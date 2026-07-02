import React, { useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Upload, Loader2 } from 'lucide-react';
import { getProfileImageUrl } from '../lib/pocketbase';

export default function Topbar() {
  const { currentUser, setCurrentUser, users } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch(`/api/users/${currentUser.id}/avatar`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // Update local user state
        const updatedUser = { ...currentUser, avatar: data.avatar };
        setCurrentUser(updatedUser);
        // We might also want to force a refresh of the context or it'll update on the next poll
      }
    } catch (error) {
      console.error('Failed to upload avatar', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 z-20 shadow-[0_4px_24px_rgba(19,152,199,0.02)]">
      <div className="flex-1 flex items-center">
        <div className="flex items-center text-black hidden sm:flex">
          <span className="text-4xl font-bold tracking-tighter" style={{ fontFamily: 'Playfair Display, serif' }}>FAV</span>
          <span className="text-[11px] tracking-[0.3em] ml-2 mt-2" style={{ fontFamily: 'Playfair Display, serif', color: '#c0a062' }}>
            GROUP
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-3 md:space-x-6">
        <div className="flex items-center text-sm bg-slate-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-slate-200">
          <span className="text-slate-400 mr-2 text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Conta:</span>
          <select 
            value={currentUser?.id || ''}
            onChange={(e) => {
              const u = users.find(u => u.id === e.target.value);
              if (u) setCurrentUser(u);
            }}
            className="bg-transparent border-none text-slate-700 font-semibold text-sm focus:ring-0 appearance-none outline-none cursor-pointer hover:text-amber-600 transition-colors"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
        
        <div 
          className="relative h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
          ) : currentUser?.avatar ? (
            <>
              <img src={getProfileImageUrl(currentUser.id, currentUser.avatar)} alt={currentUser.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="h-4 w-4 text-white" />
              </div>
            </>
          ) : (
            <>
              <User className="h-5 w-5 text-slate-400" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="h-4 w-4 text-white" />
              </div>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>
    </header>
  );
}
