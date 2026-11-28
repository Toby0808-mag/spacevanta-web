/**
 * SpaceVanta Global Unique BundleDriver Singleton (L5@v02 §2.3 / §4 / §5 / §7)
 * - Exports dispatch(state, intent, mode), mountStage(canvas, opts), built-in AssetAdapter,
 *   Promote S0..S5 orchestration, F2 Mixed-MTO & 3 direct-pass branches, and idempotent commit lock.
 * - Enforces single persistent active WebGL stage per screen (Active WebGL <= 1; Cold P2 = 0 WebGL).
 * - Zero bare hex values, zero hardcoded commercial prices/dates, zero literal Worker URLs.
 */
import { createBundleScene, isReducedMotion, webglAvailable } from "./BundleScene3D.js";
import { loadGlbBounded, pickHotGlbUrl, resolveGlbUrl } from "./glbMount.js";
import { BUNDLE_MOTHER_RIG, LID_SV_LOCK } from "./motherRig.js";
import { createMtoScene } from "./MtoScene3D.js";
import { MTO_HANDOFF_FROZEN_KEYS, MTO_MOTHER_RIG, MTO_SKUS, findMtoSku } from "./mtoRig.js";
import { DEFAULT_PROMOTE_TIMING, reducePromote, s2DurationMs, s4DurationMs } from "./PromoteController.js";

var DRAFT_KEY = "sv_bundle_driver_v02";
var HANDOFF_KEY = "sv_bundle_handoff_v02";
var MTO_DRAFT_KEY = "sv_mto_draft_v01";
var MTO_HANDOFF_KEY = "sv_mto_handoff_v01";
var MTO_REMEMBER_KEY = "sv_mto_remember_v01";
var MTO_HANDOFF_TTL_MS = 30 * 60 * 1000;

/* ---- Telemetry Emitter (L5@v02 §7.8 Observable Non-PII Events) ---- */
function emitBundleEvent(eventName, detail) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail: detail || {} }));
  } catch (_e) {}
}

/* ---- Built-In AssetAdapter (L5@v02 §2.3 & §5: logical contract keys, 0 literal Worker URLs) ---- */
var packCache = null;

