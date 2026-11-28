/**
 * SpaceVanta Bundle 3D Stage Engine (L5@v02 · L3 r2)
 * - 4000-4200K 5-Face Softbox PMREMGenerator Studio IBL + 3-point warm lights (anti-black guarantee)
 * - Dual-layer CSS token resolution (--svd-* -> --sv-* -> PALETTE sRGB fallback, zero bare hex, never black)
 * - 2 Core Hotspots: HS_BAY_GRID (bay_1..bay_6) + HS_SV_CREST (78x72mm plinth-free SV)
 * - 4 C1 Triggered Clips: clip_lid_toggle, clip_slot_add, clip_slot_swap, clip_slot_remove
 *   with mandatory closed-lid -> auto-open 72 deg anti-interpenetration linkage
 * - 3 Frozen Dual-End Camera Presets (tray_view, sv_crest, bay_grid) + ?sv_motion=off 0ms snap
 */
import * as THREE from "three";
import {
  buildMProtoItem,
  buildTrayAssembly,
  resolvePaletteTokens
} from "./bundle-geometry.js";
import {
  C1_CLIPS,
  CAMERA_PRESETS,
  HOTSPOT_GROUPS,
  LID_SV_LOCK,
  getCameraPreset
} from "./motherRig.js";

function isReducedMotion() {
  if (typeof document !== "undefined" && document.documentElement) {
    if (document.documentElement.getAttribute("data-sv-motion") === "off") return true;
  }
  if (typeof window !== "undefined") {
    if (window.SpaceVanta && window.SpaceVanta.flags && window.SpaceVanta.flags.isMotionOff()) return true;
    try {
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    } catch (_e) {}
  }
  return false;
}

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return (window.innerWidth || 1280) <= 767;
}

function easeOutCubic(t) {
  var inv = 1 - Math.max(0, Math.min(1, t));
  return 1 - inv * inv * inv;
}

/**
 * L5@v02 §3.3: Procedural 4000-4200K 5-Face Softbox Studio IBL via PMREMGenerator.
 * Guarantees satin brushed metal (gunmetal/slate/steel/pewter) & bright silver SV
 * never reflect pure black, maintaining W/C >= 1.60.
 */
function createFiveFaceSoftboxEnv(renderer, p) {
  var pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  var envScene = new THREE.Scene();
  envScene.background = new THREE.Color(p.paper);

  // Face 1 (+Y): Overhead 4100K main softbox
  var topFace = new THREE.Mesh(
    new THREE.PlaneGeometry(4.0, 4.0),
    new THREE.MeshBasicMaterial({ color: new THREE.Color("rgb(255, 250, 240)"), side: THREE.DoubleSide })
  );
  topFace.position.set(0, 1.8, 0);
  topFace.rotation.x = Math.PI * 0.5;
  envScene.add(topFace);

  // Face 2 (+X/+Z): Front-right 4050K warm key softbox
  var keyFace = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 2.4),
    new THREE.MeshBasicMaterial({ color: new THREE.Color("rgb(255, 245, 230)"), side: THREE.DoubleSide })
  );
  keyFace.position.set(1.8, 0.85, 1.4);
  keyFace.lookAt(0, 0.03, 0);
  envScene.add(keyFace);

  // Face 3 (-X/+Z): Front-left 4150K fill softbox
  var fillFace = new THREE.Mesh(
    new THREE.PlaneGeometry(3.0, 2.2),
    new THREE.MeshBasicMaterial({ color: new THREE.Color("rgb(252, 244, 232)"), side: THREE.DoubleSide })
  );
  fillFace.position.set(-1.7, 0.75, 1.2);
  fillFace.lookAt(0, 0.03, 0);
  envScene.add(fillFace);

  // Face 4 (-Z/+Y): Rear-top 4200K neutral-warm rim softbox for brushed edge separation
  var rimFace = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 2.0),
    new THREE.MeshBasicMaterial({ color: new THREE.Color("rgb(245, 247, 250)"), side: THREE.DoubleSide })
  );
  rimFace.position.set(0.0, 1.1, -1.8);
  rimFace.lookAt(0, 0.03, 0);
  envScene.add(rimFace);

  // Face 5 (-Y): Warm paper bounce floor (--svd-paper)
  var bounceFace = new THREE.Mesh(
    new THREE.PlaneGeometry(5.0, 5.0),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(p.paper), side: THREE.DoubleSide })
  );
  bounceFace.position.set(0, -1.1, 0);
  bounceFace.rotation.x = -Math.PI * 0.5;
  envScene.add(bounceFace);

  var rt = pmrem.fromScene(envScene, 0.035);
  envScene.traverse(function (obj) {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      obj.material.dispose();
    }
  });
  pmrem.dispose();
  return rt;
}

