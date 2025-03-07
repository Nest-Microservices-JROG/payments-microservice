import { Controller, Get } from "@nestjs/common";


@Controller('/')
export class HealthCheckController {

  @Get()
  healthCheck() {
    return 'Payments webhook is up and running!';
  }
}