import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import { Provider } from "next-auth/providers/index";
import { User } from "@/types/user";
import { getClientIp } from "@/lib/ip";
import { getIsoTimestr } from "@/lib/time";
import { getUuid } from "@/lib/hash";
import { saveUser } from "@/services/user";
import { handleSignInUser } from "./handler";

let providers: Provider[] = [];

// Google One Tap Auth
if (
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED === "true" &&
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID
) {
  providers.push(
    CredentialsProvider({
      id: "google-one-tap",
      name: "google-one-tap",

      credentials: {
        credential: { type: "text" },
      },

      async authorize(credentials, req) {
        const googleClientId = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID;
        if (!googleClientId) {
          console.log("invalid google auth config");
          return null;
        }

        const token = credentials!.credential;

        const response = await fetch(
          "https://oauth2.googleapis.com/tokeninfo?id_token=" + token
        );
        if (!response.ok) {
          console.log("Failed to verify token");
          return null;
        }

        const payload = await response.json();
        if (!payload) {
          console.log("invalid payload from token");
          return null;
        }

        const {
          email,
          sub,
          given_name,
          family_name,
          email_verified,
          picture: image,
        } = payload;
        if (!email) {
          console.log("invalid email in payload");
          return null;
        }

        const user = {
          id: sub,
          name: [given_name, family_name].join(" "),
          email,
          image,
          emailVerified: email_verified ? new Date() : null,
        };

        return user;
      },
    })
  );
}

// Google Auth
if (
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" &&
  process.env.AUTH_GOOGLE_ID &&
  process.env.AUTH_GOOGLE_SECRET &&
  process.env.AUTH_GOOGLE_ID !== "your-google-client-id.apps.googleusercontent.com" &&
  process.env.AUTH_GOOGLE_SECRET !== "your-google-client-secret"
) {
  providers.push(
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
} else {
  console.log('⚠️ Google OAuth 未正确配置，跳过 Google 登录提供商');
}

// Github Auth
if (
  process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" &&
  process.env.AUTH_GITHUB_ID &&
  process.env.AUTH_GITHUB_SECRET
) {
  providers.push(
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  );
}

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "google-one-tap");

export const authOptions: NextAuthConfig = {
  providers,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('🚪 SignIn Callback 开始:', {
        userEmail: user?.email,
        userName: user?.name,
        provider: account?.provider,
        providerAccountId: account?.providerAccountId,
        accountType: account?.type
      });

      try {
        const isAllowedToSignIn = true;
        if (isAllowedToSignIn) {
          console.log('✅ SignIn 允许登录');
          return true;
        } else {
          console.log('❌ SignIn 拒绝登录');
          return false;
        }
      } catch (error) {
        console.error('❌ SignIn Callback 错误:', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect Callback:', { url, baseUrl });

      // Allows relative callback URLs
      if (url.startsWith("/")) {
        // 处理国际化路由：如果URL不包含locale，添加默认locale
        if (url === "/" || url.startsWith("/?")) {
          const redirectUrl = `${baseUrl}/en`;
          console.log('✅ 重定向到首页:', redirectUrl);
          return redirectUrl;
        }

        // 如果是 /create 这样的路径，添加默认locale
        if (!url.match(/^\/(en|zh|ja|ko|ru|fr|de|ar|es|it)/)) {
          const redirectUrl = `${baseUrl}/en${url}`;
          console.log('✅ 添加locale重定向:', redirectUrl);
          return redirectUrl;
        }

        const redirectUrl = `${baseUrl}${url}`;
        console.log('✅ 相对路径重定向:', redirectUrl);
        return redirectUrl;
      }

      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        console.log('✅ 同源重定向:', url);
        return url;
      }

      console.log('✅ 默认重定向到首页:', `${baseUrl}/en`);
      return `${baseUrl}/en`;
    },
    async session({ session, token, user }) {
      console.log('🎫 Session Callback:', {
        hasSession: !!session,
        hasToken: !!token,
        hasTokenUser: !!token?.user,
        sessionUserEmail: session?.user?.email,
        tokenUserEmail: (token?.user as any)?.email,
        tokenUserUuid: (token?.user as any)?.uuid
      });

      if (token && token.user) {
        session.user = token.user;
        console.log('✅ Session 用户信息已设置:', {
          email: session.user.email,
          uuid: session.user.uuid
        });
      } else {
        console.log('⚠️ Session 缺少用户信息:', {
          hasToken: !!token,
          hasTokenUser: !!(token?.user)
        });
      }
      return session;
    },
    async jwt({ token, user, account }) {
      console.log('🔍 JWT Callback 开始:', {
        hasToken: !!token,
        hasUser: !!user,
        hasAccount: !!account,
        provider: account?.provider,
        userEmail: user?.email,
        tokenSub: token?.sub,
        existingTokenUser: !!token?.user
      });

      // Persist the OAuth access_token and or the user id to the token right after signin
      try {
        if (!user || !account) {
          console.log('🔄 JWT 返回现有 token (无新用户或账户)');
          return token;
        }

        console.log('👤 JWT 处理新用户登录:', {
          email: user.email,
          provider: account.provider,
          providerAccountId: account.providerAccountId
        });

        const userInfo = await handleSignInUser(user, account);
        if (!userInfo) {
          console.error('❌ handleSignInUser 返回空值');
          throw new Error("save user failed");
        }

        console.log('✅ 用户保存成功:', {
          uuid: userInfo.uuid,
          email: userInfo.email,
          nickname: userInfo.nickname
        });

        token.user = {
          uuid: userInfo.uuid,
          email: userInfo.email,
          nickname: userInfo.nickname,
          avatar_url: userInfo.avatar_url,
          created_at: userInfo.created_at,
        };

        console.log('✅ JWT token.user 已设置');
        return token;
      } catch (e) {
        console.error("❌ JWT callback 错误:", e);
        console.error("错误详情:", {
          message: e instanceof Error ? e.message : String(e),
          stack: e instanceof Error ? e.stack : undefined,
          userEmail: user?.email,
          provider: account?.provider
        });
        return token;
      }
    },
  },
};
