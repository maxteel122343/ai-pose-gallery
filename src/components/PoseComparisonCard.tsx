import React, { useState } from 'react';
import { ANGLES, PoseGroup, PoseItem } from '../types';

interface PoseComparisonCardProps {
  currentPoseItem: PoseItem | null;
  currentPoseGroup: PoseGroup | null;
  onSelectAngleItem: (item: PoseItem) => void;
  onApplyPose: (item: PoseItem) => void;
  isApplying: boolean;
  onClose: () => void;
}

export const PoseComparisonCard: React.FC<PoseComparisonCardProps> = ({
  currentPoseItem,
  currentPoseGroup,
  onSelectAngleItem,
  onApplyPose,
  isApplying,
  onClose,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!currentPoseItem || !currentPoseGroup) return null;

  return (
    <div className={`pose-comparison-card ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="card-header">
        <div className="header-info">
          <span className="card-badge">{currentPoseGroup.number}</span>
          <span className="card-title" title={currentPoseGroup.name}>
            {currentPoseGroup.name}
          </span>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="card-btn-icon"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expandir' : 'Minimizar'}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button
            type="button"
            className="card-btn-icon"
            onClick={onClose}
            title="Fechar comparação"
          >
            ×
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="card-content">
          {/* Main Reference Image */}
          <div className="reference-image-wrap" onClick={() => setIsZoomed(!isZoomed)}>
            <img
              src={currentPoseItem.full || currentPoseItem.thumb}
              alt={`${currentPoseGroup.name} · ${currentPoseItem.angle}`}
              className={`reference-img ${isZoomed ? 'zoomed' : ''}`}
            />
            <span className="angle-label-tag">{currentPoseItem.angle}</span>
            <span className="hint-overlay">Clique para ampliar</span>
          </div>

          {/* 5 Angles Thumbnails Bar */}
          <div className="angles-bar">
            {ANGLES.filter((ang) => currentPoseGroup.angles[ang]).map((ang) => {
              const angItem = currentPoseGroup.angles[ang];
              const isSelected = angItem.angle === currentPoseItem.angle;
              return (
                <button
                  key={ang}
                  type="button"
                  className={`angle-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectAngleItem(angItem)}
                  title={`Ver ângulo ${ang}`}
                >
                  <img src={angItem.thumb} alt={ang} />
                  <span>{ang}</span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="card-footer">
            <button
              type="button"
              className={`apply-pose-btn ${isApplying ? 'loading' : ''}`}
              onClick={() => onApplyPose(currentPoseItem)}
              disabled={isApplying}
            >
              {isApplying ? (
                <>
                  <span className="spinner-sm" />
                  <span>Estimando & Aplicando...</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Aplicar Pose no 3D</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
