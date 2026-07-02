import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Room, Reservation, SwapRequest, ChatMessage, AdditionalService } from '../types';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  users: User[];
  rooms: Room[];
  services: AdditionalService[];
  reservations: Reservation[];
  swapRequests: SwapRequest[];
  chatMessages: ChatMessage[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => void;
  updateReservation: (id: string, reservation: Partial<Reservation>) => void;
  cancelReservation: (id: string) => void;
  requestSwap: (swapRequest: Omit<SwapRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateSwapRequestStatus: (id: string, status: SwapRequest['status']) => void;
  sendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  fetchData: () => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [usersRes, roomsRes, servicesRes, resRes, swapRes, chatRes] = await Promise.all([
        fetch('/api/users').then(r => r.ok ? r.json() : []),
        fetch('/api/rooms').then(r => r.ok ? r.json() : []),
        fetch('/api/services').then(r => r.ok ? r.json() : []),
        fetch('/api/reservations').then(r => r.ok ? r.json() : []),
        fetch('/api/swap_requests').then(r => r.ok ? r.json() : []),
        fetch('/api/chat_messages').then(r => r.ok ? r.json() : []),
      ]);

      setUsers(usersRes);
      setRooms(roomsRes);
      setServices(servicesRes);
      setReservations(resRes);
      setSwapRequests(swapRes);
      setChatMessages(chatRes);
      
      if (usersRes.length > 0 && !currentUser) {
        setCurrentUser(usersRes[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll for updates
    return () => clearInterval(interval);
  }, []);

  const addReservation = async (reservation: Omit<Reservation, 'id' | 'createdAt'>) => {
    const newId = `res_${Date.now()}`;
    await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...reservation, id: newId, status: 'CONFIRMADA' })
    });
    fetchData();
  };

  const updateReservation = async (id: string, data: Partial<Reservation>) => {
    await fetch(`/api/reservations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fetchData();
  };

  const cancelReservation = async (id: string) => {
    await updateReservation(id, { status: 'CANCELADA' });
  };

  const requestSwap = async (data: Omit<SwapRequest, 'id' | 'createdAt' | 'status'>) => {
    const newId = `swap_${Date.now()}`;
    await fetch('/api/swap_requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, id: newId, status: 'PENDENTE' })
    });
    fetchData();
  };

  const updateSwapRequestStatus = async (id: string, status: SwapRequest['status']) => {
    await fetch(`/api/swap_requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (status === 'ACEITA') {
      const req = swapRequests.find((r) => r.id === id);
      if (req) {
        await fetch(`/api/reservations/${req.requesterReservationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: req.targetUserId })
        });
        await fetch(`/api/reservations/${req.targetReservationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: req.requesterId })
        });
      }
    }
    fetchData();
  };

  const sendMessage = async (data: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newId = `msg_${Date.now()}`;
    await fetch('/api/chat_messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, id: newId })
    });
    fetchData();
  };

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser, users, rooms, services, reservations, swapRequests, chatMessages,
      addReservation, updateReservation, cancelReservation, requestSwap, updateSwapRequestStatus, sendMessage, fetchData, loading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
