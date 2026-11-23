import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Agent } from './agent.entity.js';

@Entity('action_logs')
export class ActionLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() action: string;
  @Column({ nullable: true }) details: string;
  @Column({ default: true }) success: boolean;
  @ManyToOne(() => Agent, (agent: Agent) => agent.logs, { onDelete: 'CASCADE' }) agent: Relation<Agent>;
  @Column() agentId: string;
  @CreateDateColumn() createdAt: Date;
}