import React, { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import {
  BONE_LABELS,
  BONE_SHORT_LABELS,
  ANATOMICAL_BONE_GROUPS,
  ALL_STANDARD_BONES,
  SkeletonRig,
} from '../utils/boneMapping';
import { ModelSkeletonInfo, StandardBoneName } from '../types';

interface BoneControlPanelProps {
  rig: SkeletonRig | null;
  modelInfo: ModelSkeletonInfo | null;
  selectedBoneName: StandardBoneName | null;
  onSelectBone: (name: StandardBoneName | null) => void;
  visibleGizmoBones: Set<StandardBoneName>;
  onToggleBoneGizmo: (boneName: StandardBoneName) => void;
  onSetAllGizmosVisible: (visible: boolean) => void;
  onSetSelectedOnlyGizmo: () => void;
  gizmoMode: 'selected' | 'all' | 'custom' | 'none';
  showSkeletonHelper: boolean;
  onToggleSkeletonHelper: () => void;
  showWireframe: boolean;
  onToggleWireframe: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  useGizmo: boolean;
  onToggleGizmo: () => void;
  showNumericalValues: boolean;
  onToggleNumericalValues: () => void;
  onResetPose: () => void;
  lastUpdatedRotation?: { bone: StandardBoneName; x: number; y: number; z: number; timestamp: number } | null;
}

export const BoneControlPanel: React.FC<BoneControlPanelProps> = ({
  rig,
  modelInfo,
  selectedBoneName,
  onSelectBone,
  visibleGizmoBones,
  onToggleBoneGizmo,
  onSetAllGizmosVisible,
  onSetSelectedOnlyGizmo,
  gizmoMode,
  showSkeletonHelper,
  onToggleSkeletonHelper,
  showWireframe,
  onToggleWireframe,
  showGrid,
  onToggleGrid,
  useGizmo,
  onToggleGizmo,
  showNumericalValues,
  onToggleNumericalValues,
  onResetPose,
  lastUpdatedRotation,
}) => {
  // Current rotation in degrees for selected bone
  const [rotX, setRotX] = useState<number>(0);
  const [rotY, setRotY] = useState<number>(0);
  const [rotZ, setRotZ] = useState<number>(0);

  // Search filter for bones list
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync sliders when selected bone or rig updates
  useEffect(() => {
    if (!rig || !selectedBoneName) {
      setRotX(0);
      setRotY(0);
      setRotZ(0);
      return;
    }

    const bone = rig.standardBones.get(selectedBoneName);
    if (!bone) return;

    setRotX(Math.round(THREE.MathUtils.radToDeg(bone.rotation.x)));
    setRotY(Math.round(THREE.MathUtils.radToDeg(bone.rotation.y)));
    setRotZ(Math.round(THREE.MathUtils.radToDeg(bone.rotation.z)));
  }, [rig, selectedBoneName]);

  // Sync sliders in real time when gizmo is dragged in 3D viewport
  useEffect(() => {
    if (!lastUpdatedRotation || !selectedBoneName) return;
    if (lastUpdatedRotation.bone === selectedBoneName) {
      setRotX(lastUpdatedRotation.x);
      setRotY(lastUpdatedRotation.y);
      setRotZ(lastUpdatedRotation.z);
    }
  }, [lastUpdatedRotation, selectedBoneName]);

  // Update bone rotation from sliders
  const handleRotationChange = (axis: 'x' | 'y' | 'z', valueDeg: number) => {
    if (!rig || !selectedBoneName) return;
    const bone = rig.standardBones.get(selectedBoneName);
    if (!bone) return;

    const rad = THREE.MathUtils.degToRad(valueDeg);
    bone.rotation[axis] = rad;

    if (axis === 'x') setRotX(valueDeg);
    if (axis === 'y') setRotY(valueDeg);
    if (axis === 'z') setRotZ(valueDeg);
  };

  // Reset current single bone rotation to rest
  const handleResetSingleBone = (targetBoneName = selectedBoneName) => {
    if (!rig || !targetBoneName) return;
    const bone = rig.standardBones.get(targetBoneName);
    if (!bone) return;
    const rest = rig.restRotations.get(bone);
    if (rest) {
      bone.rotation.copy(rest);
      if (targetBoneName === selectedBoneName) {
        setRotX(Math.round(THREE.MathUtils.radToDeg(rest.x)));
        setRotY(Math.round(THREE.MathUtils.radToDeg(rest.y)));
        setRotZ(Math.round(THREE.MathUtils.radToDeg(rest.z)));
      }
    }
  };

  // Mirror pose between left and right limbs
  const handleMirrorPose = () => {
    if (!rig) return;

    const pairs: [StandardBoneName, StandardBoneName][] = [
      ['LeftShoulder', 'RightShoulder'],
      ['LeftArm', 'RightArm'],
      ['LeftForeArm', 'RightForeArm'],
      ['LeftHand', 'RightHand'],
      ['LeftUpLeg', 'RightUpLeg'],
      ['LeftLeg', 'RightLeg'],
      ['LeftFoot', 'RightFoot'],
    ];

    pairs.forEach(([leftName, rightName]) => {
      const leftBone = rig.standardBones.get(leftName);
      const rightBone = rig.standardBones.get(rightName);
      if (leftBone && rightBone) {
        // Swap rotations with mirrored X/Z axes
        const tempL = leftBone.rotation.clone();
        leftBone.rotation.set(rightBone.rotation.x, -rightBone.rotation.y, -rightBone.rotation.z);
        rightBone.rotation.set(tempL.x, -tempL.y, -tempL.z);
      }
    });

    // Also invert Hips/Spine yaw and roll
    const hips = rig.standardBones.get('Hips');
    if (hips) {
      hips.rotation.y = -hips.rotation.y;
      hips.rotation.z = -hips.rotation.z;
    }
    const spine = rig.standardBones.get('Spine');
    if (spine) {
      spine.rotation.y = -spine.rotation.y;
      spine.rotation.z = -spine.rotation.z;
    }

    if (selectedBoneName) {
      const b = rig.standardBones.get(selectedBoneName);
      if (b) {
        setRotX(Math.round(THREE.MathUtils.radToDeg(b.rotation.x)));
        setRotY(Math.round(THREE.MathUtils.radToDeg(b.rotation.y)));
        setRotZ(Math.round(THREE.MathUtils.radToDeg(b.rotation.z)));
      }
    }
  };

  // Helper to read rotation of any bone
  const getBoneRotationDeg = (bName: StandardBoneName) => {
    if (!rig) return { x: 0, y: 0, z: 0 };
    const b = rig.standardBones.get(bName);
    if (!b) return { x: 0, y: 0, z: 0 };
    return {
      x: Math.round(THREE.MathUtils.radToDeg(b.rotation.x)),
      y: Math.round(THREE.MathUtils.radToDeg(b.rotation.y)),
      z: Math.round(THREE.MathUtils.radToDeg(b.rotation.z)),
    };
  };

  // Filter groups according to search input
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ANATOMICAL_BONE_GROUPS;

    return ANATOMICAL_BONE_GROUPS.map((group) => {
      const matchingBones = group.bones.filter((bName) => {
        const fullLabel = BONE_LABELS[bName].toLowerCase();
        const shortLabel = BONE_SHORT_LABELS[bName].toLowerCase();
        return fullLabel.includes(q) || shortLabel.includes(q) || bName.toLowerCase().includes(q);
      });
      return {
        ...group,
        bones: matchingBones,
      };
    }).filter((group) => group.bones.length > 0);
  }, [searchQuery]);

  const hasBones = modelInfo?.hasSkeleton ?? false;

  return (
    <aside className="bone-control-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title-row">
          <h3>Ajustes do Esqueleto</h3>
          <span className={`status-pill ${hasBones ? 'success' : 'warning'}`}>
            {hasBones ? `${modelInfo?.boneCount} ossos` : 'Sem Rig'}
          </span>
        </div>
        <p className="panel-desc">
          Clique no boneco 3D para selecionar ossos e use o gizmo com ângulos ao vivo ou ajuste os controles abaixo.
        </p>
      </div>

      {/* Warning message if no skeleton */}
      {!hasBones && (
        <div className="no-bones-alert">
          <strong>Modelo sem ossos!</strong>
          <p>
            O arquivo GLB atual não possui armature / bones. Para usar a aplicação de poses e o controle
            manual, faça upload de um modelo com esqueleto.
          </p>
        </div>
      )}

      {/* Viewport Display Toggles */}
      <div className="panel-section">
        <label className="section-label">Exibição & Modos 3D</label>
        <div className="toggle-grid">
          <button
            type="button"
            className={`view-toggle-btn ${useGizmo ? 'active' : ''}`}
            onClick={onToggleGizmo}
            title="Ativar/Desativar Gizmo de Rotação 3D"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3a9 9 0 0 1 9 9" />
            </svg>
            Gizmo 3D
          </button>

          <button
            type="button"
            className={`view-toggle-btn ${showSkeletonHelper ? 'active' : ''}`}
            onClick={onToggleSkeletonHelper}
            title="Visualizar esqueleto (Skeleton Helper)"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="2" />
              <line x1="12" y1="7" x2="12" y2="15" />
              <line x1="12" y1="15" x2="8" y2="21" />
              <line x1="12" y1="15" x2="16" y2="21" />
              <line x1="7" y1="10" x2="17" y2="10" />
            </svg>
            Esqueleto
          </button>

          <button
            type="button"
            className={`view-toggle-btn ${showWireframe ? 'active' : ''}`}
            onClick={onToggleWireframe}
            title="Alternar modo Wireframe"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="m3 3 18 18M21 3 3 21" />
            </svg>
            Wireframe
          </button>

          <button
            type="button"
            className={`view-toggle-btn ${showGrid ? 'active' : ''}`}
            onClick={onToggleGrid}
            title="Alternar Grade do Chão"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
            Grade
          </button>

          <button
            type="button"
            className={`view-toggle-btn ${showNumericalValues ? 'active' : ''}`}
            onClick={onToggleNumericalValues}
            title="Exibir ou ocultar valores numéricos de rotação (X/Y/Z)"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Valores (X/Y/Z)
          </button>
        </div>
      </div>

      {/* Rotation Sliders for Currently Selected Bone */}
      {selectedBoneName && (
        <div className="panel-section sliders-box">
          <div className="section-header-row">
            <div>
              <label className="section-label" style={{ marginBottom: 2 }}>
                Rotação: {BONE_SHORT_LABELS[selectedBoneName]}
              </label>
              <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>
                {BONE_LABELS[selectedBoneName]}
              </span>
            </div>
            <button
              type="button"
              className="text-action-btn"
              onClick={() => handleResetSingleBone(selectedBoneName)}
              title="Restaurar rotação deste osso para a pose neutra"
            >
              Zerar este osso
            </button>
          </div>

          {/* X Axis */}
          <div className="slider-row">
            <div className="slider-meta">
              <span className="axis-badge x">X</span>
              <span className="axis-name">Pitch / Inclinação</span>
              <span className="axis-val" style={{ color: '#ef4444' }}>
                {rotX}°
              </span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotX}
              onChange={(e) => handleRotationChange('x', Number(e.target.value))}
            />
          </div>

          {/* Y Axis */}
          <div className="slider-row">
            <div className="slider-meta">
              <span className="axis-badge y">Y</span>
              <span className="axis-name">Yaw / Giro Lateral</span>
              <span className="axis-val" style={{ color: '#10b981' }}>
                {rotY}°
              </span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotY}
              onChange={(e) => handleRotationChange('y', Number(e.target.value))}
            />
          </div>

          {/* Z Axis */}
          <div className="slider-row">
            <div className="slider-meta">
              <span className="axis-badge z">Z</span>
              <span className="axis-name">Roll / Rotação</span>
              <span className="axis-val" style={{ color: '#3b82f6' }}>
                {rotZ}°
              </span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotZ}
              onChange={(e) => handleRotationChange('z', Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* Visibility Control & Bone List Section */}
      <div className="panel-section gizmo-visibility-card">
        <div className="section-header-row">
          <label className="section-label">Visibilidade dos Gizmos por Osso</label>
          <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>
            {visibleGizmoBones.size} visíveis
          </span>
        </div>

        {/* Quick Bulk Actions */}
        <div className="gizmo-quick-actions">
          <button
            type="button"
            className={`gizmo-action-btn ${gizmoMode === 'selected' ? 'active' : ''}`}
            onClick={onSetSelectedOnlyGizmo}
            title="Mostrar gizmo apenas para o osso atualmente selecionado"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Selecionado
          </button>

          <button
            type="button"
            className={`gizmo-action-btn ${gizmoMode === 'all' ? 'active' : ''}`}
            onClick={() => onSetAllGizmosVisible(true)}
            title="Mostrar gizmos de rotação em todas as articulações mapeadas"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Mostrar Todos
          </button>

          <button
            type="button"
            className={`gizmo-action-btn ${gizmoMode === 'none' ? 'active' : ''}`}
            onClick={() => onSetAllGizmosVisible(false)}
            title="Ocultar todos os gizmos de rotação"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
            Ocultar Todos
          </button>
        </div>

        {/* Bone Search Filter */}
        <div className="bone-search-wrap">
          <svg className="bone-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="bone-search-input"
            placeholder="Filtrar osso por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="bone-search-clear"
              onClick={() => setSearchQuery('')}
              title="Limpar filtro"
            >
              ×
            </button>
          )}
        </div>

        {/* Anatomical Groups List */}
        <div className="bone-groups-list">
          {filteredGroups.map((group) => (
            <div key={group.name} className="bone-group-block">
              <div className="bone-group-header">{group.name}</div>
              <div className="bone-group-items">
                {group.bones.map((bName) => {
                  const isSelected = selectedBoneName === bName;
                  const isGizmoVisible = visibleGizmoBones.has(bName);
                  const isAvailable = rig?.standardBones.has(bName) ?? false;
                  const rot = getBoneRotationDeg(bName);

                  return (
                    <div
                      key={bName}
                      className={`bone-item-row ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                      onClick={() => {
                        if (!isAvailable) return;
                        onSelectBone(bName);
                      }}
                      title={isAvailable ? 'Clique para selecionar e focar gizmo neste osso' : 'Osso não encontrado no rig'}
                    >
                      {/* Individual Gizmo Visibility Toggle */}
                      <button
                        type="button"
                        className={`bone-vis-toggle-btn ${isGizmoVisible ? 'visible' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isAvailable) return;
                          onToggleBoneGizmo(bName);
                        }}
                        title={
                          isGizmoVisible
                            ? `Ocultar gizmo de ${BONE_SHORT_LABELS[bName]}`
                            : `Mostrar gizmo de ${BONE_SHORT_LABELS[bName]}`
                        }
                      >
                        {isGizmoVisible ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" y1="2" x2="22" y2="22" />
                          </svg>
                        )}
                      </button>

                      {/* Bone Info & Real-Time Angles */}
                      <div className="bone-row-main">
                        <div className="bone-row-title-row">
                          <span className="bone-row-name">
                            {BONE_SHORT_LABELS[bName]}
                          </span>
                          {isSelected && <span className="bone-row-selected-tag">Ativo</span>}
                        </div>

                        {/* Real-time Angle Badges */}
                        <div className="bone-rot-summary">
                          <span className="bone-rot-chip x">
                            <span>X</span> {rot.x}°
                          </span>
                          <span className="bone-rot-chip y">
                            <span>Y</span> {rot.y}°
                          </span>
                          <span className="bone-rot-chip z">
                            <span>Z</span> {rot.z}°
                          </span>
                        </div>
                      </div>

                      {/* Quick Reset Button if Bone is Rotated */}
                      {(rot.x !== 0 || rot.y !== 0 || rot.z !== 0) && (
                        <button
                          type="button"
                          className="bone-quick-reset-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetSingleBone(bName);
                          }}
                          title="Zerar rotação deste osso"
                        >
                          Zerar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Pose Actions */}
      <div className="panel-section actions-section">
        <label className="section-label">Ações Globais da Pose</label>
        <div className="action-buttons-stack">
          <button
            type="button"
            className="panel-btn reset-pose-btn"
            onClick={onResetPose}
            disabled={!hasBones}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Resetar Pose (T-Pose / Rest)
          </button>

          <button
            type="button"
            className="panel-btn mirror-pose-btn"
            onClick={handleMirrorPose}
            disabled={!hasBones}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m16 4 4 4-4 4" />
              <path d="M20 8H10a4 4 0 0 0-4 4v0" />
              <path d="m8 20-4-4 4-4" />
              <path d="M4 16h10a4 4 0 0 0 4-4v0" />
            </svg>
            Espelhar Pose (Inverter Esq/Dir)
          </button>
        </div>
      </div>

      {/* Model Info Summary */}
      {modelInfo && (
        <div className="panel-section info-card">
          <div className="info-row">
            <span>Modelo:</span>
            <strong>{modelInfo.modelName}</strong>
          </div>
          <div className="info-row">
            <span>Padrão do Rig:</span>
            <strong>{modelInfo.formatName}</strong>
          </div>
          <div className="info-row">
            <span>Total de Bones:</span>
            <strong>{modelInfo.boneCount}</strong>
          </div>
          <div className="info-row">
            <span>Mapeados para Pose:</span>
            <strong>{modelInfo.mappedBonesCount} / 17</strong>
          </div>
        </div>
      )}
    </aside>
  );
};
