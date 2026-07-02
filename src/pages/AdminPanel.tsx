import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Shield, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export default function AdminPanel() {
  const { users, rooms, services, reservations, fetchData } = useAppContext();
  const [activeTab, setActiveTab] = useState<'users' | 'rooms' | 'services' | 'reservations'>('users');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Shield className="h-6 w-6 text-amber-600" />
          Painel Administrativo
        </h1>
        <p className="text-slate-500 mt-1">Gerencie usuários, salas, serviços e reservas do sistema.</p>
      </div>

      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Usuários
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'rooms' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Salas
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'services' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Serviços
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'reservations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Reservas
        </button>
      </div>

      {activeTab === 'users' && <UsersManager users={users} onUpdate={fetchData} />}
      {activeTab === 'rooms' && <RoomsManager rooms={rooms} onUpdate={fetchData} />}
      {activeTab === 'services' && <ServicesManager services={services} onUpdate={fetchData} />}
      {activeTab === 'reservations' && <ReservationsManager reservations={reservations} users={users} rooms={rooms} onUpdate={fetchData} />}
    </div>
  );
}

function UsersManager({ users, onUpdate }: { users: any[], onUpdate: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', role: 'USER', avatar: '', color: '#3b82f6' });

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setFormData({ name: user.name, role: user.role, avatar: user.avatar || '', color: user.color || '#3b82f6' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', role: 'USER', avatar: '', color: '#3b82f6' });
  };

  const handleSave = async (id?: string) => {
    try {
      const url = id ? `/api/users/${id}` : '/api/users';
      const method = id ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      onUpdate();
      handleCancel();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="font-semibold text-slate-900">Gerenciar Usuários</h2>
        <button 
          onClick={() => setEditingId('new')}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Usuário
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Papel</th>
              <th className="px-6 py-4">Avatar (URL)</th>
              <th className="px-6 py-4">Cor</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {editingId === 'new' && (
              <tr className="bg-amber-50/30">
                <td className="px-6 py-3">
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" placeholder="Nome" />
                </td>
                <td className="px-6 py-3">
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="border rounded px-2 py-1 text-sm">
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="px-6 py-3">
                  <input type="text" value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" placeholder="URL do Avatar" />
                </td>
                <td className="px-6 py-3">
                  <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="border rounded h-8 w-12 cursor-pointer" />
                </td>
                <td className="px-6 py-3 text-right space-x-2">
                  <button onClick={() => handleSave()} className="text-green-600 hover:text-green-700 p-1"><Check className="w-4 h-4" /></button>
                  <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
                </td>
              </tr>
            )}
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50">
                {editingId === user.id ? (
                  <>
                    <td className="px-6 py-3">
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-6 py-3">
                      <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="border rounded px-2 py-1 text-sm">
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <input type="text" value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-6 py-3">
                      <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="border rounded h-8 w-12 cursor-pointer" />
                    </td>
                    <td className="px-6 py-3 text-right space-x-2">
                      <button onClick={() => handleSave(user.id)} className="text-green-600 hover:text-green-700 p-1"><Check className="w-4 h-4" /></button>
                      <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{user.avatar}</td>
                    <td className="px-6 py-4">
                      {user.color ? (
                        <div className="w-6 h-6 rounded-md shadow-sm border border-slate-200" style={{ backgroundColor: user.color }} title={user.color}></div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(user)} className="text-slate-400 hover:text-amber-600 transition-colors p-1"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(user.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoomsManager({ rooms, onUpdate }: { rooms: any[], onUpdate: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', capacity: 10, resources: [] as string[], location: '', status: 'DISPONIVEL', image: '' });

  const handleEdit = (room: any) => {
    setEditingId(room.id);
    setFormData({ name: room.name, capacity: room.capacity, resources: room.resources || [], location: room.location, status: room.status, image: room.image || '' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', capacity: 10, resources: [], location: '', status: 'DISPONIVEL', image: '' });
  };

  const handleSave = async (id?: string) => {
    try {
      const url = id ? `/api/rooms/${id}` : '/api/rooms';
      const method = id ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      onUpdate();
      handleCancel();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta sala? (Pode falhar se houver reservas vinculadas)')) return;
    try {
      await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
      onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="font-semibold text-slate-900">Gerenciar Salas</h2>
        <button 
          onClick={() => setEditingId('new')}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nova Sala
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Capacidade</th>
              <th className="px-6 py-4">Localização</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {editingId === 'new' && (
              <tr className="bg-amber-50/30">
                <td className="px-6 py-3">
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" placeholder="Nome" />
                </td>
                <td className="px-6 py-3">
                  <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} className="w-full border rounded px-2 py-1 text-sm" />
                </td>
                <td className="px-6 py-3">
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" placeholder="Andar X..." />
                </td>
                <td className="px-6 py-3">
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="border rounded px-2 py-1 text-sm">
                    <option value="DISPONIVEL">DISPONIVEL</option>
                    <option value="MANUTENCAO">MANUTENCAO</option>
                  </select>
                </td>
                <td className="px-6 py-3 text-right space-x-2">
                  <button onClick={() => handleSave()} className="text-green-600 hover:text-green-700 p-1"><Check className="w-4 h-4" /></button>
                  <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
                </td>
              </tr>
            )}
            {rooms.map(room => (
              <tr key={room.id} className="hover:bg-slate-50/50">
                {editingId === room.id ? (
                  <>
                    <td className="px-6 py-3">
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-6 py-3">
                      <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} className="w-full border rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-6 py-3">
                      <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-6 py-3">
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="border rounded px-2 py-1 text-sm">
                        <option value="DISPONIVEL">DISPONIVEL</option>
                        <option value="MANUTENCAO">MANUTENCAO</option>
                      </select>
                    </td>
                    <td className="px-6 py-3 text-right space-x-2">
                      <button onClick={() => handleSave(room.id)} className="text-green-600 hover:text-green-700 p-1"><Check className="w-4 h-4" /></button>
                      <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 font-medium text-slate-900">{room.name}</td>
                    <td className="px-6 py-4 text-slate-500">{room.capacity} pessoas</td>
                    <td className="px-6 py-4 text-slate-500">{room.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${room.status === 'DISPONIVEL' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(room)} className="text-slate-400 hover:text-amber-600 transition-colors p-1"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(room.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ServicesManager({ services, onUpdate }: { services: any[], onUpdate: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '' });

  const handleEdit = (service: any) => {
    setEditingId(service.id);
    setFormData({ name: service.name, description: service.description || '', icon: service.icon || '' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', icon: '' });
  };

  const handleSave = async (id?: string) => {
    try {
      const url = id ? `/api/services/${id}` : '/api/services';
      const method = id ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      onUpdate();
      handleCancel();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
      onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="font-semibold text-slate-900">Gerenciar Serviços Adicionais</h2>
        <button 
          onClick={() => setEditingId('new')}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Serviço
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Ícone</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {editingId === 'new' && (
              <tr className="bg-amber-50/30">
                <td className="px-6 py-3">
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" placeholder="Ex: Coffee Break" />
                </td>
                <td className="px-6 py-3">
                  <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" placeholder="Descrição" />
                </td>
                <td className="px-6 py-3">
                  <input type="text" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" placeholder="lucide-icon-name" />
                </td>
                <td className="px-6 py-3 text-right space-x-2">
                  <button onClick={() => handleSave()} className="text-green-600 hover:text-green-700 p-1"><Check className="w-4 h-4" /></button>
                  <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
                </td>
              </tr>
            )}
            {services.map(service => (
              <tr key={service.id} className="hover:bg-slate-50/50">
                {editingId === service.id ? (
                  <>
                    <td className="px-6 py-3">
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-6 py-3">
                      <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-6 py-3">
                      <input type="text" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-6 py-3 text-right space-x-2">
                      <button onClick={() => handleSave(service.id)} className="text-green-600 hover:text-green-700 p-1"><Check className="w-4 h-4" /></button>
                      <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 font-medium text-slate-900">{service.name}</td>
                    <td className="px-6 py-4 text-slate-500">{service.description}</td>
                    <td className="px-6 py-4 text-slate-500">{service.icon}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(service)} className="text-slate-400 hover:text-amber-600 transition-colors p-1"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(service.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReservationsManager({ reservations, users, rooms, onUpdate }: { reservations: any[], users: any[], rooms: any[], onUpdate: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', roomId: '', userId: '', date: '', startTime: '', endTime: '', status: 'PENDING', services: [] as string[] });

  const handleEdit = (res: any) => {
    setEditingId(res.id);
    setFormData({ 
      title: res.title, 
      roomId: res.roomId, 
      userId: res.userId, 
      date: res.date, 
      startTime: res.startTime, 
      endTime: res.endTime, 
      status: res.status, 
      services: res.services || [] 
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: '', roomId: '', userId: '', date: '', startTime: '', endTime: '', status: 'PENDING', services: [] });
  };

  const handleSave = async (id?: string) => {
    try {
      const url = id ? `/api/reservations/${id}` : '/api/reservations';
      const method = id ? 'PUT' : 'POST';
      // For POST, we need an id
      const payload = { ...formData, id: id || `res${Date.now()}` };
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      onUpdate();
      handleCancel();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta reserva?')) return;
    try {
      await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
      onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="font-semibold text-slate-900">Gerenciar Reservas</h2>
        <button 
          onClick={() => setEditingId('new')}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nova Reserva
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Título / Sala</th>
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Data / Horário</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {editingId === 'new' && (
              <tr className="bg-amber-50/30">
                <td className="px-6 py-3 flex flex-col gap-1">
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" placeholder="Título" />
                  <select value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})} className="border rounded px-2 py-1 text-sm">
                    <option value="">Selecione a Sala</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </td>
                <td className="px-6 py-3">
                  <select value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} className="border rounded px-2 py-1 text-sm">
                    <option value="">Selecione o Usuário</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </td>
                <td className="px-6 py-3 flex flex-col gap-1">
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" />
                  <div className="flex gap-1">
                    <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" />
                    <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" />
                  </div>
                </td>
                <td className="px-6 py-3">
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="border rounded px-2 py-1 text-sm">
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
                <td className="px-6 py-3 text-right space-x-2">
                  <button onClick={() => handleSave()} className="text-green-600 hover:text-green-700 p-1"><Check className="w-4 h-4" /></button>
                  <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
                </td>
              </tr>
            )}
            {reservations.map(res => (
              <tr key={res.id} className="hover:bg-slate-50/50">
                {editingId === res.id ? (
                  <>
                    <td className="px-6 py-3 flex flex-col gap-1">
                      <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" />
                      <select value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})} className="border rounded px-2 py-1 text-sm">
                        <option value="">Selecione a Sala</option>
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <select value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} className="border rounded px-2 py-1 text-sm">
                        <option value="">Selecione o Usuário</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-3 flex flex-col gap-1">
                      <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" />
                      <div className="flex gap-1">
                        <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" />
                        <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" />
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="border rounded px-2 py-1 text-sm">
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="px-6 py-3 text-right space-x-2">
                      <button onClick={() => handleSave(res.id)} className="text-green-600 hover:text-green-700 p-1"><Check className="w-4 h-4" /></button>
                      <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{res.title}</div>
                      <div className="text-xs text-slate-500">{rooms.find((r: any) => r.id === res.roomId)?.name}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{users.find((u: any) => u.id === res.userId)?.name}</td>
                    <td className="px-6 py-4 text-slate-500">
                      <div>{res.date}</div>
                      <div className="text-xs">{res.startTime} - {res.endTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                        res.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                        res.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(res)} className="text-slate-400 hover:text-amber-600 transition-colors p-1"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(res.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
