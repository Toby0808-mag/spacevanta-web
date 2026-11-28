/**
 * SpaceVanta Homologous Single-Source 3D Geometry Builder (L5@v02 · L3 r2)
 * Shared by Child_Tray.glb / SV_MP_SKU_01..09_v01.glb build pipeline & L1/V-P5 procedural fallback.
 *
 * Strictly enforces:
 * - L5@v02 §3.3 Four-layer rich non-black palette:
 *   1) 5-step brushed metal shell (metal-recess -> gunmetal -> slate -> steel -> pewter)
 *   2) Dual-step warm paper inner cavity & lid inner liner (paper / paper-subtle, roughness 0.88-0.94)
 *   3) Plinth-free 78x72mm bright silver origami SV crest (specular + terminal 18% silver chamfer,
 *      physically isolated from seam-aura; 1.35mm seam blue + 0.60mm locked seam-aura core ONLY in fractures)
 *   4) 9 M-Proto natural physical product materials (cotton white chocolate box, matte matcha pouch,
 *      roasted cocoa gift tin, warm cream ceramic cup w/ champagne ring, oat tea caddy, praline box, etc.)
 * - L5@v02 §6.1 Zero interpenetration: bbox.min.y === 0 at local Y = +0.0062m on lidPivot, pivot [0, 0.036, -0.105].
 * - Zero bare hex strings (reads --svd-* / --sv-* via getComputedStyle with PALETTE sRGB triplets, never black).
 */
import * as THREE from "three";
import { ANCHOR_COORDS, LID_SV_LOCK } from "./motherRig.js";

var PALETTE_FALLBACK = {
  paper: "rgb(251, 247, 240)",
  paperSubtle: "rgb(243, 239, 232)",
  ink: "rgb(37, 35, 33)",
  inkSoft: "rgb(107, 101, 92)",
  line: "rgb(228, 221, 208)",
  metalRecess: "rgb(31, 34, 42)",
  gunmetal: "rgb(49, 53, 64)",
  slate: "rgb(90, 96, 110)",
  steel: "rgb(139, 146, 158)",
  pewter: "rgb(183, 188, 196)",
  silver: "rgb(219, 217, 218)",
  specular: "rgb(242, 241, 240)",
  seamDeep: "rgb(21, 75, 184)",
  seam: "rgb(29, 107, 255)",
  seamMid: "rgb(125, 173, 222)",
  seamAura: "rgb(229, 255, 255)"
};

/* Layer 4: Natural physical M-Proto product palette (L5@v02 §3.3 — restrained material colors, 0 black blocks) */
var MPROTO_SPECS = {
  SV_MP_SKU_01_v01: {
    kind: "coffret",
    body: "rgb(248, 245, 239)",
    accent: "rgb(112, 82, 62)",
    trim: "rgb(198, 172, 122)",
    roughness: 0.84,
    metalness: 0.02
  },
  SV_MP_SKU_02_v01: {
    kind: "pouch",
    body: "rgb(118, 138, 108)",
    accent: "rgb(245, 239, 228)",
    trim: "rgb(94, 112, 86)",
    roughness: 0.86,
    metalness: 0.02
  },
  SV_MP_SKU_03_v01: {
    kind: "cocoa_tin",
    body: "rgb(106, 76, 58)",
    accent: "rgb(196, 169, 120)",
    trim: "rgb(243, 237, 226)",
    roughness: 0.56,
    metalness: 0.18
  },
  SV_MP_SKU_04_v01: {
    kind: "ceramic_cup",
    body: "rgb(242, 235, 222)",
    accent: "rgb(201, 174, 124)",
    trim: "rgb(92, 68, 52)",
    roughness: 0.42,
    metalness: 0.06
  },
  SV_MP_SKU_05_v01: {
    kind: "tea_caddy",
    body: "rgb(226, 215, 197)",
    accent: "rgb(183, 188, 196)",
    trim: "rgb(122, 108, 92)",
    roughness: 0.64,
    metalness: 0.14
  },
  SV_MP_SKU_06_v01: {
    kind: "praline_box",
    body: "rgb(168, 132, 98)",
    accent: "rgb(250, 246, 238)",
    trim: "rgb(116, 84, 60)",
    roughness: 0.78,
    metalness: 0.04
  },
  SV_MP_SKU_07_v01: {
    kind: "porcelain_vessel",
    body: "rgb(246, 241, 232)",
    accent: "rgb(199, 173, 126)",
    trim: "rgb(142, 128, 112)",
    roughness: 0.38,
    metalness: 0.08
  },
  SV_MP_SKU_08_v01: {
    kind: "drip_folio",
    body: "rgb(214, 199, 176)",
    accent: "rgb(88, 66, 52)",
    trim: "rgb(248, 244, 236)",
    roughness: 0.82,
    metalness: 0.02
  },
  SV_MP_SKU_09_v01: {
    kind: "brass_scoop",
    body: "rgb(243, 239, 232)",
    accent: "rgb(194, 168, 122)",
    trim: "rgb(126, 104, 74)",
    roughness: 0.36,
    metalness: 0.52
  }
};

function readToken(names, fallback) {
  if (typeof document !== "undefined" && document.documentElement) {
    var cs = getComputedStyle(document.documentElement);
    for (var i = 0; i < names.length; i++) {
      var val = cs.getPropertyValue(names[i]).trim();
      if (val && val !== "rgb(0, 0, 0)") return val;
    }
  }
  return fallback;
}

