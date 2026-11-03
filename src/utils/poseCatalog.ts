import { PoseBoneRotations } from '../types';

export interface PosePresetDefinition {
  rotations: PoseBoneRotations;
  hipHeightFactor?: number;
}

/**
 * Meticulously calibrated anatomical joint rotation presets for all 80 reference poses (P001 to P080).
 * Calibrated for humanoid armatures (Mixamo and procedural humanoid mannequin).
 * 
 * Mixamo local rotation axes:
 * - Hips: Pitch forward (+x: leaning forward/wall push), Yaw (+y), Roll (+z: hip pop)
 * - Spine/Chest: Back arch (-x: chest out/arched back; +x: hunched forward)
 * - Neck/Head: Pitch (-x: head back/looking up; +x: chin down), Yaw (+y: looking back), Roll (+z: tilt to shoulder)
 * - LeftArm: Lower/raise (+x: lower arm to side; -x: raise arm up; -90: overhead), Swing (+z: forward; -z: backward)
 * - RightArm: Lower/raise (+x: lower arm to side; -x: raise arm up; -90: overhead), Swing (-z: forward; +z: backward)
 * - LeftForeArm: Elbow flexion (+z: 0 to 130 deg flexes inward)
 * - RightForeArm: Elbow flexion (-z: 0 to -130 deg flexes inward)
 * - LeftUpLeg: Pitch (-x: raise thigh forward/up to chest; +x: kick back), Abduction (+z: side split/spread)
 * - RightUpLeg: Pitch (-x: raise thigh forward/up to chest; +x: kick back), Abduction (-z: side split/spread)
 * - LeftLeg / RightLeg: Knee flexion (+x: 0 to 135 deg bends knee back)
 * - LeftFoot / RightFoot: Pointed toe (+x: 25 to 40 deg)
 */
