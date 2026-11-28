/**
 * SpaceVanta Bundle Hot Child Controller (L5@v02 · sv_flow_child_promote_v01)
 * - Strictly locks to single Worker-assigned pool (bundle.assigned_pool); hides panel on L2 if unreachable.
 * - Cross-pool / pool-change hands off to Mother page carrying poolId + activeSlotSkus (Zero Reset).
 */
(function (global) {
  'use strict';

  var SINGLE_POOL_SKUS = [
    { skuId: 'SV_MP_SKU_01_v01', title: 'Cotton White Coffret' },
    { skuId: 'SV_MP_SKU_02_v01', title: 'Matte Matcha Crisps' },
    { skuId: 'SV_MP_SKU_03_v01', title: 'Roasted Cocoa Tin' },
    { skuId: 'SV_MP_SKU_04_v01', title: 'Warm Cream Ceramic Cup' },
    { skuId: 'SV_MP_SKU_05_v01', title: 'Oat Linen Tea Caddy' },
    { skuId: 'SV_MP_SKU_06_v01', title: 'Toasted Praline Box' }
  ];

  async function initHotChild(root) {
    if (!root || root.getAttribute('data-sv-ready') === 'true') return;
    root.setAttribute('data-sv-ready', 'true');

    var driverUrl = root.getAttribute('data-sv-driver-url') || '/public/sv-bundle/BundleDriver.js';
    var posterUrl = root.getAttribute('data-sv-poster-url') || '';
    var driver = global.BundleDriver || null;
    if (!driver) {
      try {
        var mod = await import(driverUrl);
        driver = mod.BundleDriver || mod.default || global.BundleDriver;
      } catch (_e) {
        driver = null;
      }
    }

    var canvasEl = root.querySelector('[data-sv-bundle-canvas]');
    var l4El = root.querySelector('[data-sv-l4-static]');
    var panelEl = root.querySelector('[data-sv-slot="child-hot-singlepool-panel"]');
    var trustEl = root.querySelector('[data-sv-slot="child-trust-header"]');
    var assignedChip = root.querySelector('[data-sv-assigned-chip]');
    var assignedNameEl = root.querySelector('[data-sv-field="assigned-pool-name"]');
    var slotRows = Array.prototype.slice.call(root.querySelectorAll('.sv-bch-slot'));
    var priceEl = root.querySelector('[data-sv-field="locale-price"]');
    var commitBtn = root.querySelector('[data-sv-commit]');
    var commitLabel = root.querySelector('[data-sv-commit-label]');
    var handoffLink = root.querySelector('[data-sv-handoff-link]');
    var toastEl = root.querySelector('[data-sv-toast]');

    if (!driver) {
      if (canvasEl) canvasEl.hidden = true;
      if (l4El) l4El.removeAttribute('hidden');
      return;
    }

    var state = driver.createInitialState('hot_child');
    state = driver.dispatch(state, {
      type: 'HYDRATE_POOL',
      poolId: 'scene_assigned_01',
      poolName: 'Desk Tea & Tasting Pool',
      curated: SINGLE_POOL_SKUS.map(function (it, i) {
        return { slotId: 'bay_' + (i + 1), skuId: it.skuId, title: it.title, qty: 1, isMto: false, fromCrossPool: false };
      }),
      crossLimit: 0
    }, 'ephemeral');

    function render(clipHint) {
      root.setAttribute('data-sv-state', state.flow);
      slotRows.forEach(function (row, idx) {
        var lbl = row.querySelector('[data-sv-slot-name]');
        var s = state.slots[idx];
        if (lbl && s) lbl.textContent = 'Bay ' + (idx + 1) + ' · ' + (s.title || s.skuId);
      });
      if (handoffLink) {
        handoffLink.href = driver.buildMotherHandoffUrl(state.poolId, state.slots);
      }
      var hasQuote = Boolean(state.quote && state.quote.localePrice);
      if (priceEl) {
        if (hasQuote) {
          priceEl.textContent = String(state.quote.localePrice);
          priceEl.removeAttribute('hidden');
        } else {
          priceEl.setAttribute('hidden', '');
        }
      }
      if (commitBtn && commitLabel) {
        commitBtn.disabled = !hasQuote && state.flow !== 'timeout_fallback';
        commitLabel.textContent = state.flow === 'hot_child_pool_edit' ? 'Take Scene Custom Set' : 'Take This Set';
      }
      if (toastEl) {
        if (state.toast) {
          toastEl.textContent = state.toast;
          toastEl.removeAttribute('hidden');
        } else {
          toastEl.setAttribute('hidden', '');
        }
      }
      if (canvasEl && canvasEl.dataset.sv3d === 'webgl') {
        driver.updateStage(canvasEl, { slots: state.slots, clipHint: clipHint || null });
      }
    }

    var mountRes = await driver.mountStage(canvasEl, {
      role: 'hot_child',
      slots: state.slots,
      lidOpenDeg: 72,
      posterUrl: posterUrl
    });
    if (!mountRes.ok) {
      if (canvasEl) canvasEl.hidden = true;
      if (l4El) l4El.removeAttribute('hidden');
    }
    render();

    global.addEventListener('sv:data', function (e) {
      var d = e && e.detail ? (e.detail.data || e.detail) : null;
      if (!d) return;
      if (d.assignedPoolUnavailable && panelEl) {
        panelEl.setAttribute('hidden', '');
        return;
      }
      if (panelEl) panelEl.removeAttribute('hidden');
      var bdl = d.bundle || {};
      if (bdl.assigned_pool_name && assignedNameEl && assignedChip) {
        assignedNameEl.textContent = String(bdl.assigned_pool_name);
        assignedChip.removeAttribute('hidden');
        state.poolId = bdl.assigned_pool_id || state.poolId;
      }
      var sh = d.shipping || {};
      if (trustEl) {
        if (sh.duty && sh.deadline && bdl.threshold && !d.shippingUnavailable) {
          trustEl.querySelector('[data-sv-field="duty"]').textContent = String(sh.duty);
          trustEl.querySelector('[data-sv-field="leadtime"]').textContent = String(sh.deadline);
          trustEl.querySelector('[data-sv-field="threshold"]').textContent = String(bdl.threshold);
          trustEl.removeAttribute('hidden');
        } else {
          trustEl.setAttribute('hidden', '');
        }
      }
      if (bdl.quote) {
        state = driver.dispatch(state, { type: 'SET_QUOTE', quote: bdl.quote }, 'ephemeral');
      }
      render();
    });

    root.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
      if (!btn) return;
      var act = btn.getAttribute('data-action');
      if (act === 'child-swap') {
        var idx = Number(btn.getAttribute('data-bay-index') || 0);
        var cur = state.slots[idx];
        var pos = SINGLE_POOL_SKUS.findIndex(function (x) { return x.skuId === (cur && cur.skuId); });
        var next = SINGLE_POOL_SKUS[(pos + 1) % SINGLE_POOL_SKUS.length];
        state = driver.dispatch(state, {
          type: 'SWAP_SLOT',
          index: idx,
          skuId: next.skuId,
          title: next.title,
          isMto: false,
          fromCrossPool: false
        }, 'ephemeral');
        render({ clipId: 'clip_slot_swap', bayIndex: idx, skuId: next.skuId });
      } else if (act === 'child-hotspot') {
        driver.updateStage(canvasEl, { hotspotId: btn.getAttribute('data-hotspot-id') });
      } else if (act === 'child-cam') {
        driver.updateStage(canvasEl, { hotspotId: null, cameraPreset: btn.getAttribute('data-preset') });
      } else if (act === 'child-lid') {
        driver.updateStage(canvasEl, { clipId: 'clip_lid_toggle' });
      } else if (act === 'handoff-mother') {
        state = driver.dispatch(state, { type: 'HANDOFF_MOTHER' }, 'ephemeral');
        if (handoffLink) {
          handoffLink.href = driver.buildMotherHandoffUrl(state.poolId, state.slots);
        }
        root.setAttribute('data-sv-state', 'handoff_to_mother');
      } else if (act === 'child-commit') {
        var before = state.commitCount;
        state = driver.dispatch(state, { type: 'ATTEMPT_COMMIT', lockMs: 2500 }, 'ephemeral');
        render();
        if (state.commitCount > before) {
          setTimeout(function () {
            state = driver.dispatch(state, { type: 'COMMIT_OK' }, 'ephemeral');
            render();
          }, 260);
        }
      }
    });
  }

  function boot() {
    var els = document.querySelectorAll('[data-sv-module="sv_flow_child_promote_v01"][data-sv-role="hot_child"]');
    for (var i = 0; i < els.length; i++) initHotChild(els[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  global.SVBundleHotChild = { init: initHotChild };
})(window);
