import React, { useEffect } from 'react';

export type InfoType = 'guide' | 'notice';

interface InfoDialogProps {
  type: InfoType | null;
  onClose: () => void;
}

export const InfoDialog: React.FC<InfoDialogProps> = ({ type, onClose }) => {
  useEffect(() => {
    if (!type) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [type, onClose]);

  if (!type) return null;

  const isGuide = type === 'guide';
  const title = isGuide ? 'How to use' : 'Terms of use';

  return (
    <div
      className="info-dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="info-dialog" role="dialog" aria-modal="true" aria-labelledby="infoTitle">
        <div className="info-head">
          <h2 id="infoTitle">{title}</h2>
          <button
            className="info-close"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="info-content">
          {isGuide ? (
            <ul>
              <li>
                Load a reference image into your AI tool&apos;s{' '}
                <strong>pose reference / composition reference</strong> feature (ControlNet,
                IP-Adapter, or prompt &ldquo;change to this pose&rdquo;).
              </li>
              <li>
                Using several angles of the same pose keeps the pose consistent across generated
                images or video.
              </li>
              <li>
                Click a card or thumbnail to open the viewer and download the{' '}
                <strong>900 × 1200 full-size PNG</strong>.
              </li>
              <li>
                Images are faceless gray mannequin line drawings with no face, clothing or
                background. Add those with your prompt or other references.
              </li>
              <li>
                On desktop use <strong>← / →</strong> to switch angle and{' '}
                <strong>↑ / ↓</strong> to switch pose. On mobile, swipe the image left or right.
              </li>
            </ul>
          ) : (
            <>
              <ul>
                <li>
                  The original author allows free use in your own work, including commercial work,
                  editing and pose reference.
                </li>
                <li>
                  <strong>
                    Redistributing, reposting or reselling the image data itself (original or
                    edited) is prohibited.
                  </strong>
                </li>
                <li>
                  Credit is not required (optional). Image metadata has been removed and assets are
                  provided without warranty.
                </li>
                <li>The figures are mannequin line drawings, not real people.</li>
                <li>
                  Do not use them in connection with real people, minors, or anything contrary to
                  public order and morals.
                </li>
              </ul>
              <div className="info-note">
                This is an English summary of the original site&apos;s terms. The original
                author&apos;s published terms take precedence.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
