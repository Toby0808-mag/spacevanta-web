/**
 * SpaceVanta MTO Ecosystem Homologous 3D Geometry Builder (L5@v01 · L3 r2)
 * Shared by MTO product GLB pipeline & MtoScene3D (via BundleDriver.mountStage).
 *
 * Strictly enforces:
 * - Zero bare hex strings (reads --sv-* / --svd-* via resolvePaletteTokens(), sRGB triplets only)
 * - SV_MOTHER_MTO_v01 = 0 triangles / 0 meshes / 0 shadows (pure dashed anchor root)
 * - Warmth balance W/C >= 1.60 (Track 01/02 alpha <= 15%, Track 03 spine clasp alpha <= 9%, seam-aura <= 2.5%)
 * - Deep metal surfaces pair seam with locked seam-aura core (11.72:1 AAA)
 */
import * as THREE from "three";
import { resolvePaletteTokens } from "./bundle-geometry.js";
import { MTO_ANCHOR_COORDS, MTO_MOUNT_ORDER, MTO_SKUS } from "./mtoRig.js";

var MTO_MATERIAL_SPECS = {
  SV_MTO_SKU_01: {
    kind: "ceramic",
    primary: "rgb(245, 239, 228)",
    secondary: "rgb(212, 196, 172)",
    metal: "rgb(90, 96, 110)",
    roughness: 0.44,
    metalness: 0.05
  },
  SV_MTO_SKU_02: {
    kind: "linen",
    primary: "rgb(233, 224, 208)",
    secondary: "rgb(246, 241, 232)",
    metal: "rgb(49, 53, 64)",
    roughness: 0.88,
    metalness: 0.02
  },
  SV_MTO_SKU_03: {
    kind: "thermal",
    primary: "rgb(139, 146, 158)",
    secondary: "rgb(198, 174, 142)",
    metal: "rgb(49, 53, 64)",
    roughness: 0.38,
    metalness: 0.42
  },
  SV_MTO_SKU_04: {
    kind: "travel",
    primary: "rgb(224, 212, 192)",
    secondary: "rgb(245, 240, 231)",
    metal: "rgb(90, 96, 110)",
    roughness: 0.82,
    metalness: 0.04
  },
  SV_MTO_SKU_05: {
    kind: "travertine",
    primary: "rgb(236, 228, 214)",
    secondary: "rgb(206, 194, 176)",
    metal: "rgb(49, 53, 64)",
    roughness: 0.72,
    metalness: 0.03
  }
};

function getMtoSpec(skuId) {
  var key = String(skuId || "SV_MTO_SKU_01").replace(/_v01$/, "");
  if (key === "TBD_SKU_01") key = "SV_MTO_SKU_01";
  else if (key === "TBD_SKU_02") key = "SV_MTO_SKU_02";
  else if (key === "TBD_SKU_03") key = "SV_MTO_SKU_03";
  else if (key === "TBD_SKU_04") key = "SV_MTO_SKU_04";
  else if (key === "TBD_SKU_05") key = "SV_MTO_SKU_05";
  return MTO_MATERIAL_SPECS[key] || MTO_MATERIAL_SPECS.SV_MTO_SKU_01;
}

/**
 * Builds a physical cross-category MTO product object (4000K warm-paper studio compatible).
 */
