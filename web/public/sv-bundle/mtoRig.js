/**
 * SpaceVanta MTO Ecosystem Frozen Rig, Hotspots, C1 Clips & Camera Presets
 * Authority: L5_mto_ecosystem_v01_手册.md §2 / §4 / §5 / §6 (L5@v01 · L3 r2 aligned)
 * Zero bare hex values. SV_MOTHER_MTO_v01 = 0 triangles / 0 materials / 0 shadows / 0 GLB.
 */

var MTO_MOTHER_ID = "SV_MOTHER_MTO_v01";
var MTO_ANCHORS = ["anchor_form", "anchor_finish", "anchor_spec"];
var MTO_MOUNT_ORDER = ["anchor_form", "anchor_finish", "anchor_spec", "anchor_form"];

var MTO_ALLOWED_SLOTS = {
  anchor_form: ["base", "body"],
  anchor_finish: ["surface", "coat"],
  anchor_spec: ["pack", "label"]
};

var MTO_ANCHOR_COORDS = {
  anchor_form: [0.0, 0.05, 0.35],
  anchor_finish: [-0.35, 0.22, 0.0],
  anchor_spec: [0.35, 0.28, 0.0]
};

var MTO_ANCHOR_LABELS = {
  anchor_form: "Form layer — base & silhouette proportion",
  anchor_finish: "Finish layer — tactile surface & coat",
  anchor_spec: "Spec layer — modular fit & inscription"
};

var MTO_SNAP = { deg: 6, mm: 3 };

var MTO_SEAM_RAIL = {
  id: "seam_rail",
  path: ["anchor_form", "anchor_finish", "anchor_spec", "anchor_form"],
  maxPx: 2,
  auraRequiredOnDeepMetal: true
};

/* Cross-category 5 MTO SKUs (4000K warm-paper studio aesthetic, zero commercial prices) */
var MTO_SKUS = [
  {
    sku: "SV_MTO_SKU_01",
    legacyHandle: "TBD_SKU_01",
    poolId: "mto_pool_ceramic_01",
    category: "Ceramic",
    title: "Ceramic Pour-Over Vessel",
    subtitle: "Warm cream stoneware silhouette with brushed collar",
    defaultForm: "base_fluted",
    defaultFinish: "surface_warm_glaze",
    defaultSpec: "pack_single_box"
  },
  {
    sku: "SV_MTO_SKU_02",
    legacyHandle: "TBD_SKU_02",
    poolId: "mto_pool_linen_02",
    category: "Linen",
    title: "Woven Linen Desk Folio",
    subtitle: "Oatmeal bookcloth tri-fold with gunmetal spine clasp",
    defaultForm: "body_slim_a5",
    defaultFinish: "coat_raw_linen",
    defaultSpec: "label_blind_deboss"
  },
  {
    sku: "SV_MTO_SKU_03",
    legacyHandle: "TBD_SKU_03",
    poolId: "mto_pool_thermal_03",
    category: "Thermal",
    title: "Brushed Thermal Carafe",
    subtitle: "Double-wall satin slate vessel with warm cork base",
    defaultForm: "body_tapered",
    defaultFinish: "surface_satin_slate",
    defaultSpec: "pack_gift_sleeve"
  },
  {
    sku: "SV_MTO_SKU_04",
    legacyHandle: "TBD_SKU_04",
    poolId: "mto_pool_travel_04",
    category: "Travel",
    title: "Modular Travel Organizer",
    subtitle: "Structured warm canvas shell with removable divider",
    defaultForm: "base_compact_tray",
    defaultFinish: "coat_waxed_canvas",
    defaultSpec: "label_monogram_tag"
  },
  {
    sku: "SV_MTO_SKU_05",
    legacyHandle: "TBD_SKU_05",
    poolId: "mto_pool_travertine_05",
    category: "Travertine",
    title: "Honed Travertine Valet Tray",
    subtitle: "Natural warm stone catchall with recessed metal rail",
    defaultForm: "base_chamfer_ plinth",
    defaultFinish: "surface_honed_stone",
    defaultSpec: "pack_linen_wrap"
  }
];

/* L5@v01 §4.1 & §6: r2 Hotspot Registry (single screen <= 5 desktop / <= 3 mobile) */
var MTO_HOTSPOTS = {
  track_01: [
    { id: "HS_MTO_01_SAT_01", satIndex: 0, liftPx: 14, magnetDeg: 4, magnetPx: 6 },
    { id: "HS_MTO_01_SAT_02", satIndex: 1, liftPx: 14, magnetDeg: 4, magnetPx: 6 },
    { id: "HS_MTO_01_SAT_03", satIndex: 2, liftPx: 14, magnetDeg: 4, magnetPx: 6 },
    { id: "HS_MTO_01_SAT_04", satIndex: 3, liftPx: 14, magnetDeg: 4, magnetPx: 6 }
  ],
  track_02: [
    { id: "HS_MTO_02_FORM", anchor: "anchor_form", layerIndex: 0, liftPx: 12, neighborDampPx: 3.5 },
    { id: "HS_MTO_02_FINISH", anchor: "anchor_finish", layerIndex: 1, liftPx: 12, neighborDampPx: 3.5 },
    { id: "HS_MTO_02_SPEC", anchor: "anchor_spec", layerIndex: 2, liftPx: 12, neighborDampPx: 3.5 }
  ],
  track_03: [
    { id: "HS_MTO_03_FOLIO_COVER", peekOpenPct: 0.25 }
  ]
};

