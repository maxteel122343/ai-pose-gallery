import * as THREE from 'three';
import { ModelSkeletonInfo, StandardBoneName } from '../types';

// Patterns to match standard bone names
const BONE_PATTERNS: Record<StandardBoneName, RegExp[]> = {
  Hips: [
    /hips/i,
    /pelvis/i,
    /root/i,
    /cog/i,
    /waist/i,
    /center/i,
    /hip$/i,
  ],
  Spine: [
    /spine$/i,
    /spine_01/i,
    /spine1/i,
    /lower_spine/i,
    /torso/i,
    /abdominal/i,
  ],
  Chest: [
    /chest/i,
    /spine2/i,
    /spine3/i,
    /spine_02/i,
    /upper_spine/i,
    /thorax/i,
  ],
  Neck: [
    /neck/i,
    /cervical/i,
  ],
  Head: [
    /head/i,
    /skull/i,
  ],
  LeftShoulder: [
    /(left|l)[\W_]*(shoulder|clavicle|collar)/i,
    /(shoulder|clavicle|collar)[\W_]*(left|l)/i,
  ],
  LeftArm: [
    /(left|l)[\W_]*(arm|upperarm|upper_arm|bicep)/i,
    /(arm|upperarm|upper_arm|bicep)[\W_]*(left|l)/i,
  ],
  LeftForeArm: [
    /(left|l)[\W_]*(forearm|lowerarm|lower_arm|elbow)/i,
    /(forearm|lowerarm|lower_arm|elbow)[\W_]*(left|l)/i,
  ],
  LeftHand: [
    /(left|l)[\W_]*(hand|wrist|palm)/i,
    /(hand|wrist|palm)[\W_]*(left|l)/i,
  ],
  RightShoulder: [
    /(right|r)[\W_]*(shoulder|clavicle|collar)/i,
    /(shoulder|clavicle|collar)[\W_]*(right|r)/i,
  ],
  RightArm: [
    /(right|r)[\W_]*(arm|upperarm|upper_arm|bicep)/i,
    /(arm|upperarm|upper_arm|bicep)[\W_]*(right|r)/i,
  ],
  RightForeArm: [
    /(right|r)[\W_]*(forearm|lowerarm|lower_arm|elbow)/i,
    /(forearm|lowerarm|lower_arm|elbow)[\W_]*(right|r)/i,
  ],
  RightHand: [
    /(right|r)[\W_]*(hand|wrist|palm)/i,
    /(hand|wrist|palm)[\W_]*(right|r)/i,
  ],
  LeftUpLeg: [
    /(left|l)[\W_]*(upleg|upperleg|upper_leg|thigh)/i,
    /(upleg|upperleg|upper_leg|thigh)[\W_]*(left|l)/i,
  ],
  LeftLeg: [
    /(left|l)[\W_]*(leg|lowerleg|lower_leg|calf|shin|knee)/i,
    /(leg|lowerleg|lower_leg|calf|shin|knee)[\W_]*(left|l)/i,
  ],
  LeftFoot: [
    /(left|l)[\W_]*(foot|ankle|toe)/i,
    /(foot|ankle|toe)[\W_]*(left|l)/i,
  ],
  RightUpLeg: [
    /(right|r)[\W_]*(upleg|upperleg|upper_leg|thigh)/i,
    /(upleg|upperleg|upper_leg|thigh)[\W_]*(right|r)/i,
  ],
  RightLeg: [
    /(right|r)[\W_]*(leg|lowerleg|lower_leg|calf|shin|knee)/i,
    /(leg|lowerleg|lower_leg|calf|shin|knee)[\W_]*(right|r)/i,
  ],
  RightFoot: [
    /(right|r)[\W_]*(foot|ankle|toe)/i,
    /(foot|ankle|toe)[\W_]*(right|r)/i,
  ],
};

// Portuguese friendly labels for UI
export const BONE_LABELS: Record<StandardBoneName, string> = {
  Hips: 'Quadril / Pelve (Hips)',
  Spine: 'Coluna Inferior (Spine)',
  Chest: 'Peito / Tórax (Chest)',
  Neck: 'Pescoço (Neck)',
  Head: 'Cabeça (Head)',
  LeftShoulder: 'Ombro Esquerdo (L Shoulder)',
  LeftArm: 'Braço Esquerdo (L Arm)',
  LeftForeArm: 'Antebraço Esquerdo (L Forearm)',
  LeftHand: 'Mão Esquerda (L Hand)',
  RightShoulder: 'Ombro Direito (R Shoulder)',
  RightArm: 'Braço Direito (R Arm)',
  RightForeArm: 'Antebraço Direito (R Forearm)',
  RightHand: 'Mão Direita (R Hand)',
  LeftUpLeg: 'Coxa Esquerda (L Thigh)',
  LeftLeg: 'Canela / Joelho Esq (L Shin)',
  LeftFoot: 'Pé Esquerdo (L Foot)',
  RightUpLeg: 'Coxa Direita (R Thigh)',
  RightLeg: 'Canela / Joelho Dir (R Shin)',
  RightFoot: 'Pé Direito (R Foot)',
};

