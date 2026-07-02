import React from 'react';
import { useAppContext } from '../context/AppContext';
import { format, isToday } from 'date-fns';

export default function Dashboard() {
  const { reservations, rooms } = useAppContext();
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayReservations = reservations.filter(res => res.date === todayStr && res.status !== 'CANCELADA');
  
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-[10px] font-bold tracking-[0.2em] text-amber-600/80 uppercase mb-2">Visão Geral</h2>
        <h1 className="text-4xl font-serif font-bold text-slate-800 tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_32px_rgba(0,0,0,0.04)]">
          <h3 className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Reservas Hoje</h3>
          <p className="mt-4 text-5xl font-serif font-bold text-slate-800" style={{ fontFamily: 'Playfair Display, serif' }}>{todayReservations.length}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_32px_rgba(0,0,0,0.04)]">
          <h3 className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Salas Ativas</h3>
          <p className="mt-4 text-5xl font-serif font-bold text-slate-800" style={{ fontFamily: 'Playfair Display, serif' }}>{rooms.filter(r => r.status === 'DISPONIVEL').length}</p>
        </div>
      </div>
      
      <div className="pt-4">
        <h2 className="text-[10px] font-bold tracking-[0.2em] text-amber-600/80 uppercase mb-6">Próximas Reservas</h2>

        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          {todayReservations.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm font-medium">Nenhuma reserva para hoje.</div>
          ) : (
            <ul className="divide-y divide-slate-100/60">
              {todayReservations.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(res => {
                const room = rooms.find(r => r.id === res.roomId);
                return (
                  <li key={res.id} className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                    <div>
                      <p className="font-semibold text-slate-800 text-base">{res.title}</p>
                      <p className="text-sm text-slate-500 mt-1 flex items-center font-medium">
                        <span className="text-amber-700 font-semibold">{room?.name}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 mx-2.5"></span>
                        {res.startTime} - {res.endTime}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-200 transition-colors">
                      Confirmada
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
