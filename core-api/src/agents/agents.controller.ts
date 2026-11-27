import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { AgentsService } from './agents.service';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post('register')
  register(@Body() body: { tenantCode: string; hostname: string; os: string }) {
    return this.agentsService.registerAgent(body);
  }

  @Get()
  getAgents(@Query('tenantId') tenantId: string) {
    return this.agentsService.getAgentsByTenant(tenantId);
  }

  @Get(':id/logs')
  getLogs(@Param('id') id: string) {
    return this.agentsService.getAgentLogs(id);
  }
}