var AssetAdapter = {
  resolveModelsBases: function () {
    var bases = [];
    if (typeof document !== "undefined") {
      var dna = document.querySelector("[data-sv-dna]");
      var fromDna = dna && dna.dataset && dna.dataset.modelsBase ? dna.dataset.modelsBase.trim() : "";
      if (fromDna) bases.push(fromDna.replace(/\/$/, ""));

      var domOverride = document.querySelector("[data-sv-models-base]");
      var fromDom = domOverride && domOverride.dataset && domOverride.dataset.svModelsBase
        ? domOverride.dataset.svModelsBase.trim()
        : "";
      if (fromDom && bases.indexOf(fromDom.replace(/\/$/, "")) === -1) {
        bases.push(fromDom.replace(/\/$/, ""));
      }
    }
    if (typeof window !== "undefined" && window.SpaceVanta && window.SpaceVanta.config) {
      var c = window.SpaceVanta.config;
      if (c.modelsBase && bases.indexOf(c.modelsBase.replace(/\/$/, "")) === -1) {
        bases.push(c.modelsBase.replace(/\/$/, ""));
      }
      if (c.modelsCdnBase && bases.indexOf(c.modelsCdnBase.replace(/\/$/, "")) === -1) {
        bases.push(c.modelsCdnBase.replace(/\/$/, ""));
      }
    }
    return bases;
  },

  fetchJsonBounded: async function (url, signal, timeoutMs) {
    var ctl = typeof AbortController === "function" ? new AbortController() : null;
    var ms = timeoutMs || 3000;
    var timer = setTimeout(function () {
      if (ctl) ctl.abort();
    }, ms);
    if (signal) {
      signal.addEventListener("abort", function () {
        if (ctl) ctl.abort();
      }, { once: true });
    }
    try {
      var kvOff = typeof window !== "undefined" && window.SpaceVanta && window.SpaceVanta.flags
        ? window.SpaceVanta.flags.isKvOff()
        : false;
      var targetUrl = kvOff ? (url + (url.indexOf("?") === -1 ? "?sv_kv=off" : "&sv_kv=off")) : url;
      var res = await fetch(targetUrl, {
        signal: ctl ? ctl.signal : undefined,
        credentials: "same-origin"
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error("asset_http_" + res.status);
      return await res.json();
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  },

  loadModelsPack: async function (signal) {
    if (packCache) return packCache;
    var bases = AssetAdapter.resolveModelsBases();
    var lastErr = null;
    for (var i = 0; i < bases.length; i++) {
      var base = bases[i];
      try {
        var manifest = await AssetAdapter.fetchJsonBounded(base + "/manifest.json", signal, 2500);
        var motherPath = (manifest && manifest.packages && manifest.packages.mother && manifest.packages.mother.config) || "mother/config.json";
        var childPath = (manifest && manifest.packages && manifest.packages.child && manifest.packages.child.config) || "child/config.json";
        var pair = await Promise.all([
          AssetAdapter.fetchJsonBounded(base + "/" + motherPath, signal, 2500),
          AssetAdapter.fetchJsonBounded(base + "/" + childPath, signal, 2500)
        ]);
        packCache = {
          manifest: manifest,
          mother: pair[0],
          child: pair[1],
          base: base
        };
        return packCache;
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("models_pack_unreachable");
  },

  invalidate: function () {
    packCache = null;
  }
};

/* ---- Persistent Single-Instance WebGL Stage Registry (Active WebGL <= 1) ---- */
var stageMounts = new Map();

function getActiveStageCount() {
  return stageMounts.size;
}

function validateSlotBindings(slots) {
  if (!Array.isArray(slots) || slots.length === 0) {
    return { boundCount: 0, unboundCount: 0, slots: [] };
  }
  var boundCount = 0;
  var unboundCount = 0;
  var normalized = slots.slice(0, 6).map(function (s, idx) {
    if (!s || !s.skuId) {
      return null;
    }
    var productUrl = typeof s.productUrl === "string" ? s.productUrl.trim() : "";
    var skuId = String(s.skuId).trim();
    var bound = Boolean(skuId);
    if (bound) boundCount += 1;
    else unboundCount += 1;
    return {
      slotId: s.slotId || ("bay_" + (idx + 1)),
      skuId: skuId,
      productUrl: productUrl,
      variantId: s.variantId || "",
      title: s.title || "",
      isMto: Boolean(s.isMto),
      fromCrossPool: Boolean(s.fromCrossPool),
      qty: s.qty || 1,
      bound: bound
    };
  });
  return { boundCount: boundCount, unboundCount: unboundCount, slots: normalized };
}

async function mountStage(canvas, options, signal) {
  var opts = options || {};
  var isMtoPack = opts.pack === "mto" || opts.family === "mto";
  var threeDOff = Boolean(opts.threeDOff) || (
    typeof window !== "undefined" &&
    window.SpaceVanta &&
    window.SpaceVanta.flags &&
    window.SpaceVanta.flags.is3DOff()
  );

  // Cold S0 strictly forbids WebGL creation (V-06 / V-09 / V-P4)
  if (opts.role === "cold_p2" || opts.role === "cold_preview" || opts.role === "cold_01map") {
    return { ok: false, level: "L4", reason: "cold_zero_webgl", activeWebGL: getActiveStageCount() };
  }
  if (opts.tier === "poster") {
    unmountStage(canvas, "poster_tier_downgrade");
    if (canvas && canvas.dataset) {
      canvas.dataset.sv3d = "poster";
      canvas.dataset.svModelTier = "poster";
    }
    return { ok: false, level: "L4", reason: "poster_tier", activeWebGL: getActiveStageCount() };
  }
  if (threeDOff) {
    unmountStage(canvas);
    return { ok: false, level: "L4", reason: "sv_3d_off", activeWebGL: getActiveStageCount() };
  }
  if (!webglAvailable()) {
    return { ok: false, level: "L4", reason: "webgl_unavailable", activeWebGL: getActiveStageCount() };
  }

  // Enforce single persistent active WebGL canvas per screen: dispose any other canvas before mounting
  Array.from(stageMounts.keys()).forEach(function (existingCanvas) {
    if (existingCanvas !== canvas) {
      unmountStage(existingCanvas, "single_hot_budget_reclaim");
    }
  });
  unmountStage(canvas, "remount");

  var pack = null;
  if (!opts.skipRemotePack) {
    try {
      pack = await AssetAdapter.loadModelsPack(signal);
    } catch (_e) {
      pack = null;
    }
  }

  var glbRoot = null;
  var glbStatus = "procedural_homologous";
  var glbUrl = opts.glbUrl || null;

  if (!glbUrl && pack && pack.base) {
    if (isMtoPack && pack.mother && pack.mother.variants) {
      var vKey = opts.track === "02" ? "prism" : (opts.track === "03" ? "folio" : "block");
      var vEntry = pack.mother.variants[vKey];
      var mtoRel = vEntry && vEntry.hotGlb && vEntry.hotGlb.lod0 ? vEntry.hotGlb.lod0 : null;
      glbUrl = resolveGlbUrl(pack.base, mtoRel);
    } else {
      var rel = pickHotGlbUrl(pack.child, pack.manifest && pack.manifest.packages && pack.manifest.packages.child);
      glbUrl = resolveGlbUrl(pack.base, rel);
    }
  }

  if (glbUrl && !opts.forceProcedural) {
    var loaded = await loadGlbBounded(glbUrl, signal);
    if (loaded.ok) {
      glbRoot = loaded.root;
      glbStatus = "glb:" + loaded.bytes;
    } else {
      glbStatus = "vp5_fallback:" + loaded.reason;
      if (opts.strictPosterOnGlbFail) {
        var evtName = isMtoPack ? "mto.promote_s0_s5" : "sv_bundle_promote_fallback_vp5";
        emitBundleEvent(evtName, {
          stage: "vp5_fallback",
          poolId: opts.poolId || "",
          sku: opts.sku || "",
          reason: loaded.reason
        });
        return {
          ok: false,
          level: "L1_VP5",
          reason: loaded.reason,
          poster: opts.posterUrl || (pack && pack.manifest && pack.manifest.fallback && pack.manifest.fallback.poster) || ""
        };
      }
    }
  } else if (opts.strictPosterOnGlbFail && opts.simulateVp5Fail) {
    emitBundleEvent(isMtoPack ? "mto.promote_s0_s5" : "sv_bundle_promote_fallback_vp5", {
      stage: "vp5_fallback",
      poolId: opts.poolId || "",
      sku: opts.sku || "",
      reason: "simulated_lod_fail"
    });
    return {
      ok: false,
      level: "L1_VP5",
      reason: "simulated_lod_fail",
      poster: opts.posterUrl || ""
    };
  }

  if (isMtoPack) {
    try {
      var mtoTrack = String(opts.track || "01");
      var mtoTier = opts.tier === "r1" ? "r1" : "r2";
      var mtoHandle = createMtoScene(
        canvas,
        {
          track: mtoTrack,
          tier: mtoTier,
          sku: opts.sku || MTO_SKUS[0].sku
        },
        {
          glbRoot: glbRoot,
          glbMap: opts.glbMap || null,
          onTelemetry: emitBundleEvent
        }
      );

      stageMounts.set(canvas, mtoHandle);

      canvas.dataset.sv3d = "webgl";
      canvas.dataset.svPack = "mto";
      canvas.dataset.svModel = mtoTrack === "02"
        ? "SV_MP_MTO_PRISM_v01"
        : (mtoTrack === "03" ? "SV_MP_MTO_FOLIO_v01" : "SV_MP_MTO_BLOCK_v01");
      canvas.dataset.svModelTier = mtoTier;
      canvas.dataset.svGeoSource = mtoHandle.geoSource;
      canvas.dataset.svGlb = glbStatus;
      canvas.dataset.svMotherMeshes = String(mtoHandle.motherMeshCount);
      canvas.dataset.svGeo = String(mtoHandle.memoryGeometries());

      return {
        ok: true,
        level: "L0",
        handle: mtoHandle,
        geoSource: mtoHandle.geoSource,
        glbStatus: glbStatus
      };
    } catch (mtoErr) {
      return {
        ok: false,
        level: "L4",
        reason: mtoErr instanceof Error ? mtoErr.message : "mto_stage_mount_failed"
      };
    }
  }

  var binding = validateSlotBindings(opts.slots);
  var defaultBaySkus = binding.slots.length > 0
    ? binding.slots.map(function (s) { return s ? s.skuId : null; })
    : [
        "SV_MP_SKU_01_v01",
        "SV_MP_SKU_02_v01",
        "SV_MP_SKU_03_v01",
        "SV_MP_SKU_04_v01",
        "SV_MP_SKU_05_v01",
        "SV_MP_SKU_06_v01"
      ];

  try {
    var handle = createBundleScene(
      canvas,
      {
        bayCount: 6,
        cols: 3,
        rows: 2,
        defaultBaySkus: defaultBaySkus
      },
      opts.cameraPreset || "tray_view",
      {
        glbRoot: glbRoot,
        onSlotSelect: opts.onSlotSelect,
        onTelemetry: emitBundleEvent
      }
    );

    handle.setMotherRigVisible(Boolean(opts.motherRigOn));
    var initialLidDeg = opts.lidOpenDeg != null ? opts.lidOpenDeg : LID_SV_LOCK.openDeg;
    handle.setLidOpenDeg(initialLidDeg, Boolean(opts.animateInitialLid));
    if (binding.slots.length > 0) {
      handle.setSlots(binding.slots, opts.activeSlotIndex != null ? opts.activeSlotIndex : -1);
    }

    stageMounts.set(canvas, handle);

    canvas.dataset.sv3d = "webgl";
    canvas.dataset.svModel = opts.role === "hot_child" ? "Child_Tray" : "Bundle_MOTHER";
    canvas.dataset.svModelTier = "r2";
    canvas.dataset.svGeoSource = handle.geoSource;
    canvas.dataset.svGlb = glbStatus;
    canvas.dataset.svMotherMeshes = String(handle.motherMeshCount);
    canvas.dataset.svGeo = String(handle.memoryGeometries());

    return {
      ok: true,
      level: "L0",
      handle: handle,
      geoSource: handle.geoSource,
      glbStatus: glbStatus,
      bindingCheck: binding
    };
  } catch (err) {
    return {
      ok: false,
      level: "L4",
      reason: err instanceof Error ? err.message : "stage_mount_failed"
    };
  }
}

function updateStage(canvas, patch) {
  var handle = stageMounts.get(canvas);
  if (!handle || !patch) return null;
  if (patch.refreshTokens) handle.refreshTokens();
  if (patch.tier && typeof handle.setTier === "function") handle.setTier(patch.tier);
  if (patch.track && typeof handle.setTrack === "function") {
    handle.setTrack(patch.track, patch);
    if (canvas && canvas.dataset) {
      canvas.dataset.svModel = patch.track === "02"
        ? "SV_MP_MTO_PRISM_v01"
        : (patch.track === "03" ? "SV_MP_MTO_FOLIO_v01" : "SV_MP_MTO_BLOCK_v01");
    }
  }
  if (patch.sku && typeof handle.setCenterSkuSubject === "function") {
    handle.setCenterSkuSubject(patch.sku);
  }
  if (patch.cameraPreset) handle.setCameraPreset(patch.cameraPreset, patch.easeMs);
  if (patch.hotspotId !== undefined) handle.focusHotspot(patch.hotspotId, patch);
  if (patch.clipId) handle.playClip(patch.clipId, patch);
  else if (patch.lidOpenDeg != null) handle.setLidOpenDeg(patch.lidOpenDeg, Boolean(patch.animateLid));
  if (patch.slots) handle.setSlots(patch.slots, patch.activeSlotIndex != null ? patch.activeSlotIndex : -1, patch.clipHint);
  if (patch.motherRigOn != null) handle.setMotherRigVisible(patch.motherRigOn);
  if (patch.paused === true) handle.pause();
  if (patch.paused === false) handle.resume();
  canvas.dataset.svGeo = String(handle.memoryGeometries());
  return handle.getCameraState();
}

function getStageHandle(canvas) {
  return stageMounts.get(canvas) || null;
}

function unmountStage(canvas, reason) {
  var handle = stageMounts.get(canvas);
  if (!handle) return null;
  var mem = handle.dispose();
  stageMounts.delete(canvas);
  if (canvas && canvas.dataset) {
    canvas.dataset.sv3d = "disposed";
    canvas.dataset.svGeo = String(mem.geometriesAfter);
  }
  emitBundleEvent("sv_bundle_demote_dispose", {
    reason: reason || "unmount",
    geometriesAfter: mem.geometriesAfter,
    baselineDelta: mem.baselineDelta
  });
  return mem;
}

function resizeAllStages() {
  stageMounts.forEach(function (handle) {
    handle.resize();
  });
}

/* ---- State Reducer (L5@v02 §4.1 Mother 9 States & §4.2 Child 12 States) ---- */
function padSixSlots(items) {
  var out = [null, null, null, null, null, null];
  if (!Array.isArray(items)) return out;
  for (var i = 0; i < 6; i++) {
    out[i] = items[i] ? Object.assign({}, items[i]) : null;
  }
  return out;
}

function countFilledSlots(slots) {
  return slots.filter(function (s) { return Boolean(s && s.skuId); }).length;
}

function countUniqueSkus(slots) {
  var set = new Set();
  slots.forEach(function (s) {
    if (s && s.skuId) set.add(s.skuId);
  });
  return set.size;
}

function countSkuOccurrences(slots, skuId) {
  return slots.filter(function (s) { return Boolean(s && s.skuId === skuId); }).length;
}

function recountCross(slots, limit) {
  var used = slots.filter(function (s) { return Boolean(s && s.fromCrossPool); }).length;
  return Math.max(0, (limit || 0) - used);
}

function detectDirectPassBranch(state) {
  // L5@v02 §7.4 & V-10: HK market / empty seasonal pool / switch off -> direct pass without blocking
  var mkt = String(state.market || "").toLowerCase();
  if (mkt === "en-hk" || mkt === "hk") return "hk_market_direct_pass";
  if (state.f2SwitchOff) return "switch_off_direct_pass";
  if (state.seasonPoolEmpty) return "season_pool_empty_direct_pass";
  return null;
}

function hasMtoInSlots(slots) {
  return slots.some(function (s) { return Boolean(s && s.isMto); });
}

function createInitialState(role) {
  return {
    role: role || "mother",
    flow: role === "hot_child" ? "hot_child_ready" : (role === "cold_p2" ? "S0_COLD_IDLE" : "master_ready"),
    mode: "master",
    market: "en-us",
    poolId: "",
    poolName: "",
    curatedSlots: [null, null, null, null, null, null],
    slots: [null, null, null, null, null, null],
    rules: { minSkus: 2, maxQty: 6, maxPerSku: 2 },
    crossLimit: 2,
    crossLeft: 2,
    quote: null,
    tiers: null,
    trust: null,
    parcelNote: null,
    mtoSla: null,
    mtoCartHint: null,
    seasonPoolEmpty: false,
    f2SwitchOff: false,
    directPassBranch: null,
    boundaryCode: null,
    commitLockedUntil: 0,
    lastIdempotencyKey: null,
    commitCount: 0,
    duplicateBlockedCount: 0,
    toast: null,
    srMessage: null,
    activeHotspot: null,
    activeBayIndex: 0
  };
}

function computePostEditFlow(baseRole, nextSlots, state) {
  if (baseRole === "hot_child") return "hot_child_pool_edit";
  var directPass = detectDirectPassBranch(state);
  if (hasMtoInSlots(nextSlots) && !directPass) {
    return "mixed_mto_hint";
  }
  return "aux_editing";
}

function reduceBundle(state, intent) {
  var type = intent && intent.type;
  switch (type) {
    case "SET_MARKET": {
      var m = String(intent.market || "en-us").toLowerCase();
      var nextDirect = detectDirectPassBranch(Object.assign({}, state, { market: m }));
      var nextFlow = state.flow;
      if (state.flow === "mixed_mto_hint" && nextDirect) {
        nextFlow = state.mode === "aux" ? "aux_editing" : "master_ready";
      } else if (hasMtoInSlots(state.slots) && !nextDirect && state.role === "mother" && (state.flow === "master_ready" || state.flow === "aux_editing")) {
        nextFlow = "mixed_mto_hint";
      }
      return Object.assign({}, state, {
        market: m,
        directPassBranch: nextDirect,
        flow: nextFlow
      });
    }

    case "HYDRATE_POOL": {
      var curated = padSixSlots(intent.curated || []);
      var initialSlots = padSixSlots(intent.restoredSlots || intent.curated || []);
      var rules = Object.assign({ minSkus: 2, maxQty: 6, maxPerSku: 2 }, intent.rules || {});
      var cLimit = intent.crossLimit != null ? intent.crossLimit : state.crossLimit;
      var nextMode = intent.restoredSlots ? "aux" : "master";
      var nextStateBase = Object.assign({}, state, {
        poolId: intent.poolId || state.poolId,
        poolName: intent.poolName || state.poolName,
        curatedSlots: curated,
        slots: initialSlots,
        rules: rules,
        crossLimit: cLimit,
        crossLeft: recountCross(initialSlots, cLimit),
        seasonPoolEmpty: Boolean(intent.seasonPoolEmpty),
        f2SwitchOff: Boolean(intent.f2SwitchOff),
        mode: nextMode
      });
      nextStateBase.directPassBranch = detectDirectPassBranch(nextStateBase);
      if (state.role === "hot_child") {
        nextStateBase.flow = "hot_child_ready";
      } else if (intent.introPeek) {
        nextStateBase.flow = "master_intro_peek";
      } else if (hasMtoInSlots(initialSlots) && !nextStateBase.directPassBranch) {
        nextStateBase.flow = "mixed_mto_hint";
      } else {
        nextStateBase.flow = nextMode === "aux" ? "aux_editing" : "master_ready";
      }
      return nextStateBase;
    }

    case "HYDRATE_TRUST":
      return Object.assign({}, state, {
        trust: intent.duty && intent.leadtime && intent.threshold
          ? { duty: intent.duty, leadtime: intent.leadtime, threshold: intent.threshold }
          : null
      });

    case "HYDRATE_ECO":
      return Object.assign({}, state, {
        parcelNote: intent.parcelNote || null,
        mtoSla: intent.mtoSla || null,
        mtoCartHint: intent.mtoCartHint || null
      });

    case "SET_QUOTE": {
      var nextQ = intent.quote || null;
      var nextT = intent.tiers !== undefined ? intent.tiers : state.tiers;
      var dp = detectDirectPassBranch(state);
      var mtoActive = (Boolean(nextQ && nextQ.hasMto) || hasMtoInSlots(state.slots)) && !dp;
      var qFlow = state.flow;
      if (state.role === "mother" && mtoActive && (state.flow === "master_ready" || state.flow === "aux_editing")) {
        qFlow = "mixed_mto_hint";
      }
      return Object.assign({}, state, {
        quote: nextQ,
        tiers: nextT,
        directPassBranch: dp,
        flow: qFlow
      });
    }

    case "DISMISS_INTRO_PEEK":
      if (state.flow !== "master_intro_peek") return state;
      return Object.assign({}, state, {
        flow: hasMtoInSlots(state.slots) && !detectDirectPassBranch(state) ? "mixed_mto_hint" : "master_ready"
      });

    case "TOGGLE_MOBILE_FLIP": {
      if (state.flow === "mobile_flip_compare") {
        var backMode = intent.selectMode || state.mode;
        return Object.assign({}, state, {
          mode: backMode,
          slots: backMode === "master" ? padSixSlots(state.curatedSlots) : state.slots,
          flow: backMode === "aux" ? "aux_editing" : "master_ready"
        });
      }
      return Object.assign({}, state, {
        flow: "mobile_flip_compare"
      });
    }

    case "ADD_SLOT": {
      var targetIdx = typeof intent.index === "number"
        ? intent.index
        : state.slots.findIndex(function (s) { return !s || !s.skuId; });

      if (targetIdx < 0 || targetIdx >= 6 || countFilledSlots(state.slots) >= (state.rules.maxQty || 6)) {
        return Object.assign({}, state, {
          boundaryCode: "MAX_QTY",
          flow: "boundary_nudge"
        });
      }
      if (intent.fromCrossPool && state.role === "hot_child") {
        // Hot Child strictly locks single pool — cross-pool redirects to Mother
        return Object.assign({}, state, { flow: "handoff_to_mother" });
      }
      if (intent.fromCrossPool && state.crossLeft <= 0) {
        return Object.assign({}, state, {
          boundaryCode: "CROSS_POOL_CAP",
          flow: "boundary_nudge"
        });
      }
      if (countSkuOccurrences(state.slots, intent.skuId) >= (state.rules.maxPerSku || 2)) {
        return Object.assign({}, state, {
          boundaryCode: "MAX_PER_SKU",
          flow: "boundary_nudge"
        });
      }

      var addedSlots = state.slots.slice();
      addedSlots[targetIdx] = {
        slotId: "bay_" + (targetIdx + 1),
        skuId: intent.skuId,
        title: intent.title || intent.skuId,
        qty: 1,
        isMto: Boolean(intent.isMto),
        fromCrossPool: Boolean(intent.fromCrossPool),
        productUrl: intent.productUrl || ""
      };
      return Object.assign({}, state, {
        slots: addedSlots,
        mode: "aux",
        boundaryCode: null,
        activeBayIndex: targetIdx,
        crossLeft: recountCross(addedSlots, state.crossLimit),
        directPassBranch: detectDirectPassBranch(state),
        flow: computePostEditFlow(state.role, addedSlots, state)
      });
    }

    case "SWAP_SLOT": {
      var sIdx = intent.index;
      if (sIdx == null || sIdx < 0 || sIdx >= 6) return state;
      if (intent.fromCrossPool && state.role === "hot_child") {
        return Object.assign({}, state, { flow: "handoff_to_mother" });
      }
      var curSlot = state.slots[sIdx];
      var extraCross = Boolean(intent.fromCrossPool) && !(curSlot && curSlot.fromCrossPool);
      if (extraCross && state.crossLeft <= 0) {
        return Object.assign({}, state, {
          boundaryCode: "CROSS_POOL_CAP",
          flow: "boundary_nudge"
        });
      }
      var otherSlots = state.slots.filter(function (_, idx) { return idx !== sIdx; });
      if (countSkuOccurrences(otherSlots, intent.skuId) >= (state.rules.maxPerSku || 2)) {
        return Object.assign({}, state, {
          boundaryCode: "MAX_PER_SKU",
          flow: "boundary_nudge"
        });
      }

      var swappedSlots = state.slots.slice();
      swappedSlots[sIdx] = {
        slotId: "bay_" + (sIdx + 1),
        skuId: intent.skuId,
        title: intent.title || intent.skuId,
        qty: 1,
        isMto: Boolean(intent.isMto),
        fromCrossPool: Boolean(intent.fromCrossPool),
        productUrl: intent.productUrl || ""
      };
      return Object.assign({}, state, {
        slots: swappedSlots,
        mode: "aux",
        boundaryCode: null,
        activeBayIndex: sIdx,
        crossLeft: recountCross(swappedSlots, state.crossLimit),
        directPassBranch: detectDirectPassBranch(state),
        flow: computePostEditFlow(state.role, swappedSlots, state)
      });
    }

    case "REMOVE_SLOT": {
      var rIdx = intent.index;
      if (rIdx == null || rIdx < 0 || rIdx >= 6 || !state.slots[rIdx]) return state;
      var candidate = state.slots.slice();
      candidate[rIdx] = null;
      if (countUniqueSkus(candidate) < (state.rules.minSkus || 2)) {
        return Object.assign({}, state, {
          boundaryCode: "MIN_SKUS",
          flow: "boundary_nudge"
        });
      }
      return Object.assign({}, state, {
        slots: candidate,
        mode: "aux",
        boundaryCode: null,
        activeBayIndex: rIdx,
        crossLeft: recountCross(candidate, state.crossLimit),
        directPassBranch: detectDirectPassBranch(state),
        flow: computePostEditFlow(state.role, candidate, state)
      });
    }

    case "REORDER_SLOTS": {
      var fromIdx = intent.from;
      var toIdx = intent.to;
      if (fromIdx == null || toIdx == null || fromIdx === toIdx || fromIdx < 0 || fromIdx >= 6 || toIdx < 0 || toIdx >= 6) {
        return state;
      }
      var reordered = state.slots.slice();
      var temp = reordered[fromIdx];
      reordered[fromIdx] = reordered[toIdx];
      reordered[toIdx] = temp;
      return Object.assign({}, state, {
        slots: reordered,
        mode: "aux",
        activeBayIndex: toIdx,
        flow: computePostEditFlow(state.role, reordered, state),
        srMessage: "Moved bay " + (fromIdx + 1) + " to bay " + (toIdx + 1)
      });
    }

    case "RESET_CURATED": {
      var resetSlots = padSixSlots(state.curatedSlots);
      return Object.assign({}, state, {
        slots: resetSlots,
        mode: "master",
        boundaryCode: null,
        crossLeft: recountCross(resetSlots, state.crossLimit),
        flow: state.role === "hot_child" ? "hot_child_ready" : "master_ready"
      });
    }

    case "CLEAR_BOUNDARY":
      if (state.flow !== "boundary_nudge") return state;
      return Object.assign({}, state, {
        boundaryCode: null,
        flow: computePostEditFlow(state.role, state.slots, state)
      });

    case "HANDOFF_MOTHER":
      return Object.assign({}, state, {
        flow: "handoff_to_mother"
      });

    case "ATTEMPT_COMMIT": {
      var now = Date.now();
      var key = idempotencyKey(state.market, state.poolId, state.mode, state.slots);
      if (now < state.commitLockedUntil || (state.lastIdempotencyKey === key && state.flow === "submitting_cart")) {
        emitBundleEvent("sv_bundle_cart_commit", {
          idempotencyKey: key,
          mode: state.mode,
          blockedDuplicate: true,
          slotCount: countFilledSlots(state.slots),
          hasMto: hasMtoInSlots(state.slots),
          directPassBranch: detectDirectPassBranch(state)
        });
        return Object.assign({}, state, {
          duplicateBlockedCount: state.duplicateBlockedCount + 1,
          toast: intent.duplicateMessage || "Set already queued — duplicate click ignored."
        });
      }
      emitBundleEvent("sv_bundle_cart_commit", {
        idempotencyKey: key,
        mode: state.mode,
        blockedDuplicate: false,
        slotCount: countFilledSlots(state.slots),
        hasMto: hasMtoInSlots(state.slots),
        directPassBranch: detectDirectPassBranch(state)
      });
      return Object.assign({}, state, {
        flow: "submitting_cart",
        lastIdempotencyKey: key,
        commitCount: state.commitCount + 1,
        commitLockedUntil: now + (intent.lockMs || 2500),
        toast: null
      });
    }

    case "CANCEL_COMMIT":
      if (state.flow !== "submitting_cart") return state;
      return Object.assign({}, state, {
        commitLockedUntil: 0,
        flow: state.mode === "aux"
          ? computePostEditFlow(state.role, state.slots, state)
          : (state.role === "hot_child" ? "hot_child_ready" : "master_ready")
      });

    case "COMMIT_OK":
      return Object.assign({}, state, {
        flow: "added_to_cart",
        commitLockedUntil: Date.now() + 1800,
        toast: null
      });

    case "TIMEOUT_FALLBACK":
      return Object.assign({}, state, {
        flow: "timeout_fallback",
        commitLockedUntil: 0,
        toast: intent.message || "Request timed out. Your selected items are preserved."
      });

    case "RETRY_FROM_TIMEOUT":
      return Object.assign({}, state, {
        toast: null,
        flow: state.mode === "aux"
          ? computePostEditFlow(state.role, state.slots, state)
          : (state.role === "hot_child" ? "hot_child_ready" : "master_ready")
      });

    default:
      return state;
  }
}

function persistDraft(state) {
  if (!state || !state.poolId) return;
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        poolId: state.poolId,
        slots: state.slots,
        mode: state.mode
      })
    );
  } catch (_e) {}
}

function loadDraftSlots(poolId) {
  try {
    if (typeof sessionStorage === "undefined") return null;
    var raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    var parsed = JSON.parse(raw);
    if (poolId && parsed.poolId && parsed.poolId !== poolId) return null;
    return Array.isArray(parsed.slots) ? parsed.slots : null;
  } catch (_e) {
    return null;
  }
}

function saveMotherHandoff(poolId, slots) {
  var skus = (slots || []).map(function (s) { return s && s.skuId ? s.skuId : ""; });
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ poolId: poolId, activeSlotSkus: skus, ts: Date.now() }));
    }
  } catch (_e) {}
  return skus;
}

