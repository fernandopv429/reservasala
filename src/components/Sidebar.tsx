import React from 'react';
import { LayoutDashboard, Building2, Calendar as CalendarIcon, ClipboardList, Repeat2, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

export default function Sidebar({ currentView, setCurrentView }: { currentView: string, setCurrentView: (v: any) => void }) {
  const { swapRequests, currentUser } = useAppContext();
  
  const pendingSwaps = swapRequests.filter(
    (req) => req.status === 'PENDENTE' && (req.targetUserId === currentUser?.id || req.requesterId === currentUser?.id)
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-amber-600' },
    { id: 'calendar', label: 'Calendário & Nova Reserva', icon: CalendarIcon, color: 'text-amber-600' },
    { id: 'rooms', label: 'Salas e Recursos', icon: Building2, color: 'text-amber-600' },
    { id: 'my-reservations', label: 'Minhas Reservas', icon: ClipboardList, color: 'text-amber-600' },
    { id: 'swap-requests', label: 'Trocas & Negociações', icon: Repeat2, badge: pendingSwaps > 0 ? pendingSwaps : undefined, color: 'text-amber-600' },
  ];

  if (currentUser?.role === 'ADMIN') {
    navItems.push({ id: 'admin', label: 'Administração', icon: Shield, color: 'text-rose-600' });
  }

  return (
    <div className="bg-white border-r border-slate-100 flex flex-col h-full z-20 w-16 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="h-20 flex items-center justify-center border-b border-slate-100 overflow-hidden">
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-black">
          <span className="font-serif text-xl font-bold tracking-tighter" style={{ fontFamily: 'Playfair Display, serif' }}>FAV</span>
        </div>
      </div>
      <nav className="flex-1 py-6 space-y-3 px-2 overflow-x-hidden">
        {navItems.map((item) => {
          const active = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              title={item.label}
              className={cn(
                "w-full relative flex items-center justify-center py-3 text-sm font-medium rounded-xl transition-all duration-300 group",
                active 
                  ? "bg-slate-50 shadow-sm border border-slate-100" 
                  : "hover:bg-slate-50 border border-transparent"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", active ? item.color : `text-slate-400 group-hover:${item.color}`)} />
              {item.badge && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-400 border-2 border-white" />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
