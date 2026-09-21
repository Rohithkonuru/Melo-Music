import React from 'react';
import { Link } from 'react-router-dom';
import { Artist } from '../types';
import { formatNumber } from '../utils/formatters';

interface ArtistCardProps {
  artist: Artist;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <Link
      to={`/artist/${artist._id}`}
      className="group bg-white dark:bg-[#18181B] hover:bg-zinc-50 dark:hover:bg-zinc-850 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col items-center text-center cursor-pointer shadow-xs hover:shadow-md"
    >
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-3 bg-zinc-100 dark:bg-zinc-800 ring-2 ring-zinc-200 dark:ring-zinc-700 group-hover:ring-purple-600 transition-all shadow-xs">
        <img
          src={artist.image}
          alt={artist.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate max-w-full transition-colors">
        {artist.name}
      </h4>

      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
        {formatNumber(artist.followers)} followers
      </p>

      {artist.genres && artist.genres.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-center gap-1">
          {artist.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700"
            >
              {genre}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};
