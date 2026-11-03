import React from 'react';
import { GalleryEntry, PoseItem } from '../types';

interface SingleCardProps {
  entry: GalleryEntry;
  index: number;
  onOpenViewer: (index: number, item: PoseItem) => void;
}

export const SingleCard: React.FC<SingleCardProps> = ({
  entry,
  index,
  onOpenViewer,
}) => {
  const { item } = entry;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenViewer(index, item);
    }
  };

  return (
    <article
      className="pose-card"
      tabIndex={0}
      data-index={index}
      aria-label={`${item.name}, ${item.angle}`}
      onClick={() => onOpenViewer(index, item)}
      onKeyDown={handleKeyDown}
    >
      <div className="card-image">
        <img
          className="main-image"
          src={item.thumb}
          alt={`${item.name} · ${item.angle}`}
          loading="lazy"
          decoding="async"
        />
        <div className="image-top">
          <span className="pose-no">{item.number}</span>
          <span className="angle-tag">{item.angle}</span>
        </div>
        <span className="zoom-hint">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          >
            <path d="M8 3H3v5m13-5h5v5M8 21H3v-5m13 5h5v-5" />
          </svg>
        </span>
      </div>

      <div className="card-body">
        <h3>{item.name}</h3>
        <div className="card-meta">
          <span className="system">{item.system}</span>
          <span className="meta-dot">·</span>
          <span className="category">{item.category}</span>
        </div>
        <code className="card-id">{item.id}</code>
      </div>
    </article>
  );
};