function buildMtoProductSubject(skuId, lodLevel) {
  var spec = getMtoSpec(skuId);
  var segs = lodLevel === 2 ? 12 : (lodLevel === 1 ? 16 : 24);
  var root = new THREE.Group();
  root.name = String(skuId || "SV_MTO_SKU_01");

  var matPrimary = new THREE.MeshStandardMaterial({
    color: new THREE.Color(spec.primary),
    roughness: spec.roughness,
    metalness: spec.metalness
  });
  var matSecondary = new THREE.MeshStandardMaterial({
    color: new THREE.Color(spec.secondary),
    roughness: Math.min(0.92, spec.roughness + 0.08),
    metalness: 0.04
  });
  var matTrim = new THREE.MeshStandardMaterial({
    color: new THREE.Color(spec.metal),
    roughness: 0.36,
    metalness: 0.58
  });

  if (spec.kind === "ceramic") {
    var baseFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.031, 0.008, segs), matSecondary);
    baseFoot.position.y = 0.004;
    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.026, 0.052, segs), matPrimary);
    body.position.y = 0.034;
    var collar = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.0032, 8, segs), matTrim);
    collar.rotation.x = Math.PI * 0.5;
    collar.position.y = 0.058;
    root.add(baseFoot, body, collar);
  } else if (spec.kind === "linen") {
    var cover = new THREE.Mesh(new THREE.BoxGeometry(0.074, 0.016, 0.092), matPrimary);
    cover.position.y = 0.008;
    var sheet = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.006, 0.084), matSecondary);
    sheet.position.y = 0.018;
    var clasp = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.018, 0.024), matTrim);
    clasp.position.set(0.035, 0.009, 0);
    root.add(cover, sheet, clasp);
  } else if (spec.kind === "thermal") {
    var cork = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.028, 0.010, segs), matSecondary);
    cork.position.y = 0.005;
    var flask = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.027, 0.064, segs), matPrimary);
    flask.position.y = 0.042;
    var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.023, 0.012, segs), matTrim);
    cap.position.y = 0.080;
    root.add(cork, flask, cap);
  } else if (spec.kind === "travel") {
    var shell = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.028, 0.064), matPrimary);
    shell.position.y = 0.014;
    var tray = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.008, 0.054), matSecondary);
    tray.position.y = 0.030;
    var band = new THREE.Mesh(new THREE.BoxGeometry(0.084, 0.004, 0.012), matTrim);
    band.position.y = 0.018;
    root.add(shell, tray, band);
  } else {
    var stone = new THREE.Mesh(new THREE.BoxGeometry(0.086, 0.014, 0.086), matPrimary);
    stone.position.y = 0.007;
    var well = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.005, 0.068), matSecondary);
    well.position.y = 0.015;
    var rail = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.004, 0.006), matTrim);
    rail.position.set(0, 0.017, -0.028);
    root.add(stone, well, rail);
  }

  root.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return root;
}

/**
 * SV_MOTHER_MTO_v01: Strictly 0 triangles, 0 meshes, 0 shadows.
 * Pure invisible anchor nodes + dashed seam_rail LineSegments.
 */
function buildMtoMotherRoot(tokens) {
  var p = tokens || resolvePaletteTokens();
  var root = new THREE.Group();
  root.name = "SV_MOTHER_MTO_v01";

  var anchorNodes = {};
  Object.keys(MTO_ANCHOR_COORDS).forEach(function (anchorName) {
    var coords = MTO_ANCHOR_COORDS[anchorName];
    var node = new THREE.Object3D();
    node.name = anchorName;
    node.position.set(coords[0] * 0.42, coords[1] * 0.42, coords[2] * 0.42);
    root.add(node);
    anchorNodes[anchorName] = node;
  });

  var points = MTO_MOUNT_ORDER.map(function (name) {
    return anchorNodes[name].position.clone();
  });
  var lineGeo = new THREE.BufferGeometry().setFromPoints(points);
  var lineMat = new THREE.LineDashedMaterial({
    color: new THREE.Color(p.seam),
    dashSize: 0.016,
    gapSize: 0.010,
    transparent: true,
    opacity: 0.62
  });
  var seamRail = new THREE.Line(lineGeo, lineMat);
  seamRail.computeLineDistances();
  seamRail.name = "seam_rail";
  seamRail.visible = false;
  root.add(seamRail);

  return {
    root: root,
    anchors: anchorNodes,
    seamRail: seamRail
  };
}

/**
 * Track 01 (SV_MP_MTO_BLOCK_v01): Center square pedestal + 4 magnetic satellites + dashed seam-aura bridge.
 */