function consumeMotherHandoff() {
  try {
    if (typeof sessionStorage === "undefined") return null;
    var raw = sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(HANDOFF_KEY);
    return JSON.parse(raw);
  } catch (_e) {
    return null;
  }
}

function buildMotherHandoffUrl(poolId, slots, overrideBaseUrl) {
  var skus = saveMotherHandoff(poolId, slots);
  var basePath = overrideBaseUrl || "";
  if (!basePath) {
    if (typeof window !== "undefined" && window.SpaceVanta && window.SpaceVanta.market && window.SpaceVanta.market.buildPath) {
      basePath = window.SpaceVanta.market.buildPath("pages/bundles");
    } else {
      var m = (typeof location !== "undefined" && /^\/(en-(?:us|gb|au|ca|sg|hk))(?=\/|$)/i.exec(location.pathname));
      var prefix = m ? ("/" + m[1].toLowerCase()) : "";
      basePath = prefix + "/pages/bundles";
    }
  }
  var sep = basePath.indexOf("?") === -1 ? "?" : "&";
  var url = basePath + sep + "poolId=" + encodeURIComponent(poolId || "") +
    "&activeSlotSkus=" + encodeURIComponent(skus.filter(Boolean).join(","));
  emitBundleEvent("sv_bundle_handoff_mother", {
    poolId: poolId || "",
    activeSlotSkus: skus.filter(Boolean),
    targetPath: url
  });
  return url;
}

