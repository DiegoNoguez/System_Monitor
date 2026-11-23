import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Tenant } from './tenant.entity.js';
import { ActionLog } from './action-log.entity.js';

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() os: string;
  @Column({ unique: true }) agentToken: string;
  @Column({ default: false }) isOnline: boolean;
  @ManyToOne(() => Tenant, (tenant: Tenant) => tenant.agents, { onDelete: 'CASCADE' }) tenant: Relation<Tenant>;
  @Column() tenantId: string;
  @CreateDateColumn() createdAt: Date;
  @OneToMany(() => ActionLog, (log: ActionLog) => log.agent) logs: Relation<ActionLog[]>;
}