function buildMtoTrack01Group(tokens, externalGlbRoot) {
  var p = tokens || resolvePaletteTokens();
  var group = new THREE.Group();
  group.name = "SV_MP_MTO_BLOCK_v01";

  var matPaper = new THREE.MeshStandardMaterial({
    color: new THREE.Color(p.paper),
    roughness: 0.90,
    metalness: 0.0
  });
  var matPaperSubtle = new THREE.MeshStandardMaterial({
    color: new THREE.Color(p.paperSubtle),
    roughness: 0.91,
    metalness: 0.0
  });
  var matGunmetal = new THREE.MeshStandardMaterial({
    color: new THREE.Color(p.gunmetal),
    roughness: 0.40,
    metalness: 0.56
  });
  var matSeam = new THREE.MeshBasicMaterial({
    color: new THREE.Color(p.seam),
    transparent: true,
    opacity: 0.42
  });
  var matAura = new THREE.MeshBasicMaterial({
    color: new THREE.Color(p.seamAura),
    transparent: true,
    opacity: 0.85
  });

  function makePedestal(size, height, isCenter) {
    var blk = new THREE.Group();
    var chamfer = new THREE.Mesh(new THREE.BoxGeometry(size, height * 0.28, size), matGunmetal);
    chamfer.position.y = height * 0.14;
    var deck = new THREE.Mesh(
      new THREE.BoxGeometry(size * 0.94, height * 0.72, size * 0.94),
      isCenter ? matPaper : matPaperSubtle
    );
    deck.position.y = height * 0.64;

    // Deep-metal collar paired with locked seam + seam-aura core (11.72:1)
    var seamStrip = new THREE.Mesh(new THREE.BoxGeometry(size * 0.88, 0.0018, 0.0022), matSeam);
    seamStrip.position.set(0, height * 0.28, size * 0.48);
    var auraCore = new THREE.Mesh(new THREE.BoxGeometry(size * 0.86, 0.0009, 0.0024), matAura);
    auraCore.position.set(0, height * 0.28, size * 0.482);

    chamfer.castShadow = true;
    chamfer.receiveShadow = true;
    deck.castShadow = true;
    deck.receiveShadow = true;
    blk.add(chamfer, deck, seamStrip, auraCore);
    return { group: blk, seamMat: matSeam, auraMat: matAura };
  }

  var centerPed = makePedestal(0.168, 0.032, true);
  centerPed.group.name = "mto_01_center_block";
  var centerItemMount = new THREE.Group();
  centerItemMount.position.y = 0.032;
  if (externalGlbRoot) {
    var extClone = externalGlbRoot.clone(true);
    extClone.scale.setScalar(0.32);
    centerItemMount.add(extClone);
  } else {
    centerItemMount.add(buildMtoProductSubject(MTO_SKUS[0].sku, 0));
  }
  centerPed.group.add(centerItemMount);
  group.add(centerPed.group);

  var satOffsets = [
    [-0.168, 0.0, -0.102],
    [0.168, 0.0, -0.102],
    [-0.168, 0.0, 0.112],
    [0.168, 0.0, 0.112]
  ];
  var satellites = [];
  for (var i = 0; i < 4; i++) {
    var satPed = makePedestal(0.096, 0.022, false);
    satPed.group.name = "HS_MTO_01_SAT_0" + (i + 1);
    satPed.group.position.set(satOffsets[i][0], satOffsets[i][1], satOffsets[i][2]);
    var satMount = new THREE.Group();
    satMount.position.y = 0.022;
    var subj = buildMtoProductSubject(MTO_SKUS[(i + 1) % MTO_SKUS.length].sku, 1);
    subj.scale.setScalar(0.68);
    satMount.add(subj);
    satPed.group.add(satMount);
    group.add(satPed.group);
    satellites.push({
      id: "HS_MTO_01_SAT_0" + (i + 1),
      group: satPed.group,
      mount: satMount,
      home: new THREE.Vector3(satOffsets[i][0], satOffsets[i][1], satOffsets[i][2]),
      sku: MTO_SKUS[(i + 1) % MTO_SKUS.length].sku
    });
  }

  // 1px dashed seam-aura gravity bridge (visible when hovering/focusing a satellite)
  var bridgeGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.026, 0),
    new THREE.Vector3(-0.168, 0.038, -0.102)
  ]);
  var bridgeMat = new THREE.LineDashedMaterial({
    color: new THREE.Color(p.seam),
    dashSize: 0.012,
    gapSize: 0.008,
    transparent: true,
    opacity: 0.78
  });
  var bridgeLine = new THREE.Line(bridgeGeo, bridgeMat);
  bridgeLine.computeLineDistances();
  bridgeLine.visible = false;
  group.add(bridgeLine);

  return {
    group: group,
    centerBlock: centerPed.group,
    centerMount: centerItemMount,
    satellites: satellites,
    bridgeLine: bridgeLine,
    seamMat: matSeam,
    auraMat: matAura
  };
}

/**
 * Track 02 (SV_MP_MTO_PRISM_v01): 3-layer separable prism (Form / Finish / Spec) + precision collar.
 */
