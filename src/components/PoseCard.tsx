import React, { useState } from 'react';
import { ANGLES, GalleryEntry, PoseItem } from '../types';

interface PoseCardProps {
  entry: GalleryEntry;
  index: number;
  onOpenViewer: (index: number, item: PoseItem) => void;
}

export const PoseCard: React.FC<PoseCardProps> = ({
  entry,
  index,
  onOpenViewer,
}) => {
  const { group, item: initialItem } = entry;
  const [hoveredAngle, setHoveredAngle] = useState<string | null>(null);

  const currentItem = (hoveredAngle && group.angles[hoveredAngle]) || initialItem;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenViewer(index, currentItem);
    }
  };

  return (
    <article
      className="pose-card"
      tabIndex={0}
      data-index={index}
      aria-label={`${group.name}, ${currentItem.angle}`}
      onClick={(e) => {
        // If an angle thumb was clicked, it will handle it via stopPropagation or direct handler
        onOpenViewer(index, currentItem);
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="card-image">
        <img
          className="main-image"
          src={currentItem.thumb}
          alt={`${group.name} · ${currentItem.angle}`}
          loading="lazy"
          decoding="async"
        />
        <div className="image-top">
          <span className="pose-no">{group.number}</span>
          <span className="angle-tag">{currentItem.angle}</span>
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
        <h3>{group.name}</h3>
        <div className="card-meta">
          <span className="system">{group.system}</span>
          <span className="meta-dot">·</span>
          <span className="category">{group.category}</span>
        </div>
      </div>

      <div className="angle-strip">
        {ANGLES.filter((angle) => group.angles[angle]).map((angle) => {
          const angleItem = group.angles[angle];
          const isSelected = angleItem === currentItem;
          return (
            <button
              key={angle}
              className={`angle-thumb ${isSelected ? 'on' : ''}`}
              type="button"
              data-angle={angle}
              title={angle}
              aria-label={`View ${angle}`}
              onMouseEnter={() => setHoveredAngle(angle)}
              onMouseLeave={() => setHoveredAngle(null)}
              onClick={(e) => {
                e.stopPropagation();
                onOpenViewer(index, angleItem);
              }}
            >
              <img src={angleItem.thumb} alt="" loading="lazy" decoding="async" />
              <span>{angle}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
};
