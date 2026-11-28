/**
 * SpaceVanta MTO Hot Child Spotlight Controller (L5@v01 · Mode A1 <-> Mode A2 · Zero Reset Handoff)
 * - Reuses single persistent Hot Canvas via BundleDriver.mountStage (Active WebGL = 1 across Mode A1 & A2).
 * - Never submits POST /api/mto/request in-page; serializes track=02 + sku + pool + form + finish + spec + note
 *   via URL Query + 30-min sessionStorage dual-write into /{market}/pages/made-to-order.
 */
(function (global) {
  "use strict";

  async function initHotChild(root) {
    if (!root || root.dataset.svInitialized === "true") return;
    root.dataset.svInitialized = "true";

    var driverUrl = root.getAttribute("data-sv-driver-url") || "/public/sv-bundle/BundleDriver.js";
    var driver = global.BundleDriver || null;
    if (!driver) {
      try {
        var mod = await import(driverUrl);
        driver = mod.BundleDriver || mod.default || global.BundleDriver;
      } catch (_e) {
        driver = null;
      }
    }
    if (!driver) return;
    var MTO_SKUS = driver.mtoRig.skus;
    var findMtoSku = driver.findMtoSku;

    var state = driver.createMtoInitialState("hot_child");
    var mkt = (global.SpaceVanta && global.SpaceVanta.market && global.SpaceVanta.market.get)
      ? global.SpaceVanta.market.get().slug
      : "en-us";
    state = driver.dispatch(state, { type: "MTO_SET_MARKET", market: mkt });

    var canvasEl = root.querySelector("[data-sv-mto-child-canvas]");
    var posterEl = root.querySelector("[data-sv-mto-child-poster]");
    var whisperTextEl = root.querySelector("[data-sv-child-whisper-text]");
    var panelA1 = root.querySelector('[data-sv-mode-panel="A1"]');
    var panelA2 = root.querySelector('[data-sv-mode-panel="A2"]');
    var skuLabelEl = root.querySelector("[data-sv-child-sku-label]");
    var handoffLink = root.querySelector("[data-sv-child-handoff-link]");
    var motherLink = root.querySelector("[data-sv-child-mother-link]");
    var guideLink = root.querySelector("[data-sv-child-guide-link]");
    var toastEl = root.querySelector("[data-sv-child-toast]");
    var poolChipEl = root.querySelector("[data-sv-assigned-pool-chip]");

    var motherRouteOverride = "";

    function getGlbUrl(skuId) {
      var idx = MTO_SKUS.indexOf(findMtoSku(skuId)) + 1;
      return root.getAttribute("data-sv-glb-0" + (idx > 0 ? idx : 1)) || "";
    }

    function setWhisper(msg) {
      if (!whisperTextEl || !msg) return;
      whisperTextEl.textContent = msg;
    }

    function computeHandoffUrl() {
      return driver.buildMtoMotherUrl({
        track: "02",
        sku: state.sku,
        pool: state.poolId,
        form: state.form,
        finish: state.finish,
        spec: state.spec,
        note: state.note
      }, motherRouteOverride);
    }

    function renderChild() {
      var mode = state.track === "02" ? "A2" : "A1";
      root.setAttribute("data-sv-mode", mode);
      root.setAttribute("data-sv-state", state.flow);
      root.setAttribute("data-sv-model-tier", state.tier);

      if (panelA1 && panelA2) {
        if (mode === "A2") {
          panelA1.setAttribute("hidden", "");
          panelA2.removeAttribute("hidden");
        } else {
          panelA1.removeAttribute("hidden");
          panelA2.setAttribute("hidden", "");
        }
      }

      var info = findMtoSku(state.sku);
      if (skuLabelEl) skuLabelEl.textContent = info.title;

      var url = computeHandoffUrl();
      if (handoffLink) handoffLink.href = url;
      if (motherLink) motherLink.href = url;
      if (guideLink) guideLink.href = "/" + state.market + "/pages/mto-status";

      if (toastEl) {
        if (state.toast) {
          toastEl.textContent = state.toast;
          toastEl.removeAttribute("hidden");
        } else {
          toastEl.setAttribute("hidden", "");
        }
      }
    }

    async function mountOrUpdateStage() {
      var threeDOff = global.SpaceVanta && global.SpaceVanta.flags && global.SpaceVanta.flags.is3DOff();
      if (threeDOff || state.tier === "poster") {
        driver.unmountStage(canvasEl, "hot_child_poster");
        canvasEl.hidden = true;
        if (posterEl) posterEl.removeAttribute("hidden");
        return;
      }

      var handle = driver.getStageHandle(canvasEl);
      if (!handle) {
        canvasEl.hidden = false;
        if (posterEl) posterEl.setAttribute("hidden", "");
        var res = await driver.mountStage(canvasEl, {
          pack: "mto",
          role: "hot_child",
          track: state.track,
          tier: state.tier,
          sku: state.sku,
          glbUrl: getGlbUrl(state.sku),
          posterUrl: root.getAttribute("data-sv-poster-url") || "",
          skipRemotePack: !Boolean(global.SpaceVanta && global.SpaceVanta.config && global.SpaceVanta.config.modelsBase)
        });
        if (!res.ok) {
          canvasEl.hidden = true;
          if (posterEl) posterEl.removeAttribute("hidden");
        }
      } else {
        driver.updateStage(canvasEl, {
          track: state.track,
          tier: state.tier,
          sku: state.sku
        });
      }
    }

    root.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-action]") : null;
      if (!btn) return;
      var act = btn.getAttribute("data-action");

      if (act === "child-sat-swap") {
        var satIdx = Number(btn.getAttribute("data-sat-index") || 0);
        var nextSku = btn.getAttribute("data-sku") || MTO_SKUS[1].sku;
        state = driver.dispatch(state, { type: "MTO_SELECT_SKU", sku: nextSku });
        driver.updateStage(canvasEl, { clipId: "clip_sat_arc_swap", satIndex: satIdx, sku: nextSku });
        setWhisper(findMtoSku(nextSku).title + " centered — add curated piece or pre-fill custom specs.");
        renderChild();
        return;
      }

      if (act === "child-switch-a2") {
        state = driver.dispatch(state, { type: "MTO_SWITCH_TRACK", track: "02" });
        setWhisper("Mode A2 active on same canvas — pre-fill Form, Finish, Spec, and notes before opening Studio.");
        renderChild();
        mountOrUpdateStage();
        return;
      }

      if (act === "child-switch-a1") {
        state = driver.dispatch(state, { type: "MTO_SWITCH_TRACK", track: "01" });
        setWhisper("Returned to Mode A1 showcase — your pre-filled options remain saved.");
        renderChild();
        mountOrUpdateStage();
        return;
      }

      if (act === "child-add-curated") {
        var prev = state.commitCount;
        var idem = driver.mtoIdempotencyKey(state.market, "01", state.sku, "curated", "curated", "curated", "child");
        state = driver.dispatch(state, {
          type: "MTO_ATTEMPT_SUBMIT",
          idempotencyKey: idem,
          duplicateMessage: "Already queued in bag — duplicate click ignored."
        });
        if (state.commitCount <= prev) {
          renderChild();
          return;
        }
        var addBtn = root.querySelector("[data-sv-child-add]");
        var addLbl = root.querySelector("[data-sv-child-add-label]");
        if (addBtn) {
          addBtn.setAttribute("data-submitting", "true");
          var aura = addBtn.querySelector("[data-sv-seam-aura]");
          if (aura) aura.removeAttribute("hidden");
        }
        if (addLbl) addLbl.textContent = "Added Curated MTO ✓";
        state.flow = "hot_child_ready_01";
        state.toast = findMtoSku(state.sku).title + " added to your shopping bag.";
        renderChild();
        return;
      }

      if (act === "child-handoff-mother") {
        // Guarantee fresh sessionStorage + URL Query dual-write right before navigation
        btn.href = computeHandoffUrl();
      }
    });

    root.addEventListener("change", function (e) {
      var el = e.target;
      if (!el || !el.getAttribute) return;
      var k = el.getAttribute("data-sv-child-input");
      if (k === "form" || k === "finish" || k === "spec") {
        var patch = { type: "MTO_UPDATE_SPEC" };
        patch[k] = el.value;
        state = driver.dispatch(state, patch);
        var layerIdx = k === "form" ? 0 : (k === "finish" ? 1 : 2);
        driver.updateStage(canvasEl, { clipId: "clip_layer_part", layerIndex: layerIdx });
        renderChild();
      }
    });

    root.addEventListener("input", function (e) {
      var el = e.target;
      if (!el || !el.getAttribute) return;
      if (el.getAttribute("data-sv-child-input") === "note") {
        state = driver.dispatch(state, { type: "MTO_UPDATE_SPEC", note: el.value });
        renderChild();
      }
    });

    global.addEventListener("sv:data", function (e) {
      var d = e && e.detail ? (e.detail.data || e.detail) : null;
      if (!d) return;
      if (d.shipping && d.shipping.duty && d.shipping.leadtime && (d.bundle || d.shipping).threshold) {
        var tb = root.querySelector('[data-sv-slot="mto-child-trust-bar"]');
        if (tb) {
          root.querySelector('[data-sv-field="duty"]').textContent = d.shipping.duty;
          root.querySelector('[data-sv-field="leadtime"]').textContent = d.shipping.leadtime;
          root.querySelector('[data-sv-field="threshold"]').textContent = (d.bundle || d.shipping).threshold;
          tb.removeAttribute("hidden");
        }
      }
      if (d.mto && d.mto.child_pool) {
        var cp = d.mto.child_pool;
        if (cp.assignedPoolId && poolChipEl) {
          poolChipEl.textContent = "Pool · " + cp.assignedPoolId;
          poolChipEl.removeAttribute("hidden");
        }
        if (cp.sku) {
          state = driver.dispatch(state, { type: "MTO_SELECT_SKU", sku: cp.sku, poolId: cp.assignedPoolId });
        }
      }
      if (d.mto && d.mto.routes && d.mto.routes.motherUrl) {
        motherRouteOverride = String(d.mto.routes.motherUrl);
      }
      renderChild();
    });

    renderChild();
    mountOrUpdateStage();
  }

  function boot() {
    document.querySelectorAll(".sv-mch[data-sv-role='hot_child']").forEach(initHotChild);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window);
