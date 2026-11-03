import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createDefaultMannequin } from '../utils/defaultMannequin';
import {
  extractSkeletonRig,
  SkeletonRig,
  BONE_SHORT_LABELS,
  ALL_STANDARD_BONES,
  matchStandardBone,
} from '../utils/boneMapping';
import { StandardBoneName } from '../types';

interface Viewport3DProps {
  onRigReady: (rig: SkeletonRig) => void;
  selectedBoneName: StandardBoneName | null;
  onSelectBone: (name: StandardBoneName | null) => void;
  visibleGizmoBones: Set<StandardBoneName>;
  onToggleBoneGizmo: (boneName: StandardBoneName) => void;
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
  onBoneRotationChange?: (boneName: StandardBoneName, rotDeg: { x: number; y: number; z: number }) => void;
}

/**
 * Creates 3D coordinate crosshair lines that pierce straight through the center
 * of each gizmo (from -len to +len across X, Y, Z).
 */
function createCrosshairHelper(radius = 0.16, extendFactor = 2.4): THREE.Group {
  const group = new THREE.Group();
  group.name = 'gizmo_crosshair_lines';
  const len = radius * extendFactor;

  // X axis line (Red) - passes through center from -len to +len along local X
  const geomX = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-len, 0, 0),
    new THREE.Vector3(len, 0, 0),
  ]);
  const matX = new THREE.LineBasicMaterial({
    color: 0xff4d4d,
    linewidth: 2,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
  });
  const lineX = new THREE.Line(geomX, matX);
  lineX.renderOrder = 997;
  group.add(lineX);

  // Y axis line (Green) - passes through center from -len to +len along local Y
  const geomY = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -len, 0),
    new THREE.Vector3(0, len, 0),
  ]);
  const matY = new THREE.LineBasicMaterial({
    color: 0x10b981,
    linewidth: 2,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
  });
  const lineY = new THREE.Line(geomY, matY);
  lineY.renderOrder = 997;
  group.add(lineY);

  // Z axis line (Blue) - passes through center from -len to +len along local Z
  const geomZ = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, -len),
    new THREE.Vector3(0, 0, len),
  ]);
  const matZ = new THREE.LineBasicMaterial({
    color: 0x3b82f6,
    linewidth: 2,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
  });
  const lineZ = new THREE.Line(geomZ, matZ);
  lineZ.renderOrder = 997;
  group.add(lineZ);

  // Small center anchor bead
  const dotGeo = new THREE.SphereGeometry(radius * 0.1, 8, 8);
  const dotMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    depthTest: false,
  });
  const dotMesh = new THREE.Mesh(dotGeo, dotMat);
  dotMesh.renderOrder = 999;
  group.add(dotMesh);

  return group;
}

/**
 * Creates a lightweight 3-ring orientation gizmo with center crosshair lines
 * for secondary visible bones.
 */
