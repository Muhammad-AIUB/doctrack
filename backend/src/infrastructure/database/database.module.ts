import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity.js';
import { Chamber } from '../../chambers/entities/chamber.entity.js';
import { DailySession } from '../../sessions/entities/daily-session.entity.js';
import { QueueEntry } from '../../queue/entities/queue-entry.entity.js';
import { ConsultationLog } from '../../consultation-log/entities/consultation-log.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'medical_queue'),
        entities: [User, Chamber, DailySession, QueueEntry, ConsultationLog],
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
        ssl: config.get<string>('DB_SSL', 'false') === 'true'
          ? { rejectUnauthorized: false }
          : false,
        migrations: ['dist/infrastructure/database/migrations/*.js'],
        migrationsRun: true,
        logging: config.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : ['error'],
      }),
    }),
  ],
})
export class DatabaseModule {}