function idempotencyKey(market, poolId, mode, slots) {
  var sig = (slots || [])
    .map(function (s, idx) { return s && s.skuId ? (idx + ":" + s.skuId + ":" + (s.qty || 1)) : (idx + ":_"); })
    .join("|");
  var bucket = Math.floor(Date.now() / 60000);
  var raw = [market || "en-us", poolId || "default", mode || "master", sig, bucket].join("|");
  var h = 0;
  for (var i = 0; i < raw.length; i++) {
    h = ((h * 31) + raw.charCodeAt(i)) | 0;
  }
  return "bdl_" + Math.abs(h).toString(16) + "_" + bucket;
}

/* ---- MTO Ecosystem Reducer, Handoff & Auto-Downgrade (L5@v01 §4 / §5 / §7) ---- */
function detectMtoAutoTier() {
  if (typeof window === "undefined") return "r2";
  try {
    if (window.SpaceVanta && window.SpaceVanta.flags) {
      if (window.SpaceVanta.flags.is3DOff()) return "poster";
      var f = window.SpaceVanta.flags.get ? window.SpaceVanta.flags.get() : {};
      var explicitTier = String(f.sv_tier || "").toLowerCase();
      if (explicitTier === "poster" || explicitTier === "r1" || explicitTier === "r2") {
        return explicitTier;
      }
      var simNet = String(f.sv_net || "").toLowerCase();
      if (simNet === "slow-2g" || simNet === "2g" || simNet === "save-data") return "poster";
      if (simNet === "3g" || simNet === "low-mem") return "r1";
    }
    var nav = window.navigator || {};
    var conn = nav.connection || nav.mozConnection || nav.webkitConnection || null;
    var isCompact = (window.innerWidth || 1280) <= 767;
    if (conn) {
      if (conn.saveData) return "poster";
      var eff = String(conn.effectiveType || "").toLowerCase();
      if (eff === "slow-2g" || eff === "2g") return "poster";
      if (isCompact && (eff === "3g" || (typeof conn.downlink === "number" && conn.downlink > 0 && conn.downlink < 1.5))) {
        return "r1";
      }
    }
    if (isCompact && typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) {
      return "r1";
    }
  } catch (_e) {}
  return "r2";
}