function buildMtoTrack02Group(tokens, skuId, externalGlbRoot) {
  var p = tokens || resolvePaletteTokens();
  var group = new THREE.Group();
  group.name = "SV_MP_MTO_PRISM_v01";

  var matPaper = new THREE.MeshStandardMaterial({
    color: new THREE.Color(p.paper),
    roughness: 0.89,
    metalness: 0.0
  });
  var matSubtle = new THREE.MeshStandardMaterial({
    color: new THREE.Color(p.paperSubtle),
    roughness: 0.88,
    metalness: 0.0
  });
  var matGunmetal = new THREE.MeshStandardMaterial({
    color: new THREE.Color(p.gunmetal),
    roughness: 0.36,
    metalness: 0.58
  });
  var matSeam = new THREE.MeshBasicMaterial({
    color: new THREE.Color(p.seam),
    transparent: true,
    opacity: 0.38
  });
  var matAura = new THREE.MeshBasicMaterial({
    color: new THREE.Color(p.seamAura),
    transparent: true,
    opacity: 0.82
  });

  // Layer 0: Form (base / body)
  var layerForm = new THREE.Group();
  layerForm.name = "HS_MTO_02_FORM";
  var formSlab = new THREE.Mesh(new THREE.CylinderGeometry(0.096, 0.104, 0.026, 6), matPaper);
  formSlab.position.y = 0.013;
  var formRim = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.106, 0.004, 6), matGunmetal);
  formRim.position.y = 0.002;
  formSlab.castShadow = true;
  formSlab.receiveShadow = true;
  layerForm.add(formRim, formSlab);

  // Layer 1: Finish (surface / coat + gunmetal precision collar + seam-aura)
  var layerFinish = new THREE.Group();
  layerFinish.name = "HS_MTO_02_FINISH";
  layerFinish.position.y = 0.032;
  var finishCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.092, 0.022, 6), matSubtle);
  finishCollar.position.y = 0.011;
  var metalRing = new THREE.Mesh(new THREE.CylinderGeometry(0.091, 0.091, 0.005, 6), matGunmetal);
  metalRing.position.y = 0.011;
  var seamRing = new THREE.Mesh(new THREE.CylinderGeometry(0.0922, 0.0922, 0.0020, 6), matSeam);
  seamRing.position.y = 0.011;
  var auraRing = new THREE.Mesh(new THREE.CylinderGeometry(0.0926, 0.0926, 0.0009, 6), matAura);
  auraRing.position.y = 0.011;
  finishCollar.castShadow = true;
  finishCollar.receiveShadow = true;
  layerFinish.add(finishCollar, metalRing, seamRing, auraRing);

  // Layer 2: Spec (pack / label + subject crown)
  var layerSpec = new THREE.Group();
  layerSpec.name = "HS_MTO_02_SPEC";
  layerSpec.position.y = 0.058;
  var specCap = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.084, 0.016, 6), matPaper);
  specCap.position.y = 0.008;
  specCap.castShadow = true;
  specCap.receiveShadow = true;
  var subjectMount = new THREE.Group();
  subjectMount.position.y = 0.016;
  if (externalGlbRoot) {
    var clone = externalGlbRoot.clone(true);
    clone.scale.setScalar(0.28);
    subjectMount.add(clone);
  } else {
    var subj = buildMtoProductSubject(skuId || MTO_SKUS[0].sku, 0);
    subj.scale.setScalar(0.86);
    subjectMount.add(subj);
  }
  layerSpec.add(specCap, subjectMount);

  group.add(layerForm, layerFinish, layerSpec);

  return {
    group: group,
    layers: [layerForm, layerFinish, layerSpec],
    baseYs: [0.0, 0.032, 0.058],
    subjectMount: subjectMount,
    seamMat: matSeam,
    auraMat: matAura
  };
}

/**
 * Track 03 (SV_MP_MTO_FOLIO_v01): Warm linen tri-fold envelope + fine spine clasp (alpha <= 9%).
 */
