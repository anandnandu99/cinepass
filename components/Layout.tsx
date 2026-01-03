
import React from 'react';
import { ICONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: any) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, onLogout }) => {
  const userStr = localStorage.getItem('cinepass_user');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-0">
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform"><ICONS.Ticket /></div>
            <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">CINEPASS</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-slate-500">
              <button onClick={() => onNavigate('home')} className={`hover:text-white transition-colors ${activeView === 'home' ? 'text-indigo-400' : ''}`}>Movies</button>
              <button className="hover:text-white transition-colors">Theaters</button>
              {user && <button onClick={() => onNavigate('profile')} className={`hover:text-white transition-colors ${activeView === 'profile' ? 'text-indigo-400' : ''}`}>My Bookings</button>}
              {user?.isAdmin && <button onClick={() => onNavigate('admin')} className={`hover:text-white transition-colors ${activeView === 'admin' ? 'text-indigo-400' : ''}`}>Admin</button>}
            </nav>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                  <div className="text-right"><p className="text-[10px] font-bold text-slate-500 uppercase">{user.isAdmin ? 'Administrator' : 'Platinum Member'}</p><p className="text-sm font-bold text-white">{user.name}</p></div>
                  <button onClick={() => onNavigate('profile')} className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 p-1 hover:border-indigo-500 transition-colors"><img src={`https://i.pravatar.cc/150?u=${user.id}`} className="w-full h-full rounded-full object-cover" /></button>
                  <button onClick={onLogout} className="p-2 text-slate-500 hover:text-red-400 transition-colors" title="Logout"><ICONS.Logout /></button>
                </div>
              ) : <button onClick={() => onNavigate('home')} className="px-5 py-2 bg-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all">Sign In</button>}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 flex justify-around items-center h-20 md:hidden z-50">
        <button onClick={() => onNavigate('home')} className={`flex flex-col items-center gap-1 ${activeView === 'home' ? 'text-indigo-400' : 'text-slate-500'}`}><ICONS.Home /><span className="text-[9px] uppercase font-black tracking-widest">Home</span></button>
        <button className="flex flex-col items-center gap-1 text-slate-500"><ICONS.Search /><span className="text-[9px] uppercase font-black tracking-widest">Discover</span></button>
        <button onClick={() => onNavigate('profile')} className={`flex flex-col items-center gap-1 ${activeView === 'profile' ? 'text-indigo-400' : 'text-slate-500'}`}><ICONS.Ticket /><span className="text-[9px] uppercase font-black tracking-widest">Bookings</span></button>
        {user?.isAdmin && (
          <button onClick={() => onNavigate('admin')} className={`flex flex-col items-center gap-1 ${activeView === 'admin' ? 'text-indigo-400' : 'text-slate-500'}`}><ICONS.Settings /><span className="text-[9px] uppercase font-black tracking-widest">Admin</span></button>
        )}
        <button onClick={onLogout} className="flex flex-col items-center gap-1 text-slate-500 hover:text-red-400"><ICONS.Logout /><span className="text-[9px] uppercase font-black tracking-widest">Logout</span></button>
      </nav>
    </div>
  );
};

export default Layout;
