import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../entities/agent.entity';
import { ActionLog } from '../entities/action-log.entity';

@WebSocketGateway({ 
  cors: { origin: '*' },
  transports: ['websocket'] // Forzar WebSockets para Cloudflare
})
export class RemoteControlGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeAgents = new Map<string, string>();

  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(ActionLog)
    private actionLogRepository: Repository<ActionLog>,
  ) {}

  async handleConnection(client: Socket) {
    const { agentId, token, role, tenantId } = client.handshake.query;

    if (role === 'agent' && agentId && token) {
      const agent = await this.agentRepository.findOne({
        where: { agentToken: token as string, id: agentId as string },
      });

      if (agent) {
        client.join(`agent_${agent.id}`);
        client.join(`tenant_${agent.tenantId}`);
        this.activeAgents.set(agent.id, client.id);
        
        await this.agentRepository.update(agent.id, { isOnline: true });
        this.server.to(`tenant_${agent.tenantId}`).emit('agent_status', {
          agentId: agent.id,
          isOnline: true,
        });
        console.log(`Agente conectado: ${agent.name}`);
      } else {
        console.log('Intento de conexion de agente fallido. Token invalido.');
        client.disconnect();
      }
    }

    if (role === 'client' && tenantId) {
      client.join(`tenant_${tenantId}`);
      console.log(`Cliente Web conectado al Tenant: ${tenantId}`);
    }
  }

  async handleDisconnect(client: Socket) {
    const agentId = client.handshake.query.agentId as string;

    if (agentId && this.activeAgents.get(agentId) === client.id) {
      this.activeAgents.delete(agentId);
      
      const agent = await this.agentRepository.findOne({ where: { id: agentId } });
      if (agent) {
        await this.agentRepository.update(agentId, { isOnline: false });
        this.server.to(`tenant_${agent.tenantId}`).emit('agent_status', {
          agentId: agentId,
          isOnline: false,
        });
      }
      console.log(`Agente desconectado: ${agentId}`);
    }
  }

  @SubscribeMessage('send_command')
  handleSendCommand(@MessageBody() data: { agentId: string; command: string; payload?: any }) {
    this.server.to(`agent_${data.agentId}`).emit('execute_command', {
      command: data.command,
      payload: data.payload,
    });
  }

  @SubscribeMessage('command_result')
  async handleCommandResult(
    @MessageBody() data: { agentId: string; command: string; success: boolean; details?: string },
  ) {
    await this.actionLogRepository.save(
      this.actionLogRepository.create({
        agentId: data.agentId,
        action: data.command,
        success: data.success,
        details: data.details,
      }),
    );

    const agent = await this.agentRepository.findOne({ where: { id: data.agentId } });
    if (agent) {
      this.server.to(`tenant_${agent.tenantId}`).emit('agent_response', data);
    }
  }

  @SubscribeMessage('send_chat')
  async handleSendChat(@MessageBody() data: { agentId: string; message: string; sender: string }) {
    this.server.to(`agent_${data.agentId}`).emit('receive_chat', data);
    
    const agent = await this.agentRepository.findOne({ where: { id: data.agentId } });
    if (agent) {
      this.server.to(`tenant_${agent.tenantId}`).emit('receive_chat', data);
    }
  }

  @SubscribeMessage('file_chunk')
  handleFileChunk(@MessageBody() data: { agentId: string; chunk: string; fileName: string; isLast: boolean }) {
    this.server.to(`agent_${data.agentId}`).emit('receive_file_chunk', data);
  }

  @SubscribeMessage('request_screen')
  handleRequestScreen(@MessageBody() data: { agentId: string }) {
    this.server.to(`agent_${data.agentId}`).emit('request_screen', {});
  }

  @SubscribeMessage('screen_data')
  async handleScreenData(@MessageBody() data: { agentId: string; image: string }) {
    const agent = await this.agentRepository.findOne({ where: { id: data.agentId } });
    if (agent) {
      this.server.to(`tenant_${agent.tenantId}`).emit('screen_data', data);
    }
  }
}