/* L5@v01 §4 & §6: 6 C1 Triggered Clips (including v02 clip_submit_in_place_ack) */
var MTO_C1_CLIPS = {
  clip_track_morph: {
    id: "clip_track_morph",
    tier: "C1",
    loop: false,
    durationMs: 360,
    reducedMotionMs: 0
  },
  clip_sat_arc_swap: {
    id: "clip_sat_arc_swap",
    tier: "C1",
    loop: false,
    durationMs: 320,
    reducedMotionMs: 0
  },
  clip_magnetic_levitate: {
    id: "clip_magnetic_levitate",
    tier: "C1",
    loop: "micro_breath",
    periodMs: 4200,
    ampPx: 2.5,
    shadowRadiusDeltaPct: 3,
    shadowOpacityDeltaPct: -6,
    disablePointerParallaxOnMobile: true,
    reducedMotionMs: 0
  },
  clip_layer_part: {
    id: "clip_layer_part",
    tier: "C1",
    loop: false,
    durationMs: 260,
    targetLiftPx: 12,
    neighborDampPx: 3.5,
    reducedMotionMs: 0
  },
  clip_folio_unfold: {
    id: "clip_folio_unfold",
    tier: "C1",
    loop: false,
    durationMs: 320,
    reducedMotionMs: 0
  },
  clip_submit_in_place_ack: {
    id: "clip_submit_in_place_ack",
    tier: "C1",
    loop: false,
    durationMs: 420,
    reducedMotionMs: 0,
    zeroScroll: true,
    zeroJump: true,
    zeroCollapse: true,
    track02: { betaPeak: 0.45, auraPct: 2.4, wcMin: 2.35 },
    track03: { betaPeak: 0.42, auraPct: 1.8, wcMin: 2.90 }
  }
};

var MTO_CAMERA_PRESETS = {
  track_01: {
    desktop: { position: [0.0, 0.36, 0.56], target: [0.0, 0.04, 0.0], fov: 34 },
    mobile: { position: [0.0, 0.42, 0.66], target: [0.0, 0.04, 0.0], fov: 38 },
    easeMs: 360
  },
  track_02: {
    desktop: { position: [0.34, 0.30, 0.46], target: [0.0, 0.08, 0.0], fov: 34 },
    mobile: { position: [0.38, 0.34, 0.54], target: [0.0, 0.08, 0.0], fov: 38 },
    easeMs: 360
  },
  track_03: {
    desktop: { position: [0.0, 0.38, 0.52], target: [0.0, 0.03, 0.0], fov: 33 },
    mobile: { position: [0.0, 0.44, 0.62], target: [0.0, 0.03, 0.0], fov: 37 },
    easeMs: 360
  }
};

/* AGENT_ASSET_REGISTRY_mto.md §2: Reserved G-1/G-2 Read-Only Invocation Events */
var MTO_AGENT_EVENTS = {
  focusSatellite: "sv:mto:01:focusSatellite",
  swapCenter: "sv:mto:01:swapCenter",
  highlightAnchor: "sv:mto:mother:highlightAnchor",
  openAnchor: "sv:mto:02:openAnchor",
  ackSubmit02: "sv:mto:02:ackSubmit",
  unfoldFolio: "sv:mto:03:unfoldFolio",
  ackSubmit03: "sv:mto:03:ackSubmit",
  coldPromotePreview: "sv:mto:cold:promotePreview",
  whisperAnnounce: "sv:mto:whisper:announce"
};

var MTO_HANDOFF_FROZEN_KEYS = ["track", "sku", "pool", "form", "finish", "spec", "note"];

var MTO_MOTHER_RIG = {
  motherId: MTO_MOTHER_ID,
  anchors: MTO_ANCHORS,
  anchorCoords: MTO_ANCHOR_COORDS,
  mountOrder: MTO_MOUNT_ORDER,
  allowedSlots: MTO_ALLOWED_SLOTS,
  labels: MTO_ANCHOR_LABELS,
  snap: MTO_SNAP,
  seamRail: MTO_SEAM_RAIL,
  skus: MTO_SKUS,
  hotspots: MTO_HOTSPOTS,
  clips: MTO_C1_CLIPS,
  cameras: MTO_CAMERA_PRESETS,
  agentEvents: MTO_AGENT_EVENTS,
  handoffKeys: MTO_HANDOFF_FROZEN_KEYS,
  visible: false,
  motherRootBudget: { triangles: 0, materials: 0, shadows: 0, glb: 0 }
};

function getMtoCameraPreset(trackName, isMobile) {
  var key = trackName === "02" || trackName === "track_02"
    ? "track_02"
    : (trackName === "03" || trackName === "track_03" ? "track_03" : "track_01");
  var entry = MTO_CAMERA_PRESETS[key] || MTO_CAMERA_PRESETS.track_01;
  return isMobile ? entry.mobile : entry.desktop;
}

function findMtoSku(skuOrHandle) {
  if (!skuOrHandle) return MTO_SKUS[0];
  var target = String(skuOrHandle).trim();
  for (var i = 0; i < MTO_SKUS.length; i++) {
    if (MTO_SKUS[i].sku === target || MTO_SKUS[i].legacyHandle === target || MTO_SKUS[i].poolId === target) {
      return MTO_SKUS[i];
    }
  }
  return MTO_SKUS[0];
}

export {
  MTO_AGENT_EVENTS,
  MTO_ALLOWED_SLOTS,
  MTO_ANCHORS,
  MTO_ANCHOR_COORDS,
  MTO_ANCHOR_LABELS,
  MTO_C1_CLIPS,
  MTO_CAMERA_PRESETS,
  MTO_HANDOFF_FROZEN_KEYS,
  MTO_HOTSPOTS,
  MTO_MOTHER_ID,
  MTO_MOTHER_RIG,
  MTO_MOUNT_ORDER,
  MTO_SEAM_RAIL,
  MTO_SKUS,
  MTO_SNAP,
  findMtoSku,
  getMtoCameraPreset
};
