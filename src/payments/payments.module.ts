import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { NastModule } from 'src/transports/nast.module';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [NastModule]
})
export class PaymentsModule {}