function createBundleScene(canvas, config, initialPresetName, extras) {
  var cfg = config || {};
  var ext = extras || {};
  var tStart = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  var p = resolvePaletteTokens();

  var baselineGeometries = 0;
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min((typeof window !== "undefined" && window.devicePixelRatio) || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(p.paper);
  scene.fog = new THREE.FogExp2(new THREE.Color(p.paper).getHex(), 0.22);

  var envTarget = createFiveFaceSoftboxEnv(renderer, p);
  scene.environment = envTarget.texture;
  if ("environmentIntensity" in scene) {
    scene.environmentIntensity = 0.96;
  }
  baselineGeometries = renderer.info.memory.geometries;

  var activePreset = initialPresetName || "tray_view";
  var mobileFlag = isMobileViewport();
  var initCamSpec = getCameraPreset(activePreset, mobileFlag);

  var cam = new THREE.PerspectiveCamera(initCamSpec.fov, 1, 0.01, 12);
  var camPos = new THREE.Vector3(initCamSpec.position[0], initCamSpec.position[1], initCamSpec.position[2]);
  var camTarget = new THREE.Vector3(initCamSpec.target[0], initCamSpec.target[1], initCamSpec.target[2]);
  var spherical = new THREE.Spherical().setFromVector3(camPos.clone().sub(camTarget));

  function syncCameraFromSpherical() {
    spherical.phi = Math.max(0.18, Math.min(Math.PI * 0.5 - 0.06, spherical.phi));
    spherical.radius = Math.max(0.16, Math.min(1.15, spherical.radius));
    var nextPos = new THREE.Vector3().setFromSpherical(spherical).add(camTarget);
    cam.position.copy(nextPos);
    cam.lookAt(camTarget);
  }
  cam.position.copy(camPos);
  cam.lookAt(camTarget);

  // 3-Point Warm Studio Lighting (4000-4200K) + Hemisphere Warm Paper Bounce
  scene.add(new THREE.HemisphereLight(new THREE.Color("rgb(255, 251, 243)"), new THREE.Color(p.paperSubtle), 0.82));

  var keyLight = new THREE.DirectionalLight(new THREE.Color("rgb(255, 247, 234)"), 1.28);
  keyLight.position.set(0.42, 0.68, 0.38);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 0.05;
  keyLight.shadow.camera.far = 2.5;
  keyLight.shadow.camera.left = -0.32;
  keyLight.shadow.camera.right = 0.32;
  keyLight.shadow.camera.top = 0.32;
  keyLight.shadow.camera.bottom = -0.32;
  keyLight.shadow.bias = -0.0004;
  scene.add(keyLight);

  var fillLight = new THREE.DirectionalLight(new THREE.Color(p.paper), 0.62);
  fillLight.position.set(-0.38, 0.36, 0.24);
  scene.add(fillLight);

  var rimLight = new THREE.DirectionalLight(new THREE.Color("rgb(244, 247, 252)"), 0.54);
  rimLight.position.set(-0.12, 0.48, -0.44);
  scene.add(rimLight);

  // Build homologous Mother (0 tris) + Child_Tray assembly
  var built = buildTrayAssembly(cfg);
  scene.add(built.root);

  var geoSource = ext.glbRoot ? "glb" : "procedural";
  if (ext.glbRoot) {
    ext.glbRoot.name = "Child_Tray_GLB";
    built.motherRoot.add(ext.glbRoot);
    built.tray.visible = false;
  }

  // Warm paper shadow-catcher ground disc (--svd-paper, never black)
  var floorGeo = new THREE.CircleGeometry(0.46, 56);
  var floorMat = new THREE.MeshStandardMaterial({
    name: "warm_paper_floor_mat",
    color: new THREE.Color(p.paper),
    metalness: 0.0,
    roughness: 0.94
  });
  var floor = new THREE.Mesh(floorGeo, floorMat);
  floor.name = "warm_paper_floor";
  floor.rotation.x = -Math.PI * 0.5;
  floor.position.y = -0.0002;
  floor.receiveShadow = true;
  scene.add(floor);

  function getActiveTrayRoot() {
    return geoSource === "glb" && ext.glbRoot ? ext.glbRoot : built.tray;
  }

  function getHingeNode() {
    var r = getActiveTrayRoot();
    return r.getObjectByName("lid_hinge") || built.hinge;
  }

  function resolveBayNodes() {
    var r = getActiveTrayRoot();
    var out = [];
    for (var i = 1; i <= 6; i++) {
      var b = r.getObjectByName("bay_" + i);
      if (b) out.push(b);
    }
    return out.length === 6 ? out : built.bayCells;
  }

  // Lid & Camera Tween State
  var currentLidDeg = 0;
  var lidTween = null;
  var camTween = null;
  var slotTasks = [];
  var currentSlots = [null, null, null, null, null, null];
  var activeHotspotId = null;
  var activeBayIndex = -1;
  var onSlotSelect = typeof ext.onSlotSelect === "function" ? ext.onSlotSelect : null;
  var onTelemetry = typeof ext.onTelemetry === "function" ? ext.onTelemetry : null;

  function applyLidAngleImmediate(deg) {
    currentLidDeg = Math.max(0, Math.min(85, deg));
    var h = getHingeNode();
    if (h) {
      h.rotation.x = THREE.MathUtils.degToRad(-currentLidDeg);
    }
  }

  function startLidTween(targetDeg, durationMs, onDone) {
    var clamped = Math.max(0, Math.min(85, targetDeg));
    if (isReducedMotion() || durationMs <= 0 || Math.abs(clamped - currentLidDeg) < 0.2) {
      lidTween = null;
      applyLidAngleImmediate(clamped);
      if (typeof onDone === "function") onDone();
      return;
    }
    lidTween = {
      fromDeg: currentLidDeg,
      toDeg: clamped,
      startMs: performance.now(),
      durationMs: durationMs,
      onDone: onDone || null
    };
  }

  function startCameraPresetTween(presetName, customEaseMs) {
    activePreset = CAMERA_PRESETS[presetName] ? presetName : "tray_view";
    var spec = getCameraPreset(activePreset, isMobileViewport());
    var dur = isReducedMotion() ? 0 : (customEaseMs != null ? customEaseMs : CAMERA_PRESETS[activePreset].easeMs);

    if (dur <= 0) {
      camTween = null;
      camPos.set(spec.position[0], spec.position[1], spec.position[2]);
      camTarget.set(spec.target[0], spec.target[1], spec.target[2]);
      cam.fov = spec.fov;
      cam.position.copy(camPos);
      cam.lookAt(camTarget);
      cam.updateProjectionMatrix();
      spherical.setFromVector3(camPos.clone().sub(camTarget));
      return;
    }

    camTween = {
      fromPos: cam.position.clone(),
      toPos: new THREE.Vector3(spec.position[0], spec.position[1], spec.position[2]),
      fromTarget: camTarget.clone(),
      toTarget: new THREE.Vector3(spec.target[0], spec.target[1], spec.target[2]),
      fromFov: cam.fov,
      toFov: spec.fov,
      startMs: performance.now(),
      durationMs: dur
    };
  }

  function clearMountChildren(mountNode) {
    if (!mountNode) return;
    var copy = mountNode.children.slice();
    copy.forEach(function (ch) {
      mountNode.remove(ch);
      ch.traverse(function (o) {
        if (o instanceof THREE.Mesh) {
          if (o.geometry) o.geometry.dispose();
          if (Array.isArray(o.material)) o.material.forEach(function (m) { m.dispose(); });
          else if (o.material) o.material.dispose();
        }
      });
    });
  }

  function syncSlotsImmediate(slotsArray, highlightIdx) {
    var bayNodes = resolveBayNodes();
    activeBayIndex = highlightIdx != null ? highlightIdx : activeBayIndex;
    for (var i = 0; i < 6; i++) {
      var s = slotsArray && slotsArray[i] ? slotsArray[i] : null;
      currentSlots[i] = s ? Object.assign({}, s) : null;
      var bay = bayNodes[i];
      if (!bay) continue;

      var mount = bay.getObjectByName("bay_" + (i + 1) + "_item_mount") || bay;
      clearMountChildren(mount);

      var emptyLine = bay.getObjectByName("bay_" + (i + 1) + "_empty_outline");
      var collar = bay.getObjectByName("bay_" + (i + 1) + "_collar");
      if (collar && collar.material && "emissiveIntensity" in collar.material) {
        collar.material.emissiveIntensity = i === activeBayIndex ? 0.55 : 0.0;
      }

      if (s && s.skuId) {
        if (emptyLine) emptyLine.visible = false;
        var item = buildMProtoItem(s.skuId, { lod: 0 });
        item.userData.bayIndex = i;
        item.userData.slot = Object.assign({ bayIndex: i, slotId: "bay_" + (i + 1) }, s);
        mount.add(item);
      } else if (emptyLine) {
        emptyLine.visible = true;
      }
    }
  }

  /**
   * L5@v02 §6.2: Execute one of the 4 C1 triggered clips:
   * - clip_lid_toggle (~400ms)
   * - clip_slot_add (~280ms)
   * - clip_slot_swap (~320ms)
   * - clip_slot_remove (~220ms)
   * Enforces mandatory closed-lid -> auto-open 72 deg anti-interpenetration linkage!
   */
  function playClip(clipId, payload) {
    var opts = payload || {};
    var motionOff = isReducedMotion();

    if (clipId === "clip_lid_toggle") {
      var nextDeg = opts.targetDeg != null
        ? opts.targetDeg
        : (currentLidDeg < 40 ? LID_SV_LOCK.openDeg : LID_SV_LOCK.closedDeg);
      startLidTween(nextDeg, motionOff ? 0 : C1_CLIPS.clip_lid_toggle.durationMs, opts.onDone);
      return { clipId: clipId, autoOpenedLid: false, targetLidDeg: nextDeg };
    }

    // Slot C1 clips: check mandatory anti-interpenetration auto-open to 72 deg!
    var needsAutoOpen = currentLidDeg < LID_SV_LOCK.openDeg - 1;
    var bayIdx = typeof opts.bayIndex === "number" ? Math.max(0, Math.min(5, opts.bayIndex)) : 0;
    var bayNodes = resolveBayNodes();
    var bay = bayNodes[bayIdx];

    function runSlotAnimation() {
      if (!bay) {
        if (opts.slots) syncSlotsImmediate(opts.slots, bayIdx);
        return;
      }
      var mount = bay.getObjectByName("bay_" + (bayIdx + 1) + "_item_mount") || bay;
      var collar = bay.getObjectByName("bay_" + (bayIdx + 1) + "_collar");
      var emptyLine = bay.getObjectByName("bay_" + (bayIdx + 1) + "_empty_outline");

      if (motionOff) {
        if (opts.slots) syncSlotsImmediate(opts.slots, bayIdx);
        return;
      }

      if (clipId === "clip_slot_add") {
        clearMountChildren(mount);
        if (emptyLine) emptyLine.visible = false;
        var skuAdd = (opts.skuId) || (opts.slots && opts.slots[bayIdx] && opts.slots[bayIdx].skuId) || "SV_MP_SKU_01_v01";
        var addMesh = buildMProtoItem(skuAdd, { lod: 0 });
        addMesh.position.y = 0.036;
        addMesh.userData.bayIndex = bayIdx;
        addMesh.userData.slot = { bayIndex: bayIdx, slotId: "bay_" + (bayIdx + 1), skuId: skuAdd };
        mount.add(addMesh);
        currentSlots[bayIdx] = { skuId: skuAdd };
        slotTasks.push({
          type: "add",
          mesh: addMesh,
          collar: collar,
          startMs: performance.now(),
          durationMs: C1_CLIPS.clip_slot_add.durationMs
        });
      } else if (clipId === "clip_slot_swap") {
        var oldMesh = mount.children[0] || null;
        var skuNext = (opts.skuId) || (opts.slots && opts.slots[bayIdx] && opts.slots[bayIdx].skuId) || "SV_MP_SKU_02_v01";
        currentSlots[bayIdx] = { skuId: skuNext };
        slotTasks.push({
          type: "swap",
          mount: mount,
          oldMesh: oldMesh,
          swapped: false,
          nextSku: skuNext,
          bayIndex: bayIdx,
          collar: collar,
          emptyLine: emptyLine,
          startMs: performance.now(),
          durationMs: C1_CLIPS.clip_slot_swap.durationMs
        });
      } else if (clipId === "clip_slot_remove") {
        var remMesh = mount.children[0] || null;
        currentSlots[bayIdx] = null;
        if (!remMesh) {
          if (emptyLine) emptyLine.visible = true;
          return;
        }
        slotTasks.push({
          type: "remove",
          mount: mount,
          mesh: remMesh,
          emptyLine: emptyLine,
          startMs: performance.now(),
          durationMs: C1_CLIPS.clip_slot_remove.durationMs
        });
      }
    }

    if (needsAutoOpen) {
      if (motionOff) {
        applyLidAngleImmediate(LID_SV_LOCK.openDeg);
        runSlotAnimation();
      } else {
        startLidTween(LID_SV_LOCK.openDeg, C1_CLIPS.clip_lid_toggle.durationMs, runSlotAnimation);
      }
    } else {
      runSlotAnimation();
    }

    if (onTelemetry) {
      onTelemetry("sv_bundle_slot_edit", {
        op: clipId.replace("clip_slot_", ""),
        clipId: clipId,
        bayIndex: bayIdx,
        skuId: opts.skuId || "",
        autoOpenedLid: needsAutoOpen
      });
    }

    return {
      clipId: clipId,
      autoOpenedLid: needsAutoOpen,
      targetLidDeg: LID_SV_LOCK.openDeg
    };
  }

  /**
   * L5@v02 §6.2 & §6.3: Focus one of the 2 core hotspot groups:
   * - HS_SV_CREST: if lid open, auto-closes to 0 deg, eases camera to sv_crest (~70 deg oblique)
   * - HS_BAY_GRID: if lid closed, auto-opens to 72 deg, eases camera to bay_grid
   */
  function focusHotspot(hotspotId, subBayIdx) {
    if (!hotspotId || hotspotId === "tray_view") {
      activeHotspotId = null;
      startCameraPresetTween("tray_view");
      return { hotspotId: null, cameraPreset: "tray_view", lidDeg: currentLidDeg };
    }

    activeHotspotId = hotspotId;
    if (hotspotId === "HS_SV_CREST") {
      if (currentLidDeg > 0.5) {
        startLidTween(LID_SV_LOCK.closedDeg, C1_CLIPS.clip_lid_toggle.durationMs);
      }
      startCameraPresetTween("sv_crest");
      if (onTelemetry) {
        onTelemetry("sv_bundle_hotspot_focus", {
          hotspotId: "HS_SV_CREST",
          bayIndex: -1,
          cameraPreset: "sv_crest",
          lidDeg: 0
        });
      }
      return { hotspotId: "HS_SV_CREST", cameraPreset: "sv_crest", lidDeg: 0 };
    }

    if (hotspotId === "HS_BAY_GRID") {
      var bIdx = typeof subBayIdx === "number" ? subBayIdx : (activeBayIndex >= 0 ? activeBayIndex : 0);
      activeBayIndex = bIdx;
      if (currentLidDeg < LID_SV_LOCK.openDeg - 1) {
        startLidTween(LID_SV_LOCK.openDeg, C1_CLIPS.clip_lid_toggle.durationMs);
      }
      startCameraPresetTween("bay_grid");
      // Highlight selected bay collar
      var bays = resolveBayNodes();
      bays.forEach(function (b, idx) {
        var col = b.getObjectByName("bay_" + (idx + 1) + "_collar");
        if (col && col.material && "emissiveIntensity" in col.material) {
          col.material.emissiveIntensity = idx === bIdx ? 0.55 : 0.0;
        }
      });
      if (onTelemetry) {
        onTelemetry("sv_bundle_hotspot_focus", {
          hotspotId: "HS_BAY_GRID",
          bayIndex: bIdx,
          cameraPreset: "bay_grid",
          lidDeg: LID_SV_LOCK.openDeg
        });
      }
      return { hotspotId: "HS_BAY_GRID", bayIndex: bIdx, cameraPreset: "bay_grid", lidDeg: LID_SV_LOCK.openDeg };
    }

    return { hotspotId: hotspotId, cameraPreset: activePreset, lidDeg: currentLidDeg };
  }

  function getHotspotScreenCoords() {
    var rect = canvas.getBoundingClientRect();
    var w = rect.width || canvas.clientWidth || 640;
    var h = rect.height || canvas.clientHeight || 380;
    built.root.updateMatrixWorld(true);

    return HOTSPOT_GROUPS.map(function (hs) {
      var targetObj = getActiveTrayRoot().getObjectByName(hs.id);
      var wp = new THREE.Vector3();
      if (targetObj) {
        targetObj.getWorldPosition(wp);
      } else {
        wp.set(hs.anchorLocal[0], hs.anchorLocal[1], hs.anchorLocal[2]);
      }
      var proj = wp.clone().project(cam);
      return {
        id: hs.id,
        xPx: Math.round((proj.x * 0.5 + 0.5) * w),
        yPx: Math.round((-proj.y * 0.5 + 0.5) * h),
        active: activeHotspotId === hs.id
      };
    });
  }

  // Pointer Orbit + Bay Raycast Click
  var raycaster = new THREE.Raycaster();
  var pointer = new THREE.Vector2();
  var dragging = false;
  var moved = false;
  var lastX = 0;
  var lastY = 0;

  var onPointerDown = function (e) {
    dragging = true;
    moved = false;
    lastX = e.clientX;
    lastY = e.clientY;
    if (canvas.setPointerCapture) {
      try { canvas.setPointerCapture(e.pointerId); } catch (_err) {}
    }
  };

  var onPointerMove = function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX;
    var dy = e.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
    lastX = e.clientX;
    lastY = e.clientY;
    camTween = null;
    spherical.theta -= dx * 0.0065;
    spherical.phi -= dy * 0.005;
    syncCameraFromSpherical();
  };

  var onPointerUp = function (e) {
    if (!dragging) return;
    dragging = false;
    if (!moved) {
      var rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, cam);
        var hits = raycaster.intersectObjects(getActiveTrayRoot().children, true);
        for (var i = 0; i < hits.length; i++) {
          var cur = hits[i].object;
          while (cur) {
            if (cur.name === "svLogoGroup") {
              focusHotspot("HS_SV_CREST");
              return;
            }
            if (typeof cur.userData.bayIndex === "number") {
              var bIdx = cur.userData.bayIndex;
              focusHotspot("HS_BAY_GRID", bIdx);
              if (onSlotSelect) {
                onSlotSelect(Object.assign({ bayIndex: bIdx, slotId: "bay_" + (bIdx + 1) }, currentSlots[bIdx] || {}));
              }
              return;
            }
            cur = cur.parent;
          }
        }
      }
    }
  };

  var onWheel = function (e) {
    e.preventDefault();
    camTween = null;
    spherical.radius += e.deltaY * 0.00045;
    syncCameraFromSpherical();
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  var raf = 0;
  var paused = false;
  var disposed = false;
  var firstFrameEmitted = false;

  function stepAnimations(nowMs) {
    if (lidTween) {
      var lt = (nowMs - lidTween.startMs) / lidTween.durationMs;
      if (lt >= 1) {
        var doneCb = lidTween.onDone;
        var finalDeg = lidTween.toDeg;
        lidTween = null;
        applyLidAngleImmediate(finalDeg);
        if (typeof doneCb === "function") doneCb();
      } else {
        var k = easeOutCubic(lt);
        applyLidAngleImmediate(lidTween.fromDeg + (lidTween.toDeg - lidTween.fromDeg) * k);
      }
    }

    if (camTween) {
      var ct = (nowMs - camTween.startMs) / camTween.durationMs;
      if (ct >= 1) {
        cam.position.copy(camTween.toPos);
        camTarget.copy(camTween.toTarget);
        cam.fov = camTween.toFov;
        cam.lookAt(camTarget);
        cam.updateProjectionMatrix();
        spherical.setFromVector3(cam.position.clone().sub(camTarget));
        camTween = null;
      } else {
        var ck = easeOutCubic(ct);
        cam.position.lerpVectors(camTween.fromPos, camTween.toPos, ck);
        camTarget.lerpVectors(camTween.fromTarget, camTween.toTarget, ck);
        cam.fov = camTween.fromFov + (camTween.toFov - camTween.fromFov) * ck;
        cam.lookAt(camTarget);
        cam.updateProjectionMatrix();
        spherical.setFromVector3(cam.position.clone().sub(camTarget));
      }
    }

    for (var s = slotTasks.length - 1; s >= 0; s--) {
      var task = slotTasks[s];
      var pRatio = Math.min(1, (nowMs - task.startMs) / task.durationMs);
      if (task.type === "add") {
        task.mesh.position.y = 0.036 * (1 - easeOutCubic(pRatio));
        if (task.collar && task.collar.material && "emissiveIntensity" in task.collar.material) {
          task.collar.material.emissiveIntensity = Math.sin(pRatio * Math.PI) * 0.85;
        }
        if (pRatio >= 1) {
          task.mesh.position.y = 0;
          slotTasks.splice(s, 1);
        }
      } else if (task.type === "swap") {
        // Staggered phase: 0..0.48 lift out oldMesh, 0.50 swap (0 interpenetration!), 0.50..1.0 drop in newMesh
        if (pRatio < 0.5) {
          if (task.oldMesh) {
            task.oldMesh.position.y = 0.034 * easeOutCubic(pRatio * 2);
          }
        } else {
          if (!task.swapped) {
            task.swapped = true;
            clearMountChildren(task.mount);
            if (task.emptyLine) task.emptyLine.visible = false;
            var incoming = buildMProtoItem(task.nextSku, { lod: 0 });
            incoming.position.y = 0.034;
            incoming.userData.bayIndex = task.bayIndex;
            task.mount.add(incoming);
            task.newMesh = incoming;
          }
          if (task.newMesh) {
            task.newMesh.position.y = 0.034 * (1 - easeOutCubic((pRatio - 0.5) * 2));
          }
        }
        if (pRatio >= 1) {
          if (task.newMesh) task.newMesh.position.y = 0;
          slotTasks.splice(s, 1);
        }
      } else if (task.type === "remove") {
        task.mesh.position.y = 0.034 * easeOutCubic(pRatio);
        if (pRatio >= 1) {
          clearMountChildren(task.mount);
          if (task.emptyLine) task.emptyLine.visible = true;
          slotTasks.splice(s, 1);
        }
      }
    }
  }

  var resize = function () {
    if (disposed) return;
    var parent = canvas.parentElement;
    var w = Math.max(240, (parent && parent.clientWidth) || canvas.clientWidth || 640);
    var h = Math.max(300, (parent && parent.clientHeight) || Math.round(w * 0.62));
    canvas.style.width = "100%";
    canvas.style.height = h + "px";
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    renderer.render(scene, cam);
  };

  var loop = function (ts) {
    if (disposed || paused) return;
    var nowMs = ts || performance.now();
    stepAnimations(nowMs);
    renderer.render(scene, cam);
    if (!firstFrameEmitted) {
      firstFrameEmitted = true;
      var firstFrameMs = Math.round(nowMs - tStart);
      if (onTelemetry) {
        onTelemetry("sv_bundle_stage_ready", {
          geoSource: geoSource,
          firstFrameMs: firstFrameMs,
          modelTier: "r2"
        });
      }
    }
    raf = requestAnimationFrame(loop);
  };

  resize();
  loop(performance.now());

  return {
    canvas: canvas,
    geoSource: geoSource,
    motherMeshCount: built.motherMeshCount,
    baselineGeometries: baselineGeometries,
    memoryGeometries: function () { return renderer.info.memory.geometries; },
    getBoundSlots: function () { return currentSlots.slice(); },
    getLidOpenDeg: function () { return currentLidDeg; },
    getCameraState: function () {
      return {
        preset: activePreset,
        position: [
          Number(cam.position.x.toFixed(4)),
          Number(cam.position.y.toFixed(4)),
          Number(cam.position.z.toFixed(4))
        ],
        target: [
          Number(camTarget.x.toFixed(4)),
          Number(camTarget.y.toFixed(4)),
          Number(camTarget.z.toFixed(4))
        ],
        fov: Number(cam.fov.toFixed(2)),
        lidDeg: Number(currentLidDeg.toFixed(2)),
        activeHotspotId: activeHotspotId,
        activeBayIndex: activeBayIndex
      };
    },
    getSvCrestMetrics: function () {
      var logoNode = getActiveTrayRoot().getObjectByName("svLogoGroup") || built.logo;
      var minX = Infinity, maxX = -Infinity;
      var minY = Infinity, maxY = -Infinity;
      var minZ = Infinity, maxZ = -Infinity;
      logoNode.updateMatrixWorld(true);
      var invLogo = logoNode.matrixWorld.clone().invert();
      logoNode.traverse(function (m) {
        if (m instanceof THREE.Mesh && m.geometry) {
          m.geometry.computeBoundingBox();
          var bb = m.geometry.boundingBox;
          if (bb) {
            var relMat = m.matrixWorld.clone().premultiply(invLogo);
            var localBb = bb.clone().applyMatrix4(relMat);
            if (localBb.min.x < minX) minX = localBb.min.x;
            if (localBb.max.x > maxX) maxX = localBb.max.x;
            if (localBb.min.y < minY) minY = localBb.min.y;
            if (localBb.max.y > maxY) maxY = localBb.max.y;
            if (localBb.min.z < minZ) minZ = localBb.min.z;
            if (localBb.max.z > maxZ) maxZ = localBb.max.z;
          }
        }
      });
      var wMm = (maxX - minX) * 1000;
      var hMm = (maxZ - minZ) * 1000;
      var tMm = (maxY - minY) * 1000;
      return {
        widthMm: Number(wMm.toFixed(1)),
        heightMm: Number(hMm.toFixed(1)),
        thicknessMm: Number(tMm.toFixed(2)),
        aspectRatio: Number((wMm / (hMm || 1)).toFixed(2)),
        logoLocalY: Number(logoNode.position.y.toFixed(4)),
        localBboxMinY: Number((minY === Infinity ? 0 : minY).toFixed(5)),
        hasPlinth: Boolean(getActiveTrayRoot().getObjectByName("svPlinth"))
      };
    },
    getMotherInspection: function () {
      var mNode = built.motherRoot;
      var directMeshes = 0;
      var directMaterials = 0;
      var directShadows = 0;
      var anchorsFound = [];
      mNode.children.forEach(function (ch) {
        if (ch instanceof THREE.Mesh) {
          directMeshes += 1;
          if (ch.material) directMaterials += 1;
          if (ch.castShadow || ch.receiveShadow) directShadows += 1;
        }
        if (ch.name.indexOf("anchor_") === 0) {
          anchorsFound.push({
            name: ch.name,
            hasRotor: Boolean(ch.getObjectByName("rotor") || ch.getObjectByName("Rotor"))
          });
        }
      });
      return {
        motherId: mNode.name,
        triangles: directMeshes,
        materials: directMaterials,
        shadows: directShadows,
        anchors: anchorsFound
      };
    },
    getHotspotScreenCoords: getHotspotScreenCoords,
    setCameraPreset: function (presetName, customEaseMs) {
      startCameraPresetTween(presetName, customEaseMs);
    },
    focusHotspot: focusHotspot,
    playClip: playClip,
    setLidOpenDeg: function (deg, animate) {
      if (animate) {
        playClip("clip_lid_toggle", { targetDeg: deg });
      } else {
        lidTween = null;
        applyLidAngleImmediate(deg);
      }
    },
    setSlots: function (slots, activeIdx, clipHint) {
      if (clipHint && clipHint.clipId) {
        playClip(clipHint.clipId, {
          bayIndex: clipHint.bayIndex,
          skuId: clipHint.skuId,
          slots: slots
        });
        return;
      }
      syncSlotsImmediate(slots, activeIdx != null ? activeIdx : -1);
    },
    setMotherRigVisible: function (on) {
      built.rigOverlay.visible = Boolean(on);
    },
    refreshTokens: function () {
      var nextP = resolvePaletteTokens();
      scene.background = new THREE.Color(nextP.paper);
      if (scene.fog) scene.fog.color = new THREE.Color(nextP.paper);
      floorMat.color = new THREE.Color(nextP.paper);
    },
    pause: function () {
      paused = true;
      cancelAnimationFrame(raf);
    },
    resume: function () {
      if (disposed || !paused) return;
      paused = false;
      loop(performance.now());
    },
    resize: resize,
    dispose: function () {
      if (disposed) return { geometriesAfter: 0, baselineDelta: 0 };
      disposed = true;
      paused = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);

      // 3-Part Explicit Dispose (L5@v02 §4.2 S5_COLD_PARK / V-P6):
      // 1) Environment & Textures, 2) Geometries & Materials, 3) WebGLRenderer
      envTarget.dispose();
      scene.environment = null;
      scene.traverse(function (obj) {
        if (obj.geometry && typeof obj.geometry.dispose === "function") {
          obj.geometry.dispose();
        }
        var mat = obj.material;
        if (Array.isArray(mat)) {
          mat.forEach(function (m) {
            if (m && m.map) m.map.dispose();
            if (m && typeof m.dispose === "function") m.dispose();
          });
        } else if (mat) {
          if (mat.map) mat.map.dispose();
          if (typeof mat.dispose === "function") mat.dispose();
        }
      });
      var geoAfter = renderer.info.memory.geometries;
      renderer.dispose();
      return {
        geometriesAfter: geoAfter,
        baselineDelta: Math.abs(geoAfter - baselineGeometries)
      };
    }
  };
}

function webglAvailable() {
  try {
    if (typeof document === "undefined") return false;
    var c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (_e) {
    return false;
  }
}

export {
  createBundleScene,
  createFiveFaceSoftboxEnv,
  isMobileViewport,
  isReducedMotion,
  webglAvailable
};
