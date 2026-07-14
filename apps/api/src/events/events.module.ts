import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma.service';
import { StellarModule } from '../stellar/stellar.module';

@Module({
  imports: [StellarModule],
  controllers: [EventsController],
  providers: [EventsService, PrismaService],
})
export class EventsModule {}
