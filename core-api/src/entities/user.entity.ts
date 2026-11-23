import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Tenant } from './tenant.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column() password: string;
  @Column({ default: 'ADMIN' }) role: string;
  @ManyToOne(() => Tenant, (tenant: Tenant) => tenant.users, { onDelete: 'CASCADE' }) tenant: Relation<Tenant>;
  @Column() tenantId: string;
  @CreateDateColumn() createdAt: Date;
}