import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  initialRoomId?: string;
  initialStartTime?: string;
}

export default function NewReservationModal({ isOpen, onClose, selectedDate, initialRoomId, initialStartTime }: Props) {
  const { rooms, services, reservations, currentUser, addReservation, requestSwap } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [roomId, setRoomId] = useState(initialRoomId || rooms[0]?.id || '');
  const [date, setDate] = useState(selectedDate || format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(initialStartTime || '09:00');
  const [endTime, setEndTime] = useState(() => {
    if (initialStartTime) {
      const [h, m] = initialStartTime.split(':').map(Number);
      return `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return '10:00';
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [conflictingRes, setConflictingRes] = useState<any>(null);
  const [myOfferResId, setMyOfferResId] = useState('');
  
  if (!isOpen) return null;

  const myAvailableReservations = reservations.filter(res => 
    res.userId === currentUser.id && 
    res.status !== 'CANCELADA' && 
    new Date(`${res.date}T${res.startTime}`) > new Date()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (conflictingRes) {
      if (!myOfferResId) {
        setError('Selecione uma de suas reservas para oferecer na troca.');
        return;
      }
      
      requestSwap({
        requesterId: currentUser.id,
        requesterReservationId: myOfferResId,
        targetUserId: conflictingRes.userId,
        targetReservationId: conflictingRes.id
      });
      
      onClose();
      return;
    }

    if (startTime >= endTime) {
      setError('O horário de início deve ser anterior ao horário de término.');
      return;
    }

    // Check for conflicts
    const conflict = reservations.find(res => {
      if (res.status === 'CANCELADA') return false;
      if (res.roomId !== roomId) return false;
      if (res.date !== date) return false;
      
      // overlap condition: StartA < EndB and EndA > StartB
      return startTime < res.endTime && endTime > res.startTime;
    });

    if (conflict) {
      if (conflict.userId === currentUser.id) {
        setError('Você já possui uma reserva neste horário.');
      } else {
        setConflictingRes(conflict);
      }
      return;
    }

    addReservation({
      title,
      roomId,
      date,
      startTime,
      endTime,
      userId: currentUser.id,
      services: selectedServices,
      status: 'CONFIRMADA'
    });

    onClose();
  };

  const resetForm = () => {
    setConflictingRes(null);
    setMyOfferResId('');
    setError('');
  };

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-2xl font-serif font-bold text-slate-800" style={{ fontFamily: 'Playfair Display, serif' }}>Nova Reserva</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full p-2">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-semibold border border-rose-100">{error}</div>}
          
          {conflictingRes ? (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
                <p className="font-semibold text-sm mb-1">Horário indisponível</p>
                <p className="text-xs">Já existe uma reserva para esta sala neste horário. Você pode oferecer uma de suas reservas futuras em troca.</p>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Selecione uma reserva sua para oferecer</label>
                {myAvailableReservations.length === 0 ? (
                  <p className="text-sm text-slate-500 py-2">Você não possui reservas futuras disponíveis para troca.</p>
                ) : (
                  <select 
                    className="w-full border border-slate-200 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm font-semibold"
                    value={myOfferResId}
                    onChange={e => setMyOfferResId(e.target.value)}
                  >
                    <option value="" disabled>Selecione uma reserva...</option>
                    {myAvailableReservations.map(res => {
                      const room = rooms.find(r => r.id === res.roomId);
                      return (
                        <option key={res.id} value={res.id}>
                          {res.title} ({room?.name}) - {format(new Date(res.date), 'dd/MM')} às {res.startTime}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Título do Evento</label>
                <input 
                  required
                  type="text" 
                  className="w-full border border-slate-200 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm font-semibold placeholder:text-slate-400"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Reunião de Planejamento"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Sala</label>
                <select 
                  className="w-full border border-slate-200 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm font-semibold"
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                >
                  {rooms.map(room => (
                    <option key={room.id} value={room.id} disabled={room.status === 'MANUTENCAO'}>
                      {room.name} {room.status === 'MANUTENCAO' ? '(Manutenção)' : `(Cap: ${room.capacity})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Data</label>
                  <input 
                    required
                    type="date" 
                    className="w-full border border-slate-200 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm font-semibold"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Início</label>
                  <input 
                    required
                    type="time" 
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm font-semibold"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Término</label>
                  <input 
                    required
                    type="time" 
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm font-semibold"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">Serviços Adicionais</label>
                <div className="space-y-2">
                  {services.map(service => (
                    <label key={service.id} className="flex items-center space-x-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => toggleService(service.id)}
                      />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{service.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="pt-6 flex justify-end space-x-3 border-t border-slate-100">
            {conflictingRes ? (
              <button 
                type="button" 
                onClick={resetForm}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 focus:outline-none transition-colors"
              >
                Voltar
              </button>
            ) : (
              <button 
                type="button" 
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 focus:outline-none transition-colors"
              >
                Cancelar
              </button>
            )}
            
            {conflictingRes ? (
              <button 
                type="submit"
                disabled={myAvailableReservations.length === 0}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-amber-600 border border-transparent rounded-full hover:bg-amber-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)]"
              >
                Solicitar Troca
              </button>
            ) : (
              <button 
                type="submit"
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-slate-900 border border-transparent rounded-full hover:bg-slate-800 focus:outline-none transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)]"
              >
                Confirmar Reserva
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
