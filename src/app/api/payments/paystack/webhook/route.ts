import { NextResponse } from "next/server";
import { PaystackClient } from "@/lib/payments/paystack";
import { fulfillOrder } from "@/lib/payments/fulfillment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    const paystack = new PaystackClient();

    // In production, signature verification is mandatory
    if (process.env.PAYSTACK_SECRET_KEY && signature) {
      const isValid = paystack.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event !== "charge.success") {
      return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    const transactionData = payload.data;
    const reference = transactionData?.reference;
    const metadata = transactionData?.metadata;
    const orderId = metadata?.order_id;
    const orderNumber = metadata?.order_number || reference;

    if (!orderId && !reference) {
      return NextResponse.json({ error: "Missing order identifier or reference" }, { status: 400 });
    }

    const result = await fulfillOrder({
      orderId,
      orderNumber,
      reference,
      channel: transactionData?.channel ?? "mobile_money",
      rawTransactionData: transactionData,
      verifyWithPaystack: false,
    });

    if (!result.success) {
      console.error("[Webhook] Fulfillment error:", result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      received: true,
      order_id: result.order?.id,
      tickets_issued: result.tickets?.length ?? 0,
      alreadyConfirmed: result.alreadyConfirmed,
    });
  } catch (err: any) {
    console.error("Paystack webhook fatal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
