import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere sesión de usuario.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      master_order_id,
      symbol,
      action,
      quantity,
      slaves_count,
      latency_ms,
      status,
    } = body;

    if (!symbol || !action || !quantity) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: symbol, action, quantity' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('copier_logs')
      .insert({
        user_id: user.id,
        master_order_id: String(master_order_id || Date.now()),
        symbol: String(symbol).toUpperCase(),
        action: action === 'BUY' ? 'BUY' : 'SELL',
        quantity: Number(quantity) || 1,
        slaves_count: Number(slaves_count) || 1,
        latency_ms: Number(latency_ms) || 0,
        status: status || 'SUCCESS',
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting copier_log:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      log: data,
    });
  } catch (err: any) {
    console.error('Error in /api/copier/sync-trade:', err);
    return NextResponse.json(
      { error: err?.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
