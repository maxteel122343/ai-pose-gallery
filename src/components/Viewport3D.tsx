import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createDefaultMannequin } from '../utils/defaultMannequin';
import { extractSkeletonRig, SkeletonRig } from '../utils/boneMapping';
import { StandardBoneName } from '../types';

interface Viewport3DProps {
  onRigReady: (rig: SkeletonRig) => void;
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
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  onRigReady,
  selectedBoneName,
  showSkeletonHelper,
  showWireframe,
  showGrid,
  useGizmo,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeModelType, setActiveModelType] = useState<'mannequin' | 'jogging' | 'custom'>('mannequin');
  const [hasAnimation, setHasAnimation] = useState(false);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);

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

  // Animation mixer
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const clockRef = useRef(new THREE.Clock());

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
    transformControls.setSize(0.75);
    transformControls.setSpace('local');
    scene.add(transformControls.getHelper());
    transformControlsRef.current = transformControls;

    // Disable OrbitControls while dragging gizmo
    transformControls.addEventListener('dragging-changed', (event) => {
      controls.enabled = !event.value;
    });

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
  }, [isPlayingAnimation]);

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
        // Do not auto-play by default so it stays in static pose for editing
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

  // Sync TransformControls attachment to selected bone
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
    } else {
      transformControls.detach();
    }
  }, [selectedBoneName, useGizmo]);

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
    >
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
        <span>Botão esquerdo: Girar órbita · Botão direito: Panorâmica · Scroll: Zoom</span>
      </div>
    </div>
  );
};
