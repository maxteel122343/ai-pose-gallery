import * as THREE from 'three';
import { PoseItem, StandardBoneName, PoseBoneRotations, EulerRotationDeg } from '../types';
import { SkeletonRig } from './boneMapping';
import { POSE_PRESETS } from './poseCatalog';

interface Detected2DFeatures {
  headCenter: { x: number; y: number };
  headTiltDeg: number;
  spineLeanDeg: number;
  spineArchDeg: number;
  leftArmAngleDeg: number;
  leftElbowAngleDeg: number;
  rightArmAngleDeg: number;
  rightElbowAngleDeg: number;
  leftLegAngleDeg: number;
  leftKneeAngleDeg: number;
  rightLegAngleDeg: number;
  rightKneeAngleDeg: number;
  hipHeightNorm: number; // 0 (top) to 1 (bottom)
  isSeatedOrSquatting: boolean;
}

/**
 * Analyzes the 2D pose image canvas to detect figure contours, limbs and angles.
 */
export async function analyzePoseImage(imageUrl: string): Promise<Detected2DFeatures | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const width = 120;
        const height = 160;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Collect foreground (dark mannequin line pixels)
        let minX = width;
        let maxX = 0;
        let minY = height;
        let maxY = 0;
        const fgPixels: { x: number; y: number }[] = [];

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            // Threshold for mannequin dark pixels (line drawings on light background)
            const brightness = (r + g + b) / 3;
            if (brightness < 210) {
              fgPixels.push({ x, y });
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (fgPixels.length < 50) {
          resolve(null);
          return;
        }

        const figHeight = Math.max(1, maxY - minY);
        const figWidth = Math.max(1, maxX - minX);

        // Find head region (top 20% of figure)
        const headPixels = fgPixels.filter((p) => p.y <= minY + figHeight * 0.22);
        let headCenterX = (minX + maxX) / 2;
        let headCenterY = minY + figHeight * 0.1;
        if (headPixels.length > 0) {
          headCenterX = headPixels.reduce((sum, p) => sum + p.x, 0) / headPixels.length;
          headCenterY = headPixels.reduce((sum, p) => sum + p.y, 0) / headPixels.length;
        }

        // Mid torso / hip region (45% - 65% of figure)
        const hipPixels = fgPixels.filter(
          (p) => p.y >= minY + figHeight * 0.45 && p.y <= minY + figHeight * 0.65
        );
        let hipCenterX = (minX + maxX) / 2;
        let hipCenterY = minY + figHeight * 0.55;
        if (hipPixels.length > 0) {
          hipCenterX = hipPixels.reduce((sum, p) => sum + p.x, 0) / hipPixels.length;
          hipCenterY = hipPixels.reduce((sum, p) => sum + p.y, 0) / hipPixels.length;
        }

        // Spine angle
        const dx = headCenterX - hipCenterX;
        const dy = hipCenterY - headCenterY;
        const spineLeanDeg = Math.max(-35, Math.min(35, (Math.atan2(dx, dy) * 180) / Math.PI));

        // Lateral span of arms (shoulders/arms region: 20% - 50%)
        const armPixels = fgPixels.filter(
          (p) => p.y >= minY + figHeight * 0.2 && p.y <= minY + figHeight * 0.55
        );
        let leftExtent = 0;
        let rightExtent = 0;
        armPixels.forEach((p) => {
          if (p.x > hipCenterX) leftExtent = Math.max(leftExtent, p.x - hipCenterX);
          else rightExtent = Math.max(rightExtent, hipCenterX - p.x);
        });

        // Aspect ratio of the figure silhouette determines seated vs standing
        const isSeatedOrSquatting = figHeight / figWidth < 1.35;

        resolve({
          headCenter: { x: headCenterX / width, y: headCenterY / height },
          headTiltDeg: spineLeanDeg * 0.5,
          spineLeanDeg,
          spineArchDeg: isSeatedOrSquatting ? 15 : 5,
          leftArmAngleDeg: Math.min(90, Math.round((leftExtent / (figWidth * 0.5)) * 60)),
          leftElbowAngleDeg: 25,
          rightArmAngleDeg: Math.min(90, Math.round((rightExtent / (figWidth * 0.5)) * 60)),
          rightElbowAngleDeg: 25,
          leftLegAngleDeg: isSeatedOrSquatting ? 80 : 8,
          leftKneeAngleDeg: isSeatedOrSquatting ? 90 : 8,
          rightLegAngleDeg: isSeatedOrSquatting ? 80 : 8,
          rightKneeAngleDeg: isSeatedOrSquatting ? 90 : 8,
          hipHeightNorm: hipCenterY / height,
          isSeatedOrSquatting,
        });
      } catch (err) {
        console.warn('Image analysis fallback', err);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}

