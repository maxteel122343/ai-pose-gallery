import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-copy">
          <p>
            <strong>POSE Atlas English Edition</strong> · Images and original data © the original
            author ギア (
            <a href="https://x.com/giaaibusi" target="_blank" rel="noopener noreferrer">
              @giaaibusi
            </a>
            ) · Layout based on the Chinese edition by{' '}
            <a
              href="https://github.com/anhao/ai-pose-gallery-zh"
              target="_blank"
              rel="noopener noreferrer"
            >
              Anhao
            </a>
          </p>
          <p>
            Source:{' '}
            <a href="https://ai-pose-gallery.pages.dev/" target="_blank" rel="noopener noreferrer">
              ai-pose-gallery.pages.dev
            </a>{' '}
            · Read the terms of use before using the images. Redistribution, reposting and resale of
            the image data follow the original author&apos;s terms.
          </p>
        </div>
        <div className="footer-links">
          <a
            href="https://github.com/iMorpheuz/ai-pose-gallery"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub source
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M14 4h6v6m0-6-9 9M19 14v6H4V5h6" />
            </svg>
          </a>
          <a href="https://x.com/anhao_ai" target="_blank" rel="noopener noreferrer">
            X @anhao_ai
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M14 4h6v6m0-6-9 9M19 14v6H4V5h6" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};
