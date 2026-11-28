/**
 * SpaceVanta MTO Cold 01 Planar Square Map Controller (L5@v01 · SV_CHILD_COLD_MTO_01MAP_v01)
 * - Strictly 0 WebGL, 0 GLB, 0 Three.js / BundleDriver imports in S0_COLD_IDLE (V-09).
 * - Lazy-triggers root-level SVPromotePortal ONLY when user activates Planar01MapTrigger
 *   or when reserved G-1/G-2 event sv:mto:cold:promotePreview fires.
 * - Esc restores focus to exact originating Cold card trigger button (V-A7).
 * - Idempotent 1-click Add Curated MTO (3 rapid clicks = 1 commit + duplicate notice).
 */
(function (global) {
  "use strict";

  function getMarketSlug() {
    if (global.SpaceVanta && global.SpaceVanta.market && global.SpaceVanta.market.get) {
      return global.SpaceVanta.market.get().slug || "en-us";
    }
    var m = ((global.location && global.location.pathname) || "").match(/^\/(en-(?:us|gb|au|ca|sg|hk))(?=\/|$)/i);
    return m ? m[1].toLowerCase() : "en-us";
  }

  function buildMotherDeepLink(sku, poolId) {
    var slug = getMarketSlug();
    return "/" + slug + "/pages/made-to-order?track=02&sku=" +
      encodeURIComponent(sku || "SV_MTO_SKU_01") +
      "&pool=" + encodeURIComponent(poolId || "");
  }

  function initMtoColdGrid(root) {
    if (!root || root.getAttribute("data-sv-ready") === "true") return;
    root.setAttribute("data-sv-ready", "true");

    var driverUrl = root.getAttribute("data-sv-driver-url") || "/public/sv-bundle/BundleDriver.js";
    var toastEl = root.querySelector("[data-sv-mto-cold-toast]");
    var commitLocks = Object.create(null);
    var commitCounts = Object.create(null);
    var toastTimer = null;

    function showToast(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.removeAttribute("hidden");
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toastEl.setAttribute("hidden", "");
      }, 2500);
    }

    function syncMotherLinks() {
      var links = root.querySelectorAll("[data-sv-mto-mother-link]");
      for (var i = 0; i < links.length; i++) {
        var sku = links[i].getAttribute("data-sku") || "SV_MTO_SKU_01";
        var pid = links[i].getAttribute("data-pool-id") || "";
        links[i].href = buildMotherDeepLink(sku, pid);
      }
    }
    syncMotherLinks();
    global.addEventListener("sv:market", syncMotherLinks);

    // Silhouette fallback if planar image fails to load
    var imgs = root.querySelectorAll(".sv-mcc-planar-img");
    Array.prototype.forEach.call(imgs, function (img) {
      img.addEventListener("error", function () {
        img.hidden = true;
        var frame = img.closest(".sv-mcc-planar-frame");
        if (frame) frame.classList.add("sv-mcc-planar-frame--silhouette");
      });
    });

    function triggerCardPromote(triggerBtn, card) {
      if (!card || !global.SVPromotePortal) return;
      var sku = card.getAttribute("data-sku") || "SV_MTO_SKU_01";
      var poolId = card.getAttribute("data-pool-id") || "mto_pool_ceramic_01";
      var poolName = card.getAttribute("data-pool-name") || "Made-to-Order Piece";
      var posterUrl = card.getAttribute("data-poster-url") || "";
      var glbUrl = card.getAttribute("data-glb-url") || "";
      var simulateVp5 = root.getAttribute("data-sv-simulate-vp5") === "true" ||
        Boolean(global.SpaceVanta && global.SpaceVanta.flags && global.SpaceVanta.flags.get().sv_vp5 === "1");
      var strictPoster = root.getAttribute("data-sv-strict-poster-on-glb-fail") === "true" || simulateVp5;

      var portal = global.SVPromotePortal.getInstance();
      portal.promote(triggerBtn, {
        pack: "mto",
        driverUrl: driverUrl,
        sku: sku,
        poolId: poolId,
        poolName: poolName,
        posterUrl: posterUrl,
        glbUrl: glbUrl,
        motherUrl: buildMotherDeepLink(sku, poolId),
        simulateVp5Fail: simulateVp5,
        strictPosterOnGlbFail: strictPoster
      });
    }

    root.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-action]") : null;
      if (!btn) return;
      var act = btn.getAttribute("data-action");

      if (act === "mto-cold-promote") {
        e.preventDefault();
        var card = btn.closest("[data-sv-cold-card]");
        triggerCardPromote(btn, card);
        return;
      }

      if (act === "mto-cold-add") {
        e.preventDefault();
        var sku = btn.getAttribute("data-sku") || "SV_MTO_SKU_01";
        var now = Date.now();
        var lockedUntil = commitLocks[sku] || 0;
        var blocked = now < lockedUntil;
        if (!blocked) {
          commitLocks[sku] = now + 2500;
          commitCounts[sku] = (commitCounts[sku] || 0) + 1;
        }
        showToast(
          blocked
            ? "Request already queued — duplicate click ignored."
            : "Curated Made-to-Order piece queued for your shopping bag."
        );
      }
    });

    // Reserved G-1/G-2 Agent Read-Only Invocation Listener: sv:mto:cold:promotePreview
    global.addEventListener("sv:mto:cold:promotePreview", function (e) {
      var targetSku = (e && e.detail && e.detail.sku) || "SV_MTO_SKU_01";
      var card = root.querySelector('[data-sv-cold-card][data-sku="' + targetSku + '"]') ||
        root.querySelector("[data-sv-cold-card]");
      if (!card) return;
      var trig = card.querySelector('[data-action="mto-cold-promote"]');
      if (trig) triggerCardPromote(trig, card);
    });

    root._svMtoColdController = {
      getCommitCount: function (sku) { return commitCounts[sku] || 0; }
    };
  }

  function boot() {
    var grids = document.querySelectorAll('.sv-mcc[data-sv-role="cold_01map"]');
    for (var i = 0; i < grids.length; i++) initMtoColdGrid(grids[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  global.SVMtoColdChild = { init: initMtoColdGrid };
})(window);