/**
 * Returns the hip height scaling factor (e.g. 1.0 for standing, 0.45 for seated, 0.2 for lying)
 */
export function getPoseHeightFactor(item: PoseItem): number {
  const num = (item.number || '').toUpperCase().trim();
  if (POSE_PRESETS[num] && POSE_PRESETS[num].hipHeightFactor !== undefined) {
    return POSE_PRESETS[num].hipHeightFactor!;
  }
  const category = (item.category || '').toLowerCase();
  if (category.includes('sitting') || category.includes('seated')) return 0.45;
  if (category.includes('squat')) return 0.52;
  if (category.includes('kneel') || category.includes('seiza')) return 0.55;
  if (category.includes('lying') || category.includes('prone') || category.includes('supine')) return 0.20;
  return 1.0;
}

/**
 * Computes semantic target Euler angles (in degrees) for standard bones
 * calibrated specifically for humanoid / Mixamo rigs.
 */
export function computeTargetPoseRotations(
  item: PoseItem,
  visionFeatures?: Detected2DFeatures | null
): PoseBoneRotations {
  const num = (item.number || '').toUpperCase().trim();

  // 1. Check exact calibrated pose preset (P001 to P080)
  if (POSE_PRESETS[num]) {
    const preset = POSE_PRESETS[num];
    // Deep clone rotations so we can adjust safely
    const rot: PoseBoneRotations = {};
    for (const [boneKey, angles] of Object.entries(preset.rotations)) {
      rot[boneKey as StandardBoneName] = { ...angles };
    }

    // Blend minor vision features if present
    if (visionFeatures && visionFeatures.spineLeanDeg) {
      const lean = visionFeatures.spineLeanDeg * 0.15;
      if (rot.Spine) rot.Spine.z = (rot.Spine.z || 0) - lean;
      if (rot.Chest) rot.Chest.z = (rot.Chest.z || 0) - lean;
    }

    return rot;
  }

  // 2. Semantic fallback for custom or unlisted poses
  const rot: PoseBoneRotations = {};
  const name = (item.name || '').toLowerCase();
  const category = (item.category || '').toLowerCase();

  const isSitting = category.includes('sitting') || category.includes('seated');
  const isSquatting = category.includes('squat');
  const isLying = category.includes('lying') || category.includes('prone');
  const isKneeling = category.includes('kneel') || category.includes('seiza');
  const isArching = category.includes('arch') || name.includes('arch');
  const isTwisting = category.includes('twist') || name.includes('twist');

  const archDeg = isArching ? -20 : isSitting ? 10 : 0;
  const twistDeg = isTwisting ? 20 : 0;
  const leanDeg = visionFeatures ? visionFeatures.spineLeanDeg : 0;

  rot.Hips = { x: isLying ? 80 : 0, y: 0, z: leanDeg * 0.25 };
  rot.Spine = { x: archDeg * 0.5, y: twistDeg * 0.4, z: -leanDeg * 0.15 };
  rot.Chest = { x: archDeg * 0.5, y: twistDeg * 0.6, z: -leanDeg * 0.2 };
  rot.Neck = { x: isArching ? -12 : 0, y: twistDeg * 0.4, z: 0 };
  rot.Head = { x: isArching ? -10 : 4, y: twistDeg * 0.4, z: 0 };

  if (isSitting) {
    rot.Hips = { x: -10, y: 0, z: 0 };
    rot.LeftUpLeg = { x: -80, y: 15, z: 20 };
    rot.LeftLeg = { x: 85, y: 0, z: 0 };
    rot.RightUpLeg = { x: -80, y: -15, z: -20 };
    rot.RightLeg = { x: 85, y: 0, z: 0 };
  } else if (isSquatting) {
    rot.Hips = { x: 15, y: 0, z: 0 };
    rot.LeftUpLeg = { x: -95, y: 25, z: 28 };
    rot.LeftLeg = { x: 110, y: 0, z: 0 };
    rot.RightUpLeg = { x: -95, y: -25, z: -28 };
    rot.RightLeg = { x: 110, y: 0, z: 0 };
  } else if (isKneeling) {
    rot.LeftUpLeg = { x: -10, y: 5, z: 0 };
    rot.LeftLeg = { x: 115, y: 0, z: 0 };
    rot.RightUpLeg = { x: -10, y: -5, z: 0 };
    rot.RightLeg = { x: 115, y: 0, z: 0 };
  } else if (isLying) {
    rot.LeftUpLeg = { x: 12, y: 10, z: 8 };
    rot.LeftLeg = { x: 25, y: 0, z: 0 };
    rot.RightUpLeg = { x: 8, y: -10, z: -8 };
    rot.RightLeg = { x: 35, y: 0, z: 0 };
  } else {
    rot.LeftUpLeg = { x: 0, y: 4, z: 3 };
    rot.LeftLeg = { x: 3, y: 0, z: 0 };
    rot.RightUpLeg = { x: 0, y: -4, z: -3 };
    rot.RightLeg = { x: 3, y: 0, z: 0 };
  }

  // Arms fallback
  rot.LeftArm = { x: 70, y: -10, z: 12 };
  rot.LeftForeArm = { x: 10, y: 0, z: 15 };
  rot.RightArm = { x: 70, y: 10, z: -12 };
  rot.RightForeArm = { x: 10, y: 0, z: -15 };

  return rot;
}

