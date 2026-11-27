import {
  WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody,
  OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../entities/agent.entity';
import { ActionLog } from '../entities/action-log.entity';

@WebSocketGateway({ cors: { origin: '*' }, transports: ['websocket'] })
export class RemoteControlGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private activeAgents = new Map<string, string>();

  constructor(
    @InjectRepository(Agent) private agentRepository: Repository<Agent>,
    @InjectRepository(ActionLog) private actionLogRepository: Repository<ActionLog>,
  ) {}

  async handleConnection(client: Socket) {
    const { agentId, token, role, tenantId } = client.handshake.query;
    if (role === 'agent' && agentId && token) {
      const agent = await this.agentRepository.findOne({ where: { agentToken: token as string, id: agentId as string } });
      if (agent) {
        client.join(`agent_${agent.id}`);
        client.join(`tenant_${agent.tenantId}`);
        this.activeAgents.set(agent.id, client.id);
        await this.agentRepository.update(agent.id, { isOnline: true });
        this.server.to(`tenant_${agent.tenantId}`).emit('agent_status', { agentId: agent.id, isOnline: true });
      } else client.disconnect();
    }
    if (role === 'client' && tenantId) client.join(`tenant_${tenantId}`);
  }

  async handleDisconnect(client: Socket) {
    const agentId = client.handshake.query.agentId as string;
    if (agentId && this.activeAgents.get(agentId) === client.id) {
      this.activeAgents.delete(agentId);
      const agent = await this.agentRepository.findOne({ where: { id: agentId } });
      if (agent) {
        await this.agentRepository.update(agentId, { isOnline: false });
        this.server.to(`tenant_${agent.tenantId}`).emit('agent_status', { agentId, isOnline: false });
      }
    }
  }

  @SubscribeMessage('send_command')
  handleSendCommand(@MessageBody() data: any) {
    this.server.to(`agent_${data.agentId}`).emit('execute_command', { command: data.command, payload: data.payload });
  }

  @SubscribeMessage('command_result')
  async handleCommandResult(@MessageBody() data: any) {
    await this.actionLogRepository.save(this.actionLogRepository.create({
      agentId: data.agentId, action: data.command, success: data.success, details: data.details,
    }));
    const agent = await this.agentRepository.findOne({ where: { id: data.agentId } });
    if (agent) this.server.to(`tenant_${agent.tenantId}`).emit('agent_response', data);
  }

  @SubscribeMessage('send_chat')
  async handleSendChat(@MessageBody() data: any) {
    this.server.to(`agent_${data.agentId}`).emit('receive_chat', data);
    const agent = await this.agentRepository.findOne({ where: { id: data.agentId } });
    if (agent) this.server.to(`tenant_${agent.tenantId}`).emit('receive_chat', data);
  }

  @SubscribeMessage('file_chunk')
  handleFileChunk(@MessageBody() data: any) {
    this.server.to(`agent_${data.agentId}`).emit('receive_file_chunk', data);
  }

  @SubscribeMessage('file_chunk_from_agent')
  async handleFileFromAgent(@MessageBody() data: any) {
    const agent = await this.agentRepository.findOne({ where: { id: data.agentId } });
    if (agent) this.server.to(`tenant_${agent.tenantId}`).emit('receive_file_chunk_from_agent', data);
  }

  @SubscribeMessage('remote_mouse_event')
  handleRemoteMouse(@MessageBody() data: any) {
    this.server.to(`agent_${data.agentId}`).emit('remote_mouse_event', data);
  }

  @SubscribeMessage('start_stream')
  handleStartStream(@MessageBody() data: any) {
    this.server.to(`agent_${data.agentId}`).emit('start_stream', {});
  }

  @SubscribeMessage('stop_stream')
  handleStopStream(@MessageBody() data: any) {
    this.server.to(`agent_${data.agentId}`).emit('stop_stream', {});
  }

  @SubscribeMessage('screen_data')
  async handleScreenData(@MessageBody() data: any) {
    const agent = await this.agentRepository.findOne({ where: { id: data.agentId } });
    if (agent) this.server.volatile.to(`tenant_${agent.tenantId}`).emit('screen_data', data);
  }

  @SubscribeMessage('request_admin_screen')
  handleRequestAdminScreen(@MessageBody() data: any) {
    // Notificar al frontend que el agente quiere ver la pantalla
    this.server.to(`tenant_${data.tenantId}`).emit('agent_wants_admin_screen', data);
  }

  @SubscribeMessage('send_admin_screen')
  handleSendAdminScreen(@MessageBody() data: any) {
    this.server.to(`agent_${data.agentId}`).emit('admin_screen_data', data);
  }
}