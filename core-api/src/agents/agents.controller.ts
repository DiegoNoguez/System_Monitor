import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AgentsService } from './agents.service';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post('register')
  register(@Body() body: { tenantCode: string; hostname: string; os: string }) {
    return this.agentsService.registerAgent(body);
  }

  @Get(':id/logs')
  getLogs(@Param('id') id: string) {
    return this.agentsService.getAgentLogs(id);
  }
}