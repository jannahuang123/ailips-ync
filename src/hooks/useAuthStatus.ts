"use client";

import { useSession } from "next-auth/react";
import { useAppContext } from "@/contexts/app";
import { useEffect, useState } from "react";

/**
 * 用户认证状态管理 Hook
 * 基于 ShipAny 模板的最佳实践
 */
export function useAuthStatus() {
  const { data: session, status } = useSession();
  const { user } = useAppContext();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 当会话状态不再是 loading 时，标记为已初始化
    if (status !== 'loading') {
      setIsInitialized(true);
    }
  }, [status]);

  const authStatus = {
    // 基础状态
    isLoading: status === 'loading' || !isInitialized,
    isAuthenticated: status === 'authenticated' && !!session?.user,
    isUnauthenticated: status === 'unauthenticated',
    
    // 用户信息
    session,
    user,
    hasUserData: !!user,
    
    // 状态检查
    isSessionReady: status !== 'loading',
    isUserInfoLoaded: !!user && status === 'authenticated',
    
    // 错误状态
    hasSessionError: status === 'authenticated' && !session?.user,
    hasUserInfoError: status === 'authenticated' && !!session?.user && !user,
    
    // 便捷方法
    requiresLogin: status === 'unauthenticated',
    canUseFeatures: status === 'authenticated' && !!user,
  };

  return authStatus;
}

/**
 * 用户积分状态 Hook
 */
export function useUserCredits() {
  const { user } = useAppContext();
  const authStatus = useAuthStatus();

  return {
    credits: user?.credits,
    leftCredits: user?.credits?.left_credits || 0,
    totalCredits: user?.credits?.total_credits || 0,
    usedCredits: user?.credits?.used_credits || 0,
    freeCredits: user?.credits?.free_credits || 0,
    isPro: user?.credits?.is_pro || false,
    isRecharged: user?.credits?.is_recharged || false,
    hasCredits: (user?.credits?.left_credits || 0) > 0,
    canGenerate: authStatus.canUseFeatures && (user?.credits?.left_credits || 0) > 0,
  };
}

/**
 * 登录状态检查 Hook
 * 用于需要登录才能访问的组件
 */
export function useRequireAuth() {
  const authStatus = useAuthStatus();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (authStatus.isSessionReady && authStatus.requiresLogin) {
      setShouldRedirect(true);
    }
  }, [authStatus.isSessionReady, authStatus.requiresLogin]);

  return {
    ...authStatus,
    shouldRedirect,
    redirectToLogin: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
    }
  };
}
