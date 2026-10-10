import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const id = url.searchParams.get('id') || url.searchParams.get('data.id');

    console.log(`[Mercado Pago Webhook] Received notification: Topic=${topic}, ID=${id}`);

    // Si viene una notificación de pago (payment)
    if (topic === 'payment' && id) {
      const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

      if (mpAccessToken) {
        const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
          headers: {
            Authorization: `Bearer ${mpAccessToken}`
          }
        });

        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          console.log(`[Mercado Pago Webhook] Payment ${id} Status: ${paymentData.status}`);
          // Aquí se actualiza el estado de la orden en la BD (APPROVED, PENDING, REJECTED)
        }
      }
    }

    return NextResponse.json({ received: true, status: 'ok' }, { status: 200 });
  } catch (error: any) {
    console.error('[Mercado Pago Webhook Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
