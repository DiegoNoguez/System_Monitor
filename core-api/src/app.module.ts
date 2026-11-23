import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteControlModule } from './remote-control/remote-control.module.js';

// Entidades
import { Tenant } from './entities/tenant.entity.js';
import { User } from './entities/user.entity.js';
import { Agent } from './entities/agent.entity.js';
import { ActionLog } from './entities/action-log.entity.js';
import { AgentsModule } from './agents/agents.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 5432),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [Tenant, User, Agent, ActionLog],
        synchronize: true, // Solo desarrollo
      }),
    }),
    RemoteControlModule,
    AgentsModule,
  ],
})
export class AppModule {}