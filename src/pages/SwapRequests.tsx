import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { MessageCircle, Check, X, ArrowRightLeft } from 'lucide-react';
import ChatModal from '../components/ChatModal';
import { format, parseISO } from 'date-fns';
import { getProfileImageUrl } from '../lib/pocketbase';

export default function SwapRequests() {
  const { swapRequests, reservations, users, currentUser } = useAppContext();
  const [activeChatReqId, setActiveChatReqId] = useState<string | null>(null);

  const myRequests = swapRequests.filter(
    req => req.requesterId === currentUser.id || req.targetUserId === currentUser.id
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-[10px] font-bold tracking-[0.2em] text-amber-600/80 uppercase mb-2">Negociação</h2>
        <h1 className="text-4xl font-serif font-bold text-slate-800 tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Trocas & Negociações</h1>
        <p className="text-slate-500 mt-4 max-w-2xl text-sm leading-relaxed">Gerencie solicitações de troca de reservas com outros usuários.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        {myRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium">Nenhuma solicitação de troca encontrada.</div>
        ) : (
          <ul className="divide-y divide-slate-100/60">
            {myRequests.map(req => {
              const isReceived = req.targetUserId === currentUser.id;
              const otherUserId = isReceived ? req.requesterId : req.targetUserId;
              const otherUser = users.find(u => u.id === otherUserId);
              
              const myRes = reservations.find(r => r.id === (isReceived ? req.targetReservationId : req.requesterReservationId));
              const theirRes = reservations.find(r => r.id === (isReceived ? req.requesterReservationId : req.targetReservationId));

              return (
                <li key={req.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col lg:flex-row justify-between gap-6 group">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className={`text-[10px] font-bold tracking-[0.1em] px-2.5 py-1 rounded-full uppercase border ${
                        isReceived ? 'bg-indigo-50/50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {isReceived ? 'Recebida' : 'Enviada'}
                      </span>
                      <span className={`text-[10px] font-bold tracking-[0.1em] px-2.5 py-1 rounded-full uppercase border ${
                        req.status === 'PENDENTE' ? 'bg-yellow-50/50 text-yellow-700 border-yellow-200' :
                        req.status === 'ACEITA' ? 'bg-emerald-50/50 text-emerald-700 border-emerald-200' : 'bg-rose-50/50 text-rose-600 border-rose-200'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 mt-3 text-sm">
                      <img src={otherUser ? getProfileImageUrl(otherUser.id, otherUser.avatar) : ''} className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" alt="" />
                      <span className="font-semibold text-slate-700">{otherUser?.name}</span>
                      <span className="text-slate-500 text-xs font-medium">quer trocar a reserva:</span>
                    </div>

                    <div className="mt-4 flex items-center space-x-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">A reserva DELE(A)</p>
                        <p className="font-semibold text-sm text-slate-700">{theirRes?.title}</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{theirRes && format(parseISO(theirRes.date), 'dd/MM/yyyy')} <span className="mx-1 text-slate-300">•</span> {theirRes?.startTime} - {theirRes?.endTime}</p>
                      </div>
                      <div className="flex items-center justify-center flex-shrink-0 text-slate-300">
                        <ArrowRightLeft className="w-5 h-5 text-amber-600/50" />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">A SUA reserva</p>
                        <p className="font-semibold text-sm text-slate-700">{myRes?.title}</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{myRes && format(parseISO(myRes.date), 'dd/MM/yyyy')} <span className="mx-1 text-slate-300">•</span> {myRes?.startTime} - {myRes?.endTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 lg:mt-0 mt-4 self-start lg:self-center">
                    <button
                      onClick={() => setActiveChatReqId(req.id)}
                      className="text-[10px] font-bold uppercase tracking-widest text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center px-5 py-2.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)]"
                    >
                      <MessageCircle className="w-4 h-4 mr-2 text-amber-500" />
                      {req.status === 'PENDENTE' ? 'Negociar / Chat' : 'Ver Chat'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {activeChatReqId && (
        <ChatModal 
          isOpen={true} 
          onClose={() => setActiveChatReqId(null)} 
          swapRequestId={activeChatReqId} 
        />
      )}
    </div>
  );
}
