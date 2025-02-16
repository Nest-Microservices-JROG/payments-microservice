import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config/envs';

@Module({
   imports: [
      ClientsModule.register([
         {
            name: envs.natsServiceName,
            transport: Transport.NATS,
            options: {
               servers: envs.natsServers
            }
         }
      ])
   ],
   exports: [
      ClientsModule.register([
         {
            name: envs.natsServiceName,
            transport: Transport.NATS,
            options: {
               servers: envs.natsServers
            }
         }
      ])
   ]
})
export class NastModule { }
