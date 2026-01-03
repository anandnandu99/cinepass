
import React, { useState } from 'react';
import { MOVIES, CINEMAS, SHOWS, ICONS } from '../constants';
import { Movie, Cinema, Show } from '../types';

type ManagementType = 'movies' | 'theaters' | 'shows';

const AdminDashboard: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(MOVIES);
  const [theaters, setTheaters] = useState<Cinema[]>(CINEMAS);
  const [shows, setShows] = useState<Show[]>(SHOWS);
  const [activeTab, setActiveTab] = useState<ManagementType | 'stats'>('movies');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ManagementType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [movieForm, setMovieForm] = useState<Partial<Movie>>({});
  const [theaterForm, setTheaterForm] = useState<Partial<Cinema>>({});
  const [showForm, setShowForm] = useState<Partial<Show>>({});

  const openModal = (type: ManagementType, id: string | null = null) => {
    setModalType(type);
    setEditingId(id);
    setIsModalOpen(true);

    if (type === 'movies') {
      const item = id ? movies.find(m => m.id === id) : null;
      setMovieForm(item || { title: '', genre: [], formats: ['2D'], rating: 0, duration: '' });
    } else if (type === 'theaters') {
      const item = id ? theaters.find(t => t.id === id) : null;
      setTheaterForm(item || { name: '', location: '', screens: 1 });
    } else if (type === 'shows') {
      const item = id ? shows.find(s => s.id === id) : null;
      setShowForm(item || { movieId: movies[0]?.id, cinemaId: theaters[0]?.id, time: '12:00 PM', date: new Date().toISOString().split('T')[0], screen: 1, format: '2D', price: 10 });
    }
  };

  const handleSave = () => {
    if (modalType === 'movies') {
      if (editingId) {
        setMovies(prev => prev.map(m => m.id === editingId ? { ...m, ...movieForm } as Movie : m));
      } else {
        const newDoc = { ...movieForm, id: Date.now().toString(), poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=400&h=600' } as Movie;
        setMovies(prev => [...prev, newDoc]);
      }
    } else if (modalType === 'theaters') {
      if (editingId) {
        setTheaters(prev => prev.map(t => t.id === editingId ? { ...t, ...theaterForm } as Cinema : t));
      } else {
        const newDoc = { ...theaterForm, id: 'c' + Date.now().toString(), distance: '0.0 km' } as Cinema;
        setTheaters(prev => [...prev, newDoc]);
      }
    } else if (modalType === 'shows') {
      if (editingId) {
        setShows(prev => prev.map(s => s.id === editingId ? { ...s, ...showForm } as Show : s));
      } else {
        const newDoc = { ...showForm, id: 's' + Date.now().toString() } as Show;
        setShows(prev => [...prev, newDoc]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = (type: ManagementType, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    if (type === 'movies') setMovies(prev => prev.filter(m => m.id !== id));
    if (type === 'theaters') setTheaters(prev => prev.filter(t => t.id !== id));
    if (type === 'shows') setShows(prev => prev.filter(s => s.id !== id));
  };

  const navItems = [
    { id: 'movies', label: 'Movies', icon: <ICONS.Film /> },
    { id: 'theaters', label: 'Theaters', icon: <ICONS.Building /> },
    { id: 'shows', label: 'Shows', icon: <ICONS.Calendar /> },
    { id: 'stats', label: 'Analytics', icon: <ICONS.ChartBar /> },
  ] as const;

  return (
    <div className="animate-fadeIn min-h-[calc(100vh-100px)] flex flex-col md:flex-row bg-slate-950/30 rounded-[2.5rem] border border-slate-800/50 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900/40 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-black text-white px-3">Console</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] px-3 mt-1">Management</p>
        </div>
        
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap md:w-full ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className={activeTab === item.id ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto hidden md:block px-3">
          <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Network Health</p>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Nodes Active</span>
              <span className="text-green-400 font-bold">100%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-3xl font-black text-white capitalize">{activeTab}</h3>
            <p className="text-slate-500 mt-1">
              {activeTab === 'stats' ? 'Overview of your cinema network performance.' : `Manage your ${activeTab} and schedules.`}
            </p>
          </div>
          {activeTab !== 'stats' && (
            <button 
              onClick={() => openModal(activeTab as ManagementType)}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="text-xl leading-none">+</span> Add {activeTab === 'movies' ? 'Movie' : activeTab === 'theaters' ? 'Theater' : 'Show'}
            </button>
          )}
        </div>

        {/* Content Tabs */}
        {activeTab === 'movies' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {movies.map(movie => (
              <div key={movie.id} className="flex items-center justify-between p-6 bg-slate-900/60 border border-slate-800 rounded-[2rem] group hover:border-indigo-500/30 transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className="relative w-20 h-28 shrink-0 overflow-hidden rounded-2xl shadow-2xl">
                    <img src={movie.poster} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={movie.title} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors">{movie.title}</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{movie.genre.join(', ')}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 text-yellow-500 rounded-lg text-[10px] font-black">
                        <ICONS.Star /> {movie.rating}
                      </div>
                      <span className="text-xs text-slate-700">|</span>
                      <span className="text-xs text-slate-400 font-medium">{movie.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                  <button onClick={() => openModal('movies', movie.id)} className="p-3 bg-slate-800 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete('movies', movie.id)} className="p-3 bg-slate-800 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                    <ICONS.Close />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'theaters' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {theaters.map(cinema => (
              <div key={cinema.id} className="p-8 bg-slate-900/60 border border-slate-800 rounded-[2rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-500 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                    <ICONS.Building />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white">{cinema.name}</h4>
                    <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm">
                      <ICONS.MapPin /> {cinema.location}
                    </div>
                    <p className="text-[10px] font-black uppercase text-indigo-400/60 tracking-widest mt-2">{cinema.screens} Advanced Screens</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                   <button onClick={() => openModal('theaters', cinema.id)} className="p-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all">Edit</button>
                   <button onClick={() => handleDelete('theaters', cinema.id)} className="p-3 bg-slate-800 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><ICONS.Close /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'shows' && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-800/30 border-b border-slate-800">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="px-8 py-5">Feature</th>
                    <th className="px-8 py-5">Multiplex</th>
                    <th className="px-8 py-5">Schedule</th>
                    <th className="px-8 py-5">Tech</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {shows.map(show => {
                    const movie = movies.find(m => m.id === show.movieId);
                    const theater = theaters.find(t => t.id === show.cinemaId);
                    return (
                      <tr key={show.id} className="group hover:bg-slate-800/20 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <img src={movie?.poster} className="w-10 h-14 rounded-xl object-cover shadow-lg" alt="" />
                            <span className="font-bold text-white text-base">{movie?.title}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-bold text-slate-300 text-sm">{theater?.name}</p>
                          <p className="text-[10px] text-slate-600 font-black uppercase mt-1">Screen {show.screen}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-indigo-400">
                            <ICONS.Clock />
                            <span className="font-black text-sm">{show.time}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">{show.date}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-full border border-indigo-500/20 uppercase">
                            {show.format}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => openModal('shows', show.id)} className="text-xs font-black uppercase text-slate-500 hover:text-white transition-colors">Edit</button>
                            <button onClick={() => handleDelete('shows', show.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all"><ICONS.Close /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-10 bg-gradient-to-br from-indigo-600/20 to-slate-900 border border-indigo-500/20 rounded-[3rem] space-y-4 relative overflow-hidden group">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
                <p className="text-[11px] text-indigo-400 font-black uppercase tracking-[0.3em]">Gross Revenue</p>
                <p className="text-6xl font-black text-white">$12,450</p>
                <div className="flex items-center gap-2 text-sm text-green-400 font-bold pt-2">
                   <span className="flex items-center justify-center w-6 h-6 bg-green-400/10 rounded-full">↑</span>
                   <span>14.2% Growth</span>
                </div>
              </div>
              
              <div className="p-10 bg-slate-900/60 border border-slate-800 rounded-[3rem] space-y-4">
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em]">Active Tickets</p>
                <p className="text-6xl font-black text-white">{shows.length * 42}</p>
                <p className="text-sm text-slate-500 font-medium pt-2">Across network nodes</p>
              </div>

              <div className="p-10 bg-slate-900/60 border border-slate-800 rounded-[3rem] space-y-4">
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em]">Operational Reach</p>
                <p className="text-6xl font-black text-white">{theaters.length}</p>
                <p className="text-sm text-indigo-400 font-bold pt-2">Verified Multiplexes</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-2xl font-black text-white">Movie Performance Index</h4>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Rankings</div>
              </div>
              <div className="space-y-6">
                {movies.map(movie => (
                  <div key={movie.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-300">{movie.title}</span>
                      <span className="font-black text-white">{movie.rating * 10}%</span>
                    </div>
                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all duration-1000" style={{ width: `${movie.rating * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Management Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 bg-slate-800/30 border-b border-slate-800/50 flex items-center justify-between">
              <div>
                <h4 className="text-2xl font-black text-white uppercase tracking-widest">{editingId ? 'Modify' : 'Initialize'} {modalType}</h4>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">Secure Management Portal</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all">
                <ICONS.Close />
              </button>
            </div>
            
            <div className="p-10 overflow-y-auto space-y-8 scroll-hidden">
              {modalType === 'movies' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Feature Title</label>
                    <input value={movieForm.title || ''} onChange={e => setMovieForm({ ...movieForm, title: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all text-white font-medium" placeholder="Enter movie title" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Run Time</label>
                      <input value={movieForm.duration || ''} onChange={e => setMovieForm({ ...movieForm, duration: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all text-white font-medium" placeholder="e.g. 2h 15m" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Critics Rating</label>
                      <input type="number" step="0.1" value={movieForm.rating || ''} onChange={e => setMovieForm({ ...movieForm, rating: parseFloat(e.target.value) })} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all text-white font-medium" placeholder="0.0 - 10.0" />
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'theaters' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Multiplex Branding</label>
                    <input value={theaterForm.name || ''} onChange={e => setTheaterForm({ ...theaterForm, name: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all text-white font-medium" placeholder="Cinema chain name" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Hub Location</label>
                      <input value={theaterForm.location || ''} onChange={e => setTheaterForm({ ...theaterForm, location: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all text-white font-medium" placeholder="Metropolitan area" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Screen Inventory</label>
                      <input type="number" value={theaterForm.screens || ''} onChange={e => setTheaterForm({ ...theaterForm, screens: parseInt(e.target.value) })} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all text-white font-medium" />
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'shows' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Select Media Resource</label>
                    <select value={showForm.movieId || ''} onChange={e => setShowForm({ ...showForm, movieId: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all text-white font-medium">
                      {movies.map(m => <option key={m.id} value={m.id} className="bg-slate-900">{m.title}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Assign Theater Node</label>
                    <select value={showForm.cinemaId || ''} onChange={e => setShowForm({ ...showForm, cinemaId: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all text-white font-medium">
                      {theaters.map(t => <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Timestamp</label>
                      <input value={showForm.time || ''} onChange={e => setShowForm({ ...showForm, time: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all text-white font-medium" placeholder="12:00 PM" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Exhibition Tech</label>
                      <select value={showForm.format || ''} onChange={e => setShowForm({ ...showForm, format: e.target.value as any })} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all text-white font-medium">
                        {['2D', '3D', 'IMAX', '4DX'].map(f => <option key={f} value={f} className="bg-slate-900">{f}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Pricing ($)</label>
                      <input type="number" value={showForm.price || ''} onChange={e => setShowForm({ ...showForm, price: parseFloat(e.target.value) })} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all text-white font-medium" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 bg-slate-800/30 border-t border-slate-800/50 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">Abort</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/20 transition-all">Confirm Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
