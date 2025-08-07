"use client";

import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useSession } from "next-auth/react";
import { useAppContext } from "@/contexts/app";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * 用户认证状态调试组件
 * 仅在开发环境显示，帮助诊断登录状态问题
 */
export default function AuthStatusDebug() {
  const { data: session, status } = useSession();
  const { user } = useAppContext();
  const authStatus = useAuthStatus();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 确保只在客户端渲染，避免 Hydration 不匹配
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 仅在开发环境和客户端显示
  if (!isClient || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const testUserInfo = async () => {
    try {
      const response = await fetch('/api/get-user-info', { method: 'POST' });
      const data = await response.json();
      console.log('🧪 用户信息测试结果:', data);
      alert(`用户信息测试结果: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('❌ 用户信息测试失败:', error);
      alert(`测试失败: ${error}`);
    }
  };

  const testSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      console.log('🧪 会话测试结果:', data);
      alert(`会话测试结果: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('❌ 会话测试失败:', error);
      alert(`测试失败: ${error}`);
    }
  };

  const getStatusColor = (condition: boolean) => {
    return condition ? "bg-green-500" : "bg-red-500";
  };

  const getStatusText = (condition: boolean) => {
    return condition ? "✅" : "❌";
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 max-h-96 overflow-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            🔍 认证状态调试
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "收起" : "展开"}
            </Button>
          </CardTitle>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="space-y-3 text-xs">
            {/* 基础状态 */}
            <div className="space-y-1">
              <div className="font-medium">基础状态:</div>
              <div className="flex items-center gap-2">
                <Badge variant={authStatus.isAuthenticated ? "default" : "destructive"}>
                  {getStatusText(authStatus.isAuthenticated)} 已认证
                </Badge>
                <Badge variant={authStatus.hasUserData ? "default" : "destructive"}>
                  {getStatusText(authStatus.hasUserData)} 用户数据
                </Badge>
              </div>
            </div>

            {/* 会话信息 */}
            <div className="space-y-1">
              <div className="font-medium">会话状态:</div>
              <div className="text-xs text-muted-foreground">
                <div>Status: <span className="font-mono">{status}</span></div>
                <div>Email: <span className="font-mono">{session?.user?.email || 'N/A'}</span></div>
                <div>UUID: <span className="font-mono">{session?.user?.uuid || 'N/A'}</span></div>
              </div>
            </div>

            {/* 用户信息 */}
            <div className="space-y-1">
              <div className="font-medium">用户信息:</div>
              <div className="text-xs text-muted-foreground">
                <div>Nickname: <span className="font-mono">{user?.nickname || 'N/A'}</span></div>
                <div>Credits: <span className="font-mono">{user?.credits?.left_credits || 'N/A'}</span></div>
                <div>Pro: <span className="font-mono">{user?.credits?.is_pro ? 'Yes' : 'No'}</span></div>
              </div>
            </div>

            {/* 状态检查 */}
            <div className="space-y-1">
              <div className="font-medium">状态检查:</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>{getStatusText(authStatus.isSessionReady)} 会话就绪</div>
                <div>{getStatusText(authStatus.isUserInfoLoaded)} 用户信息已加载</div>
                <div>{getStatusText(authStatus.canUseFeatures)} 可使用功能</div>
                <div>{getStatusText(!authStatus.hasSessionError)} 无会话错误</div>
              </div>
            </div>

            {/* 错误状态 */}
            {(authStatus.hasSessionError || authStatus.hasUserInfoError) && (
              <div className="space-y-1">
                <div className="font-medium text-red-600">错误状态:</div>
                <div className="text-xs text-red-600">
                  {authStatus.hasSessionError && <div>❌ 会话错误</div>}
                  {authStatus.hasUserInfoError && <div>❌ 用户信息错误</div>}
                </div>
              </div>
            )}

            {/* 测试按钮 */}
            <div className="space-y-2 pt-2 border-t">
              <div className="font-medium">测试工具:</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={testSession}>
                  测试会话
                </Button>
                <Button size="sm" variant="outline" onClick={testUserInfo}>
                  测试用户信息
                </Button>
              </div>
            </div>

            {/* 建议操作 */}
            {authStatus.requiresLogin && (
              <div className="p-2 bg-yellow-50 rounded text-xs">
                <div className="font-medium text-yellow-800">建议操作:</div>
                <div className="text-yellow-700">用户需要登录</div>
              </div>
            )}

            {authStatus.hasUserInfoError && (
              <div className="p-2 bg-red-50 rounded text-xs">
                <div className="font-medium text-red-800">建议操作:</div>
                <div className="text-red-700">检查 /api/get-user-info 端点</div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
