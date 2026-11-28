/**
 * SpaceVanta MTO Ecosystem 3D Stage Engine (L5@v01 · L3 r2)
 * Mounted exclusively via global BundleDriver.mountStage(canvas, { pack: "mto", ... }).
 *
 * Enforces:
 * - Single persistent Hot Canvas shared across Track 01 / Track 02 / Track 03 & Hot Child Mode A1 / A2
 * - SV_MOTHER_MTO_v01 = 0 triangles / 0 meshes / 0 shadows
 * - r2 Hotspots (HS_MTO_01_SAT_01..04, HS_MTO_02_FORM/FINISH/SPEC, HS_MTO_03_FOLIO_COVER)
 * - 6 C1 Clips (clip_track_morph, clip_sat_arc_swap, clip_magnetic_levitate, clip_layer_part,
 *   clip_folio_unfold, clip_submit_in_place_ack)
 * - Tier downgrade r2 -> r1 (manual orbit/zoom only, strips hotspots & C1 clips) -> Poster (unmounted 0 WebGL)
 * - Mobile 375px disables pointer parallax; ?sv_motion=off / prefers-reduced-motion forces 0ms snap
 */
import * as THREE from "three";
import { resolvePaletteTokens } from "./bundle-geometry.js";
import { isReducedMotion } from "./BundleScene3D.js";
import {
  buildContactShadowPlane,
  buildMtoMotherRoot,
  buildMtoProductSubject,
  buildMtoTrack01Group,
  buildMtoTrack02Group,
  buildMtoTrack03Group
} from "./mto-geometry.js";
import {
  MTO_ANCHORS,
  MTO_C1_CLIPS,
  MTO_MOTHER_ID,
  MTO_MOUNT_ORDER,
  MTO_SKUS,
  MTO_SNAP,
  getMtoCameraPreset
} from "./mtoRig.js";

function isMobile375OrCompact() {
  if (typeof window === "undefined") return false;
  return (window.innerWidth || 1280) <= 767;
}

function easeCubicInOut(t) {
  var x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function createWarmMtoSoftboxEnv(renderer, p) {
  var pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  var envScene = new THREE.Scene();
  envScene.background = new THREE.Color(p.paper);

  var top = new THREE.Mesh(
    new THREE.PlaneGeometry(4.0, 4.0),
    new THREE.MeshBasicMaterial({ color: new THREE.Color("rgb(255, 250, 240)"), side: THREE.DoubleSide })
  );
  top.position.set(0, 1.8, 0);
  top.rotation.x = Math.PI * 0.5;
  envScene.add(top);

  var key = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 2.4),
    new THREE.MeshBasicMaterial({ color: new THREE.Color("rgb(255, 245, 230)"), side: THREE.DoubleSide })
  );
  key.position.set(1.7, 0.85, 1.4);
  key.lookAt(0, 0.04, 0);
  envScene.add(key);

  var fill = new THREE.Mesh(
    new THREE.PlaneGeometry(3.0, 2.2),
    new THREE.MeshBasicMaterial({ color: new THREE.Color("rgb(252, 244, 232)"), side: THREE.DoubleSide })
  );
  fill.position.set(-1.6, 0.75, 1.2);
  fill.lookAt(0, 0.04, 0);
  envScene.add(fill);

  var bounce = new THREE.Mesh(
    new THREE.PlaneGeometry(5.0, 5.0),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(p.paper), side: THREE.DoubleSide })
  );
  bounce.position.set(0, -1.0, 0);
  bounce.rotation.x = -Math.PI * 0.5;
  envScene.add(bounce);

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

