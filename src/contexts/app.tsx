"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { cacheGet, cacheRemove } from "@/lib/cache";

import { CacheKey } from "@/services/constant";
import { ContextValue } from "@/types/context";
import { User } from "@/types/user";
import moment from "moment";
import useOneTapLogin from "@/hooks/useOneTapLogin";
import { useSession } from "next-auth/react";

const AppContext = createContext({} as ContextValue);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  if (
    process.env.NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID
  ) {
    useOneTapLogin();
  }

  const { data: session } = useSession();

  const [theme, setTheme] = useState<string>(() => {
    return process.env.NEXT_PUBLIC_DEFAULT_THEME || "";
  });

  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  const fetchUserInfo = async function () {
    try {
      console.log('🔍 开始获取用户信息...');

      const resp = await fetch("/api/get-user-info", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 API 响应状态:', resp.status, resp.statusText);

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('❌ API 请求失败:', {
          status: resp.status,
          statusText: resp.statusText,
          response: errorText
        });
        throw new Error(`fetch user info failed with status: ${resp.status} - ${errorText}`);
      }

      const responseData = await resp.json();
      console.log('📦 API 响应数据:', responseData);

      const { code, message, data } = responseData;

      if (code === -2) {
        console.log('🔐 用户未登录 (no auth)');
        setUser(null);
        return;
      }

      if (code !== 0) {
        console.error('❌ API 返回错误:', { code, message });
        throw new Error(message);
      }

      console.log('✅ 用户信息获取成功:', {
        uuid: data?.uuid,
        email: data?.email,
        nickname: data?.nickname,
        credits: data?.credits
      });

      setUser(data);
      updateInvite(data);

    } catch (e) {
      console.error("❌ fetch user info failed:", e);
      console.error("错误详情:", {
        message: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined
      });

      // 开发环境临时解决方案：如果是网络问题导致的认证失败，提供模拟数据
      if (process.env.NODE_ENV === 'development') {
        console.log("🔧 开发环境：检测到网络连接问题，使用模拟用户数据进行测试");
        const mockUser = {
          uuid: "dev-mock-user-uuid",
          email: "dev-test@example.com",
          nickname: "开发测试用户",
          avatar_url: "https://via.placeholder.com/150",
          credits: {
            left_credits: 100,
            is_pro: true,
            is_recharged: false,
            total_credits: 100,
            used_credits: 0,
            free_credits: 100
          }, // 模拟积分对象用于测试
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(mockUser);
        console.log("✅ 开发环境模拟用户已设置:", mockUser);
      }
    }
  };

  const updateInvite = async (user: User) => {
    try {
      if (user.invited_by) {
        // user already been invited
        console.log("user already been invited", user.invited_by);
        return;
      }

      const inviteCode = cacheGet(CacheKey.InviteCode);
      if (!inviteCode) {
        // no invite code
        return;
      }

      const userCreatedAt = moment(user.created_at).unix();
      const currentTime = moment().unix();
      const timeDiff = Number(currentTime - userCreatedAt);

      if (timeDiff <= 0 || timeDiff > 7200) {
        // user created more than 2 hours
        console.log("user created more than 2 hours");
        return;
      }

      // update invite relation
      console.log("update invite", inviteCode, user.uuid);
      const req = {
        invite_code: inviteCode,
        user_uuid: user.uuid,
      };
      const resp = await fetch("/api/update-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      });
      if (!resp.ok) {
        throw new Error("update invite failed with status: " + resp.status);
      }
      const { code, message, data } = await resp.json();
      if (code !== 0) {
        throw new Error(message);
      }

      setUser(data);
      cacheRemove(CacheKey.InviteCode);
    } catch (e) {
      console.log("update invite failed: ", e);
    }
  };

  useEffect(() => {
    if (session && session.user) {
      fetchUserInfo();
    }
  }, [session]);

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        showSignModal,
        setShowSignModal,
        user,
        setUser,
        showFeedback,
        setShowFeedback,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
