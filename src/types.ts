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
