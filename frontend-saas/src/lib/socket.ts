import { io } from 'socket.io-client';

// URL del Tunel
export const API_URL = 'https://apimonitorsystem.springyblock6devdanl.dpdns.org';

// Datos de prueba (Reemplaza el AGENT_ID con el que te dio la consola de Python)
export const TENANT_ID = '11111111-1111-1111-1111-111111111111'; 
export const AGENT_ID = 'TU_AGENT_ID_AQUI'; 

export const socket = io(API_URL, {
  query: {
    role: 'client',
    tenantId: TENANT_ID,
  },
  autoConnect: true,
  transports: ['websocket'],
});