function resolvePaletteTokens() {
  return {
    paper: readToken(["--svd-paper", "--sv-paper"], PALETTE_FALLBACK.paper),
    paperSubtle: readToken(["--svd-paper-2", "--sv-paper-subtle"], PALETTE_FALLBACK.paperSubtle),
    ink: readToken(["--svd-ink", "--sv-ink"], PALETTE_FALLBACK.ink),
    inkSoft: readToken(["--svd-ink-soft", "--sv-ink-soft"], PALETTE_FALLBACK.inkSoft),
    line: readToken(["--svd-line", "--sv-line"], PALETTE_FALLBACK.line),
    metalRecess: readToken(["--svd-metal-recess", "--sv-metal-recess"], PALETTE_FALLBACK.metalRecess),
    gunmetal: readToken(["--svd-gunmetal", "--sv-gunmetal"], PALETTE_FALLBACK.gunmetal),
    slate: readToken(["--svd-slate", "--sv-slate"], PALETTE_FALLBACK.slate),
    steel: readToken(["--svd-steel", "--sv-steel"], PALETTE_FALLBACK.steel),
    pewter: readToken(["--svd-pewter", "--sv-pewter"], PALETTE_FALLBACK.pewter),
    silver: readToken(["--svd-silver", "--sv-silver"], PALETTE_FALLBACK.silver),
    specular: readToken(["--svd-specular", "--sv-specular"], PALETTE_FALLBACK.specular),
    seamDeep: readToken(["--svd-seam-deep", "--sv-seam-deep"], PALETTE_FALLBACK.seamDeep),
    seam: readToken(["--sv-seam", "--svd-seam"], PALETTE_FALLBACK.seam),
    seamMid: readToken(["--svd-seam-mid", "--sv-seam-mid"], PALETTE_FALLBACK.seamMid),
    seamAura: PALETTE_FALLBACK.seamAura
  };
}

function brushedMetalMat(colorStr, metalness, roughness, name) {
  var mat = new THREE.MeshStandardMaterial({
    name: name || "sv_metal",
    color: new THREE.Color(colorStr),
    metalness: metalness,
    roughness: roughness
  });
  return mat;
}

function warmPaperMat(colorStr, roughness, name) {
  return new THREE.MeshStandardMaterial({
    name: name || "sv_warm_paper",
    color: new THREE.Color(colorStr),
    metalness: 0.0,
    roughness: roughness
  });
}

/**
 * Builds a closed watertight origami prism whose bottom vertices strictly sit at y = 0
 * (`bbox.min.y === 0.0000`), ensuring 0 interpenetration & 0 floating on the lid surface.
 * Polygon points are [x, z] in counter-clockwise order when viewed from +Y.
 */