function mtoIdempotencyKey(market, track, sku, form, finish, spec, noteSig) {
  var dayBucket = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  var raw = [
    market || "en-us",
    track || "02",
    sku || "SV_MTO_SKU_01",
    form || "",
    finish || "",
    spec || "",
    String(noteSig || "").slice(0, 64),
    dayBucket
  ].join("|");
  var h = 0;
  for (var i = 0; i < raw.length; i++) {
    h = ((h * 31) + raw.charCodeAt(i)) | 0;
  }
  return "mto_idem_" + Math.abs(h).toString(16) + "_" + dayBucket;
}

function createMtoInitialState(role) {
  var first = MTO_SKUS[0];
  return {
    family: "mto",
    role: role || "mto_mother",
    flow: role === "hot_child" ? "hot_child_ready_01" : "track1_square_showcase",
    track: "01",
    tier: detectMtoAutoTier(),
    market: "en-us",
    poolId: first.poolId,
    sku: first.sku,
    form: first.defaultForm,
    finish: first.defaultFinish,
    spec: first.defaultSpec,
    note: "",
    scenarioId: "desk_fit",
    targetMarket: "en-us",
    budgetBand: "tier_studio",
    qtyBand: "qty_single",
    folioOpen: false,
    autoCycle: true,
    activeHotspot: null,
    reqId: "",
    reqTrack: "",
    revisionCount: 0,
    maxRevisions: null,
    slaCustom: "",
    slaNew: "",
    slaHandover: "",
    importRuleNote: "",
    importRuleLevel: "pass",
    quoteApproved: false,
    quoteExpired: false,
    localePrice: "",
    quoteTtl: "",
    commitLockedUntil: 0,
    lastIdempotencyKey: "",
    commitCount: 0,
    duplicateBlockedCount: 0,
    toast: null
  };
}

