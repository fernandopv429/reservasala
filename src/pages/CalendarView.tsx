import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import NewReservationModal from '../components/NewReservationModal';
import { getProfileImageUrl } from '../lib/pocketbase';

const getPastelColors = (str: string | undefined) => {
  const colors = [
    { bg: 'bg-pink-200', text: 'text-pink-900', border: 'border-pink-300', icon: 'text-pink-600' },
    { bg: 'bg-yellow-200', text: 'text-yellow-900', border: 'border-yellow-400', icon: 'text-yellow-600' },
    { bg: 'bg-purple-200', text: 'text-purple-900', border: 'border-purple-300', icon: 'text-purple-600' },
    { bg: 'bg-sky-200', text: 'text-sky-900', border: 'border-sky-300', icon: 'text-sky-600' },
    { bg: 'bg-rose-200', text: 'text-rose-900', border: 'border-rose-300', icon: 'text-rose-600' },
    { bg: 'bg-emerald-200', text: 'text-emerald-900', border: 'border-emerald-300', icon: 'text-emerald-600' },
  ];
  if (!str) return colors[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const formatHour = (h: number) => {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h;
  return { hour, ampm };
};

export default function CalendarView() {
  const { reservations, rooms, users } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRoomId, setModalRoomId] = useState<string | undefined>();
  const [modalStartTime, setModalStartTime] = useState<string | undefined>();

  const dayReservations = reservations
    .filter(res => res.date === selectedDate && res.status !== 'CANCELADA')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 07:00 to 21:00

  const handlePrevDay = () => setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));
  const handleNextDay = () => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <h1 className="text-3xl font-serif font-bold text-slate-800 capitalize" style={{ fontFamily: 'Playfair Display, serif' }}>
            {format(parseISO(selectedDate), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h1>
          
          <div className="flex items-center space-x-4 bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-sm">
            <button onClick={handlePrevDay} className="text-slate-400 hover:text-amber-600 transition-colors p-1">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-slate-600 min-w-[80px] text-center">
              {format(parseISO(selectedDate), "dd/MM/yyyy")}
            </span>
            <button onClick={handleNextDay} className="text-slate-400 hover:text-amber-600 transition-colors p-1">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-full text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)] focus:outline-none"
        >
          <Plus className="w-4 h-4 mr-2 text-amber-500" />
          Nova Reserva
        </button>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden flex shadow-sm border border-slate-200">
        {/* Time labels column */}
        <div className="w-20 flex flex-col border-r border-slate-100 flex-shrink-0">
          <div className="h-16 border-b border-slate-100"></div>
          {HOURS.map(hour => {
            const { hour: h, ampm } = formatHour(hour);
            return (
              <div key={hour} className="h-24 border-b border-slate-50 relative">
                <span className="absolute -top-3 right-4 text-xs font-semibold text-slate-500">
                  {h} <span className="text-[10px] text-slate-400 ml-0.5">{ampm}</span>
                </span>
              </div>
            )
          })}
        </div>

        {/* Rooms columns */}
        <div className="flex-1 flex overflow-x-auto">
          {rooms.map(room => {
            const roomRes = dayReservations.filter(r => r.roomId === room.id);
            return (
              <div key={room.id} className="flex-1 min-w-[200px] border-r border-slate-100 relative">
                {/* Header */}
                <div className="h-16 border-b border-slate-100 flex items-center justify-center">
                  <span className="text-slate-700 text-sm font-semibold">{room.name}</span>
                </div>
                
                {/* Time slots container */}
                <div className="relative bg-white" style={{ height: `${HOURS.length * 96}px` }}>
                  {/* Background grid lines */}
                  {HOURS.map(hour => (
                    <div 
                      key={hour} 
                      className="h-24 border-b border-slate-50 w-full hover:bg-slate-50/80 cursor-pointer transition-colors" 
                      onClick={() => {
                        setModalRoomId(room.id);
                        setModalStartTime(`${String(hour).padStart(2, '0')}:00`);
                        setIsModalOpen(true);
                      }}
                    />
                  ))}

                  {/* Reservations */}
                  {roomRes.map(res => {
                    const startParts = res.startTime.split(':');
                    const endParts = res.endTime.split(':');
                    
                    const startHour = parseInt(startParts[0], 10);
                    const startMin = parseInt(startParts[1], 10);
                    const endHour = parseInt(endParts[0], 10);
                    const endMin = parseInt(endParts[1], 10);

                    // Calculations (96px per hour)
                    const topPos = ((startHour - HOURS[0]) + (startMin / 60)) * 96;
                    const durationHours = (endHour - startHour) + ((endMin - startMin) / 60);
                    const height = durationHours * 96;
                    
                    const user = users.find(u => u.id === res.userId);
                    const colors = getPastelColors(res.title);

                    const dynamicStyle: any = { top: `${topPos + 2}px`, height: `${height - 4}px` };
                    let containerClass = `absolute left-1.5 right-1.5 rounded-xl p-2.5 overflow-hidden transition-all z-10 shadow-sm border flex flex-col`;
                    
                    if (user?.color) {
                      dynamicStyle.backgroundColor = user.color + '40'; // ~25% opacity
                      dynamicStyle.borderColor = user.color;
                    } else {
                      containerClass += ` ${colors.bg} ${colors.border}`;
                    }

                    return (
                      <div 
                        key={res.id} 
                        className={containerClass}
                        style={dynamicStyle}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center">
                            <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 mr-1.5 ${user?.color ? '' : colors.icon}`} style={user?.color ? { color: user.color } : undefined} />
                            <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight">{res.title}</p>
                          </div>
                        </div>
                        <p className={`text-[10px] font-medium mt-1 ${user?.color ? '' : colors.text} ml-5`} style={user?.color ? { color: user.color } : undefined}>{res.startTime} - {res.endTime}</p>
                        
                        {user && (
                          <div className="mt-auto pt-2 flex items-center ml-5">
                            <img src={getProfileImageUrl(user.id, user.avatar)} className="w-5 h-5 rounded-full mr-1.5 border border-white shadow-sm" alt={user.name} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {isModalOpen && (
        <NewReservationModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setModalRoomId(undefined);
            setModalStartTime(undefined);
          }} 
          selectedDate={selectedDate}
          initialRoomId={modalRoomId}
          initialStartTime={modalStartTime}
        />
      )}
    </div>
  );
}
