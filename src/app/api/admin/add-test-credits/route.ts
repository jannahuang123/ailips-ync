import { NextResponse } from 'next/server';
import { increaseCredits, CreditsTransType, getUserCredits } from '@/services/credit';
import { getUserUuid } from '@/services/user';
import { getOneYearLaterTimestr } from '@/lib/time';

/**
 * 为当前登录用户增加测试积分的API端点
 * 仅用于开发和测试环境
 */
export async function POST(request: Request) {
  try {
    // 获取当前登录用户UUID
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return NextResponse.json({
        error: 'User not authenticated',
        code: 'NO_AUTH'
      }, { status: 401 });
    }

    // 解析请求参数
    const body = await request.json();
    const credits = body.credits || 100; // 默认100积分

    // 验证积分数量
    if (credits <= 0 || credits > 1000) {
      return NextResponse.json({
        error: 'Invalid credits amount. Must be between 1 and 1000.',
        code: 'INVALID_CREDITS'
      }, { status: 400 });
    }

    console.log(`🎯 为用户 ${user_uuid} 增加 ${credits} 测试积分`);

    // 获取用户当前积分
    const currentCredits = await getUserCredits(user_uuid);
    
    // 增加积分
    await increaseCredits({
      user_uuid: user_uuid,
      trans_type: CreditsTransType.SystemAdd,
      credits: credits,
      expired_at: getOneYearLaterTimestr(),
    });

    // 获取更新后的积分
    const updatedCredits = await getUserCredits(user_uuid);

    console.log(`✅ 成功为用户 ${user_uuid} 增加 ${credits} 积分`);
    console.log(`   原积分: ${currentCredits.left_credits}`);
    console.log(`   新积分: ${updatedCredits.left_credits}`);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${credits} test credits`,
      data: {
        user_uuid,
        credits_added: credits,
        previous_credits: currentCredits.left_credits,
        current_credits: updatedCredits.left_credits,
        expires_at: getOneYearLaterTimestr()
      }
    });

  } catch (error) {
    console.error('❌ 增加测试积分失败:', error);
    
    return NextResponse.json({
      error: 'Failed to add test credits',
      code: 'ADD_CREDITS_FAILED',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * 获取当前用户积分信息
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

    const credits = await getUserCredits(user_uuid);

    return NextResponse.json({
      success: true,
      data: {
        user_uuid,
        credits: credits.left_credits,
        is_pro: credits.is_pro,
        is_recharged: credits.is_recharged
      }
    });

  } catch (error) {
    console.error('❌ 获取用户积分失败:', error);
    
    return NextResponse.json({
      error: 'Failed to get user credits',
      code: 'GET_CREDITS_FAILED',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