function reduceMto(state, intent) {
  var type = intent && intent.type;
  switch (type) {
    case "MTO_SET_MARKET": {
      var m = String(intent.market || "en-us").toLowerCase();
      return Object.assign({}, state, { market: m, targetMarket: m });
    }
    case "MTO_SET_TIER": {
      var t = String(intent.tier || "r2").toLowerCase();
      if (t !== "r2" && t !== "r1" && t !== "poster") t = "r2";
      return Object.assign({}, state, {
        tier: t,
        autoCycle: t === "r2" ? state.autoCycle : false
      });
    }
    case "MTO_SWITCH_TRACK": {
      var tr = String(intent.track || "01");
      if (tr !== "01" && tr !== "02" && tr !== "03") tr = "01";
      var nextSku = intent.sku ? findMtoSku(intent.sku).sku : state.sku;
      var nextFlow = tr === "01"
        ? (state.role === "hot_child" ? "hot_child_ready_01" : "track1_square_showcase")
        : (tr === "02"
          ? (state.role === "hot_child" ? "hot_child_prefill_02" : "track2_customize_stage")
          : (state.folioOpen ? "track3_folio_open" : "track3_folio_closed"));
      return Object.assign({}, state, {
        track: tr,
        sku: nextSku,
        flow: nextFlow,
        toast: null
      });
    }
    case "MTO_SELECT_SKU": {
      // L5@v01 §4.1 #4 & V-03: Switching SKU preserves Form / Finish / Spec!
      var found = findMtoSku(intent.sku);
      return Object.assign({}, state, {
        sku: found.sku,
        poolId: intent.poolId || found.poolId,
        toast: null
      });
    }
    case "MTO_UPDATE_SPEC": {
      return Object.assign({}, state, {
        form: intent.form !== undefined ? String(intent.form) : state.form,
        finish: intent.finish !== undefined ? String(intent.finish) : state.finish,
        spec: intent.spec !== undefined ? String(intent.spec) : state.spec,
        note: intent.note !== undefined ? String(intent.note) : state.note,
        scenarioId: intent.scenarioId !== undefined ? String(intent.scenarioId) : state.scenarioId,
        targetMarket: intent.targetMarket !== undefined ? String(intent.targetMarket) : state.targetMarket,
        budgetBand: intent.budgetBand !== undefined ? String(intent.budgetBand) : state.budgetBand,
        qtyBand: intent.qtyBand !== undefined ? String(intent.qtyBand) : state.qtyBand
      });
    }
    case "MTO_HYDRATE_HANDOFF": {
      // Zero-Reset deep-link / sessionStorage hydration
      var hSku = intent.sku ? findMtoSku(intent.sku) : findMtoSku(state.sku);
      var hTrack = String(intent.track || "02");
      if (hTrack !== "01" && hTrack !== "02" && hTrack !== "03") hTrack = "02";
      return Object.assign({}, state, {
        track: hTrack,
        sku: hSku.sku,
        poolId: intent.pool || hSku.poolId,
        form: intent.form || state.form,
        finish: intent.finish || state.finish,
        spec: intent.spec || state.spec,
        note: intent.note !== undefined ? String(intent.note) : state.note,
        flow: hTrack === "02" ? "track2_customize_stage" : (hTrack === "03" ? "track3_folio_open" : "track1_square_showcase"),
        folioOpen: hTrack === "03" ? true : state.folioOpen
      });
    }
    case "MTO_TOGGLE_FOLIO": {
      var open = intent.open !== undefined ? Boolean(intent.open) : !state.folioOpen;
      return Object.assign({}, state, {
        track: "03",
        folioOpen: open,
        scenarioId: intent.scenarioId || state.scenarioId,
        flow: open ? "track3_folio_open" : "track3_folio_closed"
      });
    }
    case "MTO_ATTEMPT_SUBMIT": {
      var now = Date.now();
      var idem = intent.idempotencyKey || mtoIdempotencyKey(
        state.market,
        state.track,
        state.sku,
        state.form,
        state.finish,
        state.spec,
        state.note
      );
      if (
        now < state.commitLockedUntil ||
        state.flow === "submitting_request" ||
        (state.lastIdempotencyKey === idem && state.commitCount > 0 && !intent.allowFreshKey)
      ) {
        return Object.assign({}, state, {
          duplicateBlockedCount: state.duplicateBlockedCount + 1,
          toast: intent.duplicateMessage || "Request already submitted — duplicate click ignored."
        });
      }
      return Object.assign({}, state, {
        flow: "submitting_request",
        lastIdempotencyKey: idem,
        commitCount: state.commitCount + 1,
        commitLockedUntil: now + (intent.lockMs || 2500),
        toast: null
      });
    }
    case "MTO_SUBMIT_IN_PLACE_ACK": {
      // L5@v01 §4.1 #7: Stay in place, zero jump, zero scroll, zero collapse!
      var ackReqId = String(intent.reqId || state.reqId || "");
      emitBundleEvent("mto.requested", {
        reqId: ackReqId,
        track: state.track,
        sku: state.sku,
        market: state.market
      });
      return Object.assign({}, state, {
        flow: "submit_in_place_ack",
        reqId: ackReqId,
        reqTrack: state.track,
        commitLockedUntil: Date.now() + 1200,
        toast: null
      });
    }
    case "MTO_NEW_REQUEST": {
      return Object.assign({}, state, {
        flow: state.track === "03" ? "track3_folio_open" : "track2_customize_stage",
        commitLockedUntil: 0,
        lastIdempotencyKey: "",
        toast: null
      });
    }
    case "MTO_TIMEOUT_FALLBACK": {
      return Object.assign({}, state, {
        flow: "timeout_fallback",
        commitLockedUntil: 0,
        toast: intent.message || "Request timed out. Your custom selections and notes are safely preserved."
      });
    }
    case "MTO_RETRY_FROM_TIMEOUT": {
      var backFlow = state.track === "03"
        ? (state.folioOpen ? "track3_folio_open" : "track3_folio_closed")
        : (state.track === "02" ? "track2_customize_stage" : "track1_square_showcase");
      return Object.assign({}, state, {
        flow: backFlow,
        toast: null
      });
    }
    default:
      return state;
  }
}

