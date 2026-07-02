import { pgTable, text, timestamp, integer, boolean, json } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(), // 'ADMIN' | 'USER'
  avatar: text('avatar').notNull(),
  color: text('color'),
});

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull(),
  resources: json('resources').$type<string[]>().notNull(),
  location: text('location').notNull(),
  status: text('status').notNull(), // 'DISPONIVEL' | 'MANUTENCAO'
  image: text('image'),
});

export const services = pgTable('services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'),
});

export const reservations = pgTable('reservations', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  startTime: text('start_time').notNull(), // HH:MM
  endTime: text('end_time').notNull(), // HH:MM
  services: json('services').$type<string[]>().notNull(),
  status: text('status').notNull(), // 'CONFIRMADA' | 'CANCELADA'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const swapRequests = pgTable('swap_requests', {
  id: text('id').primaryKey(),
  requesterId: text('requester_id').notNull().references(() => users.id),
  requesterReservationId: text('requester_reservation_id').notNull().references(() => reservations.id),
  targetUserId: text('target_user_id').notNull().references(() => users.id),
  targetReservationId: text('target_reservation_id').notNull().references(() => reservations.id),
  status: text('status').notNull(), // 'PENDENTE' | 'ACEITA' | 'RECUSADA'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  swapRequestId: text('swap_request_id').notNull().references(() => swapRequests.id),
  senderId: text('sender_id').notNull().references(() => users.id),
  text: text('text').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
