/**
 * SpaceVanta Bundle Mother Rig, Frozen Dimensions, Hotspots, C1 Clips & Camera Presets
 * Authority: L5_bundle_v02_手册.md §6 / §6.1 / §6.2 / §6.3 (L5@v02 · L3 r2 aligned)
 * Zero bare hex values. Zero Rotor on anchor_B. Mother = 0 triangles / 0 materials / 0 shadows.
 */

var MOTHER_ID = "Bundle_MOTHER";
var MOTHER_ANCHORS = ["anchor_A", "anchor_B", "anchor_C"];
var MOUNT_ORDER = ["anchor_A", "anchor_B", "anchor_C", "anchor_A"];

var ALLOWED_SLOTS = {
  anchor_A: ["lid", "base"],
  anchor_B: ["ring"],
  anchor_C: ["lid", "base", "ring"]
};

var ANCHOR_COORDS = {
  anchor_A: [0.0, 0.036, -0.105],
  anchor_B: [-0.124, 0.022, 0.082],
  anchor_C: [0.124, 0.010, 0.082]
};

var ANCHOR_LABELS = {
  anchor_A: "Rear Hinge Pivot + Slate Lid & Bright SV Socket",
  anchor_B: "6-Bay Divider Rim & Warm Paper Liner Collar",
  anchor_C: "Gunmetal Tray Base + Ecosystem Slot Mount"
};

var SNAP = { deg: 6, mm: 3 };

var SEAM_RAIL = {
  id: "seam_rail",
  path: ["anchor_A", "anchor_B", "anchor_C", "anchor_A"],
  maxPx: 2,
  auraRequiredOnDeepMetal: true
};

/* L5@v02 §6.1: Frozen Tray & Plinth-Free 78x72mm SV Crest Geometry Table */
var LID_SV_LOCK = {
  trayOuterW: 0.280,
  trayOuterD: 0.210,
  trayOuterH: 0.036,
  trayInnerW: 0.264,
  trayInnerD: 0.194,
  lidHingePivot: [0.0, 0.036, -0.105],
  lidThickness: 0.0062,
  lidTopLocalY: 0.0062,
  plinth: false,
  svBboxMm: { width: 78, height: 72, aspect: 1.083 },
  sLetterMm: { height: 72, width: 49, bodyThick: 3.6, ridgeThick: 4.0 },
  vLetterMm: { height: 30, width: 32, bodyThick: 2.6 },
  marginsMm: { topBottom: 69, leftRight: 101, minRequired: 36 },
  seamWidthsMm: {
    sFractureGap: 2.5,
    svSeparationGap: 3.2,
    seamBlue: 1.35,
    seamAuraCore: 0.60,
    seamMidHalo: 0.85
  },
  closedDeg: 0,
  peekDeg: 12,
  openDeg: 72
};

/* L5@v02 §6.2: 2 Core Hotspot Groups (ecosystem <=5 desktop / <=3 mobile) */
var HOTSPOT_GROUPS = [
  {
    id: "HS_BAY_GRID",
    group: "slot_grid",
    cameraPreset: "bay_grid",
    anchorLocal: [0.0, 0.024, 0.010],
    subTargets: ["bay_1", "bay_2", "bay_3", "bay_4", "bay_5", "bay_6"],
    requiredLidDeg: 72,
    labelKey: "bundle.hotspot.bay_grid_title",
    descKey: "bundle.hotspot.bay_grid_desc"
  },
  {
    id: "HS_SV_CREST",
    group: "brand_crest",
    cameraPreset: "sv_crest",
    anchorLocal: [0.0, 0.045, 0.000],
    subTargets: [],
    requiredLidDeg: 0,
    labelKey: "bundle.hotspot.sv_crest_title",
    descKey: "bundle.hotspot.sv_crest_desc"
  }
];

/* L5@v02 §6.2: 4 C1 Triggered Clips (non-looping, 0 particles, anti-interpenetration auto-open) */
var C1_CLIPS = {
  clip_lid_toggle: {
    id: "clip_lid_toggle",
    tier: "C1",
    durationMs: 400,
    loop: false,
    reducedMotionMs: 0,
    anglesDeg: [0, 12, 72]
  },
  clip_slot_add: {
    id: "clip_slot_add",
    tier: "C1",
    durationMs: 280,
    loop: false,
    reducedMotionMs: 0,
    requiresOpenLidDeg: 72
  },
  clip_slot_swap: {
    id: "clip_slot_swap",
    tier: "C1",
    durationMs: 320,
    loop: false,
    reducedMotionMs: 0,
    requiresOpenLidDeg: 72
  },
  clip_slot_remove: {
    id: "clip_slot_remove",
    tier: "C1",
    durationMs: 220,
    loop: false,
    reducedMotionMs: 0,
    requiresOpenLidDeg: 72
  }
};

/* L5@v02 §6.3: Frozen Dual-End Camera Coordinates (Origin Bundle_MOTHER [0,0,0]) */
var CAMERA_PRESETS = {
  tray_view: {
    desktop: { position: [0.33, 0.30, 0.37], target: [0.0, 0.026, -0.008], fov: 34 },
    mobile: { position: [0.38, 0.34, 0.43], target: [0.0, 0.026, -0.008], fov: 38 },
    easeMs: 380
  },
  sv_crest: {
    desktop: { position: [0.045, 0.245, 0.085], target: [0.0, 0.043, 0.000], fov: 28 },
    mobile: { position: [0.050, 0.275, 0.095], target: [0.0, 0.043, 0.000], fov: 30 },
    easeMs: 380
  },
  bay_grid: {
    desktop: { position: [0.18, 0.34, 0.24], target: [0.0, 0.018, 0.010], fov: 32 },
    mobile: { position: [0.22, 0.38, 0.28], target: [0.0, 0.018, 0.010], fov: 36 },
    easeMs: 380
  }
};

var BUNDLE_MOTHER_RIG = {
  motherId: MOTHER_ID,
  anchors: MOTHER_ANCHORS,
  anchorCoords: ANCHOR_COORDS,
  mountOrder: MOUNT_ORDER,
  allowedSlots: ALLOWED_SLOTS,
  labels: ANCHOR_LABELS,
  snap: SNAP,
  seamRail: SEAM_RAIL,
  lidSvLock: LID_SV_LOCK,
  hotspotMin: 2,
  hotspots: HOTSPOT_GROUPS,
  clips: C1_CLIPS,
  cameras: CAMERA_PRESETS,
  visible: false,
  motherRootBudget: { triangles: 0, materials: 0, shadows: 0 }
};

function isSlotAllowed(anchor, slot) {
  return Boolean(ALLOWED_SLOTS[anchor] && ALLOWED_SLOTS[anchor].includes(slot));
}

function getCameraPreset(presetName, isMobile) {
  var entry = CAMERA_PRESETS[presetName] || CAMERA_PRESETS.tray_view;
  return isMobile ? entry.mobile : entry.desktop;
}

export {
  ALLOWED_SLOTS,
  ANCHOR_COORDS,
  ANCHOR_LABELS,
  BUNDLE_MOTHER_RIG,
  C1_CLIPS,
  CAMERA_PRESETS,
  HOTSPOT_GROUPS,
  LID_SV_LOCK,
  MOTHER_ANCHORS,
  MOTHER_ID,
  MOUNT_ORDER,
  SEAM_RAIL,
  SNAP,
  getCameraPreset,
  isSlotAllowed
};
