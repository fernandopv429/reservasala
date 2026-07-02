import express from 'express';
import cors from 'cors';
import { db } from './src/db/db';
import * as schema from './src/db/schema';
import { eq, or, and } from 'drizzle-orm';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import PocketBase from 'pocketbase';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const upload = multer({ dest: 'uploads/' });

async function startServer() {
  const app = express();
  const PORT = 3000;


  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/users', async (req, res) => {
    try {
      const allUsers = await db.select().from(schema.users);
      res.json(allUsers);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const newUser = { ...req.body, id: `u${Date.now()}` };
      await db.insert(schema.users).values(newUser);
      res.json(newUser);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = req.body;
      await db.update(schema.users).set(updatedUser).where(eq(schema.users.id, id));
      res.json(updatedUser);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(schema.users).where(eq(schema.users.id, id));
      res.json({ success: true });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  app.post('/api/users/:id/avatar', upload.single('avatar'), async (req, res) => {
    try {
      const { id } = req.params;
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const pbUrl = process.env.VITE_POCKETBASE_URL || 'https://db.nexusdevhub.com';
      const pb = new PocketBase(pbUrl);
      
      const email = process.env.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
      const password = process.env.POCKETBASE_ADMIN_PASSWORD || 'suasenha123';
      
      await pb.admins.authWithPassword(email, password);

      // We need a FormData object to upload the file to pocketbase
      // Node 18+ has global fetch and FormData
      const formData = new FormData();
      const fileData = fs.readFileSync(req.file.path);
      const blob = new Blob([fileData], { type: req.file.mimetype });
      
      formData.append('avatar', blob, req.file.originalname);
      
      let pbUser;
      try {
        const records = await pb.collection('users').getList(1, 1, {
          filter: `username = "user_${id}"`
        });
        if (records.items.length > 0) {
          pbUser = records.items[0];
        }
      } catch (e) {
        // Ignore error
      }

      if (!pbUser) {
        pbUser = await pb.collection('users').create({
          email: `user_${id}@example.com`,
          password: 'password123',
          passwordConfirm: 'password123',
          username: `user_${id}`
        });
      }

      const updatedRecord = await pb.collection('users').update(pbUser.id, formData);
      
      // Update our postgres DB with the filename
      const avatarFilename = updatedRecord.avatar;
      
      // Store the PB ID as well so we can fetch the image
      // Wait, we only have avatar in postgres. We can just store `pbUser.id + '/' + avatarFilename` in postgres 
      // or we can adjust getProfileImageUrl to split it.
      await db.update(schema.users).set({ avatar: pbUser.id + '/' + avatarFilename }).where(eq(schema.users.id, id));

      // Cleanup
      fs.unlinkSync(req.file.path);
      
      res.json({ success: true, avatar: avatarFilename });
    } catch (e: any) {
      console.error(e.response?.data || e);
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'Failed to upload avatar' });
    }
  });

  app.get('/api/rooms', async (req, res) => {
    try {
      const allRooms = await db.select().from(schema.rooms);
      res.json(allRooms);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch rooms' });
    }
  });

  app.post('/api/rooms', async (req, res) => {
    try {
      const newRoom = { ...req.body, id: `r${Date.now()}` };
      await db.insert(schema.rooms).values(newRoom);
      res.json(newRoom);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create room' });
    }
  });

  app.put('/api/rooms/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updatedRoom = req.body;
      await db.update(schema.rooms).set(updatedRoom).where(eq(schema.rooms.id, id));
      res.json(updatedRoom);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update room' });
    }
  });

  app.delete('/api/rooms/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(schema.rooms).where(eq(schema.rooms.id, id));
      res.json({ success: true });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete room' });
    }
  });

  app.get('/api/services', async (req, res) => {
    try {
      const allServices = await db.select().from(schema.services);
      res.json(allServices);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  app.post('/api/services', async (req, res) => {
    try {
      const newService = { ...req.body, id: `s${Date.now()}` };
      await db.insert(schema.services).values(newService);
      res.json(newService);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create service' });
    }
  });

  app.put('/api/services/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updatedService = req.body;
      await db.update(schema.services).set(updatedService).where(eq(schema.services.id, id));
      res.json(updatedService);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update service' });
    }
  });

  app.delete('/api/services/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(schema.services).where(eq(schema.services.id, id));
      res.json({ success: true });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete service' });
    }
  });

  app.get('/api/reservations', async (req, res) => {
    try {
      const allReservations = await db.select().from(schema.reservations);
      res.json(allReservations);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch reservations' });
    }
  });

  app.post('/api/reservations', async (req, res) => {
    try {
      const { id, roomId, userId, title, date, startTime, endTime, services, status } = req.body;
      const newRes = { id, roomId, userId, title, date, startTime, endTime, services, status };
      await db.insert(schema.reservations).values(newRes);
      res.json(newRes);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create reservation' });
    }
  });

  app.put('/api/reservations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await db.update(schema.reservations).set(data).where(eq(schema.reservations.id, id));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update reservation' });
    }
  });

  app.delete('/api/reservations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(schema.reservations).where(eq(schema.reservations.id, id));
      res.json({ success: true });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete reservation' });
    }
  });

  app.get('/api/swap_requests', async (req, res) => {
    try {
      const reqs = await db.select().from(schema.swapRequests);
      res.json(reqs);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch swap requests' });
    }
  });

  app.post('/api/swap_requests', async (req, res) => {
    try {
      const { id, requesterId, requesterReservationId, targetUserId, targetReservationId, status } = req.body;
      await db.insert(schema.swapRequests).values({
        id, requesterId, requesterReservationId, targetUserId, targetReservationId, status
      });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create swap request' });
    }
  });

  app.put('/api/swap_requests/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      await db.update(schema.swapRequests).set(data).where(eq(schema.swapRequests.id, id));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update swap request' });
    }
  });

  app.get('/api/chat_messages', async (req, res) => {
    try {
      const msgs = await db.select().from(schema.chatMessages);
      res.json(msgs);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
  });

  app.post('/api/chat_messages', async (req, res) => {
    try {
      const { id, swapRequestId, senderId, text } = req.body;
      await db.insert(schema.chatMessages).values({
        id, swapRequestId, senderId, text
      });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create chat message' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
