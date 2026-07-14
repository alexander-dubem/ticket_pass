import { Module } from '@nestjs/common';
import { StellarService } from './stellar.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [StellarService, PrismaService],
  exports: [StellarService],
})
export class StellarModule {}