function createOrigamiPrismGeometry(ptsXZ, heights) {
  var n = ptsXZ.length;
  var positions = [];
  var indices = [];

  // Bottom vertices: 0 .. n-1 (y = 0)
  for (var i = 0; i < n; i++) {
    positions.push(ptsXZ[i][0], 0.0, ptsXZ[i][1]);
  }
  // Top vertices: n .. 2n-1 (y = heights[i])
  for (var j = 0; j < n; j++) {
    var h = Array.isArray(heights) ? heights[j] : heights;
    positions.push(ptsXZ[j][0], h, ptsXZ[j][1]);
  }

  // Top face fan (facing +Y)
  for (var t = 1; t < n - 1; t++) {
    indices.push(n, n + t + 1, n + t);
  }
  // Bottom face fan (facing -Y)
  for (var b = 1; b < n - 1; b++) {
    indices.push(0, b, b + 1);
  }
  // Side quads
  for (var s = 0; s < n; s++) {
    var next = (s + 1) % n;
    var b0 = s;
    var b1 = next;
    var t0 = n + s;
    var t1 = n + next;
    indices.push(b0, t0, t1);
    indices.push(b0, t1, b1);
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  var nonIndexed = geo.toNonIndexed();
  geo.dispose();
  nonIndexed.computeVertexNormals();
  nonIndexed.computeBoundingBox();
  return nonIndexed;
}

/**
 * Builds a fracture seam strip embedded strictly inside an origami fracture channel:
 * - Dark recessed channel bed (--sv-metal-recess)
 * - Soft falloff strip (--sv-seam-mid, <= 0.85mm)
 * - Seam blue bar (--sv-seam, 1.35mm)
 * - Locked inner light core (--sv-seam-aura seam-aura, 0.60mm, AAA 11.72:1 on deep metal)
 * Zero full-logo outline, zero contact with --sv-silver.
 */
function buildFractureSeamSegment(name, x1, z1, x2, z2, p) {
  var g = new THREE.Group();
  g.name = name;
  var dx = x2 - x1;
  var dz = z2 - z1;
  var len = Math.sqrt(dx * dx + dz * dz);
  var angle = Math.atan2(dx, dz);
  g.position.set((x1 + x2) * 0.5, 0.0, (z1 + z2) * 0.5);
  g.rotation.y = angle;

  // 1) Fracture shadow recess floor (2.4mm wide, y = 0..0.00025m)
  var recessGeo = new THREE.BoxGeometry(0.0024, 0.00025, len);
  recessGeo.translate(0, 0.000125, 0);
  var recessMesh = new THREE.Mesh(recessGeo, brushedMetalMat(p.metalRecess, 0.55, 0.44, name + "_recess"));
  g.add(recessMesh);

  // 2) Mid falloff (0.85mm <= 1.0mm)
  var midGeo = new THREE.BoxGeometry(0.0019, 0.00038, len * 0.96);
  midGeo.translate(0, 0.00028, 0);
  var midMat = new THREE.MeshStandardMaterial({
    name: name + "_mid",
    color: new THREE.Color(p.seamMid),
    emissive: new THREE.Color(p.seamMid),
    emissiveIntensity: 0.28,
    metalness: 0.1,
    roughness: 0.45
  });
  g.add(new THREE.Mesh(midGeo, midMat));

  // 3) Seam blue calibration strip (1.35mm in [1.2, 1.5]mm)
  var seamGeo = new THREE.BoxGeometry(0.00135, 0.00052, len * 0.94);
  seamGeo.translate(0, 0.00042, 0);
  var seamMat = new THREE.MeshStandardMaterial({
    name: name + "_seam",
    color: new THREE.Color(p.seam),
    emissive: new THREE.Color(p.seam),
    emissiveIntensity: 0.55,
    metalness: 0.08,
    roughness: 0.32
  });
  g.add(new THREE.Mesh(seamGeo, seamMat));

  // 4) Locked 1px inner light core (0.60mm in [0.5, 0.7]mm, var(--sv-seam-aura))
  var auraGeo = new THREE.BoxGeometry(0.0006, 0.00066, len * 0.90);
  auraGeo.translate(0, 0.00056, 0);
  var auraMat = new THREE.MeshStandardMaterial({
    name: name + "_aura",
    color: new THREE.Color(p.seamAura),
    emissive: new THREE.Color(p.seamAura),
    emissiveIntensity: 0.85,
    metalness: 0.0,
    roughness: 0.2
  });
  g.add(new THREE.Mesh(auraGeo, auraMat));

  return g;
}

/**
 * L5@v02 §6.1: Plinth-free 78mm x 72mm (1.08:1) Bright Origami SV Crest.
 * - S: H=72mm (Z: -0.036..+0.036), W=49mm (X: -0.039..+0.010), ridge +4.0mm, body +3.6mm.
 * - V: H=30mm (Z: -0.004..+0.026), W=32mm (X: +0.007..+0.039), thin sheet +2.6mm.
 * - S fracture gap: 2.5mm (2.2-2.8mm); S-V separation gap: 3.2mm (3.0-3.5mm).
 * - Terminal 18% silver chamfer strictly adjacent to specular top & isolated from seam-aura.
 */
function buildSvLogoGroup(paletteOverride) {
  var p = paletteOverride || resolvePaletteTokens();
  var g = new THREE.Group();
  g.name = "svLogoGroup";

  var specularMat = brushedMetalMat(p.specular, 0.78, 0.20, "sv_crest_specular");
  var silverChamferMat = brushedMetalMat(p.silver, 0.75, 0.22, "sv_crest_silver_18pct");
  var slateFacetMat = brushedMetalMat(p.slate, 0.58, 0.34, "sv_crest_slate_facet");
  var gunmetalSideMat = brushedMetalMat(p.gunmetal, 0.60, 0.36, "sv_crest_gunmetal_side");

  function addFacet(name, ptsXZ, heights, mat, addSilverEdge) {
    var geo = createOrigamiPrismGeometry(ptsXZ, heights);
    var mesh = new THREE.Mesh(geo, mat);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);

    // Terminal 18% bright silver chamfer strip elevated on top outer rim (physically >= 3mm above seam-aura)
    if (addSilverEdge) {
      var cx = 0;
      var cz = 0;
      for (var i = 0; i < ptsXZ.length; i++) {
        cx += ptsXZ[i][0];
        cz += ptsXZ[i][1];
      }
      cx /= ptsXZ.length;
      cz /= ptsXZ.length;
      var insetPts = ptsXZ.map(function (pt) {
        return [cx + (pt[0] - cx) * 0.84, cz + (pt[1] - cz) * 0.84];
      });
      var baseH = Array.isArray(heights) ? Math.min.apply(null, heights) : heights;
      var capGeo = createOrigamiPrismGeometry(insetPts, 0.00018);
      capGeo.translate(0, baseH, 0);
      var cap = new THREE.Mesh(capGeo, silverChamferMat);
      cap.name = name + "_silver_rim";
      g.add(cap);
    }
  }

  // 1) S Upper-Right Swept Origami Wing (X: -0.0150..+0.0100, Z: -0.0360..-0.0105)
  addFacet(
    "sv_s_upper_wing",
    [
      [-0.0150, -0.0250],
      [0.0000, -0.0360],
      [0.0100, -0.0265],
      [-0.0150, -0.0105]
    ],
    [0.0040, 0.0036, 0.0035, 0.0040],
    specularMat,
    true
  );

  // 2) S Upper-Left Fractured Origami Block (2.5mm physical gap across X = -0.0175..-0.0150)
  addFacet(
    "sv_s_upper_left",
    [
      [-0.0390, -0.0210],
      [-0.0175, -0.0250],
      [-0.0175, -0.0100],
      [-0.0390, 0.0010]
    ],
    [0.0035, 0.0040, 0.0040, 0.0036],
    slateFacetMat,
    false
  );

  // 3) S Central Diagonal Spine Fold
  addFacet(
    "sv_s_mid_spine",
    [
      [-0.0375, 0.0010],
      [-0.0175, -0.0095],
      [-0.0065, 0.0045],
      [-0.0225, 0.0125]
    ],
    [0.0036, 0.0040, 0.0036, 0.0038],
    specularMat,
    true
  );

  // 4) S Lower Split Origami Shards (2.5mm fracture channels)
  addFacet(
    "sv_s_shard_center",
    [
      [-0.0195, 0.0150],
      [-0.0085, 0.0085],
      [-0.0055, 0.0175]
    ],
    [0.0036, 0.0038, 0.0036],
    specularMat,
    false
  );

  addFacet(
    "sv_s_shard_right",
    [
      [-0.0030, 0.0065],
      [0.0038, 0.0145],
      [0.0100, 0.0265],
      [-0.0015, 0.0305]
    ],
    [0.0038, 0.0036, 0.0034, 0.0035],
    slateFacetMat,
    false
  );

  // 5) S Lower-Left Swept Origami Tail (reaches Z = +0.0360, X = -0.0390)
  addFacet(
    "sv_s_lower_tail",
    [
      [-0.0390, 0.0265],
      [-0.0065, 0.0200],
      [-0.0075, 0.0305],
      [-0.0245, 0.0360]
    ],
    [0.0034, 0.0036, 0.0036, 0.0035],
    gunmetalSideMat,
    false
  );

  // 6) Separate Letter V Thin Origami Sheet (+2.6mm, 3.2mm gap from S, X: +0.0070..+0.0390, Z: -0.0040..+0.0260)
  addFacet(
    "sv_v_left_wing",
    [
      [0.0070, -0.0020],
      [0.0155, 0.0025],
      [0.0225, 0.0165],
      [0.0225, 0.0260]
    ],
    [0.0026, 0.0026, 0.0026, 0.0026],
    specularMat,
    true
  );

  addFacet(
    "sv_v_right_wing",
    [
      [0.0225, 0.0165],
      [0.0315, 0.0010],
      [0.0390, -0.0040],
      [0.0225, 0.0260]
    ],
    [0.0026, 0.0026, 0.0026, 0.0026],
    specularMat,
    true
  );

  // Fracture Blue Seam + Locked Aura ONLY inside fracture cuts (zero outer outline)
  g.add(buildFractureSeamSegment("sv_seam_upper_fracture", -0.01625, -0.0245, -0.01625, -0.0102, p));
  g.add(buildFractureSeamSegment("sv_seam_lower_split_a", -0.0205, 0.0138, -0.0068, 0.0186, p));
  g.add(buildFractureSeamSegment("sv_seam_lower_split_b", -0.0042, 0.0075, -0.0025, 0.0295, p));
  g.add(buildFractureSeamSegment("sv_seam_sv_gap", 0.0054, 0.0020, 0.0145, 0.0235, p));

  // Hotspot anchor node HS_SV_CREST
  var crestAnchor = new THREE.Group();
  crestAnchor.name = "HS_SV_CREST";
  crestAnchor.position.set(0.0, 0.0042, 0.0);
  g.add(crestAnchor);

  return g;
}

