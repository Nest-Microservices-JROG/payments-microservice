import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { envs } from 'src/config/envs';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {

   private readonly stripeService = new Stripe(envs.stripeSecretKey);
   private readonly logger = new Logger(PaymentsService.name);

   constructor(
      @Inject(envs.natsServiceName) private readonly client: ClientProxy
   ) { }

   async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
      const { currency, items, orderId } = paymentSessionDto;

      const lineItems = items.map(item => {
         return {
            price_data: {
               currency: currency,
               product_data: {
                  name: item.name,
               },
               unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
         }
      })

      const session = await this.stripeService.checkout.sessions.create({
         payment_intent_data: {
            metadata: {
               orderId: orderId
            }
         },
         line_items: lineItems,
         mode: 'payment',
         success_url: envs.stripeSuccessUrl,
         cancel_url: envs.stripeCancelUrl
      });

      return {
         cancelUrl: session.cancel_url,
         successUrl: session.success_url,
         url: session.url,
      };
   }

   async stripeWebhook(req: Request, res: Response) {
      const sig = req.headers['stripe-signature'];
      let event: Stripe.Event;
      const endpointSecret = envs.stripeEndpointSecret;

      try {
         event = this.stripeService.webhooks.constructEvent(req['rawBody'], sig, endpointSecret);
      } catch (error) {
         console.log('Error', error.message);
         return res.status(400).send(`Webhook Error: ${error.message}`);
      }

      switch (event.type) {
         case 'charge.succeeded':
            const chargeSucceded = event.data.object as Stripe.Charge;
            const payload = {
               stripePaymentId: chargeSucceded.id,
               orderId: chargeSucceded.metadata.orderId,
               receipUrl: chargeSucceded.receipt_url,
            }
            this.logger.log(`Charge succeded: ${JSON.stringify(payload)}`);
            this.client.emit('payment.succeeded', payload);
            break;
         default:
            console.log(`Unhandled event type ${event.type}`);
      }

      return res.status(200).json({ recived: true });
   }

}