function persistMtoDraft(state) {
  if (!state || state.family !== "mto") return;
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(
      MTO_DRAFT_KEY,
      JSON.stringify({
        track: state.track,
        sku: state.sku,
        pool: state.poolId,
        form: state.form,
        finish: state.finish,
        spec: state.spec,
        note: state.note,
        scenarioId: state.scenarioId,
        budgetBand: state.budgetBand,
        qtyBand: state.qtyBand,
        ts: Date.now()
      })
    );
  } catch (_e) {}
}

function saveMtoRemember(entry) {
  if (!entry) return;
  try {
    if (typeof localStorage === "undefined") return;
    // Strictly zero PII (never store email or localePrice!)
    var safe = {
      reqId: String(entry.reqId || ""),
      track: String(entry.track || "02"),
      sku: String(entry.sku || ""),
      form: String(entry.form || ""),
      finish: String(entry.finish || ""),
      spec: String(entry.spec || ""),
      market: String(entry.market || "en-us"),
      revisionCount: Number(entry.revisionCount || 0),
      ts: Date.now()
    };
    localStorage.setItem(MTO_REMEMBER_KEY, JSON.stringify(safe));
  } catch (_e) {}
}

function loadMtoRemember() {
  try {
    if (typeof localStorage === "undefined") return null;
    var raw = localStorage.getItem(MTO_REMEMBER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_e) {
    return null;
  }
}

function saveMtoHandoff(payload) {
  var pl = payload || {};
  var normalized = {
    track: String(pl.track || "02"),
    sku: String(pl.sku || MTO_SKUS[0].sku),
    pool: String(pl.pool || ""),
    form: String(pl.form || ""),
    finish: String(pl.finish || ""),
    spec: String(pl.spec || ""),
    note: String(pl.note || ""),
    ts: Date.now()
  };
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(MTO_HANDOFF_KEY, JSON.stringify(normalized));
    }
  } catch (_e) {}
  return normalized;
}

