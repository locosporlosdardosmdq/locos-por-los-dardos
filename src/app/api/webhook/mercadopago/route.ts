import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    let topic = url.searchParams.get('topic') || url.searchParams.get('type');
    let id = url.searchParams.get('id') || url.searchParams.get('data.id');

    // Mercado Pago v2 webhooks may send the event in JSON body
    if (!id) {
      try {
        const body = await request.json();
        if (body?.data?.id) {
          id = String(body.data.id);
        } else if (body?.id) {
          id = String(body.id);
        }
        if (body?.type) {
          topic = body.type;
        } else if (body?.topic) {
          topic = body.topic;
        }
      } catch {
        // Body was empty or not json, proceed with query params
      }
    }

    console.log(`[Mercado Pago Webhook] Received notification: Topic=${topic}, ID=${id}`);

    // Si viene una notificación de pago (payment)
    if ((topic === 'payment' || topic === 'collection') && id) {
      const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

      if (mpAccessToken) {
        const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
          headers: {
            Authorization: `Bearer ${mpAccessToken}`
          }
        });

        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          const paymentStatus = paymentData.status;
          const externalRef = paymentData.external_reference;

          console.log(`[Mercado Pago Webhook] Payment ${id} Status: ${paymentStatus}, External Ref: ${externalRef}`);

          const pool = getDbPool();

          if (paymentStatus === 'approved') {
            if (externalRef) {
              // 1. Actualizar orden en la tabla de ecommerce
              await pool.query(
                `UPDATE orders 
                 SET payment_status = 'APPROVED', 
                     mercadopago_payment_id = $1, 
                     updated_at = NOW() 
                 WHERE order_number = $2;`,
                [String(id), externalRef]
              );

              // 2. Si la referencia corresponde a una inscripción de torneo
              await pool.query(
                `UPDATE grand_tournament_registrations 
                 SET payment_status = 'CONFIRMED' 
                 WHERE id = $1;`,
                [externalRef]
              );
            }
          } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
            if (externalRef) {
              await pool.query(
                `UPDATE orders 
                 SET payment_status = 'REJECTED', 
                     mercadopago_payment_id = $1, 
                     updated_at = NOW() 
                 WHERE order_number = $2;`,
                [String(id), externalRef]
              );
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true, status: 'ok' }, { status: 200 });
  } catch (error: any) {
    console.error('[Mercado Pago Webhook Error]', error);
    return NextResponse.json({ error: 'Error procesando notificación de Mercado Pago' }, { status: 500 });
  }
}