function createSecondaryOrientationHelper(boneName: StandardBoneName, label: string): THREE.Group {
  const group = new THREE.Group();
  group.name = `secondary_gizmo_${boneName}`;
  const radius = 0.16;

  // 1. Crosshair lines passing directly through the middle of the gizmo
  const crosshair = createCrosshairHelper(radius, 2.3);
  group.add(crosshair);

  // 2. X ring (Red) - in YZ plane
  const geoX = new THREE.RingGeometry(radius * 0.93, radius, 28);
  const matX = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    depthTest: false,
  });
  const meshX = new THREE.Mesh(geoX, matX);
  meshX.rotation.y = Math.PI / 2;
  meshX.renderOrder = 998;
  group.add(meshX);

  // 3. Y ring (Green) - in XZ plane
  const geoY = new THREE.RingGeometry(radius * 0.93, radius, 28);
  const matY = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    depthTest: false,
  });
  const meshY = new THREE.Mesh(geoY, matY);
  meshY.rotation.x = Math.PI / 2;
  meshY.renderOrder = 998;
  group.add(meshY);

  // 4. Z ring (Blue) - in XY plane
  const geoZ = new THREE.RingGeometry(radius * 0.93, radius, 28);
  const matZ = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    depthTest: false,
  });
  const meshZ = new THREE.Mesh(geoZ, matZ);
  meshZ.renderOrder = 998;
  group.add(meshZ);

  // 5. Joint pick anchor sphere (interactive click area)
  const sphereGeo = new THREE.SphereGeometry(radius * 0.42, 12, 12);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    depthTest: false,
  });
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  sphereMesh.renderOrder = 999;
  sphereMesh.userData = { standardBoneName: boneName, isJointPick: true, label };
  group.add(sphereMesh);

  return group;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  onRigReady,
  selectedBoneName,
  onSelectBone,
  visibleGizmoBones,
  showSkeletonHelper,
  showWireframe,
  showGrid,
  useGizmo,
  onToggleGizmo,
  showNumericalValues,
  onToggleNumericalValues,
  onBoneRotationChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeModelType, setActiveModelType] = useState<'mannequin' | 'jogging' | 'custom'>('mannequin');
  const [hasAnimation, setHasAnimation] = useState(false);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);
  const [isHudMinimized, setIsHudMinimized] = useState(false);

  // Click feedback ripple state
  const [clickFeedback, setClickFeedback] = useState<{
    x: number;
    y: number;
    label: string;
    id: number;
  } | null>(null);

  // References to three instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const skeletonHelperRef = useRef<THREE.SkeletonHelper | null>(null);
  const currentRigRef = useRef<SkeletonRig | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const currentModelGroupRef = useRef<THREE.Object3D | null>(null);
  const secondaryGizmoGroupRef = useRef<THREE.Group>(new THREE.Group());
  const activeCrosshairGroupRef = useRef<THREE.Group>(createCrosshairHelper(0.18, 2.4));

  // Animation mixer
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const clockRef = useRef(new THREE.Clock());

  // Gizmo Badges DOM Refs for active bone (expanded ring labels)
  const badgesLayerRef = useRef<HTMLDivElement>(null);
  const badgeXRef = useRef<HTMLDivElement>(null);
  const badgeYRef = useRef<HTMLDivElement>(null);
  const badgeZRef = useRef<HTMLDivElement>(null);
  const degXRef = useRef<HTMLSpanElement>(null);
  const degYRef = useRef<HTMLSpanElement>(null);
  const degZRef = useRef<HTMLSpanElement>(null);
  const bonePillRef = useRef<HTMLDivElement>(null);
  const boneNameTextRef = useRef<HTMLSpanElement>(null);

  // Right-side organized HUD rows map (prevents overlapping in 3D perspective!)
  const hudRowElementsRef = useRef<Map<StandardBoneName, HTMLDivElement>>(new Map());

  // Callback & state refs for animation loop
  const selectedBoneNameRef = useRef<StandardBoneName | null>(selectedBoneName);
  selectedBoneNameRef.current = selectedBoneName;

  const visibleGizmoBonesRef = useRef<Set<StandardBoneName>>(visibleGizmoBones);
  visibleGizmoBonesRef.current = visibleGizmoBones;

  const useGizmoRef = useRef<boolean>(useGizmo);
  useGizmoRef.current = useGizmo;

  const showNumericalValuesRef = useRef<boolean>(showNumericalValues);
  showNumericalValuesRef.current = showNumericalValues;

  const onBoneRotationChangeRef = useRef(onBoneRotationChange);
  onBoneRotationChangeRef.current = onBoneRotationChange;

  const isDraggingTransformControlsRef = useRef<boolean>(false);
  const pointerDownPosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  // List of bones to display neatly in the right-side HUD
  const activeBonesForHud = useMemo(() => {
    return ALL_STANDARD_BONES.filter(
      (bName) => visibleGizmoBones.has(bName) || bName === selectedBoneName
    );
  }, [visibleGizmoBones, selectedBoneName]);

  const activeBonesForHudRef = useRef(activeBonesForHud);
  activeBonesForHudRef.current = activeBonesForHud;

  // Update live degree values from bone directly
  const updateDegreeBadgesText = useCallback((bone: THREE.Bone) => {
    const degX = Math.round(THREE.MathUtils.radToDeg(bone.rotation.x));
    const degY = Math.round(THREE.MathUtils.radToDeg(bone.rotation.y));
    const degZ = Math.round(THREE.MathUtils.radToDeg(bone.rotation.z));

    if (degXRef.current) degXRef.current.textContent = `${degX}°`;
    if (degYRef.current) degYRef.current.textContent = `${degY}°`;
    if (degZRef.current) degZRef.current.textContent = `${degZ}°`;
  }, []);

  // Setup Three.js scene once
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x13161f);
    sceneRef.current = scene;

    // Secondary Gizmos group & Active Crosshair group
    scene.add(secondaryGizmoGroupRef.current);
    scene.add(activeCrosshairGroupRef.current);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 3.4);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Studio Environment map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.0, 0);
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Do not go below floor
    controls.minDistance = 0.5;
    controls.maxDistance = 15;
    controlsRef.current = controls;

    // TransformControls for manual bone rotation gizmo
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setMode('rotate');
    transformControls.setSize(0.85);
    transformControls.setSpace('local');
    scene.add(transformControls.getHelper());
    transformControlsRef.current = transformControls;

    // Disable OrbitControls while dragging gizmo
    transformControls.addEventListener('dragging-changed', (event) => {
      controls.enabled = !event.value;
      isDraggingTransformControlsRef.current = Boolean(event.value);
    });

    // Handle real-time dragging rotation updates
    const handleGizmoRotateChange = () => {
      const bone = transformControls.object as THREE.Bone | null;
      if (!bone) return;

      // Update live degree badges on gizmo rings immediately
      updateDegreeBadgesText(bone);

      // Notify parent to update sidebar sliders
      if (selectedBoneNameRef.current) {
        const xDeg = Math.round(THREE.MathUtils.radToDeg(bone.rotation.x));
        const yDeg = Math.round(THREE.MathUtils.radToDeg(bone.rotation.y));
        const zDeg = Math.round(THREE.MathUtils.radToDeg(bone.rotation.z));
        onBoneRotationChangeRef.current?.(selectedBoneNameRef.current, { x: xDeg, y: yDeg, z: zDeg });
      }
    };

    transformControls.addEventListener('objectChange', handleGizmoRotateChange);
    transformControls.addEventListener('change', handleGizmoRotateChange);

    // 3-Point Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xeef2ff, 0x1a1e28, 0.7);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ea, 1.5);
    dirLight.position.set(3, 5, 4);
    dirLight.castShadow = !isSoftwareGl;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.normalBias = 0.02;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x7388ff, 0.8);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);

    // Floor Grid
    const gridHelper = new THREE.GridHelper(8, 20, 0x5b5bd6, 0x272c3d);
    gridHelper.position.y = 0;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Shadow catcher plane on the floor
    const shadowPlaneGeo = new THREE.PlaneGeometry(10, 10);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.001;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Initial model: default mannequin
    loadDefaultModel();

    // Render loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();

      // Update animation mixer if active
      if (mixerRef.current && isPlayingAnimation) {
        mixerRef.current.update(delta);
      }

      controls.update();

      const rig = currentRigRef.current;
      const w = containerRef.current?.clientWidth ?? 800;
      const h = containerRef.current?.clientHeight ?? 600;

      // Synchronize secondary gizmos positions and rotations
      if (rig && secondaryGizmoGroupRef.current.children.length > 0) {
        secondaryGizmoGroupRef.current.children.forEach((child) => {
          const bName = child.userData?.standardBoneName as StandardBoneName | undefined;
          if (bName) {
            const b = rig.standardBones.get(bName);
            if (b) {
              b.getWorldPosition(child.position);
              b.getWorldQuaternion(child.quaternion);
            }
          }
        });
      }

      // Synchronize Active Gizmo Crosshair lines (pierces through active TransformControls)
      if (useGizmoRef.current && selectedBoneNameRef.current && rig) {
        const activeBone = rig.standardBones.get(selectedBoneNameRef.current);
        if (activeBone && activeCrosshairGroupRef.current) {
          activeCrosshairGroupRef.current.visible = true;
          activeBone.getWorldPosition(activeCrosshairGroupRef.current.position);
          activeBone.getWorldQuaternion(activeCrosshairGroupRef.current.quaternion);

          // Dynamically scale crosshair lines to match visual camera distance
          const dist = camera.position.distanceTo(activeCrosshairGroupRef.current.position);
          const crossScale = Math.max(0.6, dist * 0.42);
          activeCrosshairGroupRef.current.scale.setScalar(crossScale);
        } else if (activeCrosshairGroupRef.current) {
          activeCrosshairGroupRef.current.visible = false;
        }
      } else if (activeCrosshairGroupRef.current) {
        activeCrosshairGroupRef.current.visible = false;
      }

      // 1. Update Active Gizmo Overlay degree badges positions (if showNumericalValues is ON)
      if (
        showNumericalValuesRef.current &&
        useGizmoRef.current &&
        selectedBoneNameRef.current &&
        rig &&
        containerRef.current &&
        cameraRef.current &&
        badgesLayerRef.current
      ) {
        const activeBoneName = selectedBoneNameRef.current;
        const activeBone = rig.standardBones.get(activeBoneName);

        if (activeBone) {
          const centerPos = new THREE.Vector3();
          activeBone.getWorldPosition(centerPos);

          const quat = new THREE.Quaternion();
          activeBone.getWorldQuaternion(quat);

          const projCenter = centerPos.clone().project(camera);
          const inFront = projCenter.z < 1 && projCenter.z > -1;

          if (inFront) {
            badgesLayerRef.current.style.display = 'block';

            const centerX = ((projCenter.x + 1) / 2) * w;
            const centerY = ((-projCenter.y + 1) / 2) * h;

            // Visual ring radius in 3D: proportional to camera distance
            const dist = camera.position.distanceTo(centerPos);
            const r3D = dist * 0.13;

            // Local axis vectors in world frame
            const dirX = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
            const dirY = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);
            const dirZ = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);

            // Points on each circle
            const pX = centerPos.clone().addScaledVector(dirY, r3D);
            const pY = centerPos.clone().addScaledVector(dirX, r3D);
            const pZ = centerPos.clone().addScaledVector(dirZ, r3D);

            const projX = pX.project(camera);
            const projY = pY.project(camera);
            const projZ = pZ.project(camera);

            const rawX = { x: ((projX.x + 1) / 2) * w, y: ((-projX.y + 1) / 2) * h };
            const rawY = { x: ((projY.x + 1) / 2) * w, y: ((-projY.y + 1) / 2) * h };
            const rawZ = { x: ((projZ.x + 1) / 2) * w, y: ((-projZ.y + 1) / 2) * h };

            // Ensure badges are nicely spaced around the center
            const offsetDir = (raw: { x: number; y: number }, defaultAngleDeg: number) => {
              let dx = raw.x - centerX;
              let dy = raw.y - centerY;
              let len = Math.hypot(dx, dy);
              if (len < 25) {
                const rad = (defaultAngleDeg * Math.PI) / 180;
                dx = Math.cos(rad);
                dy = Math.sin(rad);
                len = 1;
              }
              const targetDist = 62;
              return {
                x: centerX + (dx / len) * targetDist,
                y: centerY + (dy / len) * targetDist,
              };
            };

            const posBadgeX = offsetDir(rawX, 15);   // East
            const posBadgeY = offsetDir(rawY, 135);  // North-West
            const posBadgeZ = offsetDir(rawZ, 255);  // South-West

            if (badgeXRef.current) {
              badgeXRef.current.style.transform = `translate3d(${posBadgeX.x}px, ${posBadgeX.y}px, 0) translate(-50%, -50%)`;
            }
            if (badgeYRef.current) {
              badgeYRef.current.style.transform = `translate3d(${posBadgeY.x}px, ${posBadgeY.y}px, 0) translate(-50%, -50%)`;
            }
            if (badgeZRef.current) {
              badgeZRef.current.style.transform = `translate3d(${posBadgeZ.x}px, ${posBadgeZ.y}px, 0) translate(-50%, -50%)`;
            }

            if (bonePillRef.current) {
              bonePillRef.current.style.transform = `translate3d(${centerX}px, ${centerY - 72}px, 0) translate(-50%, -50%)`;
            }
            if (boneNameTextRef.current) {
              boneNameTextRef.current.textContent = `${BONE_SHORT_LABELS[activeBoneName] || activeBoneName} (Foco)`;
            }

            // Sync degree numbers
            updateDegreeBadgesText(activeBone);

            // Active ring highlight if user is hovering or dragging a specific axis
            const activeAxis = transformControls.axis;
            badgeXRef.current?.classList.toggle('active-axis', activeAxis === 'X');
            badgeYRef.current?.classList.toggle('active-axis', activeAxis === 'Y');
            badgeZRef.current?.classList.toggle('active-axis', activeAxis === 'Z');
          } else {
            badgesLayerRef.current.style.display = 'none';
          }
        } else {
          badgesLayerRef.current.style.display = 'none';
        }
      } else if (badgesLayerRef.current) {
        badgesLayerRef.current.style.display = 'none';
      }

      // 2. Update Right-Side Organized HUD rows (Real-time 60fps degrees without perspective collision!)
      if (showNumericalValuesRef.current && rig) {
        activeBonesForHudRef.current.forEach((bName) => {
          const rowEl = hudRowElementsRef.current.get(bName);
          if (!rowEl) return;
          const b = rig.standardBones.get(bName);
          if (b) {
            const degX = Math.round(THREE.MathUtils.radToDeg(b.rotation.x));
            const degY = Math.round(THREE.MathUtils.radToDeg(b.rotation.y));
            const degZ = Math.round(THREE.MathUtils.radToDeg(b.rotation.z));

            const spanX = rowEl.querySelector('[data-axis="x"]');
            const spanY = rowEl.querySelector('[data-axis="y"]');
            const spanZ = rowEl.querySelector('[data-axis="z"]');
            if (spanX && spanX.textContent !== `${degX}°`) spanX.textContent = `${degX}°`;
            if (spanY && spanY.textContent !== `${degY}°`) spanY.textContent = `${degY}°`;
            if (spanZ && spanZ.textContent !== `${degZ}°`) spanZ.textContent = `${degZ}°`;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handling
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      transformControls.dispose();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [isPlayingAnimation, updateDegreeBadgesText]);

  // Clean previous model & helpers
  const clearCurrentModel = () => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      mixerRef.current = null;
      actionRef.current = null;
    }
    setHasAnimation(false);
    setIsPlayingAnimation(false);

    if (currentModelGroupRef.current) {
      scene.remove(currentModelGroupRef.current);
      currentModelGroupRef.current = null;
    }

    if (skeletonHelperRef.current) {
      scene.remove(skeletonHelperRef.current);
      skeletonHelperRef.current.dispose();
      skeletonHelperRef.current = null;
    }
  };

  // Process and center any loaded 3D Object (GLB or FBX)
  const processModelObject = useCallback(
    (modelObject: THREE.Object3D, fileName: string, animations: THREE.AnimationClip[] = []) => {
      if (!sceneRef.current) return;
      const scene = sceneRef.current;

      clearCurrentModel();

      // Enable shadows & PBR material tweaks
      modelObject.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Normalize model scale so it fits nicely (~1.8m height)
      const box = new THREE.Box3().setFromObject(modelObject);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.y, 0.001);
      const targetHeight = 1.8;
      const scaleFactor = targetHeight / maxDim;
      modelObject.scale.setScalar(scaleFactor);

      // Re-evaluate box and position feet on ground (Y = 0)
      box.setFromObject(modelObject);
      modelObject.position.x = -center.x * scaleFactor;
      modelObject.position.y = -box.min.y;
      modelObject.position.z = -center.z * scaleFactor;

      scene.add(modelObject);
      currentModelGroupRef.current = modelObject;

      // Build SkeletonRig
      const rig = extractSkeletonRig(modelObject, fileName);
      currentRigRef.current = rig;

      // Skeleton helper
      if (rig.allBones.length > 0) {
        const helper = new THREE.SkeletonHelper(modelObject);
        (helper.material as THREE.LineBasicMaterial).linewidth = 2;
        (helper.material as THREE.LineBasicMaterial).color.set(0x00ffff);
        helper.visible = showSkeletonHelper;
        scene.add(helper);
        skeletonHelperRef.current = helper;
      } else {
        setErrorMessage(
          'Aviso: O modelo 3D carregado NÃO possui esqueleto (armature/bones). Não será possível aplicar poses automáticas nem manipular articulações.'
        );
      }

      // Check animations
      if (animations && animations.length > 0) {
        const mixer = new THREE.AnimationMixer(modelObject);
        mixerRef.current = mixer;
        const action = mixer.clipAction(animations[0]);
        actionRef.current = action;
        setHasAnimation(true);
        setIsPlayingAnimation(false);
      }

      onRigReady(rig);
      setModelLoading(false);
      setErrorMessage(null);
    },
    [onRigReady, showSkeletonHelper]
  );

  // Load default mannequin
  const loadDefaultModel = useCallback(() => {
    clearCurrentModel();
    setActiveModelType('mannequin');

    const mannequin = createDefaultMannequin();
    if (sceneRef.current) {
      sceneRef.current.add(mannequin);
    }
    currentModelGroupRef.current = mannequin;

    const rig = extractSkeletonRig(mannequin, 'Manequim Articulado (Padrão)');
    currentRigRef.current = rig;

    if (sceneRef.current) {
      const helper = new THREE.SkeletonHelper(mannequin);
      (helper.material as THREE.LineBasicMaterial).linewidth = 2;
      (helper.material as THREE.LineBasicMaterial).color.set(0x00ffff);
      helper.visible = showSkeletonHelper;
      sceneRef.current.add(helper);
      skeletonHelperRef.current = helper;
    }

    onRigReady(rig);
    setErrorMessage(null);
  }, [onRigReady, showSkeletonHelper]);

  // Load Jogging.fbx (Mixamo preset)
  const loadJoggingModel = useCallback(() => {
    setModelLoading(true);
    setErrorMessage(null);
    setActiveModelType('jogging');

    const loader = new FBXLoader();
    loader.load(
      '/models/Jogging.fbx',
      (fbx) => {
        processModelObject(fbx, 'Jogging.fbx (Mixamo Humanoid)', fbx.animations || []);
      },
      undefined,
      (err) => {
        console.error('Error loading Jogging.fbx', err);
        setErrorMessage('Falha ao carregar Jogging.fbx. Verifique se o arquivo está na pasta.');
        setModelLoading(false);
      }
    );
  }, [processModelObject]);

  // Load custom model (FBX, GLB or GLTF)
  const loadCustomModel = useCallback(
    (fileOrUrl: File | string, fileName = 'custom-model') => {
      setModelLoading(true);
      setErrorMessage(null);
      setActiveModelType('custom');

      const isFBX = fileName.toLowerCase().endsWith('.fbx');

      if (typeof fileOrUrl === 'string') {
        if (isFBX) {
          const loader = new FBXLoader();
          loader.load(
            fileOrUrl,
            (fbx) => processModelObject(fbx, fileName, fbx.animations || []),
            undefined,
            (err) => {
              console.error('Error loading FBX url', err);
              setErrorMessage('Erro ao carregar o arquivo FBX.');
              setModelLoading(false);
            }
          );
        } else {
          const loader = new GLTFLoader();
          loader.load(
            fileOrUrl,
            (gltf) => processModelObject(gltf.scene, fileName, gltf.animations || []),
            undefined,
            (err) => {
              console.error('Error loading GLTF url', err);
              setErrorMessage('Erro ao carregar o arquivo GLB/GLTF.');
              setModelLoading(false);
            }
          );
        }
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const contents = e.target?.result as ArrayBuffer;
          if (isFBX) {
            try {
              const loader = new FBXLoader();
              const fbx = loader.parse(contents, '');
              processModelObject(fbx, fileOrUrl.name, fbx.animations || []);
            } catch (err) {
              console.error('Error parsing FBX', err);
              setErrorMessage('Falha ao processar o arquivo .FBX.');
              setModelLoading(false);
            }
          } else {
            const loader = new GLTFLoader();
            loader.parse(
              contents,
              '',
              (gltf) => processModelObject(gltf.scene, fileOrUrl.name, gltf.animations || []),
              (err) => {
                console.error('Error parsing GLTF', err);
                setErrorMessage('Falha ao processar o arquivo .GLB/.GLTF.');
                setModelLoading(false);
              }
            );
          }
        };
        reader.readAsArrayBuffer(fileOrUrl);
      }
    },
    [processModelObject]
  );

  // Toggle animation playback
  const handleToggleAnimation = () => {
    if (!actionRef.current) return;
    if (isPlayingAnimation) {
      actionRef.current.paused = true;
      setIsPlayingAnimation(false);
    } else {
      actionRef.current.paused = false;
      actionRef.current.play();
      setIsPlayingAnimation(true);
    }
  };

  // Sync SkeletonHelper visibility
  useEffect(() => {
    if (skeletonHelperRef.current) {
      skeletonHelperRef.current.visible = showSkeletonHelper;
    }
  }, [showSkeletonHelper]);

  // Sync Floor Grid visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid]);

  // Sync Wireframe on meshes
  useEffect(() => {
    if (!currentModelGroupRef.current) return;
    currentModelGroupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material;
        const setWireframe = (m: THREE.Material) => {
          if ('wireframe' in m) {
            (m as THREE.MeshStandardMaterial).wireframe = showWireframe;
          }
        };
        if (Array.isArray(mat)) {
          mat.forEach(setWireframe);
        } else if (mat) {
          setWireframe(mat);
        }
      }
    });
  }, [showWireframe]);

  // Synchronize TransformControls attachment to selected bone
  useEffect(() => {
    const transformControls = transformControlsRef.current;
    if (!transformControls) return;

    if (!useGizmo || !selectedBoneName || !currentRigRef.current) {
      transformControls.detach();
      return;
    }

    const bone = currentRigRef.current.standardBones.get(selectedBoneName);
    if (bone) {
      transformControls.attach(bone);
      updateDegreeBadgesText(bone);
    } else {
      transformControls.detach();
    }
  }, [selectedBoneName, useGizmo, updateDegreeBadgesText]);

  // Rebuild secondary gizmos for all visible bones (except selected one)
  useEffect(() => {
    const group = secondaryGizmoGroupRef.current;

    // Clear previous children
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    if (!useGizmo || !currentRigRef.current) return;
    const rig = currentRigRef.current;

    visibleGizmoBones.forEach((boneName) => {
      if (boneName === selectedBoneName) return; // Selected bone already gets TransformControls
      const bone = rig.standardBones.get(boneName);
      if (!bone) return;

      const helper = createSecondaryOrientationHelper(boneName, BONE_SHORT_LABELS[boneName] || boneName);
      helper.userData = { standardBoneName: boneName };
      bone.getWorldPosition(helper.position);
      bone.getWorldQuaternion(helper.quaternion);
      group.add(helper);
    });
  }, [visibleGizmoBones, selectedBoneName, useGizmo]);

  // Trigger visual ripple on clicked point
  const triggerClickFeedback = (x: number, y: number, label: string) => {
    setClickFeedback({ x, y, label, id: Date.now() });
    setTimeout(() => {
      setClickFeedback(null);
    }, 700);
  };

  // Pointer interactions for clicking on avatar body points to select bones
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const dx = e.clientX - pointerDownPosRef.current.x;
    const dy = e.clientY - pointerDownPosRef.current.y;
    const dist = Math.hypot(dx, dy);

    // If pointer moved more than 5px, it's an Orbit drag, not a click
    if (dist > 5) return;
    if (isDraggingTransformControlsRef.current) return;

    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const rig = currentRigRef.current;
    if (!rig) return;

    // 1. Raycast against secondary gizmo joint anchor pick spheres
    const secondaryHits = raycaster.intersectObjects(secondaryGizmoGroupRef.current.children, true);
    if (secondaryHits.length > 0) {
      let curObj: THREE.Object3D | null = secondaryHits[0].object;
      while (curObj && !curObj.userData?.standardBoneName && curObj.parent) {
        curObj = curObj.parent;
      }
      if (curObj?.userData?.standardBoneName) {
        const boneName = curObj.userData.standardBoneName as StandardBoneName;
        onSelectBone(boneName);
        if (!useGizmo) onToggleGizmo();
        triggerClickFeedback(e.clientX - rect.left, e.clientY - rect.top, BONE_SHORT_LABELS[boneName] || boneName);
        return;
      }
    }

    // 2. Raycast against avatar model meshes
    if (currentModelGroupRef.current) {
      const hits = raycaster.intersectObjects(currentModelGroupRef.current.children, true);
      if (hits.length > 0) {
        const firstHit = hits[0];
        let foundBoneName: StandardBoneName | null = null;

        // A: Check if mesh is child of Bone (as in default procedural mannequin)
        let curObj: THREE.Object3D | null = firstHit.object;
        while (curObj && curObj !== currentModelGroupRef.current) {
          if ((curObj as THREE.Bone).isBone || curObj.type === 'Bone') {
            const matched = matchStandardBone(curObj.name);
            if (matched && rig.standardBones.has(matched)) {
              foundBoneName = matched;
              break;
            }
          }
          const matchedName = matchStandardBone(curObj.name);
          if (matchedName && rig.standardBones.has(matchedName)) {
            foundBoneName = matchedName;
            break;
          }
          curObj = curObj.parent;
        }

        // B: If SkinnedMesh (or bone not directly in parent hierarchy), find closest standard bone to hit.point
        if (!foundBoneName) {
          let minDistance = Infinity;
          const bonePos = new THREE.Vector3();
          for (const [boneName, boneObj] of rig.standardBones.entries()) {
            boneObj.getWorldPosition(bonePos);
            const d = bonePos.distanceTo(firstHit.point);
            if (d < minDistance) {
              minDistance = d;
              foundBoneName = boneName;
            }
          }
        }

        if (foundBoneName) {
          onSelectBone(foundBoneName);
          if (!useGizmo) onToggleGizmo();
          triggerClickFeedback(e.clientX - rect.left, e.clientY - rect.top, BONE_SHORT_LABELS[foundBoneName] || foundBoneName);
        }
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.fbx') || lower.endsWith('.glb') || lower.endsWith('.gltf')) {
        loadCustomModel(file, file.name);
      } else {
        setErrorMessage('Por favor, envie um arquivo com extensão .FBX, .GLB ou .GLTF.');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      loadCustomModel(file, file.name);
    }
  };

  // Camera presets
  const setCameraPreset = (view: 'front' | 'side' | 'perspective' | 'top') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (view === 'front') {
      camera.position.set(0, 1.2, 3.2);
      controls.target.set(0, 1.0, 0);
    } else if (view === 'side') {
      camera.position.set(3.2, 1.2, 0);
      controls.target.set(0, 1.0, 0);
    } else if (view === 'top') {
      camera.position.set(0, 4.0, 0.1);
      controls.target.set(0, 1.0, 0);
    } else {
      // Perspective 3/4
      camera.position.set(2.2, 1.6, 2.6);
      controls.target.set(0, 1.0, 0);
    }
    controls.update();
  };

  // Export current posed model as GLB
  const handleExportGLB = () => {
    if (!currentModelGroupRef.current) return;
    const exporter = new GLTFExporter();
    exporter.parse(
      currentModelGroupRef.current,
      (gltf) => {
        const blob = new Blob([gltf as ArrayBuffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pose_export_${Date.now()}.glb`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error exporting GLB', error);
      },
      { binary: true }
    );
  };

  return (
    <div
      ref={containerRef}
      className={`viewport-container ${isDragOver ? 'drag-active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* 1. Active Gizmo (Selected Bone) Axis Numerical Badges on 3D Rings */}
      <div ref={badgesLayerRef} className="gizmo-overlay-container" style={{ display: 'none' }}>
        {/* Selected bone header pill */}
        <div ref={bonePillRef} className="gizmo-bone-header-pill">
          <span className="bone-dot" />
          <span ref={boneNameTextRef}>Cabeça</span>
        </div>

        {/* X Axis Degree Badge (Red Circle) */}
        <div ref={badgeXRef} className="gizmo-axis-badge axis-badge-x" title="Eixo X (Pitch / Inclinação)">
          <span className="axis-letter">X</span>
          <span ref={degXRef} className="axis-degrees">
            0°
          </span>
        </div>

        {/* Y Axis Degree Badge (Green Circle) */}
        <div ref={badgeYRef} className="gizmo-axis-badge axis-badge-y" title="Eixo Y (Yaw / Rotação Lateral)">
          <span className="axis-letter">Y</span>
          <span ref={degYRef} className="axis-degrees">
            0°
          </span>
        </div>

        {/* Z Axis Degree Badge (Blue Circle) */}
        <div ref={badgeZRef} className="gizmo-axis-badge axis-badge-z" title="Eixo Z (Roll / Giro)">
          <span className="axis-letter">Z</span>
          <span ref={degZRef} className="axis-degrees">
            0°
          </span>
        </div>
      </div>

      {/* 2. Organized Right-Side HUD Panel for All Visible Bone Angles (Eliminates perspective overlap!) */}
      {showNumericalValues && (
        <div className={`viewport-angles-hud ${isHudMinimized ? 'minimized' : ''}`}>
          <div className="hud-header">
            <div className="hud-header-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a9 9 0 0 1 9 9" />
              </svg>
              <span>{isHudMinimized ? 'Ângulos' : 'Ângulos das Articulações'}</span>
              <span className="hud-count-tag">{activeBonesForHud.length}</span>
            </div>
            <div className="hud-actions">
              {/* Toggle hide values */}
              <button
                type="button"
                className="hud-btn-icon"
                onClick={onToggleNumericalValues}
                title="Ocultar valores numéricos de todos os gizmos"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              </button>
              {/* Minimize / Expand HUD */}
              <button
                type="button"
                className="hud-btn-icon"
                onClick={() => setIsHudMinimized(!isHudMinimized)}
                title={isHudMinimized ? 'Expandir lista de ângulos' : 'Minimizar'}
              >
                {isHudMinimized ? '+' : '−'}
              </button>
            </div>
          </div>

          {!isHudMinimized && (
            <div className="hud-body">
              {activeBonesForHud.length === 0 ? (
                <div className="hud-empty">Nenhum gizmo ativo</div>
              ) : (
                <div className="hud-list">
                  {activeBonesForHud.map((bName) => {
                    const isSelected = selectedBoneName === bName;
                    return (
                      <div
                        key={bName}
                        ref={(el) => {
                          if (el) hudRowElementsRef.current.set(bName, el);
                          else hudRowElementsRef.current.delete(bName);
                        }}
                        className={`hud-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          onSelectBone(bName);
                          if (!useGizmo) onToggleGizmo();
                        }}
                        title={`Clique para focar e manipular o gizmo de ${BONE_SHORT_LABELS[bName]}`}
                      >
                        <div className="hud-row-left">
                          <span className={`hud-bone-dot ${isSelected ? 'active' : ''}`} />
                          <span className="hud-bone-name">{BONE_SHORT_LABELS[bName]}</span>
                          {isSelected && <span className="hud-active-tag">Foco</span>}
                        </div>
                        <div className="hud-row-angles">
                          <span className="hud-chip x">
                            <span className="axis-letter">X</span>
                            <span data-axis="x">0°</span>
                          </span>
                          <span className="hud-chip y">
                            <span className="axis-letter">Y</span>
                            <span data-axis="y">0°</span>
                          </span>
                          <span className="hud-chip z">
                            <span className="axis-letter">Z</span>
                            <span data-axis="z">0°</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Click feedback ripple animation on avatar */}
      {clickFeedback && (
        <div
          className="click-feedback-ripple"
          style={{
            left: `${clickFeedback.x}px`,
            top: `${clickFeedback.y}px`,
          }}
        >
          <div className="ripple-circle" />
          <div className="ripple-label">{clickFeedback.label}</div>
        </div>
      )}

      {/* Top Toolbar overlay */}
      <div className="viewport-overlay-toolbar">
        <div className="toolbar-group">
          {/* File upload button */}
          <label className="tool-btn upload-btn" title="Subir arquivo 3D (.FBX, .GLB, .GLTF)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Subir (.FBX / .GLB)</span>
            <input type="file" accept=".fbx,.glb,.gltf" onChange={handleFileInput} style={{ display: 'none' }} />
          </label>

          {/* Preset Model 1: Jogging.fbx */}
          <button
            className={`tool-btn ${activeModelType === 'jogging' ? 'active-model-btn' : ''}`}
            type="button"
            onClick={loadJoggingModel}
            title="Carregar Jogging.fbx com esqueleto Mixamo completo"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="5" r="2" />
              <path d="m9 20 3-6 3 2 3-5" />
              <path d="m6 8 6 2 4-2" />
              <path d="M12 10v4l-4 4" />
            </svg>
            <span>Jogging.fbx (Mixamo)</span>
          </button>

          {/* Preset Model 2: Default Mannequin */}
          <button
            className={`tool-btn ${activeModelType === 'mannequin' ? 'active-model-btn' : ''}`}
            type="button"
            onClick={loadDefaultModel}
            title="Carregar Manequim Articulado Neutro"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="7" r="4" />
              <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
            </svg>
            <span>Manequim Padrão</span>
          </button>

          {/* Toggle show/hide numerical values */}
          <button
            className={`tool-btn ${showNumericalValues ? 'active-model-btn' : ''}`}
            type="button"
            onClick={onToggleNumericalValues}
            title={showNumericalValues ? 'Ocultar valores numéricos (limpar visão)' : 'Exibir valores numéricos (X/Y/Z)'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {showNumericalValues ? (
                <>
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </>
              )}
            </svg>
            <span>{showNumericalValues ? 'Ângulos: ON' : 'Ângulos: OFF'}</span>
          </button>

          {/* Animation Play/Pause toggle if model has clips */}
          {hasAnimation && (
            <button
              className={`tool-btn ${isPlayingAnimation ? 'anim-playing' : ''}`}
              type="button"
              onClick={handleToggleAnimation}
              title={isPlayingAnimation ? 'Pausar animação Mixamo' : 'Tocar animação do arquivo'}
            >
              {isPlayingAnimation ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Tocar Ciclo</span>
                </>
              )}
            </button>
          )}

          {/* Export to GLB */}
          <button
            className="tool-btn export-btn"
            type="button"
            onClick={handleExportGLB}
            title="Exportar modelo com a pose atual em formato .GLB"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Exportar .GLB</span>
          </button>
        </div>

        {/* View helpers */}
        <div className="toolbar-group camera-presets">
          <button className="tool-icon-btn" type="button" onClick={() => setCameraPreset('front')} title="Vista Frontal">
            Frente
          </button>
          <button className="tool-icon-btn" type="button" onClick={() => setCameraPreset('side')} title="Vista Lateral">
            Lado
          </button>
          <button className="tool-icon-btn" type="button" onClick={() => setCameraPreset('perspective')} title="Perspectiva 3D">
            3/4
          </button>
          <button className="tool-icon-btn" type="button" onClick={() => setCameraPreset('top')} title="Vista Superior">
            Topo
          </button>
        </div>
      </div>

      {/* Drag & drop overlay */}
      {isDragOver && (
        <div className="drop-target-modal">
          <div className="drop-target-box">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#5b5bd6" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <h3>Solte o arquivo .FBX ou .GLB aqui</h3>
            <p>O modelo será carregado instantaneamente com o esqueleto detectado.</p>
          </div>
        </div>
      )}

      {/* Loading banner */}
      {modelLoading && (
        <div className="viewport-status-badge loading">
          <span className="spinner" />
          <span>Carregando e processando modelo 3D...</span>
        </div>
      )}

      {/* Warning / Error alert banner */}
      {errorMessage && (
        <div className="viewport-alert-badge error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="alert-text">{errorMessage}</div>
          <button type="button" className="alert-close" onClick={() => setErrorMessage(null)}>
            ×
          </button>
        </div>
      )}

      {/* OrbitControls interaction hint in bottom corner */}
      <div className="viewport-hint">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18M3 12h18" />
        </svg>
        <span>Clique no boneco ou lista p/ selecionar · Arraste gizmo p/ rotacionar · Botão dir: Pan · Scroll: Zoom</span>
      </div>
    </div>
  );
};
