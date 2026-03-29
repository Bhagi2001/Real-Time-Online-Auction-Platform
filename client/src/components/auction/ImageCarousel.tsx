import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  title: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, title }) => {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const resolveUrl = (img: string) =>
    img.startsWith('http') ? img : `http://localhost:5000${img}`;

  const fallback = `https://source.unsplash.com/600x400/?product,auction`;
  const imgs = images?.length > 0 ? images.map(resolveUrl) : [fallback];

  const prev = () => setCurrent(c => (c - 1 + imgs.length) % imgs.length);
  const next = () => setCurrent(c => (c + 1) % imgs.length);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden group">
        <img
          src={imgs[current]}
          alt={`${title} - image ${current + 1}`}
          className="w-full h-full object-cover"
        />

        {imgs.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous image">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next image">
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image counter */}
        {imgs.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {current + 1} / {imgs.length}
          </div>
        )}

        {/* Zoom button */}
        <button onClick={() => setFullscreen(true)}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="View fullscreen">
          <ZoomIn size={16} />
        </button>
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imgs.map((img, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === current ? 'border-primary shadow-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}>
              <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setFullscreen(false)}>
          <img src={imgs[current]} alt={title} className="max-w-full max-h-full object-contain" />
          <button onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
            aria-label="Previous">
            <ChevronLeft size={24} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
            aria-label="Next">
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
};
