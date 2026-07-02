import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import RoomsList from './pages/RoomsList';
import CalendarView from './pages/CalendarView';
import MyReservations from './pages/MyReservations';
import SwapRequests from './pages/SwapRequests';
import AdminPanel from './pages/AdminPanel';

type View = 'dashboard' | 'rooms' | 'calendar' | 'my-reservations' | 'swap-requests' | 'admin';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { loading, currentUser } = useAppContext();

  if (loading || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-600/20">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 z-10">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'rooms' && <RoomsList />}
            {currentView === 'calendar' && <CalendarView />}
            {currentView === 'my-reservations' && <MyReservations />}
            {currentView === 'swap-requests' && <SwapRequests />}
            {currentView === 'admin' && <AdminPanel />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
