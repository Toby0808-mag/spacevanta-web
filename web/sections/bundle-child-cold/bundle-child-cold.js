/**
 * SpaceVanta Bundle Indirect Cold P2 Controller (L5@v02 · sv_flow_child_promote_v01)
 * - Strictly 0 WebGL, 0 GLB, 0 Three.js imports in S0_COLD_IDLE (V-06 / V-P4).
 * - Lazy-triggers root-level PromoteOverlayPortal ONLY when user clicks/activates PlanarTrayTrigger.
 * - Enforces idempotent lock on Add Curated Set (3 rapid clicks = 1 commit + duplicate notice).
 * - Dynamically prefixes /{market}/pages/bundles?poolId=... on CustomizeMotherLink.
 */
(function (global) {
  'use strict';

  function getMarketSlug() {
    if (global.SpaceVanta && global.SpaceVanta.market && global.SpaceVanta.market.get) {
      return global.SpaceVanta.market.get().slug;
    }
    var m = (global.location && global.location.pathname || '').match(/^\/(en-(?:us|gb|au|ca|sg|hk))(?=\/|$)/i);
    return m ? m[1].toLowerCase() : 'en-us';
  }

  function buildMotherPoolUrl(poolId) {
    var slug = getMarketSlug();
    return '/' + slug + '/pages/bundles?poolId=' + encodeURIComponent(poolId || '');
  }

  function initColdGrid(root) {
    if (!root || root.getAttribute('data-sv-ready') === 'true') return;
    root.setAttribute('data-sv-ready', 'true');

    var driverUrl = root.getAttribute('data-sv-driver-url') || '/public/sv-bundle/BundleDriver.js';
    var toastEl = root.querySelector('[data-sv-cold-toast]');
    var commitLocks = Object.create(null);
    var commitCounts = Object.create(null);
    var toastTimer = null;

    function showColdToast(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.removeAttribute('hidden');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toastEl.setAttribute('hidden', '');
      }, 2500);
    }

    function syncMotherLinks() {
      var links = root.querySelectorAll('[data-sv-mother-link]');
      for (var i = 0; i < links.length; i++) {
        var pid = links[i].getAttribute('data-pool-id') || '';
        links[i].href = buildMotherPoolUrl(pid);
      }
    }
    syncMotherLinks();

    global.addEventListener('sv:market', syncMotherLinks);

    // Dashed silhouette fallback on planar image load failure
    var imgs = root.querySelectorAll('.sv-bcc-planar-img');
    Array.prototype.forEach.call(imgs, function (img) {
      img.addEventListener('error', function () {
        img.hidden = true;
        var frame = img.closest('.sv-bcc-planar-frame');
        if (frame) frame.classList.add('sv-bcc-planar-frame--silhouette');
      });
    });

    // Hydrate optional curated_sets metadata from sv:data; hide card if marked unavailable
    global.addEventListener('sv:data', function (e) {
      var d = e && e.detail ? (e.detail.data || e.detail) : null;
      if (!d || !d.bundle || !Array.isArray(d.bundle.curated_sets)) return;
      var sets = d.bundle.curated_sets;
      var cards = root.querySelectorAll('[data-sv-cold-card]');
      Array.prototype.forEach.call(cards, function (card) {
        var pid = card.getAttribute('data-pool-id');
        var found = sets.find(function (s) { return s.poolId === pid; });
        if (!found) {
          card.setAttribute('hidden', '');
          return;
        }
        card.removeAttribute('hidden');
        var nameEl = card.querySelector('[data-sv-field="pool-name"]');
        var cntEl = card.querySelector('[data-sv-field="curated-count"]');
        var prEl = card.querySelector('[data-sv-field="locale-price"]');
        if (nameEl && found.poolName) nameEl.textContent = String(found.poolName);
        if (cntEl && found.curatedCount) {
          cntEl.textContent = String(found.curatedCount);
          cntEl.removeAttribute('hidden');
        }
        if (prEl && found.localePrice) {
          prEl.textContent = String(found.localePrice);
          prEl.removeAttribute('hidden');
        }
      });
    });

    root.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
      if (!btn) return;
      var action = btn.getAttribute('data-action');

      if (action === 'cold-promote') {
        e.preventDefault();
        var card = btn.closest('[data-sv-cold-card]');
        if (!card || !global.SVPromotePortal) return;
        var poolId = card.getAttribute('data-pool-id') || 'pool_daily_01';
        var poolName = card.getAttribute('data-pool-name') || 'Curated 6-Bay Set';
        var posterUrl = card.getAttribute('data-poster-url') || '';
        var skus = (card.getAttribute('data-skus') || '')
          .split(',')
          .filter(Boolean)
          .map(function (id, idx) {
            return { slotId: 'bay_' + (idx + 1), skuId: id, title: id };
          });
        var simulateVp5 = root.getAttribute('data-sv-simulate-vp5') === 'true';
        var strictPoster = root.getAttribute('data-sv-strict-poster-on-glb-fail') === 'true';
        var glbUrl = root.getAttribute('data-sv-glb-url') || '';

        var portal = global.SVPromotePortal.getInstance();
        portal.promote(btn, {
          driverUrl: driverUrl,
          poolId: poolId,
          poolName: poolName,
          posterUrl: posterUrl,
          motherUrl: buildMotherPoolUrl(poolId),
          slots: skus,
          glbUrl: glbUrl,
          simulateVp5Fail: simulateVp5,
          strictPosterOnGlbFail: strictPoster
        });
        return;
      }

      if (action === 'cold-add-set') {
        e.preventDefault();
        var setPoolId = btn.getAttribute('data-pool-id') || 'pool_daily_01';
        var now = Date.now();
        var lockedUntil = commitLocks[setPoolId] || 0;
        var blocked = now < lockedUntil;
        if (!blocked) {
          commitLocks[setPoolId] = now + 2500;
          commitCounts[setPoolId] = (commitCounts[setPoolId] || 0) + 1;
        }
        try {
          global.dispatchEvent(new CustomEvent('sv_bundle_cart_commit', {
            detail: {
              poolId: setPoolId,
              mode: 'cold_curated',
              blockedDuplicate: blocked
            }
          }));
        } catch (_err) {}
        showColdToast(
          blocked
            ? 'Already triggered — duplicate click ignored.'
            : 'Curated set queued for your shopping bag.'
        );
      }
    });

    root._svColdController = {
      getCommitCount: function (poolId) { return commitCounts[poolId] || 0; }
    };
  }

  function boot() {
    var grids = document.querySelectorAll('[data-sv-module="sv_flow_child_promote_v01"][data-sv-role="cold_p2"]');
    for (var i = 0; i < grids.length; i++) initColdGrid(grids[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  global.SVBundleColdChild = { init: initColdGrid };
})(window);
