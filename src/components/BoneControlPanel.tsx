import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { BONE_LABELS, SkeletonRig, resetRigToRestPose } from '../utils/boneMapping';
import { ModelSkeletonInfo, StandardBoneName } from '../types';

interface BoneControlPanelProps {
  rig: SkeletonRig | null;
  modelInfo: ModelSkeletonInfo | null;
  selectedBoneName: StandardBoneName | null;
  onSelectBone: (name: StandardBoneName | null) => void;
  showSkeletonHelper: boolean;
  onToggleSkeletonHelper: () => void;
  showWireframe: boolean;
  onToggleWireframe: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  useGizmo: boolean;
  onToggleGizmo: () => void;
  onResetPose: () => void;
}

const ALL_STANDARD_BONES: StandardBoneName[] = [
  'Head',
  'Neck',
  'Chest',
  'Spine',
  'Hips',
  'LeftShoulder',
  'LeftArm',
  'LeftForeArm',
  'LeftHand',
  'RightShoulder',
  'RightArm',
  'RightForeArm',
  'RightHand',
  'LeftUpLeg',
  'LeftLeg',
  'LeftFoot',
  'RightUpLeg',
  'RightLeg',
  'RightFoot',
];

export const BoneControlPanel: React.FC<BoneControlPanelProps> = ({
  rig,
  modelInfo,
  selectedBoneName,
  onSelectBone,
  showSkeletonHelper,
  onToggleSkeletonHelper,
  showWireframe,
  onToggleWireframe,
  showGrid,
  onToggleGrid,
  useGizmo,
  onToggleGizmo,
  onResetPose,
}) => {
  // Current rotation in degrees for selected bone
  const [rotX, setRotX] = useState<number>(0);
  const [rotY, setRotY] = useState<number>(0);
  const [rotZ, setRotZ] = useState<number>(0);

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
  const handleResetSingleBone = () => {
    if (!rig || !selectedBoneName) return;
    const bone = rig.standardBones.get(selectedBoneName);
    if (!bone) return;
    const rest = rig.restRotations.get(bone);
    if (rest) {
      bone.rotation.copy(rest);
      setRotX(Math.round(THREE.MathUtils.radToDeg(rest.x)));
      setRotY(Math.round(THREE.MathUtils.radToDeg(rest.y)));
      setRotZ(Math.round(THREE.MathUtils.radToDeg(rest.z)));
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
          Controle e refine a rotação de cada osso manualmente ou através do gizmo 3D.
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
            title="Mostrar Gizmo de Rotação 3D no osso selecionado"
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
        </div>
      </div>

      {/* Bone Selector */}
      <div className="panel-section">
        <label className="section-label" htmlFor="boneSelect">
          Osso Selecionado
        </label>
        <div className="select-wrap">
          <select
            id="boneSelect"
            value={selectedBoneName || ''}
            onChange={(e) => onSelectBone((e.target.value as StandardBoneName) || null)}
            disabled={!hasBones}
          >
            <option value="">Selecione um osso...</option>
            {ALL_STANDARD_BONES.map((bName) => {
              const isAvailable = rig?.standardBones.has(bName);
              return (
                <option key={bName} value={bName} disabled={!isAvailable}>
                  {BONE_LABELS[bName]} {isAvailable ? '' : '(Não detectado)'}
                </option>
              );
            })}
          </select>
        </div>

        {/* Quick Anatomy Picker */}
        <div className="quick-anatomy-pills">
          <span className="pills-title">Atalhos rápidos:</span>
          <div className="pills-row">
            <button
              type="button"
              className={`pill-btn ${selectedBoneName === 'Head' ? 'active' : ''}`}
              onClick={() => onSelectBone('Head')}
            >
              Cabeça
            </button>
            <button
              type="button"
              className={`pill-btn ${selectedBoneName === 'Chest' ? 'active' : ''}`}
              onClick={() => onSelectBone('Chest')}
            >
              Tórax
            </button>
            <button
              type="button"
              className={`pill-btn ${selectedBoneName === 'LeftArm' ? 'active' : ''}`}
              onClick={() => onSelectBone('LeftArm')}
            >
              Braço Esq
            </button>
            <button
              type="button"
              className={`pill-btn ${selectedBoneName === 'RightArm' ? 'active' : ''}`}
              onClick={() => onSelectBone('RightArm')}
            >
              Braço Dir
            </button>
            <button
              type="button"
              className={`pill-btn ${selectedBoneName === 'Hips' ? 'active' : ''}`}
              onClick={() => onSelectBone('Hips')}
            >
              Quadril
            </button>
            <button
              type="button"
              className={`pill-btn ${selectedBoneName === 'LeftUpLeg' ? 'active' : ''}`}
              onClick={() => onSelectBone('LeftUpLeg')}
            >
              Perna Esq
            </button>
            <button
              type="button"
              className={`pill-btn ${selectedBoneName === 'RightUpLeg' ? 'active' : ''}`}
              onClick={() => onSelectBone('RightUpLeg')}
            >
              Perna Dir
            </button>
          </div>
        </div>
      </div>

      {/* Rotation Sliders */}
      {selectedBoneName && (
        <div className="panel-section sliders-box">
          <div className="section-header-row">
            <label className="section-label">Rotação Manual (Graus)</label>
            <button type="button" className="text-action-btn" onClick={handleResetSingleBone}>
              Zerar este osso
            </button>
          </div>

          {/* X Axis */}
          <div className="slider-row">
            <div className="slider-meta">
              <span className="axis-badge x">X</span>
              <span className="axis-name">Pitch / Inclinação</span>
              <span className="axis-val">{rotX}°</span>
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
              <span className="axis-val">{rotY}°</span>
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
              <span className="axis-val">{rotZ}°</span>
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

      {/* Pose Actions */}
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
