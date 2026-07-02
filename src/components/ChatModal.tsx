import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Check, XCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getProfileImageUrl } from '../lib/pocketbase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  swapRequestId: string;
}

export default function ChatModal({ isOpen, onClose, swapRequestId }: Props) {
  const { swapRequests, chatMessages, sendMessage, updateSwapRequestStatus, currentUser, users, reservations, rooms } = useAppContext();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const req = swapRequests.find(r => r.id === swapRequestId);
  const messages = chatMessages.filter(m => m.swapRequestId === swapRequestId).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen || !req) return null;

  const isReceived = req.targetUserId === currentUser.id;
  const otherUserId = isReceived ? req.requesterId : req.targetUserId;
  const otherUser = users.find(u => u.id === otherUserId);

  const myRes = reservations.find(r => r.id === (isReceived ? req.targetReservationId : req.requesterReservationId));
  const theirRes = reservations.find(r => r.id === (isReceived ? req.requesterReservationId : req.targetReservationId));

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage({
      swapRequestId,
      senderId: currentUser.id,
      text: text.trim(),
    });
    setText('');
  };

  const handleAccept = () => {
    updateSwapRequestStatus(swapRequestId, 'ACEITA');
    onClose();
  };

  const handleReject = () => {
    updateSwapRequestStatus(swapRequestId, 'RECUSADA');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <img src={otherUser ? getProfileImageUrl(otherUser.id, otherUser.avatar) : ''} className="w-10 h-10 rounded-full" alt="" />
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Negociação com {otherUser?.name}</h2>
              <p className="text-xs text-gray-500">Status: <span className="font-semibold">{req.status}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Swap Details */}
        <div className="bg-gray-50 p-4 border-b border-gray-100 shrink-0 text-sm">
          <p className="font-medium text-gray-700 mb-2">Detalhes da Troca Proposta:</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-white p-3 rounded border border-gray-200">
              <span className="text-xs text-gray-500 uppercase">Ele(a) oferece:</span>
              <p className="font-semibold text-gray-900 truncate">{theirRes?.title}</p>
              <p className="text-xs text-gray-600 mt-1">{theirRes && format(parseISO(theirRes.date), 'dd/MM/yyyy')} {theirRes?.startTime} - {theirRes?.endTime}</p>
            </div>
            <div className="flex-1 bg-white p-3 rounded border border-gray-200">
              <span className="text-xs text-gray-500 uppercase">Em troca de:</span>
              <p className="font-semibold text-gray-900 truncate">{myRes?.title}</p>
              <p className="text-xs text-gray-600 mt-1">{myRes && format(parseISO(myRes.date), 'dd/MM/yyyy')} {myRes?.startTime} - {myRes?.endTime}</p>
            </div>
          </div>
          {isReceived && req.status === 'PENDENTE' && (
            <div className="mt-4 flex space-x-3">
              <button onClick={handleAccept} className="flex-1 bg-green-600 text-white py-2 rounded-md font-medium text-sm hover:bg-green-700 flex items-center justify-center">
                <Check className="w-4 h-4 mr-2" /> Aceitar Troca
              </button>
              <button onClick={handleReject} className="flex-1 bg-red-100 text-red-700 py-2 rounded-md font-medium text-sm hover:bg-red-200 flex items-center justify-center">
                <XCircle className="w-4 h-4 mr-2" /> Recusar
              </button>
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-white space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 text-sm mt-10">
              Nenhuma mensagem ainda. Envie uma mensagem para negociar a troca.
            </div>
          ) : (
            messages.map(msg => {
              const isMine = msg.senderId === currentUser.id;
              const sender = users.find(u => u.id === msg.senderId);
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[75%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                    <img src={sender ? getProfileImageUrl(sender.id, sender.avatar) : ''} className="w-8 h-8 rounded-full flex-shrink-0" alt="" />
                    <div className={`mx-2 p-3 rounded-2xl ${
                      isMine ? 'bg-amber-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-900 rounded-tl-none'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                      <span className={`text-[10px] mt-1 block ${isMine ? 'text-amber-100' : 'text-slate-500'}`}>
                        {format(parseISO(msg.timestamp), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        {req.status === 'PENDENTE' && (
          <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-slate-50 flex shrink-0">
            <input 
              type="text" 
              className="flex-1 border border-slate-200 rounded-l-full p-2.5 px-4 text-sm focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="Digite sua mensagem..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-amber-600 text-white px-5 py-2.5 rounded-r-full hover:bg-amber-700 flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
