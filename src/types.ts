export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  color?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  resources: string[];
  location: string;
  status: 'DISPONIVEL' | 'MANUTENCAO';
  image?: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  icon?: string;
}

export interface Reservation {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  services: string[];
  status: 'CONFIRMADA' | 'CANCELADA';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  swapRequestId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface SwapRequest {
  id: string;
  requesterId: string;
  requesterReservationId: string;
  targetUserId: string;
  targetReservationId: string;
  status: 'PENDENTE' | 'ACEITA' | 'RECUSADA';
  createdAt: string;
}
