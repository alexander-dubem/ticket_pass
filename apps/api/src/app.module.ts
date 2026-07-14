import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { StellarModule } from './stellar/stellar.module';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    StellarModule,
    EventsModule,
    UsersModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