/**
 * Applies retargeted bone rotations and optional hip height smoothly to a SkeletonRig
 */
export function applyPoseToRig(
  rig: SkeletonRig,
  targetRotations: PoseBoneRotations,
  onComplete?: () => void,
  hipHeightFactor?: number
): () => void {
  const bonesToAnimate: {
    bone: THREE.Bone;
    startQuat: THREE.Quaternion;
    targetQuat: THREE.Quaternion;
  }[] = [];

  for (const [boneName, rotDeg] of Object.entries(targetRotations) as [
    StandardBoneName,
    EulerRotationDeg
  ][]) {
    const bone = rig.standardBones.get(boneName);
    if (!bone) continue;

    const startQuat = bone.quaternion.clone();

    // Compute target rotation in local space relative to rest rotation
    const restRot = rig.restRotations.get(bone) || new THREE.Euler(0, 0, 0);
    const targetEuler = new THREE.Euler(
      restRot.x + THREE.MathUtils.degToRad(rotDeg.x),
      restRot.y + THREE.MathUtils.degToRad(rotDeg.y),
      restRot.z + THREE.MathUtils.degToRad(rotDeg.z),
      'XYZ'
    );
    const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler);

    bonesToAnimate.push({ bone, startQuat, targetQuat });
  }

  // Hip vertical height animation
  const hipsBone = rig.standardBones.get('Hips');
  let hipsStartPos: THREE.Vector3 | null = null;
  let hipsTargetPos: THREE.Vector3 | null = null;

  if (hipsBone) {
    const restPos = rig.restPositions.get(hipsBone);
    if (restPos) {
      hipsStartPos = hipsBone.position.clone();
      const factor = hipHeightFactor !== undefined ? hipHeightFactor : 1.0;
      hipsTargetPos = new THREE.Vector3(restPos.x, restPos.y * factor, restPos.z);
    }
  }

  // Animate over 350ms
  let startTime: number | null = null;
  const duration = 350;
  let animId: number;

  const tick = (time: number) => {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;
    const progress = Math.min(1, elapsed / duration);
    // Smooth ease-out cubic
    const t = 1 - Math.pow(1 - progress, 3);

    for (const item of bonesToAnimate) {
      item.bone.quaternion.copy(item.startQuat).slerp(item.targetQuat, t);
    }

    if (hipsBone && hipsStartPos && hipsTargetPos) {
      hipsBone.position.lerpVectors(hipsStartPos, hipsTargetPos, t);
    }

    if (progress < 1) {
      animId = requestAnimationFrame(tick);
    } else {
      if (onComplete) onComplete();
    }
  };

  animId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(animId);
  };
}
