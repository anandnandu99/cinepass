
import React, { useState, useEffect } from 'react';
import { ViewState, Movie, Cinema, GroundingSource, User, Booking, FoodItem } from './types';
import { MOVIES, CINEMAS, ICONS, FOOD_ITEMS } from './constants';
import Layout from './components/Layout';
import MovieCard from './components/MovieCard';
import SeatPicker from './components/SeatPicker';
import AIAssistant from './components/AIAssistant';
import AdminDashboard from './components/AdminDashboard';
import { getMovieRecommendations, AIRecommendation, getCinemaInfo, getNearbyCinemasWithMaps } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cinepass_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedCinema, setSelectedCinema] = useState<Cinema>(CINEMAS[0]);
  const [selectedTime, setSelectedTime] = useState<string>('19:30');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedFood, setSelectedFood] = useState<{ id: string; quantity: number }[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [cinemaDetails, setCinemaDetails] = useState<{ text: string, sources: GroundingSource[] } | null>(null);
  const [nearbyCinemas, setNearbyCinemas] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cinepass_user', JSON.stringify(user));
      const savedBookings = localStorage.getItem('cinepass_bookings');
      setUserBookings(savedBookings ? JSON.parse(savedBookings) : []);
    } else {
      localStorage.removeItem('cinepass_user');
      setUserBookings([]);
    }
  }, [user]);

  useEffect(() => {
    getMovieRecommendations('excited', ['Action']).then(setRecommendations);
    navigator.geolocation.getCurrentPosition(pos => {
      getNearbyCinemasWithMaps(pos.coords.latitude, pos.coords.longitude).then(setNearbyCinemas);
    });
  }, []);

  useEffect(() => {
    if (view === 'details' && selectedCinema) {
      getCinemaInfo(selectedCinema.name, selectedCinema.location).then(setCinemaDetails);
    }
  }, [selectedCinema, view]);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFood = (id: string) => {
    setSelectedFood(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) return prev.filter(i => i.id !== id);
      return [...prev, { id, quantity: 1 }];
    });
  };

  const handleCheckout = () => {
    setIsBooking(true);
    setTimeout(() => {
      const newBooking: Booking = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        movieId: selectedMovie!.id,
        cinemaId: selectedCinema.id,
        seats: selectedSeats,
        time: selectedTime,
        date: new Date().toLocaleDateString(),
        totalPrice: totalAmount,
        status: 'confirmed',
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CINEPASS_TICKET_${Math.random()}`,
        foodItems: selectedFood,
      };
      const bookings = JSON.parse(localStorage.getItem('cinepass_bookings') || '[]');
      const updatedBookings = [newBooking, ...bookings];
      localStorage.setItem('cinepass_bookings', JSON.stringify(updatedBookings));
      setUserBookings(updatedBookings);
      setIsBooking(false);
      setView('success');
    }, 2000);
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
  };

  const foodTotal = selectedFood.reduce((sum, item) => {
    const food = FOOD_ITEMS.find(f => f.id === item.id);
    return sum + (food?.price || 0) * item.quantity;
  }, 0);

  const totalAmount = (selectedSeats.length * 15.50) + foodTotal;

  const filteredMovies = MOVIES.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Layout activeView={view} onNavigate={(v) => { setView(v); setSelectedSeats([]); setSelectedFood([]); }} onLogout={handleLogout}>
      {!user && view === 'home' && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
            <h2 className="text-2xl font-black text-white text-center">Welcome to CinePass</h2>
            <p className="text-slate-400 text-sm text-center">Sign in to book tickets and get AI recommendations.</p>
            <div className="space-y-4">
              <button onClick={() => setUser({ id: 'u1', name: 'John Doe', email: 'john@example.com', phone: '555-0123', isAdmin: false })} className="w-full py-4 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-500 transition-all">Sign in as User</button>
              <button onClick={() => setUser({ id: 'admin', name: 'Admin', email: 'admin@cinepass.com', phone: '555-9999', isAdmin: true })} className="w-full py-4 bg-slate-800 rounded-2xl font-bold hover:bg-slate-700 transition-all">Sign in as Admin</button>
            </div>
          </div>
        </div>
      )}

      {view === 'admin' ? (
        <AdminDashboard />
      ) : view === 'profile' ? (
        <div className="animate-fadeIn space-y-12 pb-24">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black text-white">My Bookings</h2>
            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
              <img src={`https://i.pravatar.cc/150?u=${user?.id}`} className="w-12 h-12 rounded-full border border-slate-700" alt="Avatar" />
              <div>
                <p className="text-sm font-bold text-white">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
          </div>
          
          {userBookings.length === 0 ? (
            <div className="py-24 text-center space-y-6 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600"><ICONS.Ticket /></div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-slate-300">No bookings yet</p>
                <p className="text-sm text-slate-500">Your future movie tickets will appear here.</p>
              </div>
              <button onClick={() => setView('home')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all">Browse Movies</button>
            </div>
          ) : (
            <div className="grid gap-6">
              {userBookings.map(booking => {
                const movie = MOVIES.find(m => m.id === booking.movieId);
                const cinema = CINEMAS.find(c => c.id === booking.cinemaId);
                return (
                  <div key={booking.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col md:flex-row group hover:border-indigo-500 transition-all">
                    <div className="md:w-48 h-48 md:h-auto overflow-hidden">
                      <img src={movie?.poster} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={movie?.title} />
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] mb-1">BOOKING ID: {booking.id}</p>
                          <h3 className="text-2xl font-black text-white">{movie?.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400 font-medium">
                             <div className="flex items-center gap-1"><ICONS.Clock /> {booking.time}</div>
                             <div className="flex items-center gap-1"><ICONS.MapPin /> {cinema?.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 uppercase font-bold">{booking.date}</p>
                          <p className="text-xl font-black text-white mt-1">${booking.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {booking.seats.map(seat => (
                          <span key={seat} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-100">{seat}</span>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 bg-white flex items-center justify-center border-t md:border-t-0 md:border-l border-slate-800">
                      <img src={booking.qrCode} className="w-24 h-24" alt="Ticket QR" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : view === 'home' ? (
        <div className="space-y-12 animate-fadeIn">
          <section className="relative h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-8 md:p-12">
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">CRAFT YOUR <br/>NEXT JOURNEY</h2>
              <div className="mt-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><ICONS.Search /></span>
                  <input 
                    type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search movies, genres, languages..." 
                    className="w-full bg-slate-800/80 backdrop-blur-md rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
            </div>
          </section>

          {nearbyCinemas && (
            <div className="p-6 bg-indigo-900/20 border border-indigo-500/20 rounded-3xl space-y-3">
              <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2"><ICONS.MapPin /> Cinemas Near You</h4>
              <p className="text-sm text-slate-300 italic">{nearbyCinemas.text}</p>
            </div>
          )}

          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-100">Now Showing</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {filteredMovies.map(movie => {
                const rec = recommendations.find(r => r.id === movie.id);
                return <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} isRecommended={!!rec} />;
              })}
            </div>
          </section>
        </div>
      ) : view === 'details' && selectedMovie ? (
        <div className="animate-fadeIn space-y-12 pb-24">
          <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"><ICONS.ChevronLeft /> Back</button>
          <div className="grid md:grid-cols-[400px_1fr] gap-12">
            <img src={selectedMovie.poster} className="w-full rounded-3xl shadow-2xl border border-slate-800" />
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl font-black text-white">{selectedMovie.title}</h1>
                <div className="mt-4 flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-full"><ICONS.Star /><span className="font-bold text-yellow-500">{selectedMovie.rating}</span></div>
                  <span className="text-slate-500">•</span>
                  <div className="flex items-center gap-1 text-slate-400"><ICONS.Clock /><span>{selectedMovie.duration}</span></div>
                </div>
              </div>
              <p className="text-lg text-slate-400 leading-relaxed">{selectedMovie.description}</p>
              
              <div className="space-y-4 pt-8 border-t border-slate-800">
                <h4 className="font-bold text-slate-100 flex items-center gap-2"><ICONS.MapPin /> Available Theaters</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {CINEMAS.map(c => (
                    <button key={c.id} onClick={() => setSelectedCinema(c)} className={`p-4 rounded-2xl border text-left transition-all ${selectedCinema.id === c.id ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.2)]' : 'bg-slate-800/50 border-slate-700'}`}>
                      <p className="font-bold text-slate-100">{c.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{c.location} • {c.distance}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="fixed bottom-0 left-0 right-0 p-4 md:relative md:p-0 bg-slate-950 md:bg-transparent border-t border-slate-800 md:border-0">
                <button onClick={() => setView('booking')} className="w-full px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xl shadow-2xl transition-all transform hover:scale-[1.02]">Reserve Your Seats</button>
              </div>
            </div>
          </div>
        </div>
      ) : view === 'booking' ? (
        <div className="animate-fadeIn max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <button onClick={() => setView('details')} className="text-slate-400 hover:text-white"><ICONS.ChevronLeft /> Movie Details</button>
            <div className="text-right"><h2 className="text-xl font-black text-white">{selectedMovie?.title}</h2><p className="text-sm text-slate-400">{selectedCinema.name}</p></div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl"><SeatPicker selectedSeats={selectedSeats} onToggleSeat={id => setSelectedSeats(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])} /></div>
          
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold text-white">Select Snacks</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {FOOD_ITEMS.map(item => (
                <button 
                  key={item.id} onClick={() => handleToggleFood(item.id)}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${selectedFood.find(f => f.id === item.id) ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-800/50 border-slate-700'}`}
                >
                  <div className="flex items-center gap-3"><span className="text-2xl">{item.image}</span><div className="text-left"><p className="font-bold text-sm">{item.name}</p><p className="text-xs text-slate-500">${item.price.toFixed(2)}</p></div></div>
                  {selectedFood.find(f => f.id === item.id) && <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">✓</div>}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setView('payment')} disabled={selectedSeats.length === 0} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xl transition-all disabled:opacity-50">Proceed to Payment (${totalAmount.toFixed(2)})</button>
        </div>
      ) : view === 'payment' ? (
        <div className="animate-fadeIn max-w-xl mx-auto space-y-8">
          <h2 className="text-3xl font-black text-white text-center">Payment Options</h2>
          <div className="space-y-4">
            {['Credit/Debit Card', 'UPI (Instant Pay)', 'Digital Wallet', 'Net Banking'].map(method => (
              <button key={method} onClick={handleCheckout} className="w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl text-left hover:border-indigo-500 transition-all flex items-center justify-between group">
                <span className="font-bold text-slate-100">{method}</span>
                <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
            ))}
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex justify-between text-slate-400 text-sm"><span>Subtotal</span><span>${(selectedSeats.length * 15.50).toFixed(2)}</span></div>
            <div className="flex justify-between text-slate-400 text-sm"><span>Snacks</span><span>${foodTotal.toFixed(2)}</span></div>
            <div className="pt-4 border-t border-slate-800 flex justify-between font-black text-white text-xl"><span>Total</span><span>${totalAmount.toFixed(2)}</span></div>
          </div>
        </div>
      ) : view === 'success' ? (
        <div className="animate-bounce-in max-w-md mx-auto py-12 text-center space-y-8">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-500/10"><svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
          <div className="space-y-2"><h1 className="text-4xl font-black text-white">Booking Confirmed!</h1><p className="text-slate-400">Your ticket is ready. Enjoy the show!</p></div>
          <div className="bg-white p-6 rounded-3xl inline-block shadow-2xl">
            {userBookings.length > 0 && <img src={userBookings[0].qrCode} alt="Ticket QR" />}
          </div>
          <div className="flex flex-col gap-4">
             <button onClick={() => setView('profile')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all">View All Bookings</button>
             <button onClick={() => setView('home')} className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all">Back to Home</button>
          </div>
        </div>
      ) : null}

      <AIAssistant />
    </Layout>
  );
};

export default App;
