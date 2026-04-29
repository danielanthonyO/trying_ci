import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { DevicesModule } from './devices/devices.module';
import { RepairTicketsModule } from './repair-tickets/repair-tickets.module';
import { EstimatesModule } from './estimates/estimates.module';
import { EmailModule } from './email/email.module';
import { SchedulesModule } from './schedules/schedules.module';
import { OffDaysModule } from './off-days/off-days.module';
import { PartsModule } from './parts/parts.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    CustomersModule,
    DevicesModule,
    RepairTicketsModule,
    EstimatesModule,
    EmailModule,
    SchedulesModule,
    OffDaysModule,
    PartsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}