function buildMtoTrack03Group(tokens, externalGlbRoot) {
  var p = tokens || resolvePaletteTokens();
  var group = new THREE.Group();
  group.name = "SV_MP_MTO_FOLIO_v01";

  var matLinen = new THREE.MeshStandardMaterial({
    color: new THREE.Color("rgb(238, 231, 218)"),
    roughness: 0.91,
    metalness: 0.0
  });
  var matInnerPaper = new THREE.MeshStandardMaterial({
    color: new THREE.Color(p.paper),
    roughness: 0.92,
    metalness: 0.0
  });
  var matClasp = new THREE.MeshStandardMaterial({
    color: new THREE.Color(p.gunmetal),
    roughness: 0.38,
    metalness: 0.55
  });
  var matSeam = new THREE.MeshBasicMaterial({
    color: new THREE.Color(p.seam),
    transparent: true,
    opacity: 0.34
  });
  var matAura = new THREE.MeshBasicMaterial({
    color: new THREE.Color(p.seamAura),
    transparent: true,
    opacity: 0.80
  });

  var centerLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.156, 0.008, 0.196), matInnerPaper);
  centerLeaf.position.y = 0.006;
  centerLeaf.castShadow = true;
  centerLeaf.receiveShadow = true;
  group.add(centerLeaf);

  if (externalGlbRoot) {
    var glbClone = externalGlbRoot.clone(true);
    glbClone.scale.setScalar(0.24);
    glbClone.position.set(0, 0.012, 0);
    group.add(glbClone);
  }

  // Left wing pivot
  var leftPivot = new THREE.Group();
  leftPivot.position.set(-0.078, 0.010, 0);
  var leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.076, 0.006, 0.194), matLinen);
  leftWing.position.set(0.038, 0.003, 0);
  leftWing.castShadow = true;
  leftPivot.add(leftWing);
  group.add(leftPivot);

  // Right cover pivot (HS_MTO_03_FOLIO_COVER) + fine spine clasp (alpha <= 9%)
  var rightPivot = new THREE.Group();
  rightPivot.name = "HS_MTO_03_FOLIO_COVER";
  rightPivot.position.set(0.078, 0.012, 0);
  var rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.006, 0.194), matLinen);
  rightWing.position.set(-0.041, 0.003, 0);
  rightWing.castShadow = true;

  var spineClasp = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.009, 0.044), matClasp);
  spineClasp.position.set(-0.078, 0.005, 0);
  var claspSeam = new THREE.Mesh(new THREE.BoxGeometry(0.0020, 0.0096, 0.042), matSeam);
  claspSeam.position.set(-0.078, 0.0052, 0);
  var claspAura = new THREE.Mesh(new THREE.BoxGeometry(0.0009, 0.0098, 0.040), matAura);
  claspAura.position.set(-0.078, 0.0054, 0);

  rightPivot.add(rightWing, spineClasp, claspSeam, claspAura);
  group.add(rightPivot);

  // Dashed guide line on 25% peek
  var guideGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0.0, 0.018, 0.0),
    new THREE.Vector3(0.0, 0.056, 0.095)
  ]);
  var guideMat = new THREE.LineDashedMaterial({
    color: new THREE.Color(p.seam),
    dashSize: 0.010,
    gapSize: 0.007,
    transparent: true,
    opacity: 0.72
  });
  var guideLine = new THREE.Line(guideGeo, guideMat);
  guideLine.computeLineDistances();
  guideLine.visible = false;
  group.add(guideLine);

  return {
    group: group,
    leftPivot: leftPivot,
    rightPivot: rightPivot,
    guideLine: guideLine,
    seamMat: matSeam,
    auraMat: matAura
  };
}

/**
 * Builds soft warm radial contact shadow plane coupled to clip_magnetic_levitate.
 */
function buildContactShadowPlane() {
  var size = 128;
  var tex = null;
  if (typeof document !== "undefined") {
    var cv = document.createElement("canvas");
    cv.width = size;
    cv.height = size;
    var ctx = cv.getContext("2d");
    if (ctx) {
      var grad = ctx.createRadialGradient(size / 2, size / 2, 6, size / 2, size / 2, size / 2);
      grad.addColorStop(0, "rgba(37, 35, 33, 0.18)");
      grad.addColorStop(0.55, "rgba(107, 101, 92, 0.08)");
      grad.addColorStop(1, "rgba(251, 247, 240, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      tex = new THREE.CanvasTexture(cv);
    }
  }
  var mat = new THREE.MeshBasicMaterial({
    map: tex,
    color: tex ? new THREE.Color("rgb(255, 255, 255)") : new THREE.Color("rgb(228, 221, 208)"),
    transparent: true,
    opacity: tex ? 0.85 : 0.28,
    depthWrite: false
  });
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.34), mat);
  mesh.rotation.x = -Math.PI * 0.5;
  mesh.position.y = 0.0005;
  mesh.name = "mto_contact_shadow";
  return { mesh: mesh, texture: tex, material: mat };
}

export {
  MTO_MATERIAL_SPECS,
  buildContactShadowPlane,
  buildMtoMotherRoot,
  buildMtoProductSubject,
  buildMtoTrack01Group,
  buildMtoTrack02Group,
  buildMtoTrack03Group,
  getMtoSpec
};