export const POSE_PRESETS: Record<string, PosePresetDefinition> = {
  // P001: S-curve stand, hip pushed out
  P001: {
    rotations: {
      Hips: { x: 0, y: 0, z: 12 },
      Spine: { x: 0, y: 0, z: -8 },
      Chest: { x: 0, y: 0, z: -6 },
      Neck: { x: 0, y: 0, z: 6 },
      Head: { x: 5, y: 0, z: 8 },
      LeftArm: { x: -42, y: -20, z: 23 },
      LeftForeArm: { x: 15, y: 0, z: 125 },
      LeftHand: { x: 10, y: 0, z: 25 },
      RightArm: { x: 70, y: -20, z: 27 },
      RightForeArm: { x: -25, y: 0, z: -85 },
      RightHand: { x: 15, y: 0, z: -20 },
      LeftUpLeg: { x: -5, y: 6, z: 4 },
      LeftLeg: { x: 6, y: 0, z: 0 },
      RightUpLeg: { x: -12, y: -8, z: -14 },
      RightLeg: { x: 24, y: 0, z: 0 },
    },
  },

  // P002: Back arched, sweeping hair up
  P002: {
    rotations: {
      Hips: { x: -6, y: 0, z: 2 },
      Spine: { x: -16, y: 0, z: 0 },
      Chest: { x: -18, y: 0, z: 0 },
      Neck: { x: -15, y: 0, z: 0 },
      Head: { x: -15, y: 0, z: 0 },
      LeftArm: { x: -45, y: -18, z: 25 },
      LeftForeArm: { x: 15, y: 0, z: 125 },
      LeftHand: { x: 10, y: 0, z: 25 },
      RightArm: { x: -45, y: 18, z: -25 },
      RightForeArm: { x: 15, y: 0, z: -125 },
      RightHand: { x: 10, y: 0, z: -25 },
      LeftUpLeg: { x: -2, y: 4, z: 2 },
      LeftLeg: { x: 4, y: 0, z: 0 },
      RightUpLeg: { x: -10, y: -6, z: -10 },
      RightLeg: { x: 20, y: 0, z: 0 },
    },
  },

  // P003: Hip out, looking back
  P003: {
    rotations: {
      Hips: { x: 0, y: 45, z: 14 },
      Spine: { x: -4, y: 35, z: -6 },
      Chest: { x: -6, y: 35, z: -4 },
      Neck: { x: 0, y: 38, z: 0 },
      Head: { x: 0, y: 35, z: 0 },
      LeftArm: { x: 72, y: -10, z: 10 },
      LeftForeArm: { x: 10, y: 0, z: 15 },
      RightArm: { x: 65, y: -15, z: -25 },
      RightForeArm: { x: -20, y: 0, z: -80 },
      RightHand: { x: 10, y: 0, z: -15 },
      LeftUpLeg: { x: -4, y: 4, z: 4 },
      LeftLeg: { x: 5, y: 0, z: 0 },
      RightUpLeg: { x: -12, y: -6, z: -12 },
      RightLeg: { x: 20, y: 0, z: 0 },
    },
  },

  // P004: Leaning forward, hands on knees
  P004: {
    hipHeightFactor: 0.92,
    rotations: {
      Hips: { x: 48, y: 0, z: 0 },
      Spine: { x: -10, y: 0, z: 0 },
      Chest: { x: -10, y: 0, z: 0 },
      Neck: { x: -22, y: 0, z: 0 },
      Head: { x: -18, y: 0, z: 0 },
      LeftUpLeg: { x: -42, y: 6, z: 8 },
      LeftLeg: { x: 38, y: 0, z: 0 },
      LeftFoot: { x: -8, y: 0, z: 0 },
      RightUpLeg: { x: -42, y: -6, z: -8 },
      RightLeg: { x: 38, y: 0, z: 0 },
      RightFoot: { x: -8, y: 0, z: 0 },
      LeftArm: { x: 55, y: -10, z: 32 },
      LeftForeArm: { x: 15, y: 0, z: 30 },
      LeftHand: { x: 15, y: 0, z: 0 },
      RightArm: { x: 55, y: 10, z: -32 },
      RightForeArm: { x: 15, y: 0, z: -30 },
      RightHand: { x: 15, y: 0, z: 0 },
    },
  },

  // P005: Standing, knee hugged to chest, back arched
  P005: {
    hipHeightFactor: 0.98,
    rotations: {
      Hips: { x: -5, y: 0, z: 2 },
      Spine: { x: -16, y: 0, z: 0 },
      Chest: { x: -18, y: 0, z: 0 },
      Neck: { x: -15, y: 0, z: 0 },
      Head: { x: -18, y: 0, z: 0 },
      // Right leg firmly standing
      RightUpLeg: { x: -2, y: -4, z: -3 },
      RightLeg: { x: 4, y: 0, z: 0 },
      RightFoot: { x: -2, y: 0, z: 0 },
      // Left leg lifted high against chest!
      LeftUpLeg: { x: -115, y: 15, z: 12 },
      LeftLeg: { x: 130, y: 0, z: 0 },
      LeftFoot: { x: 35, y: 0, z: 0 },
      // Arms wrapping and hugging the lifted knee
      LeftArm: { x: 48, y: -25, z: 42 },
      LeftForeArm: { x: 20, y: 0, z: 95 },
      LeftHand: { x: 20, y: 0, z: 25 },
      RightArm: { x: 48, y: 25, z: -42 },
      RightForeArm: { x: 20, y: 0, z: -95 },
      RightHand: { x: 20, y: 0, z: -25 },
    },
  },

  // P006: Hands on wall, hips pushed out
  P006: {
    hipHeightFactor: 0.92,
    rotations: {
      Hips: { x: 62, y: 0, z: 0 },
      Spine: { x: -12, y: 0, z: 0 },
      Chest: { x: -10, y: 0, z: 0 },
      Neck: { x: -25, y: 0, z: 0 },
      Head: { x: -20, y: 0, z: 0 },
      LeftUpLeg: { x: -56, y: 4, z: 8 },
      LeftLeg: { x: 8, y: 0, z: 0 },
      LeftFoot: { x: -14, y: 0, z: 0 },
      RightUpLeg: { x: -56, y: -4, z: -8 },
      RightLeg: { x: 8, y: 0, z: 0 },
      RightFoot: { x: -14, y: 0, z: 0 },
      LeftArm: { x: 10, y: -10, z: 78 },
      LeftForeArm: { x: 0, y: 0, z: 12 },
      LeftHand: { x: -75, y: 0, z: 0 },
      RightArm: { x: 10, y: 10, z: -78 },
      RightForeArm: { x: 0, y: 0, z: -12 },
      RightHand: { x: -75, y: 0, z: 0 },
    },
  },

  // P007: Back turned, looking back, hips emphasized
  P007: {
    rotations: {
      Hips: { x: 0, y: 145, z: 12 },
      Spine: { x: -4, y: 20, z: -6 },
      Chest: { x: -6, y: 20, z: -4 },
      Neck: { x: 0, y: 35, z: 0 },
      Head: { x: 2, y: 30, z: 0 },
      LeftArm: { x: 72, y: -10, z: 12 },
      LeftForeArm: { x: 10, y: 0, z: 15 },
      RightArm: { x: 65, y: -15, z: -25 },
      RightForeArm: { x: -20, y: 0, z: -80 },
      RightHand: { x: 10, y: 0, z: -15 },
      LeftUpLeg: { x: -4, y: 4, z: 4 },
      LeftLeg: { x: 5, y: 0, z: 0 },
      RightUpLeg: { x: -12, y: -6, z: -12 },
      RightLeg: { x: 20, y: 0, z: 0 },
    },
  },

  // P008: Standing, leg raised to shoulder, holding ankle (I-balance)
  P008: {
    hipHeightFactor: 0.98,
    rotations: {
      Hips: { x: 0, y: 0, z: -12 },
      Spine: { x: 0, y: 0, z: 8 },
      Chest: { x: 0, y: 0, z: 8 },
      Head: { x: 2, y: 0, z: 4 },
      RightUpLeg: { x: -2, y: -4, z: -4 },
      RightLeg: { x: 4, y: 0, z: 0 },
      // Left leg lifted straight up in I-balance
      LeftUpLeg: { x: -142, y: 18, z: 38 },
      LeftLeg: { x: 8, y: 0, z: 0 },
      LeftFoot: { x: 35, y: 0, z: 0 },
      // Left hand holds the raised ankle
      LeftArm: { x: -65, y: -20, z: 42 },
      LeftForeArm: { x: 15, y: 0, z: 75 },
      LeftHand: { x: 10, y: 0, z: 20 },
      RightArm: { x: 70, y: 10, z: -12 },
      RightForeArm: { x: 10, y: 0, z: -15 },
    },
  },

  // P009: Sweeping hair back, shower-like
  P009: {
    rotations: {
      Hips: { x: -5, y: 0, z: 0 },
      Spine: { x: -15, y: 0, z: 0 },
      Chest: { x: -16, y: 0, z: 0 },
      Neck: { x: -12, y: 0, z: 0 },
      Head: { x: -14, y: 0, z: 0 },
      LeftArm: { x: -48, y: -20, z: 22 },
      LeftForeArm: { x: 15, y: 0, z: 120 },
      LeftHand: { x: 10, y: 0, z: 20 },
      RightArm: { x: -48, y: 20, z: -22 },
      RightForeArm: { x: 15, y: 0, z: -120 },
      RightHand: { x: 10, y: 0, z: -20 },
      LeftUpLeg: { x: -2, y: 4, z: 3 },
      LeftLeg: { x: 5, y: 0, z: 0 },
      RightUpLeg: { x: -2, y: -4, z: -3 },
      RightLeg: { x: 5, y: 0, z: 0 },
    },
  },

  // P010: Standing, chest squeezed (timid / modesty)
  P010: {
    rotations: {
      Hips: { x: 2, y: 0, z: 4 },
      Spine: { x: 6, y: -4, z: -3 },
      Chest: { x: 8, y: -4, z: -4 },
      Neck: { x: 6, y: 8, z: -14 },
      Head: { x: 8, y: 10, z: -16 },
      LeftArm: { x: 74, y: 18, z: 16 },
      LeftForeArm: { x: 30, y: 10, z: 35 },
      LeftHand: { x: 15, y: 10, z: 20 },
      RightArm: { x: 74, y: -18, z: -16 },
      RightForeArm: { x: 30, y: -10, z: -35 },
      RightHand: { x: 15, y: -10, z: -20 },
      LeftUpLeg: { x: -2, y: -8, z: -4 },
      LeftLeg: { x: 8, y: 0, z: 2 },
      LeftFoot: { x: 2, y: 12, z: 0 },
      RightUpLeg: { x: -2, y: 8, z: 4 },
      RightLeg: { x: 8, y: 0, z: -2 },
      RightFoot: { x: 2, y: -12, z: 0 },
    },
  },

  // P011: Arms stretched up, waist twisted
  P011: {
    rotations: {
      Hips: { x: -4, y: 15, z: 4 },
      Spine: { x: -10, y: 20, z: 0 },
      Chest: { x: -12, y: 22, z: 0 },
      Neck: { x: -10, y: 10, z: 0 },
      Head: { x: -10, y: 10, z: 0 },
      LeftArm: { x: -95, y: -10, z: 15 },
      LeftForeArm: { x: 5, y: 0, z: 10 },
      RightArm: { x: -95, y: 10, z: -15 },
      RightForeArm: { x: 5, y: 0, z: -10 },
      LeftUpLeg: { x: -2, y: 4, z: 3 },
      LeftLeg: { x: 4, y: 0, z: 0 },
      RightUpLeg: { x: -8, y: -6, z: -8 },
      RightLeg: { x: 14, y: 0, z: 0 },
    },
  },

  // P012: Standing V (one leg high to side)
  P012: {
    hipHeightFactor: 0.97,
    rotations: {
      Hips: { x: 0, y: 0, z: -15 },
      Spine: { x: 0, y: 0, z: 12 },
      Chest: { x: 0, y: 0, z: 10 },
      Neck: { x: 0, y: 5, z: 5 },
      Head: { x: 0, y: 5, z: 5 },
      RightUpLeg: { x: -2, y: -4, z: -6 },
      RightLeg: { x: 4, y: 0, z: 0 },
      RightFoot: { x: -2, y: 0, z: 0 },
      // High side split (abduction)
      LeftUpLeg: { x: -25, y: 25, z: 88 },
      LeftLeg: { x: 8, y: 0, z: 0 },
      LeftFoot: { x: 35, y: 0, z: 0 },
      // Left hand on knee
      LeftArm: { x: 22, y: -15, z: 48 },
      LeftForeArm: { x: 12, y: 0, z: 38 },
      LeftHand: { x: 10, y: 0, z: 20 },
      // Right arm curved high overhead
      RightArm: { x: -75, y: 15, z: -32 },
      RightForeArm: { x: 18, y: 0, z: -78 },
      RightHand: { x: 12, y: 0, z: -25 },
    },
  },

  // P013: Hands behind, chest out
  P013: {
    rotations: {
      Hips: { x: -4, y: 0, z: 0 },
      Spine: { x: -14, y: 0, z: 0 },
      Chest: { x: -16, y: 0, z: 0 },
      LeftArm: { x: 50, y: 25, z: -35 },
      LeftForeArm: { x: -10, y: 0, z: 55 },
      RightArm: { x: 50, y: -25, z: 35 },
      RightForeArm: { x: -10, y: 0, z: -55 },
      LeftUpLeg: { x: 0, y: 4, z: 3 },
      LeftLeg: { x: 4, y: 0, z: 0 },
      RightUpLeg: { x: 0, y: -4, z: -3 },
      RightLeg: { x: 4, y: 0, z: 0 },
    },
  },

  // P014: Standing forward fold, hips out, hands to floor
  P014: {
    hipHeightFactor: 0.90,
    rotations: {
      Hips: { x: 82, y: 0, z: 0 },
      Spine: { x: 5, y: 0, z: 0 },
      Chest: { x: 5, y: 0, z: 0 },
      Neck: { x: 15, y: 0, z: 0 },
      Head: { x: 15, y: 0, z: 0 },
      LeftUpLeg: { x: -78, y: 4, z: 6 },
      LeftLeg: { x: 8, y: 0, z: 0 },
      LeftFoot: { x: -6, y: 0, z: 0 },
      RightUpLeg: { x: -78, y: -4, z: -6 },
      RightLeg: { x: 8, y: 0, z: 0 },
      RightFoot: { x: -6, y: 0, z: 0 },
      LeftArm: { x: 25, y: -10, z: 75 },
      LeftForeArm: { x: 5, y: 0, z: 10 },
      LeftHand: { x: -60, y: 0, z: 0 },
      RightArm: { x: 25, y: 10, z: -75 },
      RightForeArm: { x: 5, y: 0, z: -10 },
      RightHand: { x: -60, y: 0, z: 0 },
    },
  },

  // P015: Hands on hips, one knee in, arched
  P015: {
    rotations: {
      Hips: { x: -4, y: 0, z: 8 },
      Spine: { x: -12, y: 0, z: -5 },
      Chest: { x: -12, y: 0, z: -4 },
      LeftArm: { x: 70, y: 20, z: -27 },
      LeftForeArm: { x: -25, y: 0, z: 85 },
      LeftHand: { x: 15, y: 0, z: 20 },
      RightArm: { x: 70, y: -20, z: 27 },
      RightForeArm: { x: -25, y: 0, z: -85 },
      RightHand: { x: 15, y: 0, z: -20 },
      LeftUpLeg: { x: -2, y: 4, z: 3 },
      LeftLeg: { x: 4, y: 0, z: 0 },
      RightUpLeg: { x: -25, y: -12, z: -10 },
      RightLeg: { x: 45, y: 0, z: 0 },
      RightFoot: { x: 18, y: 0, z: 0 },
    },
  },

  // P016: Side sit on one hand, body curved
  P016: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: -12, y: 25, z: 15 },
      Spine: { x: 8, y: -10, z: -12 },
      Chest: { x: 8, y: -10, z: -10 },
      LeftArm: { x: 65, y: 0, z: 35 },
      LeftForeArm: { x: 10, y: 0, z: 20 },
      RightArm: { x: 45, y: 15, z: -25 },
      RightForeArm: { x: 20, y: 0, z: -75 },
      LeftUpLeg: { x: -75, y: 20, z: 20 },
      LeftLeg: { x: 90, y: 0, z: 0 },
      RightUpLeg: { x: -65, y: 10, z: 12 },
      RightLeg: { x: 85, y: 0, z: 0 },
    },
  },

  // P017: Kneeling seiza, chest out, back arched
  P017: {
    hipHeightFactor: 0.42,
    rotations: {
      Hips: { x: -8, y: 0, z: 0 },
      Spine: { x: -18, y: 0, z: 0 },
      Chest: { x: -20, y: 0, z: 0 },
      Neck: { x: -10, y: 0, z: 0 },
      Head: { x: -10, y: 0, z: 0 },
      LeftArm: { x: 65, y: -10, z: 15 },
      LeftForeArm: { x: 10, y: 0, z: 25 },
      RightArm: { x: 65, y: 10, z: -15 },
      RightForeArm: { x: 10, y: 0, z: -25 },
      LeftUpLeg: { x: -10, y: 5, z: 0 },
      LeftLeg: { x: 125, y: 0, z: 0 },
      LeftFoot: { x: 30, y: 0, z: 0 },
      RightUpLeg: { x: -10, y: -5, z: 0 },
      RightLeg: { x: 125, y: 0, z: 0 },
      RightFoot: { x: 30, y: 0, z: 0 },
    },
  },

  // P018: M-spread legs (seated, hands behind)
  P018: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: -15, y: 0, z: 0 },
      Spine: { x: -10, y: 0, z: 0 },
      Chest: { x: -10, y: 0, z: 0 },
      LeftArm: { x: 50, y: 20, z: -40 },
      LeftForeArm: { x: -5, y: 0, z: 30 },
      RightArm: { x: 50, y: -20, z: 40 },
      RightForeArm: { x: -5, y: 0, z: -30 },
      LeftUpLeg: { x: -75, y: 35, z: 38 },
      LeftLeg: { x: 95, y: 0, z: 0 },
      RightUpLeg: { x: -75, y: -35, z: -38 },
      RightLeg: { x: 95, y: 0, z: 0 },
    },
  },

  // P019: M-spread legs (seated, hands on knees)
  P019: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: 15, y: 0, z: 0 },
      Spine: { x: -5, y: 0, z: 0 },
      Chest: { x: -5, y: 0, z: 0 },
      LeftArm: { x: 55, y: -10, z: 35 },
      LeftForeArm: { x: 10, y: 0, z: 40 },
      RightArm: { x: 55, y: 10, z: -35 },
      RightForeArm: { x: 10, y: 0, z: -40 },
      LeftUpLeg: { x: -80, y: 35, z: 38 },
      LeftLeg: { x: 95, y: 0, z: 0 },
      RightUpLeg: { x: -80, y: -35, z: -38 },
      RightLeg: { x: 95, y: 0, z: 0 },
    },
  },

  // P020: Wide V-split, hands behind
  P020: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: -10, y: 0, z: 0 },
      Spine: { x: -12, y: 0, z: 0 },
      Chest: { x: -14, y: 0, z: 0 },
      LeftArm: { x: 50, y: 20, z: -40 },
      LeftForeArm: { x: -5, y: 0, z: 25 },
      RightArm: { x: 50, y: -20, z: 40 },
      RightForeArm: { x: -5, y: 0, z: -25 },
      LeftUpLeg: { x: -85, y: 20, z: 45 },
      LeftLeg: { x: 10, y: 0, z: 0 },
      LeftFoot: { x: 25, y: 0, z: 0 },
      RightUpLeg: { x: -85, y: -20, z: -45 },
      RightLeg: { x: 10, y: 0, z: 0 },
      RightFoot: { x: 25, y: 0, z: 0 },
    },
  },

  // P021: Seated, one leg extended high, holding ankle
  P021: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: -15, y: 0, z: -5 },
      Spine: { x: 0, y: 0, z: 5 },
      Chest: { x: 0, y: 0, z: 5 },
      RightUpLeg: { x: -80, y: -20, z: -25 },
      RightLeg: { x: 80, y: 0, z: 0 },
      LeftUpLeg: { x: -125, y: 15, z: 25 },
      LeftLeg: { x: 8, y: 0, z: 0 },
      LeftFoot: { x: 30, y: 0, z: 0 },
      LeftArm: { x: 20, y: -10, z: 45 },
      LeftForeArm: { x: 10, y: 0, z: 45 },
      RightArm: { x: 60, y: -10, z: -35 },
      RightForeArm: { x: 0, y: 0, z: -20 },
    },
  },

  // P022: M-spread legs (leaning back on both elbows)
  P022: {
    hipHeightFactor: 0.38,
    rotations: {
      Hips: { x: -35, y: 0, z: 0 },
      Spine: { x: -15, y: 0, z: 0 },
      Chest: { x: -15, y: 0, z: 0 },
      LeftArm: { x: 65, y: 15, z: -30 },
      LeftForeArm: { x: -15, y: 0, z: 90 },
      RightArm: { x: 65, y: -15, z: 30 },
      RightForeArm: { x: -15, y: 0, z: -90 },
      LeftUpLeg: { x: -65, y: 35, z: 38 },
      LeftLeg: { x: 95, y: 0, z: 0 },
      RightUpLeg: { x: -65, y: -35, z: -38 },
      RightLeg: { x: 95, y: 0, z: 0 },
    },
  },

  // P023: Seated, legs out, propped on side elbow
  P023: {
    hipHeightFactor: 0.38,
    rotations: {
      Hips: { x: -15, y: 35, z: 15 },
      Spine: { x: -10, y: -15, z: -15 },
      Chest: { x: -10, y: -15, z: -15 },
      LeftArm: { x: 65, y: 10, z: 15 },
      LeftForeArm: { x: -10, y: 0, z: 85 },
      RightArm: { x: 50, y: 0, z: -15 },
      RightForeArm: { x: 15, y: 0, z: -60 },
      LeftUpLeg: { x: -75, y: 15, z: 15 },
      LeftLeg: { x: 25, y: 0, z: 0 },
      RightUpLeg: { x: -70, y: 10, z: 10 },
      RightLeg: { x: 35, y: 0, z: 0 },
    },
  },

  // P024: Seated, holding legs open
  P024: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: 12, y: 0, z: 0 },
      LeftUpLeg: { x: -85, y: 35, z: 40 },
      LeftLeg: { x: 95, y: 0, z: 0 },
      RightUpLeg: { x: -85, y: -35, z: -40 },
      RightLeg: { x: 95, y: 0, z: 0 },
      LeftArm: { x: 50, y: -15, z: 42 },
      LeftForeArm: { x: 15, y: 0, z: 50 },
      RightArm: { x: 50, y: 15, z: -42 },
      RightForeArm: { x: 15, y: 0, z: -50 },
    },
  },

  // P025: Seated hugging one knee, back arched
  P025: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: -10, y: 0, z: 0 },
      Spine: { x: -14, y: 0, z: 0 },
      Chest: { x: -16, y: 0, z: 0 },
      RightUpLeg: { x: -75, y: -20, z: -20 },
      RightLeg: { x: 85, y: 0, z: 0 },
      LeftUpLeg: { x: -110, y: 10, z: 10 },
      LeftLeg: { x: 125, y: 0, z: 0 },
      LeftArm: { x: 45, y: -25, z: 45 },
      LeftForeArm: { x: 20, y: 0, z: 95 },
      RightArm: { x: 45, y: 25, z: -45 },
      RightForeArm: { x: 20, y: 0, z: -95 },
    },
  },

  // P026: Side sit, sweeping hair up
  P026: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: -10, y: 30, z: 12 },
      Spine: { x: -10, y: -15, z: -10 },
      Chest: { x: -12, y: -15, z: -10 },
      LeftArm: { x: -45, y: -20, z: 25 },
      LeftForeArm: { x: 15, y: 0, z: 125 },
      LeftHand: { x: 10, y: 0, z: 25 },
      RightArm: { x: 60, y: -15, z: -25 },
      RightForeArm: { x: 10, y: 0, z: -30 },
      LeftUpLeg: { x: -75, y: 25, z: 20 },
      LeftLeg: { x: 90, y: 0, z: 0 },
      RightUpLeg: { x: -65, y: 15, z: 12 },
      RightLeg: { x: 85, y: 0, z: 0 },
    },
  },

  // P027: W-sit, hands forward, chest squeezed
  P027: {
    hipHeightFactor: 0.38,
    rotations: {
      Hips: { x: 6, y: 0, z: 0 },
      Spine: { x: 4, y: 0, z: 0 },
      Chest: { x: 6, y: 0, z: 0 },
      Neck: { x: 4, y: 5, z: -12 },
      Head: { x: 6, y: 8, z: -14 },
      LeftUpLeg: { x: -35, y: -25, z: 22 },
      LeftLeg: { x: 130, y: 0, z: 0 },
      LeftFoot: { x: 20, y: 15, z: 0 },
      RightUpLeg: { x: -35, y: 25, z: -22 },
      RightLeg: { x: 130, y: 0, z: 0 },
      RightFoot: { x: 20, y: -15, z: 0 },
      LeftArm: { x: 74, y: 15, z: 14 },
      LeftForeArm: { x: 25, y: 0, z: 35 },
      RightArm: { x: 74, y: -15, z: -14 },
      RightForeArm: { x: 25, y: 0, z: -35 },
    },
  },

  // P028: One knee up, hands behind
  P028: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: -12, y: 0, z: 0 },
      Spine: { x: -10, y: 0, z: 0 },
      Chest: { x: -12, y: 0, z: 0 },
      LeftArm: { x: 50, y: 20, z: -35 },
      LeftForeArm: { x: -5, y: 0, z: 25 },
      RightArm: { x: 50, y: -20, z: 35 },
      RightForeArm: { x: -5, y: 0, z: -25 },
      LeftUpLeg: { x: -95, y: 10, z: 10 },
      LeftLeg: { x: 105, y: 0, z: 0 },
      RightUpLeg: { x: -75, y: -15, z: -15 },
      RightLeg: { x: 20, y: 0, z: 0 },
    },
  },

  // P029: Seated, one leg wide open (half M)
  P029: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: -10, y: 0, z: 0 },
      LeftUpLeg: { x: -80, y: 35, z: 35 },
      LeftLeg: { x: 95, y: 0, z: 0 },
      RightUpLeg: { x: -75, y: -10, z: -10 },
      RightLeg: { x: 20, y: 0, z: 0 },
      LeftArm: { x: 50, y: 0, z: 20 },
      LeftForeArm: { x: 10, y: 0, z: 30 },
      RightArm: { x: 50, y: 0, z: -20 },
      RightForeArm: { x: 10, y: 0, z: -30 },
    },
  },

  // P030: Knees-up sit, knees slightly apart
  P030: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: 8, y: 0, z: 0 },
      LeftUpLeg: { x: -95, y: 15, z: 16 },
      LeftLeg: { x: 105, y: 0, z: 0 },
      RightUpLeg: { x: -95, y: -15, z: -16 },
      RightLeg: { x: 105, y: 0, z: 0 },
      LeftArm: { x: 55, y: -10, z: 25 },
      LeftForeArm: { x: 15, y: 0, z: 45 },
      RightArm: { x: 55, y: 10, z: -25 },
      RightForeArm: { x: 15, y: 0, z: -45 },
    },
  },

  // P031: Kneeling arch, hands behind head
  P031: {
    hipHeightFactor: 0.55,
    rotations: {
      Hips: { x: -10, y: 0, z: 0 },
      Spine: { x: -20, y: 0, z: 0 },
      Chest: { x: -22, y: 0, z: 0 },
      LeftArm: { x: -45, y: -15, z: 25 },
      LeftForeArm: { x: 15, y: 0, z: 125 },
      RightArm: { x: -45, y: 15, z: -25 },
      RightForeArm: { x: 15, y: 0, z: -125 },
      LeftUpLeg: { x: -5, y: 5, z: 4 },
      LeftLeg: { x: 115, y: 0, z: 0 },
      RightUpLeg: { x: -5, y: -5, z: -4 },
      RightLeg: { x: 115, y: 0, z: 0 },
    },
  },

  // P032: All fours, back arched, looking ahead
  P032: {
    hipHeightFactor: 0.52,
    rotations: {
      Hips: { x: 75, y: 0, z: 0 },
      Spine: { x: -22, y: 0, z: 0 },
      Chest: { x: -22, y: 0, z: 0 },
      Neck: { x: -35, y: 0, z: 0 },
      Head: { x: -30, y: 0, z: 0 },
      LeftArm: { x: 15, y: -10, z: 75 },
      LeftForeArm: { x: 0, y: 0, z: 10 },
      RightArm: { x: 15, y: 10, z: -75 },
      RightForeArm: { x: 0, y: 0, z: -10 },
      LeftUpLeg: { x: -75, y: 8, z: 8 },
      LeftLeg: { x: 100, y: 0, z: 0 },
      RightUpLeg: { x: -75, y: -8, z: -8 },
      RightLeg: { x: 100, y: 0, z: 0 },
    },
  },

  // P033: Wide kneel, hips lowered
  P033: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: 10, y: 0, z: 0 },
      LeftUpLeg: { x: -25, y: 25, z: 25 },
      LeftLeg: { x: 125, y: 0, z: 0 },
      RightUpLeg: { x: -25, y: -25, z: -25 },
      RightLeg: { x: 125, y: 0, z: 0 },
      LeftArm: { x: 65, y: 0, z: 15 },
      LeftForeArm: { x: 10, y: 0, z: 25 },
      RightArm: { x: 65, y: 0, z: -15 },
      RightForeArm: { x: 10, y: 0, z: -25 },
    },
  },

  // P034: Seiza, sweeping hair up
  P034: {
    hipHeightFactor: 0.42,
    rotations: {
      Hips: { x: -8, y: 0, z: 0 },
      Spine: { x: -16, y: 0, z: 0 },
      Chest: { x: -18, y: 0, z: 0 },
      LeftArm: { x: -45, y: -15, z: 25 },
      LeftForeArm: { x: 15, y: 0, z: 125 },
      RightArm: { x: -45, y: 15, z: -25 },
      RightForeArm: { x: 15, y: 0, z: -125 },
      LeftUpLeg: { x: -10, y: 5, z: 0 },
      LeftLeg: { x: 125, y: 0, z: 0 },
      RightUpLeg: { x: -10, y: -5, z: 0 },
      RightLeg: { x: 125, y: 0, z: 0 },
    },
  },

  // P035: Kneeling on one knee, hand on thigh
  P035: {
    hipHeightFactor: 0.65,
    rotations: {
      Hips: { x: -5, y: 0, z: 0 },
      LeftUpLeg: { x: -85, y: 8, z: 8 },
      LeftLeg: { x: 90, y: 0, z: 0 },
      RightUpLeg: { x: -5, y: -5, z: -4 },
      RightLeg: { x: 115, y: 0, z: 0 },
      LeftArm: { x: 55, y: -10, z: 25 },
      LeftForeArm: { x: 15, y: 0, z: 35 },
      RightArm: { x: 65, y: 10, z: -15 },
      RightForeArm: { x: 10, y: 0, z: -20 },
    },
  },

  // P036: Straddle, knees open, hands forward, hips low
  P036: {
    hipHeightFactor: 0.48,
    rotations: {
      Hips: { x: 45, y: 0, z: 0 },
      LeftUpLeg: { x: -45, y: 35, z: 35 },
      LeftLeg: { x: 110, y: 0, z: 0 },
      RightUpLeg: { x: -45, y: -35, z: -35 },
      RightLeg: { x: 110, y: 0, z: 0 },
      LeftArm: { x: 25, y: -10, z: 50 },
      LeftForeArm: { x: 5, y: 0, z: 15 },
      RightArm: { x: 25, y: 10, z: -50 },
      RightForeArm: { x: 5, y: 0, z: -15 },
    },
  },

  // P037: Straddle, knees open, hips low, sweeping hair
  P037: {
    hipHeightFactor: 0.48,
    rotations: {
      Hips: { x: 0, y: 0, z: 0 },
      Spine: { x: -16, y: 0, z: 0 },
      Chest: { x: -18, y: 0, z: 0 },
      LeftArm: { x: -45, y: -15, z: 25 },
      LeftForeArm: { x: 15, y: 0, z: 125 },
      RightArm: { x: -45, y: 15, z: -25 },
      RightForeArm: { x: 15, y: 0, z: -125 },
      LeftUpLeg: { x: -25, y: 35, z: 35 },
      LeftLeg: { x: 115, y: 0, z: 0 },
      RightUpLeg: { x: -25, y: -35, z: -35 },
      RightLeg: { x: 115, y: 0, z: 0 },
    },
  },

  // P038: Kneeling deep arch, holding heels (camel)
  P038: {
    hipHeightFactor: 0.58,
    rotations: {
      Hips: { x: -25, y: 0, z: 0 },
      Spine: { x: -35, y: 0, z: 0 },
      Chest: { x: -35, y: 0, z: 0 },
      Neck: { x: -35, y: 0, z: 0 },
      Head: { x: -30, y: 0, z: 0 },
      LeftArm: { x: 45, y: 20, z: -45 },
      LeftForeArm: { x: -10, y: 0, z: 20 },
      RightArm: { x: 45, y: -20, z: 45 },
      RightForeArm: { x: -10, y: 0, z: -20 },
      LeftUpLeg: { x: 15, y: 5, z: 4 },
      LeftLeg: { x: 115, y: 0, z: 0 },
      RightUpLeg: { x: 15, y: -5, z: -4 },
      RightLeg: { x: 115, y: 0, z: 0 },
    },
  },

  // P039: Kneeling twist, one arm up
  P039: {
    hipHeightFactor: 0.58,
    rotations: {
      Hips: { x: -5, y: 25, z: 4 },
      Spine: { x: -10, y: 25, z: 0 },
      Chest: { x: -12, y: 25, z: 0 },
      LeftArm: { x: -95, y: -10, z: 15 },
      LeftForeArm: { x: 5, y: 0, z: 10 },
      RightArm: { x: 65, y: 15, z: -25 },
      RightForeArm: { x: 10, y: 0, z: -25 },
      LeftUpLeg: { x: -5, y: 5, z: 4 },
      LeftLeg: { x: 115, y: 0, z: 0 },
      RightUpLeg: { x: -5, y: -5, z: -4 },
      RightLeg: { x: 115, y: 0, z: 0 },
    },
  },

  // P040: Cat pose (chest down, hips high, side)
  P040: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: 75, y: 0, z: 0 },
      Spine: { x: 15, y: 0, z: 0 },
      Chest: { x: 20, y: 0, z: 0 },
      LeftArm: { x: -35, y: 0, z: 45 },
      LeftForeArm: { x: 0, y: 0, z: 15 },
      RightArm: { x: -35, y: 0, z: -45 },
      RightForeArm: { x: 0, y: 0, z: -15 },
      LeftUpLeg: { x: -75, y: 5, z: 8 },
      LeftLeg: { x: 95, y: 0, z: 0 },
      RightUpLeg: { x: -75, y: -5, z: -8 },
      RightLeg: { x: 95, y: 0, z: 0 },
    },
  },

  // P041: All fours, one leg high behind
  P041: {
    hipHeightFactor: 0.52,
    rotations: {
      Hips: { x: 75, y: 0, z: -8 },
      Spine: { x: -20, y: 0, z: 0 },
      Chest: { x: -20, y: 0, z: 0 },
      LeftArm: { x: 15, y: -10, z: 75 },
      RightArm: { x: 15, y: 10, z: -75 },
      RightUpLeg: { x: -75, y: -5, z: -8 },
      RightLeg: { x: 95, y: 0, z: 0 },
      // Left leg lifted high behind
      LeftUpLeg: { x: 35, y: 10, z: 12 },
      LeftLeg: { x: 65, y: 0, z: 0 },
      LeftFoot: { x: 35, y: 0, z: 0 },
    },
  },

  // P042: Open-knee seiza, hands forward (begging pose)
  P042: {
    hipHeightFactor: 0.42,
    rotations: {
      Hips: { x: 18, y: 0, z: 0 },
      Spine: { x: 10, y: 0, z: 0 },
      Chest: { x: 12, y: 0, z: 0 },
      Neck: { x: -15, y: 0, z: 0 },
      Head: { x: -15, y: 0, z: 0 },
      LeftUpLeg: { x: -25, y: 25, z: 25 },
      LeftLeg: { x: 125, y: 0, z: 0 },
      RightUpLeg: { x: -25, y: -25, z: -25 },
      RightLeg: { x: 125, y: 0, z: 0 },
      LeftArm: { x: 45, y: -15, z: 35 },
      LeftForeArm: { x: 15, y: 0, z: 75 },
      RightArm: { x: 45, y: 15, z: -35 },
      RightForeArm: { x: 15, y: 0, z: -75 },
    },
  },

  // P043: Kneeling, hips pushed forward
  P043: {
    hipHeightFactor: 0.58,
    rotations: {
      Hips: { x: -15, y: 0, z: 0 },
      Spine: { x: -16, y: 0, z: 0 },
      Chest: { x: -18, y: 0, z: 0 },
      LeftArm: { x: 65, y: -10, z: 15 },
      LeftForeArm: { x: 10, y: 0, z: 20 },
      RightArm: { x: 65, y: 10, z: -15 },
      RightForeArm: { x: 10, y: 0, z: -20 },
      LeftUpLeg: { x: 10, y: 5, z: 4 },
      LeftLeg: { x: 115, y: 0, z: 0 },
      RightUpLeg: { x: 10, y: -5, z: -4 },
      RightLeg: { x: 115, y: 0, z: 0 },
    },
  },

  // P044: Kneeling, hand to side, body curved
  P044: {
    hipHeightFactor: 0.55,
    rotations: {
      Hips: { x: -5, y: 0, z: 15 },
      Spine: { x: -5, y: 0, z: -12 },
      Chest: { x: -5, y: 0, z: -12 },
      LeftArm: { x: 55, y: 10, z: 25 },
      LeftForeArm: { x: 0, y: 0, z: 15 },
      RightArm: { x: -75, y: 15, z: -35 },
      RightForeArm: { x: 15, y: 0, z: -75 },
      LeftUpLeg: { x: -5, y: 5, z: 4 },
      LeftLeg: { x: 115, y: 0, z: 0 },
      RightUpLeg: { x: -5, y: -5, z: -4 },
      RightLeg: { x: 115, y: 0, z: 0 },
    },
  },

  // P045: Kneeling arch, one hand reaching to heel
  P045: {
    hipHeightFactor: 0.58,
    rotations: {
      Hips: { x: -20, y: 15, z: 4 },
      Spine: { x: -25, y: 15, z: 0 },
      Chest: { x: -25, y: 15, z: 0 },
      LeftArm: { x: -85, y: -10, z: 25 },
      LeftForeArm: { x: 10, y: 0, z: 20 },
      RightArm: { x: 45, y: -20, z: 40 },
      RightForeArm: { x: -10, y: 0, z: -20 },
      LeftUpLeg: { x: 5, y: 5, z: 4 },
      LeftLeg: { x: 115, y: 0, z: 0 },
      RightUpLeg: { x: 5, y: -5, z: -4 },
      RightLeg: { x: 115, y: 0, z: 0 },
    },
  },

  // P046: Side-lying, waist curve emphasized, one leg bent
  P046: {
    hipHeightFactor: 0.20,
    rotations: {
      Hips: { x: 15, y: 80, z: 8 },
      Spine: { x: 0, y: -10, z: -12 },
      Chest: { x: 0, y: -10, z: -12 },
      LeftArm: { x: 50, y: 0, z: 20 },
      LeftForeArm: { x: 15, y: 0, z: 65 },
      RightArm: { x: -35, y: 0, z: -45 },
      RightForeArm: { x: 15, y: 0, z: -85 },
      LeftUpLeg: { x: -45, y: 15, z: 15 },
      LeftLeg: { x: 65, y: 0, z: 0 },
      RightUpLeg: { x: 5, y: 0, z: 0 },
      RightLeg: { x: 15, y: 0, z: 0 },
    },
  },

  // P047: Prone, chin in hands, both feet up
  P047: {
    hipHeightFactor: 0.16,
    rotations: {
      Hips: { x: 80, y: 0, z: 0 },
      Spine: { x: -25, y: 0, z: 0 },
      Chest: { x: -28, y: 0, z: 0 },
      Neck: { x: -20, y: 0, z: 0 },
      Head: { x: -15, y: 0, z: 0 },
      LeftArm: { x: 25, y: -15, z: 65 },
      LeftForeArm: { x: 25, y: 0, z: 95 },
      RightArm: { x: 25, y: 15, z: -65 },
      RightForeArm: { x: 25, y: 0, z: -95 },
      LeftUpLeg: { x: -10, y: 5, z: 5 },
      LeftLeg: { x: 90, y: 0, z: 0 },
      RightUpLeg: { x: -10, y: -5, z: -5 },
      RightLeg: { x: 90, y: 0, z: 0 },
    },
  },

  // P048: Prone, upper body raised in deep arch (cobra)
  P048: {
    hipHeightFactor: 0.18,
    rotations: {
      Hips: { x: 80, y: 0, z: 0 },
      Spine: { x: -35, y: 0, z: 0 },
      Chest: { x: -38, y: 0, z: 0 },
      Neck: { x: -25, y: 0, z: 0 },
      Head: { x: -20, y: 0, z: 0 },
      LeftArm: { x: 45, y: -10, z: 45 },
      LeftForeArm: { x: 5, y: 0, z: 15 },
      RightArm: { x: 45, y: 10, z: -45 },
      RightForeArm: { x: 5, y: 0, z: -15 },
      LeftUpLeg: { x: 5, y: 5, z: 5 },
      LeftLeg: { x: 10, y: 0, z: 0 },
      RightUpLeg: { x: 5, y: -5, z: -5 },
      RightLeg: { x: 10, y: 0, z: 0 },
    },
  },

  // P049: Supine, back lifted, one leg high
  P049: {
    hipHeightFactor: 0.32,
    rotations: {
      Hips: { x: -75, y: 0, z: 0 },
      Spine: { x: 15, y: 0, z: 0 },
      Chest: { x: 15, y: 0, z: 0 },
      LeftArm: { x: 65, y: 0, z: 15 },
      RightArm: { x: 65, y: 0, z: -15 },
      RightUpLeg: { x: 55, y: -5, z: -5 },
      RightLeg: { x: 90, y: 0, z: 0 },
      LeftUpLeg: { x: -15, y: 5, z: 5 },
      LeftLeg: { x: 10, y: 0, z: 0 },
      LeftFoot: { x: 35, y: 0, z: 0 },
    },
  },

  // P050: Supine, knees together tipped to side
  P050: {
    hipHeightFactor: 0.16,
    rotations: {
      Hips: { x: -80, y: 35, z: 0 },
      Spine: { x: 5, y: -20, z: 0 },
      Chest: { x: 5, y: -20, z: 0 },
      LeftArm: { x: 35, y: 0, z: 45 },
      RightArm: { x: 35, y: 0, z: -45 },
      LeftUpLeg: { x: 35, y: 15, z: 12 },
      LeftLeg: { x: 85, y: 0, z: 0 },
      RightUpLeg: { x: 35, y: 12, z: 8 },
      RightLeg: { x: 85, y: 0, z: 0 },
    },
  },

  // P051: Prone on elbows, legs straight and slightly apart
  P051: {
    hipHeightFactor: 0.20,
    rotations: {
      Hips: { x: 80, y: 0, z: 0 },
      Spine: { x: -25, y: 0, z: 0 },
      Chest: { x: -28, y: 0, z: 0 },
      LeftArm: { x: 35, y: -10, z: 45 },
      LeftForeArm: { x: 15, y: 0, z: 75 },
      RightArm: { x: 35, y: 10, z: -45 },
      RightForeArm: { x: 15, y: 0, z: -75 },
      LeftUpLeg: { x: 5, y: 10, z: 15 },
      LeftLeg: { x: 8, y: 0, z: 0 },
      RightUpLeg: { x: 5, y: -10, z: -15 },
      RightLeg: { x: 8, y: 0, z: 0 },
    },
  },

  // P052: Side-lying S-curve, arm overhead
  P052: {
    hipHeightFactor: 0.20,
    rotations: {
      Hips: { x: 10, y: 75, z: 12 },
      Spine: { x: 0, y: -10, z: -15 },
      Chest: { x: 0, y: -10, z: -15 },
      LeftArm: { x: -85, y: -15, z: 25 },
      LeftForeArm: { x: 15, y: 0, z: 75 },
      RightArm: { x: 55, y: 0, z: -25 },
      RightForeArm: { x: 15, y: 0, z: -65 },
      LeftUpLeg: { x: -35, y: 15, z: 12 },
      LeftLeg: { x: 65, y: 0, z: 0 },
      RightUpLeg: { x: 5, y: 0, z: 0 },
      RightLeg: { x: 20, y: 0, z: 0 },
    },
  },

  // P053: Inviting side-lying pose on bed
  P053: {
    hipHeightFactor: 0.20,
    rotations: {
      Hips: { x: 12, y: 70, z: 10 },
      Spine: { x: -8, y: -10, z: -10 },
      Chest: { x: -10, y: -10, z: -10 },
      LeftArm: { x: 45, y: 0, z: 35 },
      LeftForeArm: { x: 15, y: 0, z: 65 },
      RightArm: { x: -45, y: 0, z: -45 },
      RightForeArm: { x: 20, y: 0, z: -110 },
      LeftUpLeg: { x: -25, y: 15, z: 15 },
      LeftLeg: { x: 45, y: 0, z: 0 },
      RightUpLeg: { x: 5, y: 0, z: 0 },
      RightLeg: { x: 15, y: 0, z: 0 },
    },
  },

  // P054: Prone, hips raised high
  P054: {
    hipHeightFactor: 0.35,
    rotations: {
      Hips: { x: 65, y: 0, z: 0 },
      Spine: { x: -18, y: 0, z: 0 },
      Chest: { x: -18, y: 0, z: 0 },
      LeftArm: { x: -15, y: 0, z: 45 },
      LeftForeArm: { x: 15, y: 0, z: 45 },
      RightArm: { x: -15, y: 0, z: -45 },
      RightForeArm: { x: 15, y: 0, z: -45 },
      LeftUpLeg: { x: -65, y: 8, z: 12 },
      LeftLeg: { x: 95, y: 0, z: 0 },
      RightUpLeg: { x: -65, y: -8, z: -12 },
      RightLeg: { x: 95, y: 0, z: 0 },
    },
  },

  // P055: Supine V-split (legs raised)
  P055: {
    hipHeightFactor: 0.16,
    rotations: {
      Hips: { x: -80, y: 0, z: 0 },
      Spine: { x: 5, y: 0, z: 0 },
      Chest: { x: 5, y: 0, z: 0 },
      LeftArm: { x: 50, y: 0, z: 35 },
      RightArm: { x: 50, y: 0, z: -35 },
      LeftUpLeg: { x: 15, y: 20, z: 45 },
      LeftLeg: { x: 8, y: 0, z: 0 },
      LeftFoot: { x: 30, y: 0, z: 0 },
      RightUpLeg: { x: 15, y: -20, z: -45 },
      RightLeg: { x: 8, y: 0, z: 0 },
      RightFoot: { x: 30, y: 0, z: 0 },
    },
  },

  // P056: Supine back arch, arms overhead
  P056: {
    hipHeightFactor: 0.22,
    rotations: {
      Hips: { x: -75, y: 0, z: 0 },
      Spine: { x: -25, y: 0, z: 0 },
      Chest: { x: -28, y: 0, z: 0 },
      LeftArm: { x: -95, y: -10, z: 15 },
      RightArm: { x: -95, y: 10, z: -15 },
      LeftUpLeg: { x: 45, y: 10, z: 12 },
      LeftLeg: { x: 85, y: 0, z: 0 },
      RightUpLeg: { x: 45, y: -10, z: -12 },
      RightLeg: { x: 85, y: 0, z: 0 },
    },
  },

  // P057: Prone, looking back, one knee bent sideways
  P057: {
    hipHeightFactor: 0.18,
    rotations: {
      Hips: { x: 80, y: 20, z: 0 },
      Spine: { x: -20, y: 25, z: 0 },
      Chest: { x: -22, y: 25, z: 0 },
      Neck: { x: -10, y: 35, z: 0 },
      Head: { x: -10, y: 35, z: 0 },
      LeftArm: { x: 35, y: 0, z: 45 },
      LeftForeArm: { x: 15, y: 0, z: 65 },
      RightArm: { x: 35, y: 0, z: -45 },
      RightForeArm: { x: 15, y: 0, z: -65 },
      LeftUpLeg: { x: -45, y: 35, z: 35 },
      LeftLeg: { x: 90, y: 0, z: 0 },
      RightUpLeg: { x: 5, y: -5, z: -5 },
      RightLeg: { x: 10, y: 0, z: 0 },
    },
  },

  // P058: Side-lying, top leg high, holding ankle
  P058: {
    hipHeightFactor: 0.20,
    rotations: {
      Hips: { x: 10, y: 80, z: 0 },
      Spine: { x: 0, y: -10, z: -10 },
      Chest: { x: 0, y: -10, z: -10 },
      LeftArm: { x: -35, y: -10, z: 45 },
      LeftForeArm: { x: 15, y: 0, z: 65 },
      RightArm: { x: 65, y: 0, z: -25 },
      RightForeArm: { x: 15, y: 0, z: -75 },
      // Top left leg held high
      LeftUpLeg: { x: -75, y: 25, z: 65 },
      LeftLeg: { x: 10, y: 0, z: 0 },
      LeftFoot: { x: 35, y: 0, z: 0 },
      RightUpLeg: { x: 5, y: 0, z: 0 },
      RightLeg: { x: 15, y: 0, z: 0 },
    },
  },

  // P059: Supine, knees up, one arm overhead
  P059: {
    hipHeightFactor: 0.16,
    rotations: {
      Hips: { x: -80, y: 0, z: 0 },
      Spine: { x: 4, y: 0, z: 0 },
      Chest: { x: 4, y: 0, z: 0 },
      LeftArm: { x: -95, y: -10, z: 15 },
      RightArm: { x: 65, y: 0, z: -15 },
      LeftUpLeg: { x: 45, y: 12, z: 15 },
      LeftLeg: { x: 90, y: 0, z: 0 },
      RightUpLeg: { x: 45, y: -12, z: -15 },
      RightLeg: { x: 90, y: 0, z: 0 },
    },
  },

  // P060: Prone frog legs (knees out to sides)
  P060: {
    hipHeightFactor: 0.16,
    rotations: {
      Hips: { x: 80, y: 0, z: 0 },
      Spine: { x: -15, y: 0, z: 0 },
      Chest: { x: -18, y: 0, z: 0 },
      LeftArm: { x: 35, y: 0, z: 50 },
      LeftForeArm: { x: 20, y: 0, z: 85 },
      RightArm: { x: 35, y: 0, z: -50 },
      RightForeArm: { x: 20, y: 0, z: -85 },
      LeftUpLeg: { x: -35, y: 45, z: 45 },
      LeftLeg: { x: 95, y: 0, z: 0 },
      RightUpLeg: { x: -35, y: -45, z: -45 },
      RightLeg: { x: 95, y: 0, z: 0 },
    },
  },

  // P061: Side-lying from behind, hip line
  P061: {
    hipHeightFactor: 0.20,
    rotations: {
      Hips: { x: -10, y: 110, z: 12 },
      Spine: { x: 5, y: 15, z: -10 },
      Chest: { x: 5, y: 15, z: -10 },
      LeftArm: { x: 55, y: 0, z: 25 },
      RightArm: { x: 65, y: 0, z: -15 },
      LeftUpLeg: { x: -35, y: 15, z: 12 },
      LeftLeg: { x: 55, y: 0, z: 0 },
      RightUpLeg: { x: 5, y: 0, z: 0 },
      RightLeg: { x: 25, y: 0, z: 0 },
    },
  },

  // P062: Supine, knees pulled to chest
  P062: {
    hipHeightFactor: 0.20,
    rotations: {
      Hips: { x: -80, y: 0, z: 0 },
      Spine: { x: 15, y: 0, z: 0 },
      Chest: { x: 15, y: 0, z: 0 },
      LeftUpLeg: { x: 35, y: 12, z: 12 },
      LeftLeg: { x: 115, y: 0, z: 0 },
      RightUpLeg: { x: 35, y: -12, z: -12 },
      RightLeg: { x: 115, y: 0, z: 0 },
      LeftArm: { x: 45, y: -20, z: 45 },
      LeftForeArm: { x: 20, y: 0, z: 95 },
      RightArm: { x: 45, y: 20, z: -45 },
      RightForeArm: { x: 20, y: 0, z: -95 },
    },
  },

  // P063: Prone, chin in hand, one leg up
  P063: {
    hipHeightFactor: 0.16,
    rotations: {
      Hips: { x: 80, y: 0, z: 0 },
      Spine: { x: -25, y: 0, z: 0 },
      Chest: { x: -28, y: 0, z: 0 },
      LeftArm: { x: 25, y: -15, z: 65 },
      LeftForeArm: { x: 25, y: 0, z: 95 },
      RightArm: { x: 45, y: 0, z: -35 },
      RightForeArm: { x: 15, y: 0, z: -45 },
      LeftUpLeg: { x: -10, y: 5, z: 5 },
      LeftLeg: { x: 95, y: 0, z: 0 },
      RightUpLeg: { x: 5, y: -5, z: -5 },
      RightLeg: { x: 10, y: 0, z: 0 },
    },
  },

  // P064: Supine, one knee dropped open
  P064: {
    hipHeightFactor: 0.16,
    rotations: {
      Hips: { x: -80, y: 0, z: 0 },
      LeftUpLeg: { x: 25, y: 35, z: 35 },
      LeftLeg: { x: 85, y: 0, z: 0 },
      RightUpLeg: { x: 0, y: -5, z: -5 },
      RightLeg: { x: 10, y: 0, z: 0 },
      LeftArm: { x: -75, y: -10, z: 25 },
      RightArm: { x: 65, y: 0, z: -15 },
    },
  },

  // P065: Propped on elbows, one knee up
  P065: {
    hipHeightFactor: 0.28,
    rotations: {
      Hips: { x: -55, y: 0, z: 0 },
      Spine: { x: -15, y: 0, z: 0 },
      Chest: { x: -15, y: 0, z: 0 },
      LeftArm: { x: 65, y: 15, z: -25 },
      LeftForeArm: { x: -10, y: 0, z: 75 },
      RightArm: { x: 65, y: -15, z: 25 },
      RightForeArm: { x: -10, y: 0, z: -75 },
      LeftUpLeg: { x: 25, y: 12, z: 12 },
      LeftLeg: { x: 85, y: 0, z: 0 },
      RightUpLeg: { x: -10, y: -5, z: -5 },
      RightLeg: { x: 15, y: 0, z: 0 },
    },
  },

  // P066: Bridge, hips high, knees open
  P066: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: -65, y: 0, z: 0 },
      Spine: { x: -25, y: 0, z: 0 },
      Chest: { x: -25, y: 0, z: 0 },
      LeftArm: { x: 65, y: 0, z: 15 },
      RightArm: { x: 65, y: 0, z: -15 },
      LeftUpLeg: { x: 65, y: 15, z: 18 },
      LeftLeg: { x: 95, y: 0, z: 0 },
      RightUpLeg: { x: 65, y: -15, z: -18 },
      RightLeg: { x: 95, y: 0, z: 0 },
    },
  },

  // P067: Rolled-back legs over (side, holding thighs)
  P067: {
    hipHeightFactor: 0.35,
    rotations: {
      Hips: { x: -125, y: 0, z: 0 },
      Spine: { x: 25, y: 0, z: 0 },
      Chest: { x: 25, y: 0, z: 0 },
      LeftUpLeg: { x: 45, y: 12, z: 12 },
      LeftLeg: { x: 25, y: 0, z: 0 },
      RightUpLeg: { x: 45, y: -12, z: -12 },
      RightLeg: { x: 25, y: 0, z: 0 },
      LeftArm: { x: 25, y: -10, z: 50 },
      LeftForeArm: { x: 15, y: 0, z: 65 },
      RightArm: { x: 25, y: 10, z: -50 },
      RightForeArm: { x: 15, y: 0, z: -65 },
    },
  },

  // P068: Rolled-back legs over (side, legs past head)
  P068: {
    hipHeightFactor: 0.35,
    rotations: {
      Hips: { x: -135, y: 0, z: 0 },
      Spine: { x: 25, y: 0, z: 0 },
      Chest: { x: 25, y: 0, z: 0 },
      LeftUpLeg: { x: 45, y: 8, z: 8 },
      LeftLeg: { x: 10, y: 0, z: 0 },
      RightUpLeg: { x: 45, y: -8, z: -8 },
      RightLeg: { x: 10, y: 0, z: 0 },
      LeftArm: { x: 65, y: 0, z: 15 },
      RightArm: { x: 65, y: 0, z: -15 },
    },
  },

  // P069: Rolled-back legs over (side, knees to floor by head)
  P069: {
    hipHeightFactor: 0.35,
    rotations: {
      Hips: { x: -135, y: 0, z: 0 },
      Spine: { x: 25, y: 0, z: 0 },
      Chest: { x: 25, y: 0, z: 0 },
      LeftUpLeg: { x: 55, y: 20, z: 20 },
      LeftLeg: { x: 110, y: 0, z: 0 },
      RightUpLeg: { x: 55, y: -20, z: -20 },
      RightLeg: { x: 110, y: 0, z: 0 },
      LeftArm: { x: 45, y: 0, z: 35 },
      RightArm: { x: 45, y: 0, z: -35 },
    },
  },

  // P070: Wide squat (delinquent squat)
  P070: {
    hipHeightFactor: 0.52,
    rotations: {
      Hips: { x: 25, y: 0, z: 0 },
      Spine: { x: 12, y: 0, z: 0 },
      Chest: { x: 14, y: 0, z: 0 },
      LeftUpLeg: { x: -95, y: 35, z: 35 },
      LeftLeg: { x: 120, y: 0, z: 0 },
      LeftFoot: { x: -15, y: 0, z: 0 },
      RightUpLeg: { x: -95, y: -35, z: -35 },
      RightLeg: { x: 120, y: 0, z: 0 },
      RightFoot: { x: -15, y: 0, z: 0 },
      LeftArm: { x: 45, y: -10, z: 35 },
      LeftForeArm: { x: 15, y: 0, z: 45 },
      RightArm: { x: 45, y: 10, z: -35 },
      RightForeArm: { x: 15, y: 0, z: -45 },
    },
  },

  // P071: Wide squat on tiptoes, hands to floor
  P071: {
    hipHeightFactor: 0.48,
    rotations: {
      Hips: { x: 35, y: 0, z: 0 },
      LeftUpLeg: { x: -95, y: 35, z: 35 },
      LeftLeg: { x: 125, y: 0, z: 0 },
      LeftFoot: { x: 25, y: 0, z: 0 },
      RightUpLeg: { x: -95, y: -35, z: -35 },
      RightLeg: { x: 125, y: 0, z: 0 },
      RightFoot: { x: 25, y: 0, z: 0 },
      LeftArm: { x: 35, y: -10, z: 45 },
      LeftForeArm: { x: 5, y: 0, z: 15 },
      RightArm: { x: 35, y: 10, z: -45 },
      RightForeArm: { x: 5, y: 0, z: -15 },
    },
  },

  // P072: Full bridge (hands and feet)
  P072: {
    hipHeightFactor: 0.55,
    rotations: {
      Hips: { x: -45, y: 0, z: 0 },
      Spine: { x: -45, y: 0, z: 0 },
      Chest: { x: -45, y: 0, z: 0 },
      Neck: { x: -35, y: 0, z: 0 },
      Head: { x: -30, y: 0, z: 0 },
      LeftArm: { x: -95, y: -10, z: 15 },
      LeftForeArm: { x: 10, y: 0, z: 20 },
      RightArm: { x: -95, y: 10, z: -15 },
      RightForeArm: { x: 10, y: 0, z: -20 },
      LeftUpLeg: { x: 45, y: 12, z: 15 },
      LeftLeg: { x: 95, y: 0, z: 0 },
      RightUpLeg: { x: 45, y: -12, z: -15 },
      RightLeg: { x: 95, y: 0, z: 0 },
    },
  },

  // P073: Standing split (forward fold, one leg high behind)
  P073: {
    hipHeightFactor: 0.90,
    rotations: {
      Hips: { x: 75, y: 0, z: -10 },
      Spine: { x: 5, y: 0, z: 0 },
      Chest: { x: 5, y: 0, z: 0 },
      RightUpLeg: { x: -75, y: -4, z: -6 },
      RightLeg: { x: 8, y: 0, z: 0 },
      // Left leg lifted high behind
      LeftUpLeg: { x: 65, y: 10, z: 18 },
      LeftLeg: { x: 8, y: 0, z: 0 },
      LeftFoot: { x: 35, y: 0, z: 0 },
      LeftArm: { x: 25, y: -10, z: 75 },
      LeftForeArm: { x: 5, y: 0, z: 10 },
      RightArm: { x: 25, y: 10, z: -75 },
      RightForeArm: { x: 5, y: 0, z: -10 },
    },
  },

  // P074: Front split, upper body arched
  P074: {
    hipHeightFactor: 0.20,
    rotations: {
      Hips: { x: -5, y: 0, z: 0 },
      Spine: { x: -20, y: 0, z: 0 },
      Chest: { x: -22, y: 0, z: 0 },
      LeftArm: { x: 60, y: 0, z: 20 },
      RightArm: { x: 60, y: 0, z: -20 },
      LeftUpLeg: { x: -85, y: 5, z: 5 },
      LeftLeg: { x: 8, y: 0, z: 0 },
      LeftFoot: { x: 30, y: 0, z: 0 },
      RightUpLeg: { x: 75, y: -5, z: -5 },
      RightLeg: { x: 8, y: 0, z: 0 },
      RightFoot: { x: 30, y: 0, z: 0 },
    },
  },

  // P075: Straddle split, upper body upright
  P075: {
    hipHeightFactor: 0.20,
    rotations: {
      Hips: { x: 0, y: 0, z: 0 },
      Spine: { x: -6, y: 0, z: 0 },
      Chest: { x: -8, y: 0, z: 0 },
      LeftArm: { x: 65, y: 0, z: 25 },
      RightArm: { x: 65, y: 0, z: -25 },
      LeftUpLeg: { x: -10, y: 25, z: 85 },
      LeftLeg: { x: 8, y: 0, z: 0 },
      LeftFoot: { x: 30, y: 0, z: 0 },
      RightUpLeg: { x: -10, y: -25, z: -85 },
      RightLeg: { x: 8, y: 0, z: 0 },
      RightFoot: { x: 30, y: 0, z: 0 },
    },
  },

  // P076: Shoulder stand, legs in V
  P076: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: -135, y: 0, z: 0 },
      Spine: { x: 20, y: 0, z: 0 },
      Chest: { x: 20, y: 0, z: 0 },
      LeftArm: { x: 65, y: 0, z: 25 },
      LeftForeArm: { x: 0, y: 0, z: 85 },
      RightArm: { x: 65, y: 0, z: -25 },
      RightForeArm: { x: 0, y: 0, z: -85 },
      LeftUpLeg: { x: 35, y: 15, z: 35 },
      LeftLeg: { x: 8, y: 0, z: 0 },
      RightUpLeg: { x: 35, y: -15, z: -35 },
      RightLeg: { x: 8, y: 0, z: 0 },
    },
  },

  // P077: Kneeling backbend, hands to floor
  P077: {
    hipHeightFactor: 0.52,
    rotations: {
      Hips: { x: -35, y: 0, z: 0 },
      Spine: { x: -40, y: 0, z: 0 },
      Chest: { x: -40, y: 0, z: 0 },
      Neck: { x: -30, y: 0, z: 0 },
      Head: { x: -25, y: 0, z: 0 },
      LeftArm: { x: -95, y: -10, z: 15 },
      LeftForeArm: { x: 10, y: 0, z: 20 },
      RightArm: { x: -95, y: 10, z: -15 },
      RightForeArm: { x: 10, y: 0, z: -20 },
      LeftUpLeg: { x: 15, y: 5, z: 4 },
      LeftLeg: { x: 115, y: 0, z: 0 },
      RightUpLeg: { x: 15, y: -5, z: -4 },
      RightLeg: { x: 115, y: 0, z: 0 },
    },
  },

  // P078: Wide squat, hands behind head
  P078: {
    hipHeightFactor: 0.52,
    rotations: {
      Hips: { x: 20, y: 0, z: 0 },
      Spine: { x: 10, y: 0, z: 0 },
      Chest: { x: 10, y: 0, z: 0 },
      LeftArm: { x: -45, y: -15, z: 25 },
      LeftForeArm: { x: 15, y: 0, z: 125 },
      RightArm: { x: -45, y: 15, z: -25 },
      RightForeArm: { x: 15, y: 0, z: -125 },
      LeftUpLeg: { x: -95, y: 35, z: 35 },
      LeftLeg: { x: 120, y: 0, z: 0 },
      RightUpLeg: { x: -95, y: -35, z: -35 },
      RightLeg: { x: 120, y: 0, z: 0 },
    },
  },

  // P079: Single-leg bridge (hips up, leg to ceiling)
  P079: {
    hipHeightFactor: 0.45,
    rotations: {
      Hips: { x: -65, y: 0, z: 0 },
      Spine: { x: -25, y: 0, z: 0 },
      Chest: { x: -25, y: 0, z: 0 },
      LeftArm: { x: 65, y: 0, z: 15 },
      RightArm: { x: 65, y: 0, z: -15 },
      RightUpLeg: { x: 65, y: -10, z: -12 },
      RightLeg: { x: 95, y: 0, z: 0 },
      // Left leg pointed straight up
      LeftUpLeg: { x: -5, y: 5, z: 5 },
      LeftLeg: { x: 8, y: 0, z: 0 },
      LeftFoot: { x: 35, y: 0, z: 0 },
    },
  },

  // P080: Reverse tabletop, hips thrust up
  P080: {
    hipHeightFactor: 0.48,
    rotations: {
      Hips: { x: -55, y: 0, z: 0 },
      Spine: { x: -20, y: 0, z: 0 },
      Chest: { x: -20, y: 0, z: 0 },
      LeftArm: { x: 55, y: 15, z: -35 },
      LeftForeArm: { x: -10, y: 0, z: 15 },
      RightArm: { x: 55, y: -15, z: 35 },
      RightForeArm: { x: -10, y: 0, z: -15 },
      LeftUpLeg: { x: 65, y: 10, z: 12 },
      LeftLeg: { x: 95, y: 0, z: 0 },
      RightUpLeg: { x: 65, y: -10, z: -12 },
      RightLeg: { x: 95, y: 0, z: 0 },
    },
  },
};
