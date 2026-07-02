import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { format, parseISO } from 'date-fns';
import { getProfileImageUrl } from '../lib/pocketbase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  requesterReservationId: string;
}

export default function RequestSwapModal({ isOpen, onClose, requesterReservationId }: Props) {
  const { reservations, rooms, users, currentUser, requestSwap, swapRequests } = useAppContext();
  
  const [selectedTargetId, setSelectedTargetId] = useState('');
  
  if (!isOpen) return null;

  const requesterRes = reservations.find(r => r.id === requesterReservationId);
  
  // Find valid reservations to swap with (future, not cancelled, belongs to someone else)
  // Exclude those already involved in a pending swap with this reservation
  const availableTargets = reservations.filter(res => {
    if (res.status === 'CANCELADA') return false;
    if (res.userId === currentUser.id) return false;
    
    const isPast = new Date(`${res.date}T${res.startTime}`) < new Date();
    if (isPast) return false;

    const hasPendingSwap = swapRequests.some(req => 
      req.status === 'PENDENTE' && 
      ((req.requesterReservationId === requesterReservationId && req.targetReservationId === res.id) || 
       (req.targetReservationId === requesterReservationId && req.requesterReservationId === res.id))
    );

    return !hasPendingSwap;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetId) return;

    const targetRes = reservations.find(r => r.id === selectedTargetId);
    if (!targetRes) return;

    requestSwap({
      requesterId: currentUser.id,
      requesterReservationId,
      targetUserId: targetRes.userId,
      targetReservationId: selectedTargetId
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Solicitar Troca de Reserva</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 flex flex-col overflow-hidden">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Sua Reserva</h3>
            <div className="bg-indigo-50 p-3 rounded-md text-sm text-indigo-900 border border-indigo-100">
              {requesterRes && (
                <>
                  <span className="font-semibold">{requesterRes.title}</span><br/>
                  {rooms.find(r => r.id === requesterRes.roomId)?.name} • {format(parseISO(requesterRes.date), 'dd/MM/yyyy')} das {requesterRes.startTime} às {requesterRes.endTime}
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selecione uma reserva para trocar</h3>
            
            {availableTargets.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma reserva disponível para troca.</p>
            ) : (
              <div className="space-y-2">
                {availableTargets.map(res => {
                  const room = rooms.find(r => r.id === res.roomId);
                  const user = users.find(u => u.id === res.userId);
                  
                  return (
                    <label 
                      key={res.id} 
                      className={`flex items-start p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedTargetId === res.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="targetRes" 
                        value={res.id}
                        checked={selectedTargetId === res.id}
                        onChange={() => setSelectedTargetId(res.id)}
                        className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">{res.title}</span>
                        <span className="block text-xs text-gray-500 mt-1">
                          {room?.name} • {format(parseISO(res.date), 'dd/MM/yyyy')} ({res.startTime} - {res.endTime})
                        </span>
                        <span className="flex items-center text-xs text-gray-500 mt-2">
                          <img src={user ? getProfileImageUrl(user.id, user.avatar) : ''} alt="" className="w-4 h-4 rounded-full mr-1.5" />
                          Reservado por {user?.name}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-6 mt-4 flex justify-end space-x-3 border-t border-slate-100 shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 focus:outline-none transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={!selectedTargetId}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-slate-900 border border-transparent rounded-full hover:bg-slate-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)]"
            >
              Enviar Solicitação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
