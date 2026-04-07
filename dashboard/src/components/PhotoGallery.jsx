import { Camera, ExternalLink } from 'lucide-react';
import { GALLERY_PHOTOS, NASA_GALLERIES, NASA_BLOG_LINKS } from '../lib/mission-data.js';

export default function PhotoGallery() {
  return (
    <div className="bg-space-800 rounded-xl border border-border overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera size={14} className="text-cyan-400" strokeWidth={1.5} />
          <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Mission Gallery</h3>
        </div>
      </div>

      {/* Photo cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-3">
        {GALLERY_PHOTOS.map((photo, i) => (
          <a
            key={i}
            href={photo.nasaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-space-900 border border-white/5 hover:border-cyan-500/30 transition-colors"
          >
            <div className="w-full h-full flex items-center justify-center text-slate-700 group-hover:text-slate-500 transition-colors">
              <Camera size={20} />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 pt-6">
              <p className="text-[9px] text-white/90 leading-tight line-clamp-2">{photo.caption}</p>
              {photo.credit && (
                <p className="text-[8px] text-slate-400 mt-0.5">{photo.credit}</p>
              )}
            </div>
            {photo.day && (
              <span className="absolute top-1.5 left-1.5 text-[8px] bg-black/60 text-cyan-300 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                Day {photo.day}
              </span>
            )}
            <span className="absolute top-1.5 right-1.5 text-white/0 group-hover:text-white/60 transition-colors">
              <ExternalLink size={10} />
            </span>
          </a>
        ))}
      </div>

      {/* NASA gallery links */}
      <div className="px-3 pb-3 space-y-2">
        <p className="text-[9px] text-slate-500 uppercase tracking-wider">Browse on NASA.gov</p>
        <div className="flex flex-wrap gap-1.5">
          {NASA_GALLERIES.map((g, i) => (
            <a
              key={i}
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-medium hover:bg-cyan-500/20 transition-colors"
            >
              {g.title}
              <ExternalLink size={9} />
            </a>
          ))}
        </div>
      </div>

      {/* Blog links */}
      <div className="px-3 pb-3 space-y-2 border-t border-border pt-3">
        <p className="text-[9px] text-slate-500 uppercase tracking-wider">NASA Mission Blog</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {NASA_BLOG_LINKS.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/[0.03] hover:bg-white/[0.06] transition-colors group"
            >
              <span className="text-[9px] text-slate-600 font-mono shrink-0">Day {link.day}</span>
              <span className="text-[10px] text-slate-400 group-hover:text-white truncate transition-colors">{link.title}</span>
              <ExternalLink size={9} className="text-slate-600 shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
