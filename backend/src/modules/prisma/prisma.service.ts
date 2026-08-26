import 'dotenv/config';
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../core/lib/generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({
      adapter,
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      // console.log(connection);
      // if (connection === undefined)
      //   return Logger.error("Couldn't connect to the database");
      Logger.log('Connected to the database');
    } catch (error) {
      Logger.error("Couldn't connect to the database", error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    Logger.log('Disconnected from the database');
  }
}
