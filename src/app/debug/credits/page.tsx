'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// 强制动态渲染
export const dynamic = 'force-dynamic';
import { signIn } from 'next-auth/react';

interface UserInfo {
  uuid: string;
  email: string;
  created_at: string;
  credits: {
    left_credits: number;
    is_pro: boolean;
    is_recharged: boolean;
  };
}

export default function CreditsDebugPage() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');

  const showMessage = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  // 获取用户信息
  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/get-user-info', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok && data.code === 0) {
        setUserInfo(data.data);
        showMessage('用户信息获取成功', 'success');
      } else {
        showMessage(`获取用户信息失败: ${data.message || '未知错误'}`, 'error');
      }
    } catch (error) {
      showMessage('网络请求失败', 'error');
      console.error('获取用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 修复用户积分
  const fixUserCredits = async (force = false) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/fix-user-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        if (data.fix_applied) {
          showMessage(`积分修复成功！添加了 ${data.fix_applied.credits_added} 积分`, 'success');
        } else {
          showMessage('积分状态正常，无需修复', 'info');
        }
        // 刷新用户信息
        await fetchUserInfo();
      } else {
        showMessage(`积分修复失败: ${data.error || '未知错误'}`, 'error');
      }
    } catch (error) {
      showMessage('网络请求失败', 'error');
      console.error('积分修复失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 测试LipSync API
  const testLipSyncAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lipsync/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Credit Test Project',
          imageUrl: 'https://example.com/test.jpg',
          audioPrompt: 'This is a test message for credit verification',
          quality: 'low'
        }),
      });
      
      if (response.status === 402) {
        showMessage('❌ LipSync API返回402 (积分不足)', 'error');
      } else if (response.status === 401) {
        showMessage('✅ LipSync API正常 (积分检查通过)', 'success');
      } else if (response.status === 400) {
        showMessage('✅ LipSync API正常 (积分检查通过)', 'success');
      } else {
        const data = await response.json();
        showMessage(`LipSync API返回状态: ${response.status} - ${data.error || '未知'}`, 'info');
      }
    } catch (error) {
      showMessage('测试请求失败', 'error');
      console.error('测试失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserInfo();
    }
  }, [status]);

  // 在构建时避免渲染错误
  if (typeof window === 'undefined') {
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">请先登录</h1>
          <p className="text-gray-600 mb-6">需要登录后才能查看积分状态</p>
          <button
            onClick={() => signIn()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-8">🔧 积分状态调试页面</h1>
          
          {/* 消息提示 */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              messageType === 'success' ? 'bg-green-50 text-green-800' :
              messageType === 'error' ? 'bg-red-50 text-red-800' :
              'bg-blue-50 text-blue-800'
            }`}>
              {message}
            </div>
          )}

          {/* 用户信息 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">👤 当前用户</h2>
            <p><strong>邮箱:</strong> {session?.user?.email}</p>
            <p><strong>UUID:</strong> {session?.user?.uuid}</p>
            {userInfo && (
              <>
                <p><strong>注册时间:</strong> {new Date(userInfo.created_at).toLocaleString()}</p>
                <p><strong>当前积分:</strong> 
                  <span className={userInfo.credits.left_credits < 10 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                    {userInfo.credits.left_credits}
                  </span>
                </p>
                <p><strong>是否Pro用户:</strong> {userInfo.credits.is_pro ? '是' : '否'}</p>
                <p><strong>是否充值用户:</strong> {userInfo.credits.is_recharged ? '是' : '否'}</p>
              </>
            )}
          </div>

          {/* 积分状态分析 */}
          {userInfo && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">📊 积分状态分析</h2>
              <div className="space-y-2">
                {userInfo.credits.left_credits === 0 && (
                  <div className="p-3 bg-red-100 text-red-800 rounded">
                    ❌ 积分为0，无法使用LipSync功能
                  </div>
                )}
                {userInfo.credits.left_credits > 0 && userInfo.credits.left_credits < 10 && (
                  <div className="p-3 bg-yellow-100 text-yellow-800 rounded">
                    ⚠️ 积分不足，建议补充积分
                  </div>
                )}
                {userInfo.credits.left_credits >= 10 && (
                  <div className="p-3 bg-green-100 text-green-800 rounded">
                    ✅ 积分充足，可以正常使用功能
                  </div>
                )}
                
                {/* LipSync功能所需积分 */}
                <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded">
                  <h3 className="font-semibold mb-2">💡 LipSync功能积分消耗：</h3>
                  <ul className="text-sm space-y-1">
                    <li>• 低质量 (low): 4积分</li>
                    <li>• 中等质量 (medium): 8积分</li>
                    <li>• 高质量 (high): 15积分</li>
                    <li>• 超高质量 (ultra): 25积分</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={fetchUserInfo}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '刷新中...' : '🔄 刷新信息'}
            </button>
            
            <button
              onClick={() => fixUserCredits(false)}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '修复中...' : '🔧 智能修复积分'}
            </button>
            
            <button
              onClick={() => fixUserCredits(true)}
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? '强制修复中...' : '⚡ 强制添加50积分'}
            </button>
            
            <button
              onClick={testLipSyncAPI}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? '测试中...' : '🎬 测试LipSync API'}
            </button>
          </div>

          {/* 使用说明 */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">💡 使用说明</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>刷新信息:</strong> 重新获取最新的用户积分信息</li>
              <li><strong>智能修复积分:</strong> 系统会自动判断是否需要修复，仅在必要时添加积分</li>
              <li><strong>强制添加50积分:</strong> 无论当前状态如何都会添加50积分（用于测试）</li>
              <li><strong>测试LipSync API:</strong> 验证积分修复后LipSync功能是否正常</li>
            </ul>
          </div>

          {/* 故障排除 */}
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-red-800">🚨 常见问题排除</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              <li>如果积分显示为0，请点击"智能修复积分"</li>
              <li>如果LipSync API返回402错误，说明积分检查失败，需要修复积分</li>
              <li>如果修复后仍有问题，请检查数据库连接和积分服务</li>
              <li>新用户应该自动获得50积分，如果没有请使用修复功能</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
