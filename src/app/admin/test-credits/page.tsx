'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// 强制动态渲染
export const dynamic = 'force-dynamic';

interface UserCredits {
  user_uuid: string;
  credits: number;
  is_pro: boolean;
  is_recharged: boolean;
}

interface AddCreditsResponse {
  success: boolean;
  message: string;
  data: {
    user_uuid: string;
    credits_added: number;
    previous_credits: number;
    current_credits: number;
    expires_at: string;
  };
}

export default function TestCreditsPage() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(false);
  const [creditsToAdd, setCreditsToAdd] = useState(100);

  // 获取用户积分信息
  const fetchUserCredits = async () => {
    try {
      const response = await fetch('/api/admin/add-test-credits', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setUserCredits(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch credits');
      }
    } catch (error) {
      console.error('获取积分失败:', error);
      toast.error('获取积分信息失败');
    }
  };

  // 增加测试积分
  const addTestCredits = async () => {
    if (creditsToAdd <= 0 || creditsToAdd > 1000) {
      toast.error('积分数量必须在1-1000之间');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/add-test-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credits: creditsToAdd,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result: AddCreditsResponse = await response.json();
      if (result.success) {
        toast.success(result.message);
        // 刷新积分信息
        await fetchUserCredits();
      } else {
        throw new Error(result.message || 'Failed to add credits');
      }
    } catch (error) {
      console.error('增加积分失败:', error);
      toast.error('增加积分失败');
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取积分信息
  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserCredits();
    }
  }, [status]);

  // 在构建时避免渲染错误
  if (typeof window === 'undefined') {
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">需要登录</h1>
          <p className="text-gray-600 mb-6">请先登录以访问测试积分页面</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🎯 测试积分管理
          </h1>

          {/* 用户信息 */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">用户信息</h2>
            <p className="text-blue-700">邮箱: {session?.user?.email}</p>
            <p className="text-blue-700">UUID: {userCredits?.user_uuid}</p>
          </div>

          {/* 当前积分 */}
          <div className="mb-8 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-green-900 mb-2">当前积分状态</h2>
            {userCredits ? (
              <div className="space-y-2">
                <p className="text-green-700">
                  <span className="font-medium">剩余积分:</span> 
                  <span className="text-2xl font-bold ml-2">{userCredits.credits}</span>
                </p>
                <p className="text-green-700">
                  <span className="font-medium">Pro用户:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    userCredits.is_pro ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {userCredits.is_pro ? '是' : '否'}
                  </span>
                </p>
                <p className="text-green-700">
                  <span className="font-medium">已充值用户:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    userCredits.is_recharged ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {userCredits.is_recharged ? '是' : '否'}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-green-700">加载中...</p>
            )}
          </div>

          {/* 增加积分 */}
          <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold text-yellow-900 mb-4">增加测试积分</h2>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-yellow-700 mb-2">
                  积分数量 (1-1000)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={creditsToAdd}
                  onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="输入要增加的积分数量"
                />
              </div>
              <button
                onClick={addTestCredits}
                disabled={loading || creditsToAdd <= 0 || creditsToAdd > 1000}
                className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{loading ? '处理中...' : '增加积分'}</span>
              </button>
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[50, 100, 200, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCreditsToAdd(amount)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {amount} 积分
                </button>
              ))}
            </div>
          </div>

          {/* 刷新按钮 */}
          <div className="text-center">
            <button
              onClick={fetchUserCredits}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mr-4"
            >
              刷新积分信息
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              返回首页
            </button>
          </div>

          {/* 说明 */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">使用说明:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 此页面仅用于开发和测试环境</li>
              <li>• 增加的积分有效期为1年</li>
              <li>• 每次最多可增加1000积分</li>
              <li>• 积分用于LipSync视频生成功能</li>
              <li>• 中等质量视频消耗10积分</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
