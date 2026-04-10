import { useState, useEffect, useCallback } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { GALLERY_PHOTOS, NASA_GALLERIES } from '../lib/mission-data.js';

const NASA_API = 'https://images-api.nasa.gov/search?q=Artemis%20II&media_type=image&year_start=2026';

/** Convert a NASA Image Library thumbnail URL to a larger size variant */
function upscale(thumbUrl, size = 'large') {
  if (!thumbUrl) return thumbUrl;
  return thumbUrl.replace(/~(thumb|small|medium|large|orig)\.(jpg|jpeg|png)$/i, `~${size}.$2`);
}

/** Format ISO date as "Apr 6, 2026" */
function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function PhotoGallery() {
  const [images, setImages] = useState(null); // null = loading, [] = loaded empty, [...] = loaded
  const [error, setError] = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(NASA_API)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        if (cancelled) return;
        const items = json?.collection?.items || [];
        const parsed = items
          .map(item => {
            const data = item?.data?.[0] || {};
            const link = item?.links?.find(l => l.rel === 'preview') || item?.links?.[0];
            if (!link?.href) return null;
            return {
              nasaId: data.nasa_id,
              title: data.title || 'Untitled',
              description: data.description || '',
              date: data.date_created,
              credit: data.photographer || data.secondary_creator || 'NASA',
              thumb: link.href,
              large: upscale(link.href, 'large'),
              orig: upscale(link.href, 'orig'),
            };
          })
          .filter(Boolean)
          // Newest first
          .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setImages(parsed);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message || 'Failed to load images');
        setImages([]);
      });
    return () => { cancelled = true; };
  }, []);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      else if (e.key === 'ArrowLeft') setLightboxIdx(i => (i > 0 ? i - 1 : i));
      else if (e.key === 'ArrowRight') setLightboxIdx(i => (i < (images?.length || 0) - 1 ? i + 1 : i));
    };
    window.addEventListener('keydown', onKey);
    // Lock body scroll while lightbox is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIdx, images]);

  const openLightbox = useCallback((i) => setLightboxIdx(i), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prev = useCallback((e) => {
    e.stopPropagation();
    setLightboxIdx(i => (i > 0 ? i - 1 : i));
  }, []);
  const next = useCallback((e) => {
    e.stopPropagation();
    setLightboxIdx(i => (i < (images?.length || 0) - 1 ? i + 1 : i));
  }, []);

  // Use API images if loaded, fall back to static placeholders only if API failed and returned nothing
  const displayPhotos = images && images.length > 0
    ? images
    : (error ? GALLERY_PHOTOS.map(p => ({ title: p.caption, credit: p.credit, thumb: null, large: null })) : []);

  const isLoading = images === null;
  const current = lightboxIdx !== null ? displayPhotos[lightboxIdx] : null;

  return (
    <div className="bg-space-800 rounded-xl border border-border overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-cyan-400" strokeWidth={1.5} />
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mission Gallery</h3>
        </div>
        {images && images.length > 0 && (
          <span className="text-[11px] text-slate-500">{images.length} photos · NASA Image Library</span>
        )}
      </div>

      {/* Photo grid */}
      <div className="p-3">
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 size={16} className="animate-spin mr-2" />
            <span className="text-xs">Loading photos from NASA Image Library...</span>
          </div>
        )}

        {!isLoading && displayPhotos.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-500">
            No photos available right now.
            {error && <div className="mt-1 text-[11px] text-slate-600">({error})</div>}
          </div>
        )}

        {!isLoading && displayPhotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {displayPhotos.map((photo, i) => (
              <button
                key={photo.nasaId || i}
                onClick={() => openLightbox(i)}
                className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-space-900 border border-white/5 hover:border-cyan-500/40 transition-colors text-left"
                title={photo.title}
              >
                {photo.thumb ? (
                  <img
                    src={photo.thumb}
                    alt={photo.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700 group-hover:text-slate-500 transition-colors">
                    <Camera size={20} />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 pt-6">
                  <p className="text-[11px] text-white/95 leading-tight line-clamp-2">{photo.title}</p>
                  {photo.credit && (
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{photo.credit}</p>
                  )}
                </div>
                {photo.date && (
                  <span className="absolute top-1.5 left-1.5 text-[10px] bg-black/60 text-cyan-300 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                    {formatDate(photo.date)}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* NASA gallery links — these are aggregator pages, fine to keep external */}
      <div className="px-3 pb-3 space-y-2">
        <p className="text-[11px] text-slate-500 uppercase tracking-wider">Browse on NASA.gov</p>
        <div className="flex flex-wrap gap-1.5">
          {NASA_GALLERIES.map((g, i) => (
            <a
              key={i}
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-colors"
            >
              {g.title}
              <ExternalLink size={9} />
            </a>
          ))}
        </div>
      </div>

      {/* Lightbox modal */}
      {current && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Prev button */}
          {lightboxIdx > 0 && (
            <button
              onClick={prev}
              className="absolute left-2 sm:left-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Next button */}
          {lightboxIdx < displayPhotos.length - 1 && (
            <button
              onClick={next}
              className="absolute right-2 sm:right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {/* Image + caption — stop propagation so clicks on image don't close */}
          <div
            className="max-w-5xl max-h-full flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {current.large ? (
              <img
                src={current.large}
                alt={current.title}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  // Fall back to thumb if large fails
                  if (e.target.src !== current.thumb && current.thumb) {
                    e.target.src = current.thumb;
                  }
                }}
              />
            ) : (
              <div className="w-96 h-64 rounded-lg bg-space-800 flex items-center justify-center text-slate-600">
                <Camera size={40} />
              </div>
            )}
            <div className="text-center max-w-3xl px-2">
              <p className="text-sm sm:text-base text-white font-medium leading-snug">{current.title}</p>
              {current.description && (
                <p className="text-[11px] sm:text-xs text-slate-300 mt-1.5 leading-snug line-clamp-3">{current.description}</p>
              )}
              <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-slate-500">
                {current.credit && <span>{current.credit}</span>}
                {current.date && <span>·</span>}
                {current.date && <span>{formatDate(current.date)}</span>}
                {displayPhotos.length > 1 && <span>·</span>}
                {displayPhotos.length > 1 && (
                  <span>{lightboxIdx + 1} / {displayPhotos.length}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
