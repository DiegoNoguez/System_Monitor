import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsService } from './agents.service.js';
import { AgentsController } from './agents.controller.js';
import { Agent } from '../entities/agent.entity.js';
import { Tenant } from '../entities/tenant.entity.js';
import { ActionLog } from '../entities/action-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agent, Tenant, ActionLog])],
  controllers: [AgentsController],
  providers: [AgentsService],
})
export class AgentsModule {}