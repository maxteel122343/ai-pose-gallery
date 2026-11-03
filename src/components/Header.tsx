import React from 'react';

interface HeaderProps {
  poseCount: number;
  imageCount: number;
  onOpenInfo: (type: 'guide' | 'notice') => void;
  theme: string;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  poseCount,
  imageCount,
  onOpenInfo,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="site-header">
      <div className="shell topbar">
        <a className="brand" href="./" aria-label="Back to gallery home">
          <span className="brand-mark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <circle cx="12" cy="5" r="2.4" />
              <path d="M12 8v6m0-3-4 2m4-2 4 2m-4 2-3 6m3-6 3 6" />
            </svg>
          </span>
          <span className="brand-copy">
            <strong>POSE Atlas</strong>
            <span>Reference Library</span>
          </span>
        </a>
        <nav className="top-actions" aria-label="Help and sources">
          <button
            className="action-btn"
            type="button"
            id="themeToggle"
            aria-label="Toggle dark mode"
            onClick={onToggleTheme}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
              </svg>
            )}
            <span className="action-text">Theme</span>
          </button>
          <button
            className="action-btn"
            type="button"
            data-info="guide"
            onClick={() => onOpenInfo('guide')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.7 9a2.4 2.4 0 0 1 4.6 1c0 1.8-2.3 2-2.3 3.6M12 17h.01" />
            </svg>
            <span className="action-text">How to use</span>
          </button>
          <button
            className="action-btn"
            type="button"
            data-info="notice"
            onClick={() => onOpenInfo('notice')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 3 2.8 20h18.4L12 3Z" />
              <path d="M12 9v5m0 3h.01" />
            </svg>
            <span className="action-text">Terms of use</span>
          </button>
          <a
            className="action-btn author"
            href="https://github.com/iMorpheuz/ai-pose-gallery"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View the GitHub repository"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .8a11.3 11.3 0 0 0-3.6 22c.6.1.8-.2.8-.5v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5A11.3 11.3 0 0 0 12 .8Z" />
            </svg>
            <span className="action-text">GitHub</span>
          </a>
          <a
            className="action-btn author"
            href="https://x.com/anhao_ai"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Original Chinese edition author on X"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="action-text">@anhao_ai</span>
          </a>
        </nav>
      </div>
      <div className="shell hero">
        <div>
          <p className="eyebrow">AI POSE REFERENCE · ENGLISH EDITION</p>
          <h1>AI Pose Reference Gallery<span className="hero-tagline">Find every pose you need</span></h1>
          <p className="hero-desc">Multi-angle faceless mannequin line drawings for AI image generation, composition and posing reference. Filter by series, category and angle, and download originals in one click.</p>
        </div>
        <div className="hero-stats" aria-label="Gallery stats">
          <div className="stat">
            <strong>{poseCount ? poseCount.toLocaleString('en-US') : '—'}</strong>
            <span>poses</span>
          </div>
          <div className="stat">
            <strong>{imageCount ? imageCount.toLocaleString('en-US') : '—'}</strong>
            <span>images</span>
          </div>
          <div className="stat">
            <strong>5</strong>
            <span>angles</span>
          </div>
        </div>
      </div>
    </header>
  );
};
