import * as THREE from 'three';

/**
 * Creates an aesthetic, fully-articulated procedural 3D mannequin model
 * with standard Mixamo-compatible bones and joint hierarchy.
 */
export function createDefaultMannequin(): THREE.Group {
  const mannequinGroup = new THREE.Group();
  mannequinGroup.name = 'Mannequin_Humanoid';

  // Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xd6d8e0,
    roughness: 0.35,
    metalness: 0.15,
  });

  const jointMaterial = new THREE.MeshStandardMaterial({
    color: 0x5b5bd6,
    roughness: 0.3,
    metalness: 0.4,
  });

  const darkAccentMaterial = new THREE.MeshStandardMaterial({
    color: 0x2b2e38,
    roughness: 0.4,
    metalness: 0.2,
  });

  // Reusable helper to create mesh part
  const createJoint = (radius: number) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 16), jointMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  // Bones hierarchy
  const hips = new THREE.Bone();
  hips.name = 'mixamorigHips';
  hips.position.set(0, 1.05, 0);

  // Hips geometry (pelvis)
  const pelvisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.16, 16), bodyMaterial);
  pelvisMesh.position.set(0, 0, 0);
  pelvisMesh.castShadow = true;
  hips.add(pelvisMesh);

  // Spine
  const spine = new THREE.Bone();
  spine.name = 'mixamorigSpine';
  spine.position.set(0, 0.14, 0);
  hips.add(spine);

  const spineJoint = createJoint(0.09);
  spine.add(spineJoint);

  const spineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.16, 16), bodyMaterial);
  spineMesh.position.set(0, 0.08, 0);
  spineMesh.castShadow = true;
  spine.add(spineMesh);

  // Chest
  const chest = new THREE.Bone();
  chest.name = 'mixamorigChest';
  chest.position.set(0, 0.18, 0);
  spine.add(chest);

  const chestJoint = createJoint(0.1);
  chest.add(chestJoint);

  // Ribcage block
  const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.22, 16), bodyMaterial);
  chestMesh.position.set(0, 0.11, 0);
  chestMesh.scale.set(1.1, 1.0, 0.75); // Flatter torso
  chestMesh.castShadow = true;
  chest.add(chestMesh);

  // Neck
  const neck = new THREE.Bone();
  neck.name = 'mixamorigNeck';
  neck.position.set(0, 0.23, 0);
  chest.add(neck);

  const neckJoint = createJoint(0.06);
  neck.add(neckJoint);

  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.1, 16), bodyMaterial);
  neckMesh.position.set(0, 0.05, 0);
  neck.add(neckMesh);

  // Head
  const head = new THREE.Bone();
  head.name = 'mixamorigHead';
  head.position.set(0, 0.11, 0);
  neck.add(head);

  // Stylized mannequin head
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), bodyMaterial);
  headMesh.position.set(0, 0.1, 0.02);
  headMesh.scale.set(0.9, 1.15, 1.0);
  headMesh.castShadow = true;
  head.add(headMesh);

  // Facet visor indicator
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.06), darkAccentMaterial);
  visor.position.set(0, 0.12, 0.11);
  head.add(visor);

  // ===================== ARMS =====================
  // Left Shoulder
  const leftShoulder = new THREE.Bone();
  leftShoulder.name = 'mixamorigLeftShoulder';
  leftShoulder.position.set(0.16, 0.18, 0);
  chest.add(leftShoulder);

  const leftShoulderJoint = createJoint(0.065);
  leftShoulder.add(leftShoulderJoint);

  // Left Arm (Upper Arm)
  const leftArm = new THREE.Bone();
  leftArm.name = 'mixamorigLeftArm';
  leftArm.position.set(0.09, 0, 0);
  leftShoulder.add(leftArm);

  const leftArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.24, 16), bodyMaterial);
  leftArmMesh.position.set(0.12, 0, 0);
  leftArmMesh.rotation.z = -Math.PI / 2;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);

  // Left ForeArm
  const leftForeArm = new THREE.Bone();
  leftForeArm.name = 'mixamorigLeftForeArm';
  leftForeArm.position.set(0.24, 0, 0);
  leftArm.add(leftForeArm);

  const leftElbowJoint = createJoint(0.05);
  leftForeArm.add(leftElbowJoint);

  const leftForeArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.038, 0.22, 16), bodyMaterial);
  leftForeArmMesh.position.set(0.11, 0, 0);
  leftForeArmMesh.rotation.z = -Math.PI / 2;
  leftForeArmMesh.castShadow = true;
  leftForeArm.add(leftForeArmMesh);

  // Left Hand
  const leftHand = new THREE.Bone();
  leftHand.name = 'mixamorigLeftHand';
  leftHand.position.set(0.22, 0, 0);
  leftForeArm.add(leftHand);

  const leftWristJoint = createJoint(0.04);
  leftHand.add(leftWristJoint);

  const leftHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.035, 0.07), darkAccentMaterial);
  leftHandMesh.position.set(0.045, 0, 0);
  leftHandMesh.castShadow = true;
  leftHand.add(leftHandMesh);

  // Right Shoulder
  const rightShoulder = new THREE.Bone();
  rightShoulder.name = 'mixamorigRightShoulder';
  rightShoulder.position.set(-0.16, 0.18, 0);
  chest.add(rightShoulder);

  const rightShoulderJoint = createJoint(0.065);
  rightShoulder.add(rightShoulderJoint);

  // Right Arm (Upper Arm)
  const rightArm = new THREE.Bone();
  rightArm.name = 'mixamorigRightArm';
  rightArm.position.set(-0.09, 0, 0);
  rightShoulder.add(rightArm);

  const rightArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.24, 16), bodyMaterial);
  rightArmMesh.position.set(-0.12, 0, 0);
  rightArmMesh.rotation.z = Math.PI / 2;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);

  // Right ForeArm
  const rightForeArm = new THREE.Bone();
  rightForeArm.name = 'mixamorigRightForeArm';
  rightForeArm.position.set(-0.24, 0, 0);
  rightArm.add(rightForeArm);

  const rightElbowJoint = createJoint(0.05);
  rightForeArm.add(rightElbowJoint);

  const rightForeArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.038, 0.22, 16), bodyMaterial);
  rightForeArmMesh.position.set(-0.11, 0, 0);
  rightForeArmMesh.rotation.z = Math.PI / 2;
  rightForeArmMesh.castShadow = true;
  rightForeArm.add(rightForeArmMesh);

  // Right Hand
  const rightHand = new THREE.Bone();
  rightHand.name = 'mixamorigRightHand';
  rightHand.position.set(-0.22, 0, 0);
  rightForeArm.add(rightHand);

  const rightWristJoint = createJoint(0.04);
  rightHand.add(rightWristJoint);

  const rightHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.035, 0.07), darkAccentMaterial);
  rightHandMesh.position.set(-0.045, 0, 0);
  rightHandMesh.castShadow = true;
  rightHand.add(rightHandMesh);

  // ===================== LEGS =====================
  // Left UpLeg (Thigh)
  const leftUpLeg = new THREE.Bone();
  leftUpLeg.name = 'mixamorigLeftUpLeg';
  leftUpLeg.position.set(0.1, -0.08, 0);
  hips.add(leftUpLeg);

  const leftHipJoint = createJoint(0.065);
  leftUpLeg.add(leftHipJoint);

  const leftThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.052, 0.38, 16), bodyMaterial);
  leftThighMesh.position.set(0, -0.19, 0);
  leftThighMesh.castShadow = true;
  leftUpLeg.add(leftThighMesh);

  // Left Leg (Shin)
  const leftLeg = new THREE.Bone();
  leftLeg.name = 'mixamorigLeftLeg';
  leftLeg.position.set(0, -0.38, 0);
  leftUpLeg.add(leftLeg);

  const leftKneeJoint = createJoint(0.058);
  leftLeg.add(leftKneeJoint);

  const leftShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.042, 0.38, 16), bodyMaterial);
  leftShinMesh.position.set(0, -0.19, 0);
  leftShinMesh.castShadow = true;
  leftLeg.add(leftShinMesh);

  // Left Foot
  const leftFoot = new THREE.Bone();
  leftFoot.name = 'mixamorigLeftFoot';
  leftFoot.position.set(0, -0.38, 0);
  leftLeg.add(leftFoot);

  const leftAnkleJoint = createJoint(0.045);
  leftFoot.add(leftAnkleJoint);

  const leftFootMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.18), darkAccentMaterial);
  leftFootMesh.position.set(0, -0.025, 0.05);
  leftFootMesh.castShadow = true;
  leftFoot.add(leftFootMesh);

  // Right UpLeg (Thigh)
  const rightUpLeg = new THREE.Bone();
  rightUpLeg.name = 'mixamorigRightUpLeg';
  rightUpLeg.position.set(-0.1, -0.08, 0);
  hips.add(rightUpLeg);

  const rightHipJoint = createJoint(0.065);
  rightUpLeg.add(rightHipJoint);

  const rightThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.052, 0.38, 16), bodyMaterial);
  rightThighMesh.position.set(0, -0.19, 0);
  rightThighMesh.castShadow = true;
  rightUpLeg.add(rightThighMesh);

  // Right Leg (Shin)
  const rightLeg = new THREE.Bone();
  rightLeg.name = 'mixamorigRightLeg';
  rightLeg.position.set(0, -0.38, 0);
  rightUpLeg.add(rightLeg);

  const rightKneeJoint = createJoint(0.058);
  rightLeg.add(rightKneeJoint);

  const rightShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.042, 0.38, 16), bodyMaterial);
  rightShinMesh.position.set(0, -0.19, 0);
  rightShinMesh.castShadow = true;
  rightLeg.add(rightShinMesh);

  // Right Foot
  const rightFoot = new THREE.Bone();
  rightFoot.name = 'mixamorigRightFoot';
  rightFoot.position.set(0, -0.38, 0);
  rightLeg.add(rightFoot);

  const rightAnkleJoint = createJoint(0.045);
  rightFoot.add(rightAnkleJoint);

  const rightFootMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.18), darkAccentMaterial);
  rightFootMesh.position.set(0, -0.025, 0.05);
  rightFootMesh.castShadow = true;
  rightFoot.add(rightFootMesh);

  // Add the root bone to the model
  mannequinGroup.add(hips);

  // Default natural standing stance: arms resting naturally along sides (about 75-80 deg down from T-pose)
  leftArm.rotation.z = -THREE.MathUtils.degToRad(72);
  rightArm.rotation.z = THREE.MathUtils.degToRad(72);
  leftForeArm.rotation.y = THREE.MathUtils.degToRad(12);
  rightForeArm.rotation.y = -THREE.MathUtils.degToRad(12);

  return mannequinGroup;
}
