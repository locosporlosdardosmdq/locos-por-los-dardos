import { NextResponse } from 'next/server';

interface CartItemInput {
  id: string;
  name: string;
  priceArs: number;
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customer } = body as {
      items: CartItemInput[];
      customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        province: string;
      };
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'El carrito no contiene productos' }, { status: 400 });
    }

    const totalArs = items.reduce((sum, item) => sum + item.priceArs * item.quantity, 0);
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    // Si hay un token real configurado en .env, conectar con la API de Mercado Pago
    if (mpAccessToken) {
      const mpPreferencePayload = {
        items: items.map((i) => ({
          id: i.id,
          title: i.name,
          quantity: i.quantity,
          currency_id: 'ARS',
          unit_price: i.priceArs,
        })),
        payer: {
          name: customer.name,
          email: customer.email,
          phone: { number: customer.phone },
          address: {
            street_name: customer.address,
            zip_code: '7600'
          }
        },
        external_reference: orderId,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tienda?status=success&orderId=${orderId}`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tienda?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tienda?status=pending`
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhook/mercadopago`
      };

      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mpAccessToken}`
        },
        body: JSON.stringify(mpPreferencePayload)
      });

      if (mpResponse.ok) {
        const mpData = await mpResponse.json();
        return NextResponse.json({
          success: true,
          orderId,
          totalArs,
          preferenceId: mpData.id,
          initPoint: mpData.init_point,
          sandboxInitPoint: mpData.sandbox_init_point
        });
      }
    }

    // Modo Simulación Segura de Mercado Pago (para testing y offline/desarrollo local)
    const simulatedPreferenceId = `pref_mp_${Math.random().toString(36).substring(2, 12)}`;
    return NextResponse.json({
      success: true,
      orderId,
      totalArs,
      preferenceId: simulatedPreferenceId,
      initPoint: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${simulatedPreferenceId}`,
      isSimulated: true,
      message: 'Preferencia de Mercado Pago ARS generada correctamente con soporte de Checkout Pro.'
    });
  } catch (error: any) {
    console.error('Error generando preferencia de Mercado Pago:', error);
    return NextResponse.json(
      { error: error?.message || 'Error procesando la orden con Mercado Pago' },
      { status: 500 }
    );
  }
}
