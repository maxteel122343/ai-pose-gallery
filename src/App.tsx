import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  GalleryEntry,
  PAGE_SIZE,
  PoseGroup,
  PoseItem,
  StandardBoneName,
  ViewMode,
  ModelSkeletonInfo,
} from './types';
import { Header } from './components/Header';
import { Viewport3D } from './components/Viewport3D';
import { PoseLibraryPanel } from './components/PoseLibraryPanel';
import { BoneControlPanel } from './components/BoneControlPanel';
import { PoseComparisonCard } from './components/PoseComparisonCard';
import { InfoDialog, InfoType } from './components/InfoDialog';
import { SkeletonRig, resetRigToRestPose } from './utils/boneMapping';
import {
  analyzePoseImage,
  computeTargetPoseRotations,
  applyPoseToRig,
  getPoseHeightFactor,
} from './utils/poseRetargeting';

function groupKey(item: PoseItem): string {
  return `${item.system}|${item.number || item.id}`;
}

export const App: React.FC = () => {
  // Pose data
  const [data, setData] = useState<PoseItem[]>([]);
  const [loadingPoses, setLoadingPoses] = useState<boolean>(true);

  // Filter state
  const [selectedLine, setSelectedLine] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAngle, setSelectedAngle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('pose');

  // Active pose selection
  const [selectedPoseItem, setSelectedPoseItem] = useState<PoseItem | null>(null);
  const [selectedPoseGroup, setSelectedPoseGroup] = useState<PoseGroup | null>(null);
  const [isApplyingPose, setIsApplyingPose] = useState<boolean>(false);

  // 3D Model & Rig
  const [currentRig, setCurrentRig] = useState<SkeletonRig | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelSkeletonInfo | null>(null);
  const [selectedBoneName, setSelectedBoneName] = useState<StandardBoneName | null>('Head');

  // Viewport mode options
  const [showSkeletonHelper, setShowSkeletonHelper] = useState<boolean>(false);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [useGizmo, setUseGizmo] = useState<boolean>(true);

  // Layout toggles
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState<boolean>(false);
  const [infoModal, setInfoModal] = useState<InfoType | null>(null);

  // Theme
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // Dark theme default looks best for 3D studio environments
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load pose database
  useEffect(() => {
    setLoadingPoses(true);
    fetch('/data/pose-en.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((items: PoseItem[]) => {
        items.forEach((item) => {
          item._search = `${item.name} ${item.id} ${item.category} ${item.number}`.toLowerCase();
        });
        setData(items);
        setLoadingPoses(false);
      })
      .catch((err) => {
        console.error('Failed to load pose database', err);
        setLoadingPoses(false);
      });
  }, []);

  // Compute unique series lines
  const lines = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.system)));
  }, [data]);

  // Compute groups and group map
  const { groups, groupMap } = useMemo(() => {
    const map = new Map<string, PoseGroup>();
    const grps: PoseGroup[] = [];

    data.forEach((item) => {
      const key = groupKey(item);
      if (!map.has(key)) {
        const group: PoseGroup = {
          key,
          system: item.system,
          number: item.number,
          name: item.name,
          category: item.category,
          items: [],
          angles: {},
          order: [],
        };
        map.set(key, group);
        grps.push(group);
      }
      const group = map.get(key)!;
      group.items.push(item);
      if (item.angle && !group.angles[item.angle]) {
        group.angles[item.angle] = item;
      }
    });

    grps.forEach((group) => {
      group.order = ['Front', 'High angle', 'Low angle', 'Side', 'Diagonal']
        .map((ang) => group.angles[ang])
        .filter(Boolean);
      group.items.forEach((item) => {
        if (!group.order.includes(item)) group.order.push(item);
      });
    });

    return { groups: grps, groupMap: map };
  }, [data]);

  // Initial pose selection when groups load
  useEffect(() => {
    if (groups.length > 0 && !selectedPoseItem) {
      const firstGroup = groups[0];
      const firstItem = firstGroup.order[0] || firstGroup.items[0];
      setSelectedPoseGroup(firstGroup);
      setSelectedPoseItem(firstItem);
    }
  }, [groups, selectedPoseItem]);

  // Compute available categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    data.forEach((item) => {
      if (!selectedLine || item.system === selectedLine) {
        if (item.category) set.add(item.category);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'en-US'));
  }, [data, selectedLine]);

  // Filtering criteria
  const hit = useCallback(
    (item: PoseItem) => {
      const q = searchQuery.trim().toLowerCase();
      return (
        (!selectedLine || item.system === selectedLine) &&
        (!selectedCategory || item.category === selectedCategory) &&
        (!selectedAngle || item.angle === selectedAngle) &&
        (!q || (item._search ? item._search.includes(q) : false))
      );
    },
    [selectedLine, selectedCategory, selectedAngle, searchQuery]
  );

  // Compute current filtered list
  const currentList: GalleryEntry[] = useMemo(() => {
    if (!data.length) return [];
    if (viewMode === 'single') {
      return data.filter(hit).map((item) => ({
        group: groupMap.get(groupKey(item))!,
        item,
        matched: 1,
      }));
    }

    return groups
      .filter((group) => group.items.some(hit))
      .map((group) => ({
        group,
        item: (selectedAngle && group.angles[selectedAngle]) || group.order[0],
        matched: group.items.filter(hit).length,
      }));
  }, [data, groups, groupMap, viewMode, hit, selectedAngle]);

  // When rig is ready from 3D Viewport
  const handleRigReady = useCallback((rig: SkeletonRig) => {
    setCurrentRig(rig);
    setModelInfo(rig.info);
  }, []);

  // Apply pose to 3D Model
  const handleApplyPose = useCallback(
    async (item: PoseItem) => {
      if (!currentRig) return;
      if (!currentRig.info.hasSkeleton) {
        alert(
          'Aviso: O modelo 3D atual não possui esqueleto (bones/armature). Não é possível aplicar poses neste modelo.'
        );
        return;
      }

      setIsApplyingPose(true);

      try {
        // Run vision feature analysis on the 2D image
        const visionFeatures = await analyzePoseImage(item.thumb);
        // Calculate target bone rotations and hip height factor
        const targetRotations = computeTargetPoseRotations(item, visionFeatures);
        const heightFactor = getPoseHeightFactor(item);
        // Smoothly retarget to skeleton
        applyPoseToRig(
          currentRig,
          targetRotations,
          () => {
            setIsApplyingPose(false);
          },
          heightFactor
        );
      } catch (err) {
        console.error('Failed to apply pose', err);
        setIsApplyingPose(false);
      }
    },
    [currentRig]
  );

  // Reset model pose
  const handleResetPose = useCallback(() => {
    if (!currentRig) return;
    resetRigToRestPose(currentRig);
  }, [currentRig]);

  // Select pose from gallery
  const handleSelectPose = (item: PoseItem, group: PoseGroup) => {
    setSelectedPoseItem(item);
    setSelectedPoseGroup(group);
  };

  // Direct 1-click apply from gallery card
  const handleApplyPoseDirectly = (item: PoseItem) => {
    handleApplyPose(item);
  };

  return (
    <div className="app-layout">
      {/* App Header */}
      <Header
        poseCount={groups.length}
        imageCount={data.length}
        onOpenInfo={(type) => setInfoModal(type)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main 3D Studio Workspace */}
      <div className="studio-workspace">
        {/* Left: Pose Library */}
        <PoseLibraryPanel
          data={data}
          groups={groups}
          lines={lines}
          selectedLine={selectedLine}
          onSelectLine={setSelectedLine}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedAngle={selectedAngle}
          onSelectAngle={setSelectedAngle}
          viewMode={viewMode}
          onSelectViewMode={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentList={currentList}
          selectedPoseItem={selectedPoseItem}
          onSelectPose={handleSelectPose}
          onApplyPoseDirectly={handleApplyPoseDirectly}
          isCollapsed={isLibraryCollapsed}
          onToggleCollapse={() => setIsLibraryCollapsed(!isLibraryCollapsed)}
        />

        {/* Center: 3D Viewport with Comparison Card Overlay */}
        <div className="studio-viewport-area">
          <Viewport3D
            onRigReady={handleRigReady}
            selectedBoneName={selectedBoneName}
            onSelectBone={setSelectedBoneName}
            showSkeletonHelper={showSkeletonHelper}
            onToggleSkeletonHelper={() => setShowSkeletonHelper(!showSkeletonHelper)}
            showWireframe={showWireframe}
            onToggleWireframe={() => setShowWireframe(!showWireframe)}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            useGizmo={useGizmo}
            onToggleGizmo={() => setUseGizmo(!useGizmo)}
          />

          {/* Reference Image Comparison Card */}
          {selectedPoseItem && selectedPoseGroup && (
            <PoseComparisonCard
              currentPoseItem={selectedPoseItem}
              currentPoseGroup={selectedPoseGroup}
              onSelectAngleItem={(item) => setSelectedPoseItem(item)}
              onApplyPose={handleApplyPose}
              isApplying={isApplyingPose}
              onClose={() => {
                setSelectedPoseItem(null);
                setSelectedPoseGroup(null);
              }}
            />
          )}
        </div>

        {/* Right: Bone Controls & Inspector */}
        <BoneControlPanel
          rig={currentRig}
          modelInfo={modelInfo}
          selectedBoneName={selectedBoneName}
          onSelectBone={setSelectedBoneName}
          showSkeletonHelper={showSkeletonHelper}
          onToggleSkeletonHelper={() => setShowSkeletonHelper(!showSkeletonHelper)}
          showWireframe={showWireframe}
          onToggleWireframe={() => setShowWireframe(!showWireframe)}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          useGizmo={useGizmo}
          onToggleGizmo={() => setUseGizmo(!useGizmo)}
          onResetPose={handleResetPose}
        />
      </div>

      <InfoDialog type={infoModal} onClose={() => setInfoModal(null)} />
    </div>
  );
};

export default App;
