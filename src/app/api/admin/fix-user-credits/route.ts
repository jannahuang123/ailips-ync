import { NextResponse } from 'next/server';
import { increaseCredits, CreditsTransType, CreditsAmount, getUserCredits } from '@/services/credit';
import { getUserUuid, getUserInfo } from '@/services/user';
import { getOneYearLaterTimestr } from '@/lib/time';
import { findUserByUuid } from '@/models/user';

/**
 * 用户积分问题诊断和修复API
 * 
 * 功能：
 * 1. 检查当前用户积分状态
 * 2. 诊断积分分配问题
 * 3. 为新用户或积分异常用户补充初始积分
 * 4. 返回详细的诊断和修复报告
 */

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

export async function POST(request: Request) {
  try {
    // 获取当前登录用户
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return NextResponse.json({
        error: 'User not authenticated',
        code: 'NO_AUTH',
        message: '请先登录系统'
      }, { status: 401 });
    }

    // 获取用户信息
    const userInfo = await findUserByUuid(user_uuid);
    if (!userInfo) {
      return NextResponse.json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    console.log(`🔍 开始诊断用户积分问题: ${userInfo.email} (${user_uuid})`);

    // 获取当前积分
    const currentCredits = await getUserCredits(user_uuid);
    
    // 诊断用户状态
    const diagnosis = await diagnoseUserCredits(userInfo, currentCredits);
    
    console.log(`📊 诊断结果:`, diagnosis);

    // 解析请求参数
    const body = await request.json().catch(() => ({}));
    const forcefix = body.force === true;

    let fixResult: FixResult = {
      success: false,
      diagnosis
    };

    // 如果需要修复或强制修复
    if (diagnosis.needs_fix || forcefix) {
      console.log(`🔧 开始修复用户积分问题...`);
      
      try {
        const creditsToAdd = CreditsAmount.NewUserGet; // 50积分
        const previousCredits = currentCredits.left_credits;

        // 增加积分
        await increaseCredits({
          user_uuid: user_uuid,
          trans_type: CreditsTransType.NewUser,
          credits: creditsToAdd,
          expired_at: getOneYearLaterTimestr(),
        });

        // 获取更新后的积分
        const updatedCredits = await getUserCredits(user_uuid);

        fixResult = {
          success: true,
          diagnosis,
          fix_applied: {
            credits_added: creditsToAdd,
            previous_credits: previousCredits,
            new_credits: updatedCredits.left_credits,
            transaction_type: CreditsTransType.NewUser
          }
        };

        console.log(`✅ 积分修复成功:`, fixResult.fix_applied);

      } catch (error) {
        console.error('❌ 积分修复失败:', error);
        fixResult.error = error instanceof Error ? error.message : 'Unknown error';
      }
    } else {
      fixResult.success = true;
      console.log(`✅ 用户积分正常，无需修复`);
    }

    return NextResponse.json(fixResult);

  } catch (error) {
    console.error('❌ 积分诊断修复失败:', error);
    
    return NextResponse.json({
      error: 'Failed to diagnose and fix user credits',
      code: 'DIAGNOSIS_FAILED',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * 诊断用户积分状态
 */
async function diagnoseUserCredits(userInfo: any, currentCredits: any): Promise<DiagnosisResult> {
  const userCreatedAt = new Date(userInfo.created_at);
  const now = new Date();
  const daysSinceCreation = Math.floor((now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
  
  const diagnosis: DiagnosisResult = {
    user_uuid: userInfo.uuid,
    user_email: userInfo.email,
    user_created_at: userInfo.created_at,
    current_credits: currentCredits.left_credits,
    is_new_user: daysSinceCreation <= 7, // 7天内注册的用户视为新用户
    needs_fix: false,
    issue_description: '',
    recommended_action: ''
  };

  // 诊断逻辑
  if (currentCredits.left_credits === 0) {
    if (diagnosis.is_new_user) {
      diagnosis.needs_fix = true;
      diagnosis.issue_description = '新用户未获得初始积分';
      diagnosis.recommended_action = `为新用户分配${CreditsAmount.NewUserGet}积分`;
    } else if (!currentCredits.is_recharged) {
      diagnosis.needs_fix = true;
      diagnosis.issue_description = '老用户积分耗尽且未充值';
      diagnosis.recommended_action = `补充${CreditsAmount.NewUserGet}积分以便测试功能`;
    } else {
      diagnosis.issue_description = '已充值用户积分耗尽';
      diagnosis.recommended_action = '建议用户购买更多积分';
    }
  } else if (currentCredits.left_credits < 10) {
    diagnosis.issue_description = '积分不足，可能影响功能使用';
    diagnosis.recommended_action = '建议补充积分';
  } else {
    diagnosis.issue_description = '积分状态正常';
    diagnosis.recommended_action = '无需操作';
  }

  return diagnosis;
}

/**
 * 获取用户积分诊断信息（GET请求）
 */
export async function GET() {
  try {
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return NextResponse.json({
        error: 'User not authenticated',
        code: 'NO_AUTH'
      }, { status: 401 });
    }

    const userInfo = await findUserByUuid(user_uuid);
    if (!userInfo) {
      return NextResponse.json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    const currentCredits = await getUserCredits(user_uuid);
    const diagnosis = await diagnoseUserCredits(userInfo, currentCredits);

    return NextResponse.json({
      success: true,
      diagnosis,
      credits_info: {
        left_credits: currentCredits.left_credits,
        is_pro: currentCredits.is_pro,
        is_recharged: currentCredits.is_recharged
      }
    });

  } catch (error) {
    console.error('❌ 获取积分诊断信息失败:', error);
    
    return NextResponse.json({
      error: 'Failed to get credits diagnosis',
      code: 'DIAGNOSIS_FAILED',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
