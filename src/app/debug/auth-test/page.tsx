"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

/**
 * 🔍 Google OAuth 认证测试页面
 * 
 * 用于测试和调试 Google 登录流程
 * 访问: /debug/auth-test
 */
export default function AuthTestPage() {
  const { data: session, status } = useSession();
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [providers, setProviders] = useState<any>(null);

  useEffect(() => {
    // 获取认证提供商信息
    fetch('/api/auth/providers')
      .then(res => res.json())
      .then(data => setProviders(data))
      .catch(err => console.error('获取提供商失败:', err));

    // 获取当前会话信息
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setAuthInfo(data))
      .catch(err => console.error('获取会话失败:', err));
  }, []);

  const handleGoogleSignIn = () => {
    console.log('🚀 开始 Google 登录...');
    signIn('google', { 
      callbackUrl: window.location.origin,
      redirect: true 
    });
  };

  const handleSignOut = () => {
    console.log('👋 开始登出...');
    signOut({ callbackUrl: window.location.origin });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔍 Google OAuth 认证测试
          </h1>

          {/* 当前状态 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">📊 当前状态</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p><strong>状态:</strong> {status}</p>
              <p><strong>是否登录:</strong> {session ? '✅ 已登录' : '❌ 未登录'}</p>
              {session && (
                <>
                  <p><strong>用户邮箱:</strong> {session.user?.email}</p>
                  <p><strong>用户名:</strong> {session.user?.name}</p>
                  <p><strong>用户 UUID:</strong> {(session.user as any)?.uuid}</p>
                </>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">🎮 操作</h2>
            <div className="space-x-4">
              {!session ? (
                <button
                  onClick={handleGoogleSignIn}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  🔐 Google 登录
                </button>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  👋 登出
                </button>
              )}
            </div>
          </div>

          {/* 环境信息 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">🌐 环境信息</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p><strong>当前域名:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
              <p><strong>预期回调 URL:</strong> {typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback/google` : 'N/A'}</p>
            </div>
          </div>

          {/* 提供商信息 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">🔧 认证提供商</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              {providers ? (
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(providers, null, 2)}
                </pre>
              ) : (
                <p>加载中...</p>
              )}
            </div>
          </div>

          {/* 会话详情 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">🎫 会话详情</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              {authInfo ? (
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(authInfo, null, 2)}
                </pre>
              ) : (
                <p>加载中...</p>
              )}
            </div>
          </div>

          {/* 调试说明 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">🐛 调试说明</h2>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">如何使用此页面:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>检查"环境信息"中的回调 URL 是否与 Google Cloud Console 配置一致</li>
                <li>点击"Google 登录"按钮测试登录流程</li>
                <li>观察浏览器开发者工具的控制台日志</li>
                <li>检查"会话详情"确认用户信息是否正确保存</li>
                <li>如果登录失败，检查网络请求和错误信息</li>
              </ol>
              
              <h3 className="font-semibold mt-4 mb-2">常见问题:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>redirect_uri_mismatch:</strong> Google Console 回调 URL 配置错误</li>
                <li><strong>登录后立即退出:</strong> JWT 回调函数出错，检查数据库连接</li>
                <li><strong>invalid_client:</strong> Google 客户端 ID 或密钥错误</li>
                <li><strong>会话为空:</strong> NextAuth 配置问题或环境变量错误</li>
              </ul>
            </div>
          </div>

          {/* 检查清单 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">✅ 配置检查清单</h2>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Google Cloud Console 项目已创建
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  OAuth 同意屏幕已配置并发布
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  OAuth 2.0 客户端 ID 已创建
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  回调 URL 配置正确
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  环境变量已设置 (本地和 Vercel)
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Supabase 数据库连接正常
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  用户表结构正确
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
