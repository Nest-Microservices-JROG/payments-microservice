import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }



  // @Post('create-payment-session')
  @MessagePattern('create.payment.session')
  async createPaymentSession(@Payload() paymentSessionDto: PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  async success() {
    return {
      ok: true,
      message: 'Payment successful',
    }
  }


  @Get('cancel')
  async cancel() {
    return {
      ok: false,
      message: 'Payment cancelled',
    }
  }

  @Post('webhook')
  async stripeWebhook(@Req() req: Request, @Res() res: Response) {
    console.log('webhook');
    return this.paymentsService.stripeWebhook(req, res);
  }

}
