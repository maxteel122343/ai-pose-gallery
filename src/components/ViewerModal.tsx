import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ANGLES, GalleryEntry, PoseItem } from '../types';

interface ViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIndex: number;
  currentItem: PoseItem;
  currentList: GalleryEntry[];
  onChangeItem: (index: number, item: PoseItem) => void;
}

export const ViewerModal: React.FC<ViewerModalProps> = ({
  isOpen,
  onClose,
  currentIndex,
  currentItem,
  currentList,
  onChangeItem,
}) => {
  const [imageSrc, setImageSrc] = useState(currentItem.thumb);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>('Loading full image…');
  const [copied, setCopied] = useState(false);
  const tokenRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const entry = currentList[currentIndex];
  const group = entry?.group;

  // Preload and switch to full resolution image
  useEffect(() => {
    if (!isOpen || !currentItem) return;

    setImageSrc(currentItem.thumb);
    setIsLoading(true);
    setStatusMessage('Loading full image…');

    const currentToken = ++tokenRef.current;
    const img = new Image();
    img.decoding = 'async';

    img.onload = () => {
      if (currentToken !== tokenRef.current) return;
      setImageSrc(currentItem.full);
      setIsLoading(false);
      setStatusMessage(null);
    };

    img.onerror = () => {
      if (currentToken !== tokenRef.current) return;
      setIsLoading(false);
      setStatusMessage('Full image failed to load. Try opening it in a new tab.');
    };

    img.src = currentItem.full;
  }, [isOpen, currentItem]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('viewer-open');
    } else {
      document.body.classList.remove('viewer-open');
    }
    return () => {
      document.body.classList.remove('viewer-open');
    };
  }, [isOpen]);

  const stepAngle = useCallback(
    (direction: number) => {
      if (!group || group.order.length < 2) return;
      const current = group.order.findIndex((it) => it.angle === currentItem.angle);
      const nextIdx = (current + direction + group.order.length) % group.order.length;
      onChangeItem(currentIndex, group.order[nextIdx]);
    },
    [group, currentItem.angle, currentIndex, onChangeItem]
  );

  const stepPose = useCallback(
    (direction: number) => {
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= currentList.length) return;
      const currentAngle = currentItem.angle;
      const nextEntry = currentList[nextIndex];
      const nextItem =
        nextEntry.group.angles[currentAngle] || nextEntry.item || nextEntry.group.order[0];
      onChangeItem(nextIndex, nextItem);
    },
    [currentIndex, currentList, currentItem.angle, onChangeItem]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        stepAngle(1);
      } else if (e.key === 'ArrowLeft') {
        stepAngle(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        stepPose(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        stepPose(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, stepAngle, stepPose]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      stepAngle(dx < 0 ? 1 : -1);
    }
    touchStartRef.current = null;
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(currentItem.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(currentItem.full);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentItem.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(currentItem.full, '_blank');
    }
  };

  if (!isOpen || !currentItem) return null;

  return (
    <div
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewerTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="viewer-panel">
        <button
          className="viewer-close"
          type="button"
          aria-label="Close viewer"
          onClick={onClose}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>

        <div
          className="viewer-stage"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            className={`viewer-image ${isLoading ? 'is-loading' : ''}`}
            src={imageSrc}
            alt={`${currentItem.name} · ${currentItem.angle}`}
            draggable={false}
          />
          {statusMessage && <span className="image-status">{statusMessage}</span>}

          <button
            className="viewer-nav prev"
            type="button"
            aria-label="Previous angle"
            onClick={() => stepAngle(-1)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              <path d="m15 5-7 7 7 7" />
            </svg>
          </button>
          <button
            className="viewer-nav next"
            type="button"
            aria-label="Next angle"
            onClick={() => stepAngle(1)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              <path d="m9 5 7 7-7 7" />
            </svg>
          </button>
        </div>

        <aside className="viewer-side">
          <div className="viewer-heading">
            <div className="viewer-eyebrow">
              <span>{currentItem.number || 'POSE'}</span>
              <span className="viewer-position">
                {currentIndex + 1} / {currentList.length}
              </span>
            </div>
            <h2 id="viewerTitle">{currentItem.name}</h2>
            <div className="id-row">
              <code className="viewer-id">{currentItem.id}</code>
              <button className="copy-btn" type="button" onClick={handleCopyId}>
                {copied ? 'Copied' : 'Copy ID'}
              </button>
            </div>
          </div>

          <div>
            <h3 className="side-section-title">Angles</h3>
            <div className="viewer-angles">
              {ANGLES.filter((angle) => group?.angles[angle]).map((angle) => {
                const angleItem = group!.angles[angle];
                const isSelected = angleItem.angle === currentItem.angle;
                return (
                  <button
                    key={angle}
                    className={`angle-thumb ${isSelected ? 'on' : ''}`}
                    type="button"
                    aria-label={`Switch to ${angle}`}
                    onClick={() => onChangeItem(currentIndex, angleItem)}
                  >
                    <img src={angleItem.thumb} alt={angle} />
                    <span>{angle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="download-stack">
            <a
              className="download-btn"
              href={currentItem.full}
              download={`${currentItem.id}.png`}
              onClick={handleDownload}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M12 3v12m-5-5 5 5 5-5M4 20h16" />
              </svg>
              Download full-size PNG
            </a>
            <a
              className="open-btn"
              href={currentItem.full}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M14 4h6v6m0-6-9 9M19 14v6H4V5h6" />
              </svg>
              Open in new tab
            </a>
          </div>

          <dl className="metadata">
            <dt>Series</dt>
            <dd>{currentItem.system}</dd>
            <dt>Pose number</dt>
            <dd>{currentItem.number || '—'}</dd>
            <dt>Category</dt>
            <dd>{currentItem.category || '—'}</dd>
            <dt>Angle</dt>
            <dd>{currentItem.angle || '—'}</dd>
            <dt>Image size</dt>
            <dd>900 × 1200 PNG</dd>
          </dl>

          <div className="keyboard-help">
            <kbd>←</kbd> <kbd>→</kbd> switch angle · <kbd>↑</kbd> <kbd>↓</kbd> switch pose
            <br />
            <kbd>Esc</kbd> close · swipe left/right on mobile
          </div>
        </aside>
      </section>
    </div>
  );
};
