import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { format, parseISO } from 'date-fns';
import { Repeat2, XCircle } from 'lucide-react';
import RequestSwapModal from '../components/RequestSwapModal';

export default function MyReservations() {
  const { reservations, rooms, currentUser, cancelReservation } = useAppContext();
  const [swapModalResId, setSwapModalResId] = useState<string | null>(null);

  const myReservations = reservations
    .filter(res => res.userId === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-[10px] font-bold tracking-[0.2em] text-amber-600/80 uppercase mb-2">Minha Área</h2>
        <h1 className="text-4xl font-serif font-bold text-slate-800 tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Minhas Reservas</h1>
        <p className="text-slate-500 mt-4 max-w-2xl text-sm leading-relaxed">Gerencie seus agendamentos ou solicite troca de horários.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        {myReservations.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium">Você não possui reservas.</div>
        ) : (
          <ul className="divide-y divide-slate-100/60">
            {myReservations.map(res => {
              const room = rooms.find(r => r.id === res.roomId);
              const isPast = new Date(`${res.date}T${res.startTime}`) < new Date();
              const canSwap = res.status === 'CONFIRMADA' && !isPast;
              
              return (
                <li key={res.id} className={`p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group ${res.status === 'CANCELADA' ? 'opacity-50 grayscale' : ''}`}>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-slate-800 text-base">{res.title}</h4>
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest uppercase border ${
                        res.status === 'CONFIRMADA' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                        {res.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 flex items-center">
                      <span className="text-amber-700 font-semibold mr-2">{room?.name}</span> 
                      <span className="w-1 h-1 rounded-full bg-slate-300 mx-2"></span>
                      {format(parseISO(res.date), 'dd/MM/yyyy')} 
                      <span className="w-1 h-1 rounded-full bg-slate-300 mx-2"></span>
                      {res.startTime} - {res.endTime}
                    </p>
                  </div>
                  
                  {res.status === 'CONFIRMADA' && (
                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                      {canSwap && (
                        <button
                          onClick={() => setSwapModalResId(res.id)}
                          className="text-[10px] font-bold uppercase tracking-widest text-slate-700 hover:text-amber-700 transition-colors flex items-center bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50 px-4 py-2 rounded-full"
                        >
                          <Repeat2 className="w-4 h-4 mr-2" />
                          Trocar
                        </button>
                      )}
                      <button
                        onClick={() => cancelReservation(res.id)}
                        className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors flex items-center bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 px-4 py-2 rounded-full"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancelar
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {swapModalResId && (
        <RequestSwapModal 
          isOpen={true} 
          onClose={() => setSwapModalResId(null)} 
          requesterReservationId={swapModalResId} 
        />
      )}
    </div>
  );
}