function consumeMtoHandoff() {
  var fromQuery = Object.create(null);
  var hasQuery = false;
  try {
    if (typeof window !== "undefined" && window.location && window.location.search) {
      var sp = new URLSearchParams(window.location.search);
      MTO_HANDOFF_FROZEN_KEYS.forEach(function (k) {
        var v = sp.get(k);
        if (v !== null && v !== "") {
          fromQuery[k] = v;
          hasQuery = true;
        }
      });
    }
  } catch (_e) {}

  var fromSession = null;
  try {
    if (typeof sessionStorage !== "undefined") {
      var raw = sessionStorage.getItem(MTO_HANDOFF_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.ts && (Date.now() - parsed.ts) <= MTO_HANDOFF_TTL_MS) {
          fromSession = parsed;
        } else {
          sessionStorage.removeItem(MTO_HANDOFF_KEY);
        }
      }
    }
  } catch (_e) {}

  if (!hasQuery && !fromSession) return null;
  var merged = Object.assign({}, fromSession || {}, fromQuery);
  return merged;
}

function buildMtoMotherUrl(payload, overrideBaseUrl) {
  var saved = saveMtoHandoff(payload);
  var basePath = overrideBaseUrl || "";
  if (!basePath) {
    if (typeof window !== "undefined" && window.SpaceVanta && window.SpaceVanta.market && window.SpaceVanta.market.buildPath) {
      basePath = window.SpaceVanta.market.buildPath("pages/made-to-order");
    } else {
      var m = (typeof location !== "undefined" && /^\/(en-(?:us|gb|au|ca|sg|hk))(?=\/|$)/i.exec(location.pathname));
      var prefix = m ? ("/" + m[1].toLowerCase()) : "/en-us";
      basePath = prefix + "/pages/made-to-order";
    }
  }
  var q = [];
  MTO_HANDOFF_FROZEN_KEYS.forEach(function (k) {
    var val = saved[k];
    if (val !== undefined && val !== null && String(val) !== "") {
      var str = k === "note" ? String(val).slice(0, 180) : String(val);
      q.push(encodeURIComponent(k) + "=" + encodeURIComponent(str));
    }
  });
  var sep = basePath.indexOf("?") === -1 ? "?" : "&";
  return q.length ? (basePath + sep + q.join("&")) : basePath;
}

function dispatch(state, intent, mode) {
  if (state && state.family === "mto") {
    var nextMto = reduceMto(state, intent);
    if (mode !== "ephemeral") {
      persistMtoDraft(nextMto);
    }
    return nextMto;
  }
  var next = reduceBundle(state, intent);
  if (mode !== "ephemeral") {
    persistDraft(next);
  }
  return next;
}

var BundleDriver = {
  version: "L5@v02+mto-L5@v01",
  AssetAdapter: AssetAdapter,
  rig: BUNDLE_MOTHER_RIG,
  mtoRig: MTO_MOTHER_RIG,
  findMtoSku: findMtoSku,
  promoteTiming: DEFAULT_PROMOTE_TIMING,
  createInitialState: createInitialState,
  createMtoInitialState: createMtoInitialState,
  dispatch: dispatch,
  reduceBundle: reduceBundle,
  reduceMto: reduceMto,
  reducePromote: reducePromote,
  s2DurationMs: s2DurationMs,
  s4DurationMs: s4DurationMs,
  mountStage: mountStage,
  updateStage: updateStage,
  getStageHandle: getStageHandle,
  unmountStage: unmountStage,
  resizeAllStages: resizeAllStages,
  getActiveStageCount: getActiveStageCount,
  idempotencyKey: idempotencyKey,
  mtoIdempotencyKey: mtoIdempotencyKey,
  detectMtoAutoTier: detectMtoAutoTier,
  persistDraft: persistDraft,
  loadDraftSlots: loadDraftSlots,
  saveMotherHandoff: saveMotherHandoff,
  consumeMotherHandoff: consumeMotherHandoff,
  buildMotherHandoffUrl: buildMotherHandoffUrl,
  saveMtoHandoff: saveMtoHandoff,
  consumeMtoHandoff: consumeMtoHandoff,
  buildMtoMotherUrl: buildMtoMotherUrl,
  saveMtoRemember: saveMtoRemember,
  loadMtoRemember: loadMtoRemember,
  isReducedMotion: isReducedMotion,
  emitEvent: emitBundleEvent
};

if (typeof window !== "undefined") {
  window.BundleDriver = BundleDriver;
  window.addEventListener("resize", function () {
    resizeAllStages();
  }, { passive: true });
}

export {
  AssetAdapter,
  BundleDriver,
  buildMotherHandoffUrl,
  buildMtoMotherUrl,
  consumeMotherHandoff,
  consumeMtoHandoff,
  createInitialState,
  createMtoInitialState,
  detectMtoAutoTier,
  dispatch,
  emitBundleEvent,
  getActiveStageCount,
  getStageHandle,
  idempotencyKey,
  loadDraftSlots,
  loadMtoRemember,
  mountStage,
  mtoIdempotencyKey,
  persistDraft,
  reduceBundle,
  reduceMto,
  reducePromote,
  resizeAllStages,
  saveMotherHandoff,
  saveMtoHandoff,
  saveMtoRemember,
  unmountStage,
  updateStage,
  validateSlotBindings
};
export default BundleDriver;