function createMtoScene(canvas, config, extras) {
  var cfg = config || {};
  var ext = extras || {};
  var p = resolvePaletteTokens();
  var onTelemetry = typeof ext.onTelemetry === "function" ? ext.onTelemetry : function () {};

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
  renderer.toneMappingExposure = 1.12;

  var baselineGeometries = renderer.info.memory.geometries;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(p.paper);

  var envRt = createWarmMtoSoftboxEnv(renderer, p);
  scene.environment = envRt.texture;
  if ("environmentIntensity" in scene) {
    scene.environmentIntensity = 0.94;
  }

  var activeTrack = String(cfg.track || "01");
  if (activeTrack !== "01" && activeTrack !== "02" && activeTrack !== "03") activeTrack = "01";
  var modelTier = cfg.tier === "r1" ? "r1" : "r2";
  var activeSku = cfg.sku || MTO_SKUS[0].sku;

  var mobileFlag = isMobile375OrCompact();
  var camSpec = getMtoCameraPreset(activeTrack, mobileFlag);
  var cam = new THREE.PerspectiveCamera(camSpec.fov, 1, 0.01, 10);
  var camTarget = new THREE.Vector3(camSpec.target[0], camSpec.target[1], camSpec.target[2]);
  var spherical = new THREE.Spherical().setFromVector3(
    new THREE.Vector3(camSpec.position[0], camSpec.position[1], camSpec.position[2]).sub(camTarget)
  );

  function syncCamera() {
    spherical.phi = Math.max(0.22, Math.min(Math.PI * 0.5 - 0.08, spherical.phi));
    spherical.radius = Math.max(0.26, Math.min(1.25, spherical.radius));
    var pos = new THREE.Vector3().setFromSpherical(spherical).add(camTarget);
    cam.position.copy(pos);
    cam.lookAt(camTarget);
  }
  syncCamera();

  // 4000K Warm Studio Lighting
  scene.add(new THREE.HemisphereLight(new THREE.Color("rgb(255, 251, 243)"), new THREE.Color(p.paperSubtle), 0.85));
  var keyLight = new THREE.DirectionalLight(new THREE.Color("rgb(255, 247, 234)"), 1.24);
  keyLight.position.set(0.40, 0.68, 0.42);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 0.05;
  keyLight.shadow.camera.far = 2.5;
  keyLight.shadow.camera.left = -0.35;
  keyLight.shadow.camera.right = 0.35;
  keyLight.shadow.camera.top = 0.35;
  keyLight.shadow.camera.bottom = -0.35;
  keyLight.shadow.bias = -0.0004;
  scene.add(keyLight);

  var fillLight = new THREE.DirectionalLight(new THREE.Color("rgb(250, 242, 229)"), 0.46);
  fillLight.position.set(-0.42, 0.38, 0.28);
  scene.add(fillLight);

  // Stage Root (carries magnetic levitation + pointer parallax on Desktop only)
  var stageRoot = new THREE.Group();
  stageRoot.name = "MtoHotStageRoot";
  scene.add(stageRoot);

  var contactShadow = buildContactShadowPlane();
  scene.add(contactShadow.mesh);

  // SV_MOTHER_MTO_v01 (0 meshes, 0 triangles, 0 shadows)
  var motherRig = buildMtoMotherRoot(p);
  stageRoot.add(motherRig.root);

  var glbMap = ext.glbMap || {};
  var t01 = buildMtoTrack01Group(p, glbMap.block || ext.glbRoot || null);
  var t02 = buildMtoTrack02Group(p, activeSku, glbMap.prism || ext.glbRoot || null);
  var t03 = buildMtoTrack03Group(p, glbMap.folio || null);

  stageRoot.add(t01.group, t02.group, t03.group);

  function applyTrackVisibility(tr) {
    t01.group.visible = tr === "01";
    t02.group.visible = tr === "02";
    t03.group.visible = tr === "03";
    motherRig.seamRail.visible = tr === "02" && modelTier === "r2";
  }
  applyTrackVisibility(activeTrack);

  // Animation states
  var hoveredSatIndex = -1;
  var activeLayerIndex = -1;
  var folioPeek = false;
  var folioOpen = false;
  var highlightedAnchor = null;

  var morphAnim = null;
  var swapAnim = null;
  var ackPulseAnim = null;
  var camAnim = null;
  var peekBreathAnim = null;

  var pointerParallaxX = 0;
  var pointerParallaxY = 0;
  var isDragging = false;
  var lastPtrX = 0;
  var lastPtrY = 0;
  var paused = false;
  var disposed = false;
  var rafId = 0;

  function resize() {
    if (disposed || !canvas) return;
    var rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { width: 640, height: 420 };
    var w = Math.max(160, Math.round(rect.width || canvas.clientWidth || 640));
    var h = Math.max(160, Math.round(rect.height || canvas.clientHeight || 400));
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }
  resize();

  function setCenterSkuSubject(skuId) {
    activeSku = skuId || activeSku;
    // Update Track 01 center mount & Track 02 subject mount if using homologous subject
    if (!glbMap.block && !ext.glbRoot) {
      while (t01.centerMount.children.length > 0) {
        var old = t01.centerMount.children[0];
        t01.centerMount.remove(old);
        old.traverse(function (o) {
          if (o instanceof THREE.Mesh) {
            o.geometry.dispose();
            o.material.dispose();
          }
        });
      }
      t01.centerMount.add(buildMtoProductSubject(activeSku, 0));
    }
    if (!glbMap.prism && !ext.glbRoot) {
      while (t02.subjectMount.children.length > 0) {
        var old2 = t02.subjectMount.children[0];
        t02.subjectMount.remove(old2);
        old2.traverse(function (o) {
          if (o instanceof THREE.Mesh) {
            o.geometry.dispose();
            o.material.dispose();
          }
        });
      }
      var nextSubj = buildMtoProductSubject(activeSku, 0);
      nextSubj.scale.setScalar(0.86);
      t02.subjectMount.add(nextSubj);
    }
  }

  function setTrack(nextTrack, opts) {
    var tr = String(nextTrack || "01");
    if (tr !== "01" && tr !== "02" && tr !== "03") tr = "01";
    var motionOff = isReducedMotion() || modelTier !== "r2";
    var prev = activeTrack;
    activeTrack = tr;
    applyTrackVisibility(activeTrack);

    var spec = getMtoCameraPreset(activeTrack, isMobile375OrCompact());
    if (motionOff || (opts && opts.instant)) {
      camTarget.set(spec.target[0], spec.target[1], spec.target[2]);
      cam.fov = spec.fov;
      cam.updateProjectionMatrix();
      spherical.setFromVector3(new THREE.Vector3(spec.position[0], spec.position[1], spec.position[2]).sub(camTarget));
      syncCamera();
      stageRoot.scale.setScalar(1);
    } else {
      var now = performance.now();
      morphAnim = { t0: now, dur: MTO_C1_CLIPS.clip_track_morph.durationMs };
      camAnim = {
        t0: now,
        dur: MTO_C1_CLIPS.clip_track_morph.durationMs,
        fromPos: cam.position.clone(),
        toPos: new THREE.Vector3(spec.position[0], spec.position[1], spec.position[2]),
        fromTarget: camTarget.clone(),
        toTarget: new THREE.Vector3(spec.target[0], spec.target[1], spec.target[2]),
        fromFov: cam.fov,
        toFov: spec.fov
      };
    }

    if (prev !== activeTrack) {
      onTelemetry("mto.track_switched", {
        fromTrack: prev,
        toTrack: activeTrack,
        durationMs: motionOff ? 0 : MTO_C1_CLIPS.clip_track_morph.durationMs
      });
    }
  }

  function focusHotspot(hotspotId, extra) {
    if (modelTier !== "r2") return;
    var id = String(hotspotId || "");
    if (!id) {
      hoveredSatIndex = -1;
      activeLayerIndex = -1;
      folioPeek = false;
      t01.bridgeLine.visible = false;
      t03.guideLine.visible = false;
      return;
    }

    if (id.indexOf("HS_MTO_01_SAT_0") === 0) {
      var sIdx = parseInt(id.slice(-1), 10) - 1;
      if (sIdx >= 0 && sIdx < 4) {
        hoveredSatIndex = sIdx;
        var sat = t01.satellites[sIdx];
        var pts = [
          new THREE.Vector3(0, 0.028, 0),
          new THREE.Vector3(sat.home.x * 0.94, 0.044, sat.home.z * 0.94)
        ];
        t01.bridgeLine.geometry.setFromPoints(pts);
        t01.bridgeLine.computeLineDistances();
        t01.bridgeLine.visible = activeTrack === "01";
      }
    } else if (id === "HS_MTO_02_FORM") {
      activeLayerIndex = 0;
      highlightedAnchor = "anchor_form";
      motherRig.seamRail.visible = activeTrack === "02";
    } else if (id === "HS_MTO_02_FINISH") {
      activeLayerIndex = 1;
      highlightedAnchor = "anchor_finish";
      motherRig.seamRail.visible = activeTrack === "02";
    } else if (id === "HS_MTO_02_SPEC") {
      activeLayerIndex = 2;
      highlightedAnchor = "anchor_spec";
      motherRig.seamRail.visible = activeTrack === "02";
    } else if (id === "HS_MTO_03_FOLIO_COVER") {
      folioPeek = Boolean(extra && extra.peek !== false);
      t03.guideLine.visible = activeTrack === "03" && (folioPeek || folioOpen);
    }

    onTelemetry("mto.hotspot_triggered", {
      hotspotId: id,
      track: activeTrack,
      tier: modelTier
    });
  }

  function playClip(clipId, payload) {
    var motionOff = isReducedMotion() || modelTier !== "r2";
    var pl = payload || {};

    if (clipId === "clip_sat_arc_swap") {
      var idx = typeof pl.satIndex === "number" ? pl.satIndex : 0;
      idx = Math.max(0, Math.min(3, idx));
      var satObj = t01.satellites[idx];
      var prevCenterSku = activeSku;
      var nextCenterSku = pl.sku || satObj.sku;
      satObj.sku = prevCenterSku;
      setCenterSkuSubject(nextCenterSku);
      if (motionOff) {
        satObj.group.position.copy(satObj.home);
        t01.centerBlock.position.set(0, 0, 0);
      } else {
        swapAnim = {
          t0: performance.now(),
          dur: MTO_C1_CLIPS.clip_sat_arc_swap.durationMs,
          satIndex: idx
        };
      }
      return { clipId: clipId, durationMs: motionOff ? 0 : MTO_C1_CLIPS.clip_sat_arc_swap.durationMs, centerSku: nextCenterSku };
    }

    if (clipId === "clip_layer_part") {
      activeLayerIndex = typeof pl.layerIndex === "number" ? pl.layerIndex : 0;
      return { clipId: clipId, durationMs: motionOff ? 0 : MTO_C1_CLIPS.clip_layer_part.durationMs, layerIndex: activeLayerIndex };
    }

    if (clipId === "clip_folio_unfold") {
      folioOpen = pl.open !== undefined ? Boolean(pl.open) : !folioOpen;
      t03.guideLine.visible = folioOpen && modelTier === "r2";
      if (motionOff) {
        t03.leftPivot.rotation.z = folioOpen ? Math.PI * 0.46 : 0;
        t03.rightPivot.rotation.z = folioOpen ? -Math.PI * 0.46 : 0;
      }
      return { clipId: clipId, durationMs: motionOff ? 0 : MTO_C1_CLIPS.clip_folio_unfold.durationMs, folioOpen: folioOpen };
    }

    if (clipId === "clip_submit_in_place_ack") {
      // L5@v01 §4.1 #7 & V-05: Zero scroll, zero jump, zero model collapse; single ~420ms seam light pulse
      var isT3 = activeTrack === "03" || pl.track === "03";
      var specAck = isT3 ? MTO_C1_CLIPS.clip_submit_in_place_ack.track03 : MTO_C1_CLIPS.clip_submit_in_place_ack.track02;
      var ackDur = motionOff ? 0 : MTO_C1_CLIPS.clip_submit_in_place_ack.durationMs;
      if (!motionOff) {
        ackPulseAnim = {
          t0: performance.now(),
          dur: ackDur,
          betaBase: isT3 ? 0.34 : 0.38,
          betaPeak: specAck.betaPeak
        };
      }
      onTelemetry("mto.submit_in_place_ack", {
        track: isT3 ? "03" : "02",
        durationMs: ackDur,
        betaPeak: specAck.betaPeak,
        auraPct: specAck.auraPct,
        wcMin: specAck.wcMin,
        zeroCollapse: true
      });
      return {
        clipId: clipId,
        durationMs: ackDur,
        betaPeak: specAck.betaPeak,
        auraPct: specAck.auraPct,
        wcRatio: specAck.wcMin,
        zeroCollapse: true
      };
    }

    if (clipId === "mto_mobile_peek") {
      if (!motionOff) {
        peekBreathAnim = { t0: performance.now(), dur: 520 };
      }
      return { clipId: clipId, durationMs: motionOff ? 0 : 520 };
    }

    return { clipId: clipId, durationMs: 0 };
  }

  function setTier(nextTier) {
    modelTier = nextTier === "r1" ? "r1" : "r2";
    if (modelTier === "r1") {
      hoveredSatIndex = -1;
      activeLayerIndex = -1;
      folioPeek = false;
      t01.bridgeLine.visible = false;
      t03.guideLine.visible = false;
      motherRig.seamRail.visible = false;
      stageRoot.position.y = 0;
      stageRoot.rotation.set(0, 0, 0);
    } else {
      motherRig.seamRail.visible = activeTrack === "02";
    }
    if (canvas && canvas.dataset) {
      canvas.dataset.svModelTier = modelTier;
    }
    return modelTier;
  }

  // Pointer Orbit & Desktop-only subtle parallax (strictly disabled on Mobile 375px per V-08)
  function onPointerDown(e) {
    isDragging = true;
    lastPtrX = e.clientX || 0;
    lastPtrY = e.clientY || 0;
  }
  function onPointerMove(e) {
    var cx = e.clientX || 0;
    var cy = e.clientY || 0;
    if (isDragging) {
      var dx = cx - lastPtrX;
      var dy = cy - lastPtrY;
      lastPtrX = cx;
      lastPtrY = cy;
      spherical.theta -= dx * 0.006;
      spherical.phi -= dy * 0.005;
      syncCamera();
      return;
    }
    if (!isMobile375OrCompact() && modelTier === "r2" && !isReducedMotion()) {
      var rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        pointerParallaxX = (((cx - rect.left) / rect.width) - 0.5) * 0.05;
        pointerParallaxY = (((cy - rect.top) / rect.height) - 0.5) * 0.03;
      }
    } else {
      pointerParallaxX = 0;
      pointerParallaxY = 0;
    }
  }
  function onPointerUp() {
    isDragging = false;
  }
  function onWheel(e) {
    if (!e.ctrlKey && Math.abs(e.deltaY) < 4) return;
    spherical.radius += e.deltaY * 0.0005;
    syncCamera();
  }

  canvas.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  canvas.addEventListener("wheel", onWheel, { passive: true });

  function tick(now) {
    if (disposed) return;
    rafId = requestAnimationFrame(tick);
    if (paused) return;

    var motionOff = isReducedMotion();
    var r2Active = modelTier === "r2" && !motionOff;

    // 1) Camera Ease
    if (camAnim) {
      var ct = (now - camAnim.t0) / camAnim.dur;
      if (ct >= 1) {
        camTarget.copy(camAnim.toTarget);
        cam.fov = camAnim.toFov;
        cam.updateProjectionMatrix();
        spherical.setFromVector3(camAnim.toPos.clone().sub(camTarget));
        syncCamera();
        camAnim = null;
      } else {
        var ce = easeCubicInOut(ct);
        camTarget.lerpVectors(camAnim.fromTarget, camAnim.toTarget, ce);
        var curP = new THREE.Vector3().lerpVectors(camAnim.fromPos, camAnim.toPos, ce);
        cam.fov = camAnim.fromFov + (camAnim.toFov - camAnim.fromFov) * ce;
        cam.updateProjectionMatrix();
        spherical.setFromVector3(curP.sub(camTarget));
        syncCamera();
      }
    }

    // 2) clip_track_morph (360ms)
    if (morphAnim) {
      var mt = (now - morphAnim.t0) / morphAnim.dur;
      if (mt >= 1) {
        stageRoot.scale.setScalar(1);
        morphAnim = null;
      } else {
        var dip = 1 - 0.06 * Math.sin(Math.PI * mt);
        stageRoot.scale.setScalar(dip);
      }
    }

    // 3) clip_magnetic_levitate (4.2s micro-float +-2.5px = +-0.004m + shadow +3% radius / -6% opacity)
    if (r2Active) {
      var phase = (now % MTO_C1_CLIPS.clip_magnetic_levitate.periodMs) / MTO_C1_CLIPS.clip_magnetic_levitate.periodMs;
      var sWave = Math.sin(phase * Math.PI * 2);
      stageRoot.position.y = sWave * 0.004;
      var liftNorm = (sWave + 1) * 0.5;
      contactShadow.mesh.scale.setScalar(1 + 0.03 * liftNorm);
      contactShadow.material.opacity = 0.85 * (1 - 0.06 * liftNorm);

      if (!isMobile375OrCompact()) {
        stageRoot.rotation.y += (pointerParallaxX - stageRoot.rotation.y) * 0.12;
        stageRoot.rotation.x += (pointerParallaxY - stageRoot.rotation.x) * 0.12;
      } else {
        stageRoot.rotation.set(0, 0, 0);
      }
    } else {
      stageRoot.position.y = 0;
      stageRoot.rotation.set(0, 0, 0);
      contactShadow.mesh.scale.setScalar(1);
      contactShadow.material.opacity = 0.85;
    }

    // 4) Track 01 Satellite Hover (+14px = +0.022m, 4 deg tilt, 6px = 0.010m pull) & clip_sat_arc_swap (320ms)
    if (activeTrack === "01") {
      for (var i = 0; i < 4; i++) {
        var sat = t01.satellites[i];
        var isHov = modelTier === "r2" && hoveredSatIndex === i;
        var targetY = isHov ? 0.022 : 0.0;
        var pullFactor = isHov ? 0.93 : 1.0;
        var targetX = sat.home.x * pullFactor;
        var targetZ = sat.home.z * pullFactor;
        var targetRotZ = isHov ? (sat.home.x > 0 ? 0.07 : -0.07) : 0;

        if (swapAnim && swapAnim.satIndex === i) {
          var st = (now - swapAnim.t0) / swapAnim.dur;
          if (st >= 1) {
            swapAnim = null;
            t01.centerBlock.position.set(0, 0, 0);
            sat.group.position.set(targetX, targetY, targetZ);
          } else {
            var se = easeCubicInOut(st);
            var arc = Math.sin(Math.PI * se) * 0.042;
            sat.group.position.set(
              sat.home.x * (1 - 0.35 * Math.sin(Math.PI * se)),
              arc,
              sat.home.z * (1 - 0.35 * Math.sin(Math.PI * se))
            );
            t01.centerBlock.position.y = -arc * 0.35;
          }
        } else if (motionOff) {
          sat.group.position.set(targetX, targetY, targetZ);
          sat.group.rotation.z = targetRotZ;
        } else {
          sat.group.position.x += (targetX - sat.group.position.x) * 0.22;
          sat.group.position.y += (targetY - sat.group.position.y) * 0.22;
          sat.group.position.z += (targetZ - sat.group.position.z) * 0.22;
          sat.group.rotation.z += (targetRotZ - sat.group.rotation.z) * 0.22;
        }
      }
    }

    // 5) Track 02 clip_layer_part (+12px = +0.020m target lift + +3.5px = +0.006m neighbor damping)
    if (activeTrack === "02") {
      for (var li = 0; li < 3; li++) {
        var extraLift = 0;
        if (modelTier === "r2" && activeLayerIndex >= 0) {
          if (li === activeLayerIndex) extraLift = 0.020;
          else if (Math.abs(li - activeLayerIndex) === 1) extraLift = 0.006;
        }
        var targetLy = t02.baseYs[li] + extraLift * (li + 1) * 0.55;
        if (li === activeLayerIndex) targetLy = t02.baseYs[li] + 0.020;
        else if (activeLayerIndex >= 0 && Math.abs(li - activeLayerIndex) === 1) targetLy = t02.baseYs[li] + 0.006;
        else targetLy = t02.baseYs[li];

        if (motionOff) {
          t02.layers[li].position.y = targetLy;
        } else {
          t02.layers[li].position.y += (targetLy - t02.layers[li].position.y) * 0.24;
        }
      }
    }

    // 6) Track 03 Folio Peek (25%) & Unfold (clip_folio_unfold ~320ms)
    if (activeTrack === "03") {
      var fullAngle = Math.PI * 0.46;
      var peekAngle = fullAngle * 0.25;
      var targetLeft = folioOpen ? fullAngle : 0;
      var targetRight = folioOpen ? -fullAngle : (folioPeek && modelTier === "r2" ? -peekAngle : 0);
      if (motionOff) {
        t03.leftPivot.rotation.z = targetLeft;
        t03.rightPivot.rotation.z = targetRight;
      } else {
        t03.leftPivot.rotation.z += (targetLeft - t03.leftPivot.rotation.z) * 0.20;
        t03.rightPivot.rotation.z += (targetRight - t03.rightPivot.rotation.z) * 0.20;
      }
    }

    // 7) clip_submit_in_place_ack (~420ms single seam pulse; zero collapse) & mto_mobile_peek
    if (ackPulseAnim) {
      var at = (now - ackPulseAnim.t0) / ackPulseAnim.dur;
      if (at >= 1) {
        t02.seamMat.opacity = 0.38;
        t03.seamMat.opacity = 0.34;
        ackPulseAnim = null;
      } else {
        var pulse = Math.sin(Math.PI * at);
        var curBeta = ackPulseAnim.betaBase + (ackPulseAnim.betaPeak - ackPulseAnim.betaBase) * pulse;
        t02.seamMat.opacity = curBeta;
        t03.seamMat.opacity = curBeta;
      }
    } else if (peekBreathAnim) {
      var pt = (now - peekBreathAnim.t0) / peekBreathAnim.dur;
      if (pt >= 1) {
        t01.seamMat.opacity = 0.38;
        peekBreathAnim = null;
      } else {
        t01.seamMat.opacity = 0.38 + 0.07 * Math.sin(Math.PI * pt);
      }
    }

    renderer.render(scene, cam);
  }
  rafId = requestAnimationFrame(tick);

  function countMotherMeshes() {
    var meshes = 0;
    motherRig.root.traverse(function (o) {
      if (o instanceof THREE.Mesh) meshes += 1;
    });
    return meshes;
  }

  function getMotherInspection() {
    var meshes = 0;
    var tris = 0;
    var shadows = 0;
    motherRig.root.traverse(function (o) {
      if (o instanceof THREE.Mesh) {
        meshes += 1;
        if (o.castShadow || o.receiveShadow) shadows += 1;
        var g = o.geometry;
        if (g && g.index) tris += g.index.count / 3;
        else if (g && g.attributes && g.attributes.position) tris += g.attributes.position.count / 3;
      }
    });
    return {
      id: MTO_MOTHER_ID,
      meshes: meshes,
      triangles: tris,
      materials: 0,
      shadows: shadows,
      anchors: MTO_ANCHORS.slice(),
      mountOrder: MTO_MOUNT_ORDER.slice(),
      snap: Object.assign({}, MTO_SNAP),
      highlightedAnchor: highlightedAnchor
    };
  }

  function dispose() {
    if (disposed) {
      return { geometriesAfter: 0, baselineDelta: 0 };
    }
    disposed = true;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;

    canvas.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("wheel", onWheel);

    scene.traverse(function (obj) {
      if (obj.geometry && typeof obj.geometry.dispose === "function") {
        obj.geometry.dispose();
      }
      if (obj.material) {
        var mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(function (m) {
          if (m.map && typeof m.map.dispose === "function") m.map.dispose();
          if (typeof m.dispose === "function") m.dispose();
        });
      }
    });
    if (contactShadow.texture) contactShadow.texture.dispose();
    if (envRt) envRt.dispose();

    var after = renderer.info.memory.geometries;
    renderer.dispose();
    return {
      geometriesAfter: after,
      baselineDelta: after - baselineGeometries
    };
  }

  return {
    family: "mto",
    geoSource: (glbMap.block || glbMap.prism || glbMap.folio || ext.glbRoot) ? "glb" : "procedural_homologous",
    motherMeshCount: countMotherMeshes(),
    getMotherInspection: getMotherInspection,
    setTrack: setTrack,
    getTrack: function () { return activeTrack; },
    setTier: setTier,
    getTier: function () { return modelTier; },
    setCenterSkuSubject: setCenterSkuSubject,
    focusHotspot: focusHotspot,
    playClip: playClip,
    setMotherRigVisible: function (vis) { motherRig.seamRail.visible = Boolean(vis); },
    setLidOpenDeg: function () {},
    setSlots: function () {},
    setCameraPreset: function (preset) {
      if (preset === "track_02" || preset === "02") setTrack("02");
      else if (preset === "track_03" || preset === "03") setTrack("03");
      else setTrack("01");
    },
    refreshTokens: function () {
      var nextP = resolvePaletteTokens();
      scene.background = new THREE.Color(nextP.paper);
    },
    pause: function () { paused = true; },
    resume: function () { paused = false; },
    resize: resize,
    memoryGeometries: function () { return disposed ? 0 : renderer.info.memory.geometries; },
    getCameraState: function () {
      return {
        track: activeTrack,
        tier: modelTier,
        position: [Number(cam.position.x.toFixed(3)), Number(cam.position.y.toFixed(3)), Number(cam.position.z.toFixed(3))],
        target: [Number(camTarget.x.toFixed(3)), Number(camTarget.y.toFixed(3)), Number(camTarget.z.toFixed(3))],
        fov: cam.fov
      };
    },
    dispose: dispose
  };
}

export { createMtoScene, isMobile375OrCompact };
