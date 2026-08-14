import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { StellarModule } from './stellar/stellar.module';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    // Load the shared monorepo env file (repo root .env) plus a local fallback.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(process.cwd(), '../../.env'), '.env'],
    }),
    AuthModule,
    StellarModule,
    EventsModule,
    UsersModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

