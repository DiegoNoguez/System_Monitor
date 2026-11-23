import { io } from 'socket.io-client';

export const API_URL = 'https://apimonitorsystem.springyblock6devdanl.dpdns.org';
export const TENANT_ID = '11111111-1111-1111-1111-111111111111'; 

export const socket = io(API_URL, {
  query: { role: 'client', tenantId: TENANT_ID },
  autoConnect: true,
  transports: ['websocket'],
});