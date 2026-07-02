import { User, Room, AdditionalService, Reservation } from '../types';
import { addDays, format } from 'date-fns';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Ana Silva', role: 'USER', avatar: 'https://i.pravatar.cc/150?u=u1' },
  { id: 'u2', name: 'Carlos Santos', role: 'USER', avatar: 'https://i.pravatar.cc/150?u=u2' },
  { id: 'u3', name: 'Admin (Você)', role: 'ADMIN', avatar: 'https://i.pravatar.cc/150?u=u3' },
];

export const mockRooms: Room[] = [
  {
    id: 'r1',
    name: 'Sala Alpha',
    capacity: 10,
    resources: ['TV 65"', 'Quadro Branco', 'Wi-Fi'],
    location: 'Andar 1 - Bloco A',
    status: 'DISPONIVEL',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: 'r2',
    name: 'Sala Beta',
    capacity: 20,
    resources: ['Projetor', 'Videoconferência', 'Wi-Fi'],
    location: 'Andar 2 - Bloco A',
    status: 'DISPONIVEL',
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: 'r3',
    name: 'Sala Gama (Treinamento)',
    capacity: 50,
    resources: ['Projetor Duplo', 'Sistema de Som', 'Lousa Interativa'],
    location: 'Andar 1 - Bloco B',
    status: 'DISPONIVEL',
    image: 'https://images.unsplash.com/photo-1517502884422-41ea247caa99?auto=format&fit=crop&q=80&w=600&h=400',
  },
];

export const mockServices: AdditionalService[] = [
  { id: 's1', name: 'Café e Água', icon: 'Coffee' },
  { id: 's2', name: 'Coffee Break (Básico)', icon: 'Croissant' },
  { id: 's3', name: 'Coffee Break (Premium)', icon: 'Cake' },
  { id: 's4', name: 'Suporte TI', icon: 'Monitor' },
];

const today = format(new Date(), 'yyyy-MM-dd');
const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

export const mockReservations: Reservation[] = [
  {
    id: 'res1',
    roomId: 'r1',
    userId: 'u1',
    title: 'Reunião de Alinhamento',
    date: today,
    startTime: '09:00',
    endTime: '11:00',
    services: ['s1'],
    status: 'CONFIRMADA',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res2',
    roomId: 'r2',
    userId: 'u2',
    title: 'Apresentação de Resultados',
    date: today,
    startTime: '14:00',
    endTime: '16:00',
    services: ['s2', 's4'],
    status: 'CONFIRMADA',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res3',
    roomId: 'r1',
    userId: 'u2',
    title: 'Entrevistas',
    date: tomorrow,
    startTime: '10:00',
    endTime: '12:00',
    services: ['s1'],
    status: 'CONFIRMADA',
    createdAt: new Date().toISOString(),
  }
];
