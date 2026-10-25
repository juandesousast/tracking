import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Check user_metadata (direct cloud sync between desktop and web)
    const metaConfig = user.user_metadata?.risk_config;
    if (metaConfig && typeof metaConfig.isActive === 'boolean') {
      return NextResponse.json({ success: true, config: metaConfig });
    }

    // 2. Secondary check in account_risk_configs table
    const { data: dbConfig } = await supabase
      .from('account_risk_configs')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dbConfig) {
      const mapped = {
        isActive: dbConfig.is_active,
        templateId: dbConfig.template_id || 'topstep-50k',
        dailyLossLimit: Number(dbConfig.daily_loss_limit_amount) || 1000,
        dailyLossAction: dbConfig.daily_loss_limit_action || 'liquidate',
        dailyProfitLock: dbConfig.daily_profit_target_amount ? Number(dbConfig.daily_profit_target_amount) : null,
        maxContracts: Number(dbConfig.max_contracts_limit) || 5,
        eodCloseTime: dbConfig.auto_eod_close_time || '22:10',
      };
      return NextResponse.json({ success: true, config: mapped });
    }

    return NextResponse.json({
      success: true,
      config: {
        isActive: true,
        templateId: 'topstep-50k',
        dailyLossLimit: 1000,
        dailyLossAction: 'liquidate',
        dailyProfitLock: 1500,
        maxContracts: 5,
        eodCloseTime: '22:10',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const riskConfig = {
      isActive: body.isActive !== false,
      templateId: body.templateId || 'topstep-50k',
      dailyLossLimit: Number(body.dailyLossLimit) || 1000,
      dailyLossAction: body.dailyLossAction || 'liquidate',
      dailyProfitLock: body.dailyProfitLock ? Number(body.dailyProfitLock) : null,
      maxContracts: Number(body.maxContracts) || 5,
      eodCloseTime: body.eodCloseTime || '22:10',
      updatedAt: new Date().toISOString(),
    };

    // 1. Persist directly in user_metadata (guaranteed to succeed without foreign key constraints)
    await supabase.auth.updateUser({
      data: {
        risk_config: riskConfig,
      },
    });

    // 2. Best-effort update to account_risk_configs table if user has accounts
    try {
      const { data: accounts } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', user.id);

      if (accounts && accounts.length > 0) {
        for (const acc of accounts) {
          await supabase.from('account_risk_configs').upsert(
            {
              account_id: acc.id,
              user_id: user.id,
              template_id: riskConfig.templateId,
              daily_loss_limit_amount: riskConfig.dailyLossLimit,
              daily_loss_limit_action: riskConfig.dailyLossAction,
              daily_profit_target_amount: riskConfig.dailyProfitLock,
              max_contracts_limit: riskConfig.maxContracts,
              auto_eod_close_time: riskConfig.eodCloseTime,
              is_active: riskConfig.isActive,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'account_id' }
          );
        }
      }
    } catch (e) {
      // Non-critical table sync
    }

    return NextResponse.json({ success: true, config: riskConfig });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