/**
 * Identify standard bone name from raw bone name
 */
export function matchStandardBone(name: string): StandardBoneName | undefined {
  const clean = name.replace(/mixamorig/i, '').trim();

  // Direct exact match
  if (clean in BONE_PATTERNS) {
    return clean as StandardBoneName;
  }

  // Pattern testing
  for (const [standardName, patterns] of Object.entries(BONE_PATTERNS) as [
    StandardBoneName,
    RegExp[]
  ][]) {
    for (const pattern of patterns) {
      if (pattern.test(name)) {
        return standardName;
      }
    }
  }

  return undefined;
}

export interface SkeletonRig {
  root: THREE.Object3D;
  allBones: THREE.Bone[];
  standardBones: Map<StandardBoneName, THREE.Bone>;
  boneToStandard: Map<THREE.Bone, StandardBoneName>;
  restRotations: Map<THREE.Bone, THREE.Euler>;
  restPositions: Map<THREE.Bone, THREE.Vector3>;
  info: ModelSkeletonInfo;
}

/**
 * Inspect model and construct a unified SkeletonRig
 */
export function extractSkeletonRig(root: THREE.Object3D, modelName = 'Modelo 3D'): SkeletonRig {
  const allBones: THREE.Bone[] = [];
  const standardBones = new Map<StandardBoneName, THREE.Bone>();
  const boneToStandard = new Map<THREE.Bone, StandardBoneName>();
  const restRotations = new Map<THREE.Bone, THREE.Euler>();
  const restPositions = new Map<THREE.Bone, THREE.Vector3>();

  let meshCount = 0;
  let skinnedMeshCount = 0;

  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      meshCount++;
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        skinnedMeshCount++;
        const skinned = child as THREE.SkinnedMesh;
        if (skinned.skeleton && skinned.skeleton.bones) {
          for (const bone of skinned.skeleton.bones) {
            if (!allBones.includes(bone)) {
              allBones.push(bone);
            }
          }
        }
      }
    } else if ((child as THREE.Bone).isBone) {
      const bone = child as THREE.Bone;
      if (!allBones.includes(bone)) {
        allBones.push(bone);
      }
    }
  });

  // Map bones to standard taxonomy and store rest pose
  for (const bone of allBones) {
    restRotations.set(bone, bone.rotation.clone());
    restPositions.set(bone, bone.position.clone());
  }

  // Group candidate bones by standard name
  const candidates = new Map<StandardBoneName, THREE.Bone[]>();
  for (const bone of allBones) {
    const std = matchStandardBone(bone.name);
    if (std) {
      if (!candidates.has(std)) {
        candidates.set(std, []);
      }
      candidates.get(std)!.push(bone);
    }
  }

  // For each standard bone name, select the structural bone that has children
  // (Mixamo FBX exports duplicate leaf dummy bones with 0 children which don't propagate rotations)
  for (const [std, boneList] of candidates.entries()) {
    let bestBone = boneList[0];
    for (const b of boneList) {
      const hasBoneChildren = b.children.some((c) => (c as THREE.Bone).isBone);
      if (hasBoneChildren) {
        bestBone = b;
        break;
      }
      if (b.children.length > bestBone.children.length) {
        bestBone = b;
      }
    }
    standardBones.set(std, bestBone);
    boneToStandard.set(bestBone, std);
  }

  const hasSkeleton = allBones.length > 0;
  let formatName = 'Desconhecido';
  if (allBones.some((b) => /mixamo/i.test(b.name))) {
    formatName = 'Mixamo Humanoid';
  } else if (allBones.some((b) => /def-/i.test(b.name))) {
    formatName = 'Blender Rigify';
  } else if (allBones.some((b) => /bip01/i.test(b.name))) {
    formatName = '3ds Max Biped';
  } else if (hasSkeleton) {
    formatName = 'Esqueleto Padrão';
  }

  const info: ModelSkeletonInfo = {
    hasSkeleton,
    boneCount: allBones.length,
    meshCount,
    skinnedMeshCount,
    formatName,
    modelName,
    mappedBonesCount: standardBones.size,
    bones: allBones.map((b) => ({
      name: b.name,
      standardName: boneToStandard.get(b),
      parentName: b.parent?.name,
    })),
    warningMessage: hasSkeleton
      ? undefined
      : 'Aviso: Este modelo não possui esqueleto (bones/armature). Para aplicar poses automáticas e editar articulações, carregue um arquivo .GLB com rig.',
  };

  return {
    root,
    allBones,
    standardBones,
    boneToStandard,
    restRotations,
    restPositions,
    info,
  };
}

/**
 * Reset all bones to their initial rest pose
 */
export function resetRigToRestPose(rig: SkeletonRig): void {
  for (const bone of rig.allBones) {
    const restRot = rig.restRotations.get(bone);
    if (restRot) {
      bone.rotation.copy(restRot);
    }
    const restPos = rig.restPositions.get(bone);
    if (restPos) {
      bone.position.copy(restPos);
    }
  }
}