/**
 * Layer 4: Natural Physical M-Proto Product Item (1 SKU = 1 Geometry, LOD0 / LOD1 / LOD2)
 * Fits cleanly inside each 80mm x 86mm x 26mm bay cavity with 0 lid collision.
 */
function buildMProtoItem(skuId, opts) {
  var options = opts || {};
  var lod = options.lod || 0;
  var segCylinder = lod === 0 ? 28 : lod === 1 ? 16 : 10;
  var key = MPROTO_SPECS[skuId] ? skuId : "SV_MP_SKU_01_v01";
  var spec = MPROTO_SPECS[key];

  var g = new THREE.Group();
  g.name = "mproto_" + skuId;
  g.userData.skuId = skuId;

  var bodyMat = new THREE.MeshStandardMaterial({
    name: skuId + "_body",
    color: new THREE.Color(spec.body),
    roughness: spec.roughness,
    metalness: spec.metalness
  });
  var accentMat = new THREE.MeshStandardMaterial({
    name: skuId + "_accent",
    color: new THREE.Color(spec.accent),
    roughness: Math.max(0.28, spec.roughness - 0.2),
    metalness: spec.kind === "ceramic_cup" || spec.kind === "cocoa_tin" || spec.kind === "porcelain_vessel" ? 0.55 : 0.08
  });
  var trimMat = new THREE.MeshStandardMaterial({
    name: skuId + "_trim",
    color: new THREE.Color(spec.trim),
    roughness: 0.5,
    metalness: 0.15
  });

  if (spec.kind === "ceramic_cup" || spec.kind === "porcelain_vessel") {
    // Warm cream ceramic cup with champagne gold bottom ring & glazed interior
    var footGeo = new THREE.CylinderGeometry(0.023, 0.024, 0.003, segCylinder);
    footGeo.translate(0, 0.0015, 0);
    g.add(new THREE.Mesh(footGeo, accentMat));

    var cupGeo = new THREE.CylinderGeometry(0.027, 0.023, 0.019, segCylinder);
    cupGeo.translate(0, 0.0125, 0);
    var cupMesh = new THREE.Mesh(cupGeo, bodyMat);
    cupMesh.castShadow = true;
    cupMesh.receiveShadow = true;
    g.add(cupMesh);

    var innerGeo = new THREE.CylinderGeometry(0.0235, 0.021, 0.002, segCylinder);
    innerGeo.translate(0, 0.0215, 0);
    g.add(new THREE.Mesh(innerGeo, trimMat));
  } else if (spec.kind === "tea_caddy") {
    // Oat linen canister + brushed pewter lid
    var canGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.017, segCylinder);
    canGeo.translate(0, 0.0085, 0);
    var canMesh = new THREE.Mesh(canGeo, bodyMat);
    canMesh.castShadow = true;
    g.add(canMesh);

    var capGeo = new THREE.CylinderGeometry(0.027, 0.027, 0.0045, segCylinder);
    capGeo.translate(0, 0.0192, 0);
    g.add(new THREE.Mesh(capGeo, accentMat));

    var labelGeo = new THREE.BoxGeometry(0.028, 0.001, 0.016);
    labelGeo.translate(0, 0.0216, 0);
    g.add(new THREE.Mesh(labelGeo, trimMat));
  } else if (spec.kind === "pouch") {
    // Matte matcha stand-up pouch pillowed form + unbleached cotton paper band
    var pouchGeo = new THREE.BoxGeometry(0.062, 0.015, 0.070, lod === 0 ? 4 : 1, 2, lod === 0 ? 4 : 1);
    pouchGeo.translate(0, 0.0075, 0);
    var pouchMesh = new THREE.Mesh(pouchGeo, bodyMat);
    pouchMesh.castShadow = true;
    pouchMesh.receiveShadow = true;
    g.add(pouchMesh);

    var sealGeo = new THREE.BoxGeometry(0.064, 0.003, 0.008);
    sealGeo.translate(0, 0.008, -0.032);
    g.add(new THREE.Mesh(sealGeo, trimMat));

    var bandGeo = new THREE.BoxGeometry(0.044, 0.0015, 0.036);
    bandGeo.translate(0, 0.0156, 0.004);
    g.add(new THREE.Mesh(bandGeo, accentMat));
  } else if (spec.kind === "brass_scoop") {
    // Warm paper presentation card + champagne brass scoop & clip
    var cardGeo = new THREE.BoxGeometry(0.064, 0.006, 0.070);
    cardGeo.translate(0, 0.003, 0);
    g.add(new THREE.Mesh(cardGeo, bodyMat));

    var bowlGeo = new THREE.CylinderGeometry(0.014, 0.011, 0.009, segCylinder);
    bowlGeo.translate(-0.008, 0.0105, -0.012);
    g.add(new THREE.Mesh(bowlGeo, accentMat));

    var handleGeo = new THREE.BoxGeometry(0.005, 0.0035, 0.038);
    handleGeo.translate(-0.008, 0.0095, 0.014);
    g.add(new THREE.Mesh(handleGeo, accentMat));

    var clipGeo = new THREE.BoxGeometry(0.010, 0.004, 0.046);
    clipGeo.translate(0.014, 0.0085, 0.002);
    g.add(new THREE.Mesh(clipGeo, trimMat));
  } else {
    // Artisanal coffret / cocoa tin / praline box / drip folio with belly band & seal
    var boxW = 0.064;
    var boxH = spec.kind === "cocoa_tin" ? 0.019 : 0.017;
    var boxD = 0.070;
    var baseGeo = new THREE.BoxGeometry(boxW, boxH, boxD);
    baseGeo.translate(0, boxH * 0.5, 0);
    var baseMesh = new THREE.Mesh(baseGeo, bodyMat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    g.add(baseMesh);

    var ribbonGeo = new THREE.BoxGeometry(boxW + 0.0012, boxH + 0.001, 0.018);
    ribbonGeo.translate(0, boxH * 0.5 + 0.0004, 0);
    g.add(new THREE.Mesh(ribbonGeo, accentMat));

    var sealTileGeo = new THREE.BoxGeometry(0.018, 0.0014, 0.014);
    sealTileGeo.translate(0, boxH + 0.0012, 0);
    g.add(new THREE.Mesh(sealTileGeo, trimMat));
  }

  return g;
}

