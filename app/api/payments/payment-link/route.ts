// import {
//   PaymentStatus,
//   Prisma,
// } from '@prisma/client';
// import { NextResponse } from 'next/server';

// import { prisma } from '@/lib/prisma';

// type RazorpayPaymentLinkResponse = {
//   id: string;
//   short_url: string;
//   status: string;
//   amount: number;
//   currency: string;
// };

// function normalizeIndianPhone(phone: string) {
//   const digits = phone.replace(/\D/g, '');

//   if (digits.length === 10) {
//     return `+91${digits}`;
//   }

//   if (digits.startsWith('91')) {
//     return `+${digits}`;
//   }

//   return `+${digits}`;
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const orderId = String(body.orderId ?? '').trim();

//     if (!orderId) {
//       return NextResponse.json(
//         {
//           error: 'Order ID is required.',
//         },
//         { status: 400 },
//       );
//     }

//     const keyId = process.env.RAZORPAY_KEY_ID;
//     const keySecret = process.env.RAZORPAY_KEY_SECRET;

//     if (!keyId || !keySecret) {
//       return NextResponse.json(
//         {
//           error: 'Razorpay is not configured.',
//         },
//         { status: 500 },
//       );
//     }

//     const order = await prisma.order.findUnique({
//       where: {
//         id: orderId,
//       },
//       include: {
//         cafe: true,
//         items: true,
//       },
//     });

//     if (!order) {
//       return NextResponse.json(
//         {
//           error: 'Order not found.',
//         },
//         { status: 404 },
//       );
//     }

//     if (order.paymentStatus === PaymentStatus.PAID) {
//       return NextResponse.json(
//         {
//           error: 'This order is already paid.',
//         },
//         { status: 409 },
//       );
//     }

//     /*
//      * Reuse an existing pending payment link.
//      * This prevents multiple payment links for the same order.
//      */
//     const existingPayment = await prisma.payment.findFirst({
//       where: {
//         orderId: order.id,
//         gateway: 'RAZORPAY_PAYMENT_LINK',
//         status: PaymentStatus.PENDING,
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     if (existingPayment?.rawResponse) {
//       const existingResponse =
//         existingPayment.rawResponse as {
//           short_url?: unknown;
//         };

//       if (typeof existingResponse.short_url === 'string') {
//         return NextResponse.json({
//           success: true,
//           paymentLinkId:
//             existingPayment.gatewayOrderId,
//           paymentUrl: existingResponse.short_url,
//         });
//       }
//     }

//     const authorization = Buffer.from(
//       `${keyId}:${keySecret}`,
//     ).toString('base64');

//     /*
//      * Our database stores rupees.
//      * Razorpay requires the amount in paise.
//      */
//     const amountInPaise = order.totalAmount * 100;

//     const razorpayResponse = await fetch(
//       'https://api.razorpay.com/v1/payment_links/',
//       {
//         method: 'POST',
//         headers: {
//           Authorization: `Basic ${authorization}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           amount: amountInPaise,
//           currency: 'INR',
//           accept_partial: false,

//           reference_id: order.id,

//           description: `Payment for ${order.cafe.name} order`,

//           customer: {
//             name: order.customerName,
//             contact: normalizeIndianPhone(
//               order.customerPhone,
//             ),
//           },

//           notify: {
//             sms: false,
//             email: false,
//           },

//           reminder_enable: false,

//           notes: {
//             orderId: order.id,
//             cafeId: order.cafeId,
//             cafeName: order.cafe.name,
//           },
//         }),
//       },
//     );

//     const paymentLink =
//       (await razorpayResponse.json()) as
//         RazorpayPaymentLinkResponse & {
//           error?: {
//             description?: string;
//           };
//         };

//     if (!razorpayResponse.ok) {
//       console.error(
//         'Razorpay payment-link error:',
//         paymentLink,
//       );

//       return NextResponse.json(
//         {
//           error:
//             paymentLink.error?.description ??
//             'Unable to create payment link.',
//         },
//         { status: razorpayResponse.status },
//       );
//     }

//     await prisma.payment.create({
//       data: {
//         cafeId: order.cafeId,
//         orderId: order.id,
//         gateway: 'RAZORPAY_PAYMENT_LINK',
//         gatewayOrderId: paymentLink.id,

//         /*
//          * Keep database amount consistent with Order:
//          * rupees in our current schema.
//          */
//         amount: order.totalAmount,

//         status: PaymentStatus.PENDING,

//         rawResponse:
//           paymentLink as unknown as Prisma.InputJsonValue,
//       },
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         paymentLinkId: paymentLink.id,
//         paymentUrl: paymentLink.short_url,
//       },
//       { status: 201 },
//     );
//   } catch (error) {
//     console.error(
//       'Payment-link creation failed:',
//       error,
//     );

//     return NextResponse.json(
//       {
//         error: 'Unable to create payment link.',
//       },
//       { status: 500 },
//     );
//   }
// }