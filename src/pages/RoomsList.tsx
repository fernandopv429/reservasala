import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, MapPin, CheckCircle, XCircle } from 'lucide-react';

export default function RoomsList() {
  const { rooms } = useAppContext();

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-[10px] font-bold tracking-[0.2em] text-amber-600/80 uppercase mb-2">Infraestrutura</h2>
        <h1 className="text-4xl font-serif font-bold text-slate-800 tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Salas e Recursos</h1>
        <p className="text-slate-500 mt-4 max-w-2xl text-sm leading-relaxed">
          Explore nossa estrutura para atendimentos e procedimentos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div key={room.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden flex flex-col group p-2 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_32px_rgba(0,0,0,0.04)]">
            {room.image && (
              <div className="h-48 bg-slate-100 rounded-2xl overflow-hidden m-2">
                <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-serif font-bold text-slate-800" style={{ fontFamily: 'Playfair Display, serif' }}>{room.name}</h3>
                {room.status === 'DISPONIVEL' ? (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50/50 px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                    Ativa
                  </span>
                ) : (
                  <span className="text-[10px] text-rose-600 font-bold bg-rose-50/50 px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center border border-rose-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2" />
                    Manutenção
                  </span>
                )}
              </div>
              <div className="space-y-3 mt-2 mb-6">
                <div className="flex items-center text-sm font-medium text-slate-500">
                  <Users className="w-4 h-4 mr-3 text-amber-600/70" />
                  Capacidade: <span className="text-slate-700 ml-1">{room.capacity} pax</span>
                </div>
                <div className="flex items-center text-sm font-medium text-slate-500">
                  <MapPin className="w-4 h-4 mr-3 text-amber-600/70" />
                  {room.location}
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Equipamentos</h4>
                <div className="flex flex-wrap gap-2">
                  {room.resources.map(res => (
                    <span key={res} className="text-[11px] font-medium bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200">
                      {res}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