/**
 * Builds the complete Bundle_MOTHER (0 tris) + Child_Tray (5-step brushed metal + warm paper cavity
 * + plinth-free 78x72mm SV crest + 6 bays + 2 core hotspot anchors).
 */
function buildTrayAssembly(config) {
  var cfg = config || {};
  var lod = cfg.lod || 0;
  var p = resolvePaletteTokens();

  var W = LID_SV_LOCK.trayOuterW;       // 0.280m
  var D = LID_SV_LOCK.trayOuterD;       // 0.210m
  var H = LID_SV_LOCK.trayOuterH;       // 0.036m
  var innerW = LID_SV_LOCK.trayInnerW;  // 0.264m
  var innerD = LID_SV_LOCK.trayInnerD;  // 0.194m
  var wallT = (W - innerW) * 0.5;       // 0.008m
  var cols = cfg.cols || 3;
  var rows = cfg.rows || 2;
  var bayCount = cfg.bayCount || 6;

  var root = new THREE.Group();
  root.name = "tray_assembly_root";

  /* 1. Bundle_MOTHER: Pure invisible assembly root (0 triangles / 0 materials / 0 shadows) */
  var motherRoot = new THREE.Group();
  motherRoot.name = "Bundle_MOTHER";

  var anchorNodes = {};
  ["anchor_A", "anchor_B", "anchor_C"].forEach(function (aId) {
    var aNode = new THREE.Group();
    aNode.name = aId;
    var coords = (cfg.anchors && cfg.anchors[aId] && cfg.anchors[aId].position) || ANCHOR_COORDS[aId];
    aNode.position.set(coords[0], coords[1], coords[2]);
    motherRoot.add(aNode);
    anchorNodes[aId] = aNode;
  });
  root.add(motherRoot);

  /* 2. Child_Tray Assembly */
  var tray = new THREE.Group();
  tray.name = "Child_Tray";
  motherRoot.add(tray);

  // Materials — 5-Step Brushed Metal + Dual-Step Warm Paper (L5@v02 §3.3)
  var matRecess = brushedMetalMat(p.metalRecess, 0.55, 0.44, "mat_metal_recess");
  var matGunmetal = brushedMetalMat(p.gunmetal, 0.58, 0.38, "mat_metal_gunmetal");
  var matSlate = brushedMetalMat(p.slate, 0.56, 0.36, "mat_metal_slate");
  var matSteel = brushedMetalMat(p.steel, 0.62, 0.34, "mat_metal_steel");
  var matPewter = brushedMetalMat(p.pewter, 0.64, 0.34, "mat_metal_pewter");
  var matPaper = warmPaperMat(p.paper, 0.92, "mat_inner_paper");
  var matPaperSubtle = warmPaperMat(p.paperSubtle, 0.89, "mat_inner_paper_subtle");

  // Step 1: Recessed shadow foot base (--sv-metal-recess, Y: 0.000..0.0025m)
  var footGeo = new THREE.BoxGeometry(W - 0.010, 0.0025, D - 0.010);
  footGeo.translate(0, 0.00125, 0);
  var footMesh = new THREE.Mesh(footGeo, matRecess);
  footMesh.name = "tray_foot_recess";
  footMesh.castShadow = true;
  footMesh.receiveShadow = true;
  tray.add(footMesh);

  // Step 2: Gunmetal outer perimeter walls & base floor (--sv-gunmetal, Y: 0.0025..0.0325m)
  var baseFloorGeo = new THREE.BoxGeometry(W, 0.0045, D);
  baseFloorGeo.translate(0, 0.00475, 0);
  var baseFloor = new THREE.Mesh(baseFloorGeo, matGunmetal);
  baseFloor.name = "tray_base_floor";
  baseFloor.castShadow = true;
  baseFloor.receiveShadow = true;
  tray.add(baseFloor);

  var wallH = 0.0255; // Y: 0.0070 .. 0.0325m
  var wallY = 0.0070 + wallH * 0.5;
  var fbWallGeo = new THREE.BoxGeometry(W, wallH, wallT);
  var frontWall = new THREE.Mesh(fbWallGeo, matGunmetal);
  frontWall.name = "tray_wall_front";
  frontWall.position.set(0, wallY, (D - wallT) * 0.5);
  frontWall.castShadow = true;
  frontWall.receiveShadow = true;
  tray.add(frontWall);

  var backWall = new THREE.Mesh(fbWallGeo, matGunmetal);
  backWall.name = "tray_wall_back";
  backWall.position.set(0, wallY, -(D - wallT) * 0.5);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  tray.add(backWall);

  var lrWallGeo = new THREE.BoxGeometry(wallT, wallH, innerD);
  var leftWall = new THREE.Mesh(lrWallGeo, matGunmetal);
  leftWall.name = "tray_wall_left";
  leftWall.position.set(-(W - wallT) * 0.5, wallY, 0);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  tray.add(leftWall);

  var rightWall = new THREE.Mesh(lrWallGeo, matGunmetal);
  rightWall.name = "tray_wall_right";
  rightWall.position.set((W - wallT) * 0.5, wallY, 0);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  tray.add(rightWall);

  // Step 3 & 4: Waist transition bevel (--sv-slate) + 45 deg outer chamfer collar (--sv-steel) at Y: 0.0325..0.0360m
  var waistH = 0.0035;
  var waistY = 0.0325 + waistH * 0.5;
  var fbChamfer = new THREE.Mesh(new THREE.BoxGeometry(W + 0.0016, waistH, wallT + 0.0012), matSteel);
  fbChamfer.name = "tray_chamfer_front";
  fbChamfer.position.set(0, waistY, (D - wallT) * 0.5);
  tray.add(fbChamfer);

  var bkChamfer = new THREE.Mesh(new THREE.BoxGeometry(W + 0.0016, waistH, wallT + 0.0012), matSlate);
  bkChamfer.name = "tray_chamfer_back";
  bkChamfer.position.set(0, waistY, -(D - wallT) * 0.5);
  tray.add(bkChamfer);

  var lChamfer = new THREE.Mesh(new THREE.BoxGeometry(wallT + 0.0012, waistH, innerD), matSteel);
  lChamfer.name = "tray_chamfer_left";
  lChamfer.position.set(-(W - wallT) * 0.5, waistY, 0);
  tray.add(lChamfer);

  var rChamfer = new THREE.Mesh(new THREE.BoxGeometry(wallT + 0.0012, waistH, innerD), matSteel);
  rChamfer.name = "tray_chamfer_right";
  rChamfer.position.set((W - wallT) * 0.5, waistY, 0);
  tray.add(rChamfer);

  // Waist Blue Seam + Locked Seam Aura along front waist calibration groove
  var waistSeam = new THREE.Mesh(
    new THREE.BoxGeometry(W * 0.62, 0.0013, 0.0008),
    new THREE.MeshStandardMaterial({
      name: "mat_waist_seam",
      color: new THREE.Color(p.seam),
      emissive: new THREE.Color(p.seam),
      emissiveIntensity: 0.5,
      metalness: 0.1,
      roughness: 0.35
    })
  );
  waistSeam.name = "tray_waist_seam";
  waistSeam.position.set(0, 0.0342, D * 0.5 + 0.0010);
  tray.add(waistSeam);

  var waistAura = new THREE.Mesh(
    new THREE.BoxGeometry(W * 0.60, 0.0006, 0.0009),
    new THREE.MeshStandardMaterial({
      name: "mat_waist_aura",
      color: new THREE.Color(p.seamAura),
      emissive: new THREE.Color(p.seamAura),
      emissiveIntensity: 0.82,
      metalness: 0.0,
      roughness: 0.2
    })
  );
  waistAura.name = "tray_waist_seam_aura";
  waistAura.position.set(0, 0.0342, D * 0.5 + 0.0011);
  tray.add(waistAura);

  /* Layer 2: Warm Paper Inner Cavity Floor & Liner Walls (264mm x 194mm) */
  var innerBedGeo = new THREE.BoxGeometry(innerW, 0.0022, innerD);
  innerBedGeo.translate(0, 0.0081, 0);
  var innerBed = new THREE.Mesh(innerBedGeo, matPaper);
  innerBed.name = "tray_inner_paper_floor";
  innerBed.receiveShadow = true;
  tray.add(innerBed);

  // Inner warm-paper wall liners
  var linerH = 0.022;
  var linerY = 0.0092 + linerH * 0.5;
  var fbLinerGeo = new THREE.BoxGeometry(innerW - 0.001, linerH, 0.0018);
  var fLiner = new THREE.Mesh(fbLinerGeo, matPaperSubtle);
  fLiner.position.set(0, linerY, innerD * 0.5 - 0.0009);
  tray.add(fLiner);
  var bLiner = new THREE.Mesh(fbLinerGeo, matPaperSubtle);
  bLiner.position.set(0, linerY, -innerD * 0.5 + 0.0009);
  tray.add(bLiner);

  var lrLinerGeo = new THREE.BoxGeometry(0.0018, linerH, innerD - 0.004);
  var lLiner = new THREE.Mesh(lrLinerGeo, matPaperSubtle);
  lLiner.position.set(-innerW * 0.5 + 0.0009, linerY, 0);
  tray.add(lLiner);
  var rLiner = new THREE.Mesh(lrLinerGeo, matPaperSubtle);
  rLiner.position.set(innerW * 0.5 - 0.0009, linerY, 0);
  tray.add(rLiner);

  /* 6-Bay Divider Grid + Steel/Pewter Top Ribs + Warm Paper Bay Pads (bay_1..bay_6) */
  var ring = new THREE.Group();
  ring.name = "bay_divider_rim";
  ring.position.set(0, 0.0092, 0);
  tray.add(ring);

  // Internal cross dividers: 2 longitudinal X dividers + 1 transverse Z divider
  var divH = 0.0205;
  var stepX = innerW / cols; // 0.088m
  var stepZ = innerD / rows; // 0.097m
  for (var c = 1; c < cols; c++) {
    var divX = -innerW * 0.5 + c * stepX;
    var xWall = new THREE.Mesh(new THREE.BoxGeometry(0.0028, divH - 0.0022, innerD - 0.004), matPaperSubtle);
    xWall.position.set(divX, (divH - 0.0022) * 0.5, 0);
    xWall.receiveShadow = true;
    ring.add(xWall);

    var xRib = new THREE.Mesh(new THREE.BoxGeometry(0.0032, 0.0022, innerD - 0.004), matSteel);
    xRib.name = "bay_rib_x_" + c;
    xRib.position.set(divX, divH - 0.0011, 0);
    ring.add(xRib);
  }
  for (var r = 1; r < rows; r++) {
    var divZ = -innerD * 0.5 + r * stepZ;
    var zWall = new THREE.Mesh(new THREE.BoxGeometry(innerW - 0.004, divH - 0.0022, 0.0028), matPaperSubtle);
    zWall.position.set(0, (divH - 0.0022) * 0.5, divZ);
    zWall.receiveShadow = true;
    ring.add(zWall);

    var zRib = new THREE.Mesh(new THREE.BoxGeometry(innerW - 0.004, 0.0022, 0.0032), matPewter);
    zRib.name = "bay_rib_z_" + r;
    zRib.position.set(0, divH - 0.0011, divZ);
    ring.add(zRib);
  }

  var hsBayGrid = new THREE.Group();
  hsBayGrid.name = "HS_BAY_GRID";
  hsBayGrid.position.set(0.0, 0.016, 0.010);
  ring.add(hsBayGrid);

  var bayCells = [];
  var cellW = stepX - 0.009;
  var cellD = stepZ - 0.009;

  for (var i = 0; i < bayCount; i++) {
    var col = i % cols;
    var row = Math.floor(i / cols);
    var bx = (col - (cols - 1) * 0.5) * stepX;
    var bz = (row - (rows - 1) * 0.5) * stepZ;

    var bayGroup = new THREE.Group();
    bayGroup.name = "bay_" + (i + 1);
    bayGroup.position.set(bx, 0.001, bz);
    bayGroup.userData.bayIndex = i;
    bayGroup.userData.slotId = "bay_" + (i + 1);

    var padGeo = new THREE.BoxGeometry(cellW, 0.0016, cellD);
    padGeo.translate(0, 0.0008, 0);
    var pad = new THREE.Mesh(padGeo, matPaperSubtle);
    pad.name = "bay_" + (i + 1) + "_pad";
    pad.receiveShadow = true;
    pad.userData.bayIndex = i;
    bayGroup.add(pad);

    // Subtle slot seam collar (lights up during clip_slot_add)
    var collarMat = new THREE.MeshStandardMaterial({
      name: "bay_" + (i + 1) + "_collar_mat",
      color: new THREE.Color(p.pewter),
      emissive: new THREE.Color(p.seam),
      emissiveIntensity: 0.0,
      metalness: 0.55,
      roughness: 0.36
    });
    var collarGeo = new THREE.BoxGeometry(cellW + 0.002, 0.0008, cellD + 0.002);
    collarGeo.translate(0, 0.0015, 0);
    var collar = new THREE.Mesh(collarGeo, collarMat);
    collar.name = "bay_" + (i + 1) + "_collar";
    bayGroup.add(collar);

    // Dashed empty-bay outline (shown when slot is empty after clip_slot_remove)
    var hw = cellW * 0.44;
    var hd = cellD * 0.44;
    var dashPts = [
      new THREE.Vector3(-hw, 0.0022, -hd),
      new THREE.Vector3(hw, 0.0022, -hd),
      new THREE.Vector3(hw, 0.0022, hd),
      new THREE.Vector3(-hw, 0.0022, hd),
      new THREE.Vector3(-hw, 0.0022, -hd)
    ];
    var dashGeo = new THREE.BufferGeometry().setFromPoints(dashPts);
    var dashLine = new THREE.Line(
      dashGeo,
      new THREE.LineDashedMaterial({
        color: new THREE.Color(p.seam),
        dashSize: 0.006,
        gapSize: 0.004
      })
    );
    dashLine.computeLineDistances();
    dashLine.name = "bay_" + (i + 1) + "_empty_outline";
    dashLine.visible = false;
    bayGroup.add(dashLine);

    // Mount container for M-Proto item inside bay
    var mountNode = new THREE.Group();
    mountNode.name = "bay_" + (i + 1) + "_item_mount";
    mountNode.position.set(0, 0.0018, 0);
    bayGroup.add(mountNode);

    ring.add(bayGroup);
    bayCells.push(bayGroup);
  }

  /* Step 5: Rear Hinge Barrel (--sv-pewter) & Articulated Two-Tone Slate/Steel Lid at [0, 0.036, -0.105] */
  var barrelSegs = lod === 0 ? 24 : 12;
  var barrelGeo = new THREE.CylinderGeometry(0.0032, 0.0032, W * 0.84, barrelSegs);
  barrelGeo.rotateZ(Math.PI * 0.5);
  var barrel = new THREE.Mesh(barrelGeo, matPewter);
  barrel.name = "hinge_barrel";
  barrel.position.set(0.0, H, -D * 0.5);
  barrel.castShadow = true;
  tray.add(barrel);

  var hinge = new THREE.Group();
  hinge.name = "lid_hinge";
  hinge.position.set(0.0, H, -D * 0.5); // Exact [0.0, 0.036, -0.105]

  var lidPivot = new THREE.Group();
  lidPivot.name = "lidPivot";

  var lidThick = LID_SV_LOCK.lidThickness; // 0.0062m
  // Outer Steel Bevel Rim around lid perimeter
  var lidRimGeo = new THREE.BoxGeometry(W, lidThick * 0.72, D);
  lidRimGeo.translate(0, lidThick * 0.36, D * 0.5);
  var lidRim = new THREE.Mesh(lidRimGeo, matSteel);
  lidRim.name = "lid_chamfer_rim";
  lidRim.castShadow = true;
  lidRim.receiveShadow = true;
  lidPivot.add(lidRim);

  // Main Upper Slate Brushed Panel (--sv-slate, top surface strictly at local Y = +0.0062m)
  var lidTopGeo = new THREE.BoxGeometry(W - 0.006, lidThick * 0.34, D - 0.006);
  lidTopGeo.translate(0, lidThick - (lidThick * 0.34) * 0.5, D * 0.5);
  var lidPanel = new THREE.Mesh(lidTopGeo, matSlate);
  lidPanel.name = "lid_panel";
  lidPanel.castShadow = true;
  lidPanel.receiveShadow = true;
  lidPivot.add(lidPanel);

  // Warm Paper Inner Liner on Underside of Lid (visible when lid opens to 12° / 72°)
  var lidInnerGeo = new THREE.BoxGeometry(innerW - 0.004, 0.0008, innerD - 0.004);
  lidInnerGeo.translate(0, 0.0005, D * 0.5);
  var lidInner = new THREE.Mesh(lidInnerGeo, matPaperSubtle);
  lidInner.name = "lid_inner_paper_liner";
  lidInner.receiveShadow = true;
  lidPivot.add(lidInner);

  // Plinth-free 78x72mm Bright Origami SV Crest mounted rigidly at local Y = +0.0062m, Z = +0.105m (center of lid)
  var logo = buildSvLogoGroup(p);
  logo.position.set(0.0, LID_SV_LOCK.lidTopLocalY, D * 0.5);
  lidPivot.add(logo);

  hinge.add(lidPivot);
  tray.add(hinge);

  /* Optional Debug Dashed Rig Overlay (hidden in production; Mother itself has 0 Mesh/Line children) */
  var rigOverlay = new THREE.Group();
  rigOverlay.name = "mother_rig_debug";
  rigOverlay.visible = false;
  var order = ["anchor_A", "anchor_B", "anchor_C", "anchor_A"];
  var pts = order.map(function (id) {
    var pos = (cfg.anchors && cfg.anchors[id] && cfg.anchors[id].position) || ANCHOR_COORDS[id];
    return new THREE.Vector3(pos[0], pos[1], pos[2]);
  });
  var lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
  var line = new THREE.Line(
    lineGeo,
    new THREE.LineDashedMaterial({
      color: new THREE.Color(p.seam),
      dashSize: 0.012,
      gapSize: 0.008
    })
  );
  line.computeLineDistances();
  rigOverlay.add(line);
  root.add(rigOverlay); // Attached to root (NOT motherRoot) so Bundle_MOTHER has 0 geometry/material in prod

  // Populate default 6 natural M-Proto items if requested (e.g. for Child_Tray.glb bake)
  if (Array.isArray(cfg.defaultBaySkus)) {
    cfg.defaultBaySkus.slice(0, 6).forEach(function (skuId, idx) {
      if (!skuId || !bayCells[idx]) return;
      var mount = bayCells[idx].getObjectByName("bay_" + (idx + 1) + "_item_mount");
      if (mount) {
        mount.add(buildMProtoItem(skuId, { lod: lod }));
      }
    });
  }

  var motherMeshCount = 0;
  motherRoot.children.forEach(function (c) {
    if (c instanceof THREE.Mesh) motherMeshCount += 1;
  });

  return {
    root: root,
    motherRoot: motherRoot,
    anchorNodes: anchorNodes,
    tray: tray,
    hinge: hinge,
    lidPivot: lidPivot,
    logo: logo,
    bayCells: bayCells,
    hsBayGrid: hsBayGrid,
    rigOverlay: rigOverlay,
    motherMeshCount: motherMeshCount
  };
}

export {
  MPROTO_SPECS,
  PALETTE_FALLBACK,
  buildMProtoItem,
  buildSvLogoGroup,
  buildTrayAssembly,
  createOrigamiPrismGeometry,
  resolvePaletteTokens
};
