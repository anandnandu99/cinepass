
import React from 'react';
import { Movie } from '../types';
import { ICONS } from '../constants';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
  isRecommended?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, isRecommended }) => {
  return (
    <div 
      className="group relative bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => onClick(movie)}
    >
      {isRecommended && (
        <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1">
          <ICONS.Sparkles /> AI Pick
        </div>
      )}
      
      <div className="aspect-[2/3] overflow-hidden relative">
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <button className="w-full py-2 bg-indigo-600 rounded-xl font-bold text-sm text-white shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            Book Now
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <ICONS.Star />
            <span className="text-sm font-bold text-slate-100">{movie.rating}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {movie.genre.map(g => (
            <span key={g} className="text-[10px] px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-full font-medium">
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
