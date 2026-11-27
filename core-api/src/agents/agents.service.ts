import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../entities/agent.entity';
import { Tenant } from '../entities/tenant.entity';
import { ActionLog } from '../entities/action-log.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent) private agentRepo: Repository<Agent>,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(ActionLog) private logRepo: Repository<ActionLog>,
  ) {}

  async registerAgent(data: { tenantCode: string; hostname: string; os: string }) {
    const tenant = await this.tenantRepo.findOne({ where: { registrationCode: data.tenantCode } });
    if (!tenant) throw new BadRequestException('Codigo de empresa invalido');

    const newAgent = this.agentRepo.create({
      name: data.hostname,
      os: data.os,
      agentToken: randomUUID(),
      tenantId: tenant.id,
    });
    const saved = await this.agentRepo.save(newAgent);

    return { agentId: saved.id, agentToken: saved.agentToken };
  }

  async getAgentLogs(agentId: string) {
    return this.logRepo.find({ where: { agentId }, order: { createdAt: 'DESC' }, take: 50 });
  }

  async getAgentsByTenant(tenantId: string) {
    return this.agentRepo.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
  }
}