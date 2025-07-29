'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface DiagnosisResult {
  user_uuid: string;
  user_email: string;
  user_created_at: string;
  current_credits: number;
  is_new_user: boolean;
  needs_fix: boolean;
  issue_description: string;
  recommended_action: string;
}

interface FixResult {
  success: boolean;
  diagnosis: DiagnosisResult;
  fix_applied?: {
    credits_added: number;
    previous_credits: number;
    new_credits: number;
    transaction_type: string;
  };
  error?: string;
}

export default function FixCreditsPage() {
  const { data: session, status } = useSession();
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 获取诊断信息
  const getDiagnosis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/fix-user-credits', {
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setDiagnosis(data.diagnosis);
      } else {
        setError(data.error || '获取诊断信息失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('诊断失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 修复积分
  const fixCredits = async (force = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/fix-user-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setFixResult(data);
        // 刷新诊断信息
        await getDiagnosis();
      } else {
        setError(data.error || '修复失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('修复失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 测试LipSync API
  const testLipSyncAPI = async () => {
    setLoading(true);
    setError(null);
    
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
        setError('❌ LipSync API仍然返回402 (积分不足)');
      } else if (response.status === 401) {
        setError('✅ LipSync API正常 (返回401认证错误，说明积分检查通过)');
      } else if (response.status === 400) {
        setError('✅ LipSync API正常 (返回400参数错误，说明积分检查通过)');
      } else {
        setError(`ℹ️ LipSync API返回状态: ${response.status}`);
      }
    } catch (err) {
      setError('测试请求失败');
      console.error('测试失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      getDiagnosis();
    }
  }, [status]);

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
          <p className="text-gray-600">需要登录后才能使用积分修复工具</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-8">🔧 用户积分修复工具</h1>
          
          {/* 用户信息 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">👤 当前用户</h2>
            <p><strong>邮箱:</strong> {session?.user?.email}</p>
            <p><strong>UUID:</strong> {session?.user?.uuid}</p>
          </div>

          {/* 诊断结果 */}
          {diagnosis && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">📊 积分诊断结果</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>当前积分:</strong> <span className={diagnosis.current_credits < 10 ? 'text-red-600' : 'text-green-600'}>{diagnosis.current_credits}</span></p>
                  <p><strong>是否新用户:</strong> {diagnosis.is_new_user ? '是' : '否'}</p>
                  <p><strong>需要修复:</strong> <span className={diagnosis.needs_fix ? 'text-red-600' : 'text-green-600'}>{diagnosis.needs_fix ? '是' : '否'}</span></p>
                </div>
                <div>
                  <p><strong>问题描述:</strong> {diagnosis.issue_description}</p>
                  <p><strong>建议操作:</strong> {diagnosis.recommended_action}</p>
                </div>
              </div>
            </div>
          )}

          {/* 修复结果 */}
          {fixResult && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">✅ 修复结果</h2>
              {fixResult.success ? (
                fixResult.fix_applied ? (
                  <div>
                    <p><strong>修复状态:</strong> <span className="text-green-600">成功</span></p>
                    <p><strong>添加积分:</strong> {fixResult.fix_applied.credits_added}</p>
                    <p><strong>修复前积分:</strong> {fixResult.fix_applied.previous_credits}</p>
                    <p><strong>修复后积分:</strong> {fixResult.fix_applied.new_credits}</p>
                    <p><strong>交易类型:</strong> {fixResult.fix_applied.transaction_type}</p>
                  </div>
                ) : (
                  <p className="text-green-600">用户积分正常，无需修复</p>
                )
              ) : (
                <p className="text-red-600">修复失败: {fixResult.error}</p>
              )}
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-red-800">❌ 错误信息</h2>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={getDiagnosis}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '检查中...' : '🔍 重新诊断'}
            </button>
            
            {diagnosis?.needs_fix && (
              <button
                onClick={() => fixCredits(false)}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? '修复中...' : '🔧 修复积分'}
              </button>
            )}
            
            <button
              onClick={() => fixCredits(true)}
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? '强制修复中...' : '⚡ 强制修复'}
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
              <li><strong>重新诊断:</strong> 检查当前用户的积分状态和问题</li>
              <li><strong>修复积分:</strong> 仅在系统检测到需要修复时执行</li>
              <li><strong>强制修复:</strong> 无论当前状态如何都会添加50积分</li>
              <li><strong>测试LipSync API:</strong> 验证积分修复后API是否正常工作</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
