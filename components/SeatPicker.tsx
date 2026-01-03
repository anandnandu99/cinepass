
import React from 'react';

interface SeatPickerProps {
  selectedSeats: string[];
  onToggleSeat: (seatId: string) => void;
}

const SeatPicker: React.FC<SeatPickerProps> = ({ selectedSeats, onToggleSeat }) => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  // Dummy logic for reserved seats
  const isReserved = (id: string) => ['A1', 'A2', 'C4', 'C5', 'F1', 'G8'].includes(id);

  return (
    <div className="w-full flex flex-col items-center gap-12 py-8">
      {/* Screen */}
      <div className="relative w-full max-w-lg">
        <div className="h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_4px_20px_rgba(99,102,241,0.5)] rounded-full" />
        <div className="mt-4 text-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold">Screen</span>
        </div>
      </div>

      {/* Seats Grid */}
      <div className="grid gap-4">
        {rows.map(row => (
          <div key={row} className="flex items-center gap-4">
            <span className="w-4 text-[10px] font-bold text-slate-600">{row}</span>
            <div className="flex gap-2 sm:gap-4">
              {cols.map(col => {
                const id = `${row}${col}`;
                const reserved = isReserved(id);
                const selected = selectedSeats.includes(id);

                return (
                  <button
                    key={id}
                    disabled={reserved}
                    onClick={() => onToggleSeat(id)}
                    className={`
                      w-6 h-6 sm:w-8 sm:h-8 rounded-md transition-all duration-200
                      ${reserved ? 'bg-slate-800 cursor-not-allowed border border-transparent' : 
                        selected ? 'bg-indigo-600 border border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)] scale-110' : 
                        'bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500'}
                    `}
                  />
                );
              })}
            </div>
            <span className="w-4 text-[10px] font-bold text-slate-600">{row}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-8 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/50 px-6 py-3 rounded-full border border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-700 rounded-sm border border-slate-600" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-600 rounded-sm shadow-[0_0_5px_rgba(99,102,241,0.5)]" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-800 rounded-sm" />
          <span>Taken</span>
        </div>
      </div>
    </div>
  );
};

export default SeatPicker;
