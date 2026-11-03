export interface PoseItem {
  id: string;
  system: string;
  number: string;
  category: string;
  name: string;
  angle: string;
  thumb: string;
  full: string;
  _search?: string;
}

export interface PoseGroup {
  key: string;
  system: string;
  number: string;
  name: string;
  category: string;
  items: PoseItem[];
  angles: Record<string, PoseItem>;
  order: PoseItem[];
}

export interface GalleryEntry {
  group: PoseGroup;
  item: PoseItem;
  matched: number;
}

export type ViewMode = 'pose' | 'single';

export const ANGLES = ['Front', 'High angle', 'Low angle', 'Side', 'Diagonal'] as const;

export const PAGE_SIZE: Record<ViewMode, number> = {
  pose: 60,
  single: 96,
};

// Standard humanoid bone taxonomy
export type StandardBoneName =
  | 'Hips'
  | 'Spine'
  | 'Chest'
  | 'Neck'
  | 'Head'
  | 'LeftShoulder'
  | 'LeftArm'
  | 'LeftForeArm'
  | 'LeftHand'
  | 'RightShoulder'
  | 'RightArm'
  | 'RightForeArm'
  | 'RightHand'
  | 'LeftUpLeg'
  | 'LeftLeg'
  | 'LeftFoot'
  | 'RightUpLeg'
  | 'RightLeg'
  | 'RightFoot';

export interface EulerRotationDeg {
  x: number;
  y: number;
  z: number;
}

export type PoseBoneRotations = Partial<Record<StandardBoneName, EulerRotationDeg>>;

export interface ModelBoneInfo {
  name: string;
  standardName?: StandardBoneName;
  parentName?: string;
}

export interface ModelSkeletonInfo {
  hasSkeleton: boolean;
  boneCount: number;
  meshCount: number;
  skinnedMeshCount: number;
  formatName: string;
  modelName: string;
  mappedBonesCount: number;
  bones: ModelBoneInfo[];
  warningMessage?: string;
}

export type GizmoVisibilityMode = 'selected' | 'all' | 'none' | 'custom';
