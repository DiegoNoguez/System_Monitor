import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteControlGateway } from './remote-control.gateway';
import { Agent } from '../entities/agent.entity';
import { ActionLog } from '../entities/action-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agent, ActionLog])],
  providers: [RemoteControlGateway],
})
export class RemoteControlModule {}