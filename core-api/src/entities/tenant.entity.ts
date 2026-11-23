import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm'; // <-- Importación estricta
import { User } from './user.entity.js';
import { Agent } from './agent.entity.js';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ unique: true }) registrationCode: string;
  @CreateDateColumn() createdAt: Date;
  @OneToMany(() => User, (user: User) => user.tenant) users: Relation<User[]>;
  @OneToMany(() => Agent, (agent: Agent) => agent.tenant) agents: Relation<Agent[]>;
}