import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './src/db/schema';
import dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function init() {
  console.log('Dropping existing tables...');
  await db.execute(sql`DROP TABLE IF EXISTS chat_messages CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS swap_requests CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS reservations CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS services CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS rooms CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);

  console.log('Creating tables...');
  await db.execute(sql`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT NOT NULL
    );
  `);
  
  await db.execute(sql`
    CREATE TABLE rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      resources JSON NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL,
      image TEXT
    );
  `);

  await db.execute(sql`
    CREATE TABLE services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT
    );
  `);

  await db.execute(sql`
    CREATE TABLE reservations (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES rooms(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      services JSON NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE swap_requests (
      id TEXT PRIMARY KEY,
      requester_id TEXT NOT NULL REFERENCES users(id),
      requester_reservation_id TEXT NOT NULL REFERENCES reservations(id),
      target_user_id TEXT NOT NULL REFERENCES users(id),
      target_reservation_id TEXT NOT NULL REFERENCES reservations(id),
      status TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE chat_messages (
      id TEXT PRIMARY KEY,
      swap_request_id TEXT NOT NULL REFERENCES swap_requests(id),
      sender_id TEXT NOT NULL REFERENCES users(id),
      text TEXT NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  console.log('Inserting seed data...');
  // insert users
  await db.execute(sql`
    INSERT INTO users (id, name, role, avatar) VALUES
    ('u1', 'Ana Silva', 'USER', 'https://i.pravatar.cc/150?u=u1'),
    ('u2', 'Carlos Santos', 'USER', 'https://i.pravatar.cc/150?u=u2'),
    ('u3', 'Admin (Você)', 'ADMIN', 'https://i.pravatar.cc/150?u=u3');
  `);

  await db.execute(sql`
    INSERT INTO rooms (id, name, capacity, resources, location, status, image) VALUES
    ('r1', 'Sala Alpha', 10, '["TV 65 polegadas", "Quadro Branco", "Wi-Fi"]', 'Andar 1 - Bloco A', 'DISPONIVEL', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600&h=400'),
    ('r2', 'Sala Beta', 20, '["Projetor", "Videoconferência", "Wi-Fi"]', 'Andar 2 - Bloco A', 'DISPONIVEL', 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=600&h=400'),
    ('r3', 'Sala Gama (Treinamento)', 50, '["Projetor Duplo", "Sistema de Som", "Lousa Interativa"]', 'Andar 1 - Bloco B', 'DISPONIVEL', 'https://images.unsplash.com/photo-1517502884422-41ea247caa99?auto=format&fit=crop&q=80&w=600&h=400');
  `);

  await db.execute(sql`
    INSERT INTO services (id, name, icon) VALUES
    ('s1', 'Café e Água', 'Coffee'),
    ('s2', 'Coffee Break (Básico)', 'Croissant'),
    ('s3', 'Coffee Break (Premium)', 'Cake'),
    ('s4', 'Suporte TI', 'Monitor');
  `);

  console.log('Done!');
  process.exit(0);
}

init().catch(console.error);
