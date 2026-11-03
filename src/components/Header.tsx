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
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="5" r="2.4" />
              <path d="M12 8v6m0-3-4 2m4-2 4 2m-4 2-3 6m3-6 3 6" />
            </svg>
          </span>
          <div className="brand-copy">
            <strong>POSE Atlas 3D</strong>
            <span>Studio de Retargeting & Poses</span>
          </div>
        </div>

        <nav className="top-actions" aria-label="Ações do aplicativo">
          <button
            className="action-btn"
            type="button"
            id="themeToggle"
            aria-label="Alternar tema escuro/claro"
            onClick={onToggleTheme}
          >
            {theme === 'dark' ? (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
              </svg>
            )}
            <span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
          </button>

          <button
            className="action-btn"
            type="button"
            onClick={() => onOpenInfo('guide')}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M9.7 9a2.4 2.4 0 0 1 4.6 1c0 1.8-2.3 2-2.3 3.6M12 17h.01" />
            </svg>
            <span>Como Usar</span>
          </button>

          <button
            className="action-btn"
            type="button"
            onClick={() => onOpenInfo('notice')}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M12 3 2.8 20h18.4L12 3Z" />
              <path d="M12 9v5m0 3h.01" />
            </svg>
            <span>Termos</span>
          </button>

          <a
            className="action-btn author"
            href="https://github.com/anhao/ai-pose-gallery-zh"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Repositório original de poses no GitHub"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .8a11.3 11.3 0 0 0-3.6 22c.6.1.8-.2.8-.5v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5A11.3 11.3 0 0 0 12 .8Z" />
            </svg>
            <span>GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  );
};
