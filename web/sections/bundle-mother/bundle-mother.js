/**
 * SpaceVanta Bundle Mother Section Controller (L5@v02 · sv_flow_bundle_v01 · r2)
 * - Uses global unique singleton BundleDriver (zero direct `new THREE.*` in section code).
 * - Synchronous DOM skeleton + textContent updates only (zero innerHTML concatenation).
 * - Implements all 9 Mother states, HTML5 bidirectional drag & drop, 2 core hotspots,
 *   4 C1 clips + closed-lid auto-open-to-72-deg linkage, F2 Mixed-MTO & 3 direct-pass branches,
 *   3s fast-fail degradation (L0..L5), and <head> JSON-LD promotion.
 */
(function (global) {
  'use strict';

  var SWAP_ROTATION_POOL = [
    { skuId: 'SV_MP_SKU_01_v01', title: 'Cotton White Chocolate Coffret', isMto: false },
    { skuId: 'SV_MP_SKU_02_v01', title: 'Matte Matcha Nut Crisps Pouch', isMto: false },
    { skuId: 'SV_MP_SKU_03_v01', title: 'Roasted Cocoa Gift Tin', isMto: false },
    { skuId: 'SV_MP_SKU_04_v01', title: 'Warm Cream Ceramic Cup', isMto: false },
    { skuId: 'SV_MP_SKU_05_v01', title: 'Oat Linen Tea Caddy', isMto: false },
    { skuId: 'SV_MP_SKU_06_v01', title: 'Toasted Hazelnut Praline Box', isMto: false },
    { skuId: 'SV_MP_SKU_07_v01', title: 'Bespoke Porcelain Vessel', isMto: true },
    { skuId: 'SV_MP_SKU_08_v01', title: 'Single-Origin Drip Folio', isMto: false },
    { skuId: 'SV_MP_SKU_09_v01', title: 'Brass Scoop & Clip', isMto: true }
  ];

  var BOUNDARY_MESSAGES = {
    MIN_SKUS: 'Keep the minimum variety of distinct items in your tray, or swap a slot instead.',
    MAX_QTY: 'All 6 tray bays are filled — swap an existing bay to try another piece.',
    MAX_PER_SKU: 'Per-item limit reached for this tray — pick another piece from the pool.',
    CROSS_POOL_CAP: 'Cross-pool allowance reached — swap an existing cross-pool slot to continue.'
  };

  function detectMarketSlug() {
    if (global.SpaceVanta && global.SpaceVanta.market && global.SpaceVanta.market.get) {
      return global.SpaceVanta.market.get().slug;
    }
    var m = (global.location && global.location.pathname || '').match(/^\/(en-(?:us|gb|au|ca|sg|hk))(?=\/|$)/i);
    return m ? m[1].toLowerCase() : 'en-us';
  }

  function buildMarketRoute(subPath) {
    var clean = String(subPath || '').replace(/^\/+/, '');
    if (global.SpaceVanta && global.SpaceVanta.market && global.SpaceVanta.market.buildPath) {
      return global.SpaceVanta.market.buildPath(clean);
    }
    return '/' + detectMarketSlug() + '/' + clean;
  }

  function promoteJsonLdToHead(root) {
    try {
      var scope = (root && root.parentElement) ? root.parentElement : document;
      var ldScript = scope.querySelector('script[data-sv-bundle-jsonld]') || document.querySelector('script[data-sv-bundle-jsonld]');
      if (!ldScript || !document.head) return;
      if (!document.head.querySelector('script[data-sv-bundle-head-jsonld]')) {
        var clone = document.createElement('script');
        clone.type = 'application/ld+json';
        clone.setAttribute('data-sv-bundle-head-jsonld', 'true');
        clone.textContent = ldScript.textContent;
        document.head.appendChild(clone);
      }
    } catch (_e) {}
  }

  async function initBundleMother(root) {
    if (!root || root.getAttribute('data-sv-ready') === 'true') return;
    root.setAttribute('data-sv-ready', 'true');

    promoteJsonLdToHead(root);

    var driverUrl = root.getAttribute('data-sv-driver-url') || '/public/sv-bundle/BundleDriver.js';
    var posterUrl = root.getAttribute('data-sv-poster-url') || '';
    var driver = global.BundleDriver || null;
    if (!driver) {
      try {
        var mod = await import(driverUrl);
        driver = mod.BundleDriver || mod.default || global.BundleDriver;
      } catch (_err) {
        driver = null;
      }
    }

    var trustEl = root.querySelector('[data-sv-slot="bundle-hero-trust"]');
    var dutyEl = root.querySelector('[data-sv-field="duty"]');
    var leadEl = root.querySelector('[data-sv-field="leadtime"]');
    var threshEl = root.querySelector('[data-sv-field="threshold"]');
    var orderByEl = root.querySelector('[data-sv-field="order-by"]');
    var seasonSepEl = root.querySelector('[data-sv-season-sep]');
    var seasonIconEl = root.querySelector('[data-sv-season-icon]');

    var canvasEl = root.querySelector('[data-sv-bundle-canvas]');
    var hotspotsLayer = root.querySelector('[data-sv-hotspots-layer]');
    var vp5El = root.querySelector('[data-sv-vp5-fallback]');
    var l4StaticEl = root.querySelector('[data-sv-l4-static]');
    var peekBubbleEl = root.querySelector('[data-sv-peek-bubble]');
    var modePillEl = root.querySelector('[data-sv-mode-pill]');
    var flipBtn = root.querySelector('[data-action="mobile-flip-compare"]');

    var tierBarEl = root.querySelector('[data-sv-tier-bar]');
    var tiersSummaryEl = root.querySelector('[data-sv-field="tiers-summary"]');
    var setSavingEl = root.querySelector('[data-sv-field="set-saving"]');
    var nudgeEl = root.querySelector('[data-sv-boundary-nudge]');
    var bayCards = Array.prototype.slice.call(root.querySelectorAll('[data-sv-bay-card]'));
    var dropRemoveEl = root.querySelector('[data-sv-drop-remove]');
    var ecoSlotEl = root.querySelector('[data-sv-ecoslot]');
    var parcelNoteEl = root.querySelector('[data-sv-field="one-parcel-note"]');
    var mtoF2El = root.querySelector('[data-sv-mto-f2]');
    var mtoHintTextEl = root.querySelector('[data-sv-field="mto-cart-hint"]');
    var mtoSlaEl = root.querySelector('[data-sv-field="mto-reply-sla"]');
    var toastEl = root.querySelector('[data-sv-toast]');

    var ctaAuraEl = root.querySelector('.sv-bm-cta-bar__aura');
    var priceBoxEl = root.querySelector('[data-sv-price-box]');
    var localePriceEl = root.querySelector('[data-sv-field="locale-price"]');
    var auxPriceEl = root.querySelector('[data-sv-field="aux-locale-price"]');
    var primaryCta = root.querySelector('[data-sv-primary-cta]');
    var ctaLabelEl = root.querySelector('[data-sv-cta-label]');
    var cancelBtn = root.querySelector('[data-sv-cancel-btn]');
    var cartLinkEl = root.querySelector('[data-sv-cart-link]');

    var crossPoolSection = root.querySelector('[data-sv-slot="bundle-crosspool-cold-grid"]');
    var crossBadgeEl = root.querySelector('[data-sv-cross-badge]');
    var crossLeftEl = root.querySelector('[data-sv-field="cross-left"]');
    var crossLimitEl = root.querySelector('[data-sv-field="cross-limit"]');
    var statementLinkEl = root.querySelector('[data-sv-statement-link]');
    var srLiveEl = root.querySelector('[data-sv-sr-live]');

    function syncMarketLinks() {
      if (statementLinkEl) statementLinkEl.href = buildMarketRoute('pages/mechanism-bundles-statement');
      if (cartLinkEl) cartLinkEl.href = buildMarketRoute('cart');
    }
    syncMarketLinks();

    if (!driver) {
      if (canvasEl) canvasEl.hidden = true;
      if (hotspotsLayer) hotspotsLayer.hidden = true;
      if (l4StaticEl) l4StaticEl.removeAttribute('hidden');
      root.setAttribute('data-sv-state', 'degraded_l4_static');
      return;
    }

    var state = driver.createInitialState('mother');
    state = driver.dispatch(state, {
      type: 'SET_MARKET',
      market: detectMarketSlug()
    });

    // Check URL handoff or deep-link (#routine-<id> or ?poolId=...&activeSlotSkus=...)
    var urlParams = new URLSearchParams((global.location && global.location.search) || '');
    var handoff = driver.consumeMotherHandoff();
    var restoredSkus = [];
    if (urlParams.get('activeSlotSkus')) {
      restoredSkus = urlParams.get('activeSlotSkus').split(',').filter(Boolean);
    } else if (handoff && Array.isArray(handoff.activeSlotSkus)) {
      restoredSkus = handoff.activeSlotSkus.filter(Boolean);
    }

    var defaultCurated = SWAP_ROTATION_POOL.slice(0, 6).map(function (item, idx) {
      return {
        slotId: 'bay_' + (idx + 1),
        skuId: item.skuId,
        title: item.title,
        qty: 1,
        isMto: item.isMto,
        fromCrossPool: false,
        productUrl: buildMarketRoute('products/' + item.skuId.toLowerCase())
      };
    });

    var restoredSlots = null;
    if (restoredSkus.length > 0) {
      restoredSlots = [0, 1, 2, 3, 4, 5].map(function (i) {
        var id = restoredSkus[i];
        if (!id) return null;
        var found = SWAP_ROTATION_POOL.find(function (x) { return x.skuId === id; }) || { skuId: id, title: id, isMto: false };
        return {
          slotId: 'bay_' + (i + 1),
          skuId: found.skuId,
          title: found.title,
          qty: 1,
          isMto: Boolean(found.isMto),
          fromCrossPool: false,
          productUrl: buildMarketRoute('products/' + found.skuId.toLowerCase())
        };
      });
    } else {
      restoredSlots = driver.loadDraftSlots(urlParams.get('poolId') || 'pool_daily_01');
    }

    var isMobile = (global.innerWidth || 1280) <= 767;
    var f2Enabled = root.getAttribute('data-sv-f2-enabled') !== 'false';

    state = driver.dispatch(state, {
      type: 'HYDRATE_POOL',
      poolId: urlParams.get('poolId') || (handoff && handoff.poolId) || 'pool_daily_01',
      poolName: 'Daily Precision Set',
      curated: defaultCurated,
      restoredSlots: restoredSlots,
      crossLimit: 2,
      introPeek: isMobile && !restoredSlots,
      f2SwitchOff: !f2Enabled
    });

    var boundaryTimer = null;
    var peekTimer = null;
    var commitTimer = null;
    var draggedBayIndex = null;
    var draggedPoolItem = null;

    function renderState(clipHint) {
      root.setAttribute('data-sv-state', state.flow);

      // Mobile Intro Peek 12-deg bubble
      if (peekBubbleEl) {
        if (state.flow === 'master_intro_peek') {
          peekBubbleEl.removeAttribute('hidden');
        } else {
          peekBubbleEl.setAttribute('hidden', '');
        }
      }

      if (modePillEl) {
        modePillEl.textContent = state.mode === 'aux' ? 'Custom 6-Bay' : 'Curated 6-Bay';
      }
      if (flipBtn) {
        flipBtn.setAttribute('aria-pressed', state.flow === 'mobile_flip_compare' ? 'true' : 'false');
      }

      // 6 Bay Cards
      bayCards.forEach(function (card, idx) {
        var s = state.slots[idx];
        var titleNode = card.querySelector('[data-sv-bay-title]');
        var badgeNode = card.querySelector('[data-sv-bay-badge]');
        var swapBtn = card.querySelector('[data-action="slot-swap"]');
        var remBtn = card.querySelector('[data-action="slot-remove"]');
        var addBtn = card.querySelector('[data-action="slot-add"]');

        card.setAttribute('data-active', state.activeBayIndex === idx ? 'true' : 'false');
        if (s && s.skuId) {
          card.setAttribute('data-empty', 'false');
          card.setAttribute('draggable', 'true');
          if (titleNode) titleNode.textContent = s.title || s.skuId;
          if (badgeNode) {
            if (s.isMto) {
              badgeNode.textContent = 'MTO';
              badgeNode.removeAttribute('hidden');
            } else if (s.fromCrossPool) {
              badgeNode.textContent = 'Cross-Pool';
              badgeNode.removeAttribute('hidden');
            } else {
              badgeNode.setAttribute('hidden', '');
            }
          }
          if (swapBtn) swapBtn.hidden = false;
          if (remBtn) remBtn.hidden = false;
          if (addBtn) addBtn.hidden = true;
        } else {
          card.setAttribute('data-empty', 'true');
          card.setAttribute('draggable', 'false');
          if (titleNode) titleNode.textContent = 'Empty Bay — Select or Drop Item';
          if (badgeNode) badgeNode.setAttribute('hidden', '');
          if (swapBtn) swapBtn.hidden = true;
          if (remBtn) remBtn.hidden = true;
          if (addBtn) addBtn.hidden = false;
        }
      });

      // Boundary Nudge (3.5s auto-dismiss)
      if (nudgeEl) {
        if (state.flow === 'boundary_nudge' && state.boundaryCode) {
          nudgeEl.textContent = BOUNDARY_MESSAGES[state.boundaryCode] || BOUNDARY_MESSAGES.MAX_QTY;
          nudgeEl.removeAttribute('hidden');
          if (boundaryTimer) clearTimeout(boundaryTimer);
          boundaryTimer = setTimeout(function () {
            state = driver.dispatch(state, { type: 'CLEAR_BOUNDARY' });
            renderState();
          }, 3500);
        } else {
          nudgeEl.setAttribute('hidden', '');
        }
      }

      // F2 Mixed-MTO Hint (hidden on HK / empty season / switch off direct-pass branches!)
      if (mtoF2El) {
        if (state.flow === 'mixed_mto_hint' && !state.directPassBranch) {
          if (mtoHintTextEl) {
            mtoHintTextEl.textContent = state.mtoCartHint || 'Includes a Made-to-Order piece. Choose combined or split dispatch on the Cart page.';
          }
          if (mtoSlaEl) {
            if (state.mtoSla) {
              mtoSlaEl.textContent = state.mtoSla;
              mtoSlaEl.removeAttribute('hidden');
            } else {
              mtoSlaEl.setAttribute('hidden', '');
            }
          }
          mtoF2El.removeAttribute('hidden');
        } else {
          mtoF2El.setAttribute('hidden', '');
        }
      }

      // Cross-pool remaining badge
      if (crossLeftEl && crossLimitEl) {
        crossLeftEl.textContent = String(state.crossLeft);
        crossLimitEl.textContent = String(state.crossLimit);
        if (crossBadgeEl) crossBadgeEl.removeAttribute('hidden');
      }

      // Price & Tier display (strictly from quote/tiers contract; hidden if absent)
      var hasQuote = Boolean(state.quote && state.quote.localePrice);
      if (priceBoxEl && localePriceEl) {
        if (hasQuote) {
          localePriceEl.textContent = String(state.quote.localePrice);
          if (auxPriceEl) {
            if (state.mode === 'aux' && state.quote.auxLocalePrice) {
              auxPriceEl.textContent = String(state.quote.auxLocalePrice);
              auxPriceEl.removeAttribute('hidden');
            } else {
              auxPriceEl.setAttribute('hidden', '');
            }
          }
          priceBoxEl.removeAttribute('hidden');
        } else {
          priceBoxEl.setAttribute('hidden', '');
        }
      }

      if (tierBarEl && tiersSummaryEl && setSavingEl) {
        if (state.tiers && (state.tiers.summary || state.tiers.saving)) {
          tiersSummaryEl.textContent = state.tiers.summary || '';
          setSavingEl.textContent = state.tiers.saving || '';
          tierBarEl.removeAttribute('hidden');
        } else {
          tierBarEl.setAttribute('hidden', '');
        }
      }

      // Toast / Confirmation
      if (toastEl) {
        if (state.flow === 'added_to_cart') {
          toastEl.textContent = 'Bundle selection added to your shopping bag.';
          toastEl.removeAttribute('hidden');
        } else if (state.toast) {
          toastEl.textContent = state.toast;
          toastEl.removeAttribute('hidden');
        } else {
          toastEl.setAttribute('hidden', '');
        }
      }

      // Single Primary CTA label & state per L5 §4.1
      if (primaryCta && ctaLabelEl) {
        var submitting = state.flow === 'submitting_cart';
        var added = state.flow === 'added_to_cart';
        if (ctaAuraEl) ctaAuraEl.hidden = !submitting;
        if (cancelBtn) cancelBtn.hidden = !submitting;
        if (cartLinkEl) cartLinkEl.hidden = !added;

        if (added) {
          primaryCta.hidden = true;
        } else {
          primaryCta.hidden = false;
          // L5 §5: disable add-to-cart button when bundle.quote is absent (except Retry / Swap guidance)
          primaryCta.disabled = (!hasQuote && state.flow !== 'timeout_fallback' && state.flow !== 'boundary_nudge');

          if (state.flow === 'timeout_fallback') {
            ctaLabelEl.textContent = 'Retry';
          } else if (state.flow === 'boundary_nudge') {
            ctaLabelEl.textContent = 'Swap a Slot';
          } else if (state.flow === 'mixed_mto_hint') {
            ctaLabelEl.textContent = 'Continue / Add to Cart';
          } else if (state.flow === 'mobile_flip_compare') {
            ctaLabelEl.textContent = 'Take Active Set';
          } else if (submitting) {
            ctaLabelEl.textContent = 'Adding Set...';
          } else if (state.mode === 'aux') {
            ctaLabelEl.textContent = 'Take My Custom Set';
          } else {
            ctaLabelEl.textContent = 'Take This Set';
          }
        }
      }

      if (srLiveEl && state.srMessage) {
        srLiveEl.textContent = state.srMessage;
      }

      // Sync 3D Stage
      if (canvasEl && canvasEl.dataset.sv3d === 'webgl') {
        driver.updateStage(canvasEl, {
          slots: state.slots,
          activeSlotIndex: state.activeBayIndex,
          clipHint: clipHint || null
        });
      }
    }

    // Mount 3D Stage (L0 GLB primary -> L1 homologous procedural / V-P5 poster -> L4 ?sv_3d=off static SVG)
    var initialLidDeg = state.flow === 'master_intro_peek' ? 12 : 72;
    var mountRes = await driver.mountStage(canvasEl, {
      role: 'mother',
      slots: state.slots,
      lidOpenDeg: initialLidDeg,
      animateInitialLid: state.flow === 'master_intro_peek',
      posterUrl: posterUrl,
      onSlotSelect: function (slotInfo) {
        if (slotInfo && typeof slotInfo.bayIndex === 'number') {
          state.activeBayIndex = slotInfo.bayIndex;
          renderState();
        }
      }
    });

    if (!mountRes.ok) {
      if (canvasEl) canvasEl.hidden = true;
      if (hotspotsLayer) hotspotsLayer.hidden = true;
      if (mountRes.level === 'L1_VP5' && vp5El) {
        vp5El.removeAttribute('hidden');
      } else if (l4StaticEl) {
        l4StaticEl.removeAttribute('hidden');
      }
    } else if (state.flow === 'master_intro_peek') {
      peekTimer = setTimeout(function () {
        state = driver.dispatch(state, { type: 'DISMISS_INTRO_PEEK' });
        driver.updateStage(canvasEl, { clipId: 'clip_lid_toggle', targetDeg: 72 });
        renderState();
      }, 2800);
    }

    renderState();

    // Hydrate from Worker / SpaceVanta Data Bus (3000ms fast-fail silent degradation)
    function applyDataPayload(payload) {
      if (!payload) return;

      // bundle.resolve degraded check
      if (payload.bundleResolveUnavailable === true) {
        root.setAttribute('hidden', '');
        root.setAttribute('data-sv-state', 'bundle_resolve_hidden');
        return;
      }
      root.removeAttribute('hidden');

      // Trust 50: ALL 3 fields required, else entire bar hidden (zero "· ·")
      var shipping = payload.shipping || {};
      var bdl = payload.bundle || {};
      var duty = shipping.duty || shipping.dutyLabel || '';
      var lead = shipping.deadline || shipping.leadtimeLabel || '';
      var thresh = bdl.threshold || bdl.thresholdLabel || '';

      if (trustEl) {
        if (duty && lead && thresh && !payload.shippingUnavailable) {
          if (dutyEl) dutyEl.textContent = String(duty);
          if (leadEl) leadEl.textContent = String(lead);
          if (threshEl) threshEl.textContent = String(thresh);
          trustEl.removeAttribute('hidden');
          state = driver.dispatch(state, { type: 'HYDRATE_TRUST', duty: duty, leadtime: lead, threshold: thresh });
        } else {
          trustEl.setAttribute('hidden', '');
        }
      }

      // EcosystemSlot (shipping./parcel_note)
      var parcelNote = shipping.parcel_note || shipping.parcelNote || '';
      if (ecoSlotEl) {
        if (parcelNote && !payload.shippingUnavailable && !payload.ecoSlotTimeout) {
          if (parcelNoteEl) parcelNoteEl.textContent = String(parcelNote);
          ecoSlotEl.removeAttribute('hidden');
        } else {
          ecoSlotEl.setAttribute('hidden', '');
        }
      }

      // MTO SLA & Cart Hint
      var mto = payload.mto || {};
      state = driver.dispatch(state, {
        type: 'HYDRATE_ECO',
        parcelNote: parcelNote || null,
        mtoSla: mto.reply_sla || mto.replySla || null,
        mtoCartHint: mto.cart_hint || mto.cartHint || null
      });

      // Cross-Pool L2 degradation
      if (crossPoolSection) {
        if (payload.crossPoolUnavailable || root.getAttribute('data-sv-cross-pool-enabled') === 'false') {
          crossPoolSection.setAttribute('hidden', '');
        } else {
          crossPoolSection.removeAttribute('hidden');
        }
      }

      // Quote & Tiers
      if (bdl.quote) {
        state = driver.dispatch(state, {
          type: 'SET_QUOTE',
          quote: bdl.quote,
          tiers: bdl.tiers || state.tiers
        });
      } else if (payload.quoteUnavailable) {
        state = driver.dispatch(state, { type: 'SET_QUOTE', quote: null, tiers: null });
      }

      if (typeof payload.seasonPoolEmpty === 'boolean' || typeof payload.f2SwitchOff === 'boolean') {
        state = driver.dispatch(state, {
          type: 'HYDRATE_POOL',
          poolId: state.poolId,
          poolName: state.poolName,
          curated: state.curatedSlots,
          restoredSlots: state.mode === 'aux' ? state.slots : null,
          crossLimit: bdl.cross_pool_limit != null ? bdl.cross_pool_limit : state.crossLimit,
          seasonPoolEmpty: Boolean(payload.seasonPoolEmpty),
          f2SwitchOff: payload.f2SwitchOff != null ? Boolean(payload.f2SwitchOff) : state.f2SwitchOff
        });
      }

      renderState();
    }

    function applySeasonPayload(season) {
      var allowSeason = root.getAttribute('data-sv-season-allow') !== 'false';
      var seasonOff = global.SpaceVanta && global.SpaceVanta.flags && global.SpaceVanta.flags.isSeasonOff();
      var active = allowSeason && !seasonOff && season && (season.on || season.enabled) && season.orderByLabel;
      if (orderByEl) {
        if (active) {
          orderByEl.textContent = String(season.orderByLabel);
          orderByEl.removeAttribute('hidden');
          if (seasonSepEl) seasonSepEl.removeAttribute('hidden');
          if (seasonIconEl) seasonIconEl.removeAttribute('hidden');
        } else {
          orderByEl.textContent = '';
          orderByEl.setAttribute('hidden', '');
          if (seasonSepEl) seasonSepEl.setAttribute('hidden', '');
          if (seasonIconEl) seasonIconEl.setAttribute('hidden', '');
        }
      }
      driver.updateStage(canvasEl, { refreshTokens: true });
    }

    global.addEventListener('sv:data', function (e) {
      applyDataPayload(e && e.detail ? (e.detail.data || e.detail) : null);
    });

    global.addEventListener('sv:market', function (e) {
      var d = (e && e.detail) || {};
      var nextMarket = d.code || d.slug || d.market || detectMarketSlug();
      state = driver.dispatch(state, { type: 'SET_MARKET', market: nextMarket });
      syncMarketLinks();
      renderState();
    });

    global.addEventListener('sv:season', function (e) {
      applySeasonPayload(e && e.detail ? e.detail : null);
    });

    if (global.SpaceVanta && global.SpaceVanta.data) {
      applyDataPayload(global.SpaceVanta.data);
    }
    if (global.SpaceVanta && global.SpaceVanta.season) {
      applySeasonPayload(global.SpaceVanta.season.get ? global.SpaceVanta.season.get() : global.SpaceVanta.season);
    }

    // Helper to pick next distinct SKU when swapping a slot inline
    function pickNextSwapItem(currentSkuId) {
      var idx = SWAP_ROTATION_POOL.findIndex(function (x) { return x.skuId === currentSkuId; });
      for (var step = 1; step <= SWAP_ROTATION_POOL.length; step++) {
        var cand = SWAP_ROTATION_POOL[(idx + step + SWAP_ROTATION_POOL.length) % SWAP_ROTATION_POOL.length];
        var count = state.slots.filter(function (s) { return s && s.skuId === cand.skuId; }).length;
        if (count < (state.rules.maxPerSku || 2)) return cand;
      }
      return SWAP_ROTATION_POOL[0];
    }

    // Delegated Click Actions ([data-action] * { pointer-events: none; } guarantees 100% hit rate)
    root.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
      if (!btn) return;
      var action = btn.getAttribute('data-action');

      if (action === 'dismiss-peek') {
        if (peekTimer) clearTimeout(peekTimer);
        state = driver.dispatch(state, { type: 'DISMISS_INTRO_PEEK' });
        driver.updateStage(canvasEl, { clipId: 'clip_lid_toggle', targetDeg: 72 });
        renderState();
        return;
      }

      if (action === 'mobile-flip-compare') {
        var nextMode = state.mode === 'master' ? 'aux' : 'master';
        state = driver.dispatch(state, { type: 'TOGGLE_MOBILE_FLIP', selectMode: nextMode });
        renderState();
        return;
      }

      if (action === 'camera-preset') {
        var preset = btn.getAttribute('data-preset') || 'tray_view';
        driver.updateStage(canvasEl, { hotspotId: null, cameraPreset: preset });
        root.querySelectorAll('[data-action="focus-hotspot"], [data-action="camera-preset"]').forEach(function (el) {
          el.setAttribute('aria-pressed', el === btn ? 'true' : 'false');
        });
        return;
      }

      if (action === 'focus-hotspot') {
        var hsId = btn.getAttribute('data-hotspot-id');
        driver.updateStage(canvasEl, { hotspotId: hsId, bayIndex: state.activeBayIndex });
        root.querySelectorAll('[data-action="focus-hotspot"], [data-action="camera-preset"]').forEach(function (el) {
          var match = el.getAttribute('data-hotspot-id') === hsId;
          el.setAttribute('aria-pressed', match ? 'true' : 'false');
        });
        return;
      }

      if (action === 'focus-subbay') {
        var subIdx = Number(btn.getAttribute('data-bay-index') || 0);
        state.activeBayIndex = subIdx;
        driver.updateStage(canvasEl, { hotspotId: 'HS_BAY_GRID', bayIndex: subIdx });
        renderState();
        return;
      }

      if (action === 'lid-toggle') {
        driver.updateStage(canvasEl, { clipId: 'clip_lid_toggle' });
        return;
      }

      if (action === 'reset-curated') {
        state = driver.dispatch(state, { type: 'RESET_CURATED' });
        renderState();
        return;
      }

      if (action === 'slot-swap') {
        var sIdx = Number(btn.getAttribute('data-bay-index') || 0);
        var cur = state.slots[sIdx];
        var nextItem = pickNextSwapItem(cur && cur.skuId);
        state = driver.dispatch(state, {
          type: 'SWAP_SLOT',
          index: sIdx,
          skuId: nextItem.skuId,
          title: nextItem.title,
          isMto: nextItem.isMto,
          fromCrossPool: false,
          productUrl: buildMarketRoute('products/' + nextItem.skuId.toLowerCase())
        });
        renderState({ clipId: 'clip_slot_swap', bayIndex: sIdx, skuId: nextItem.skuId });
        return;
      }

      if (action === 'slot-remove') {
        var rIdx = Number(btn.getAttribute('data-bay-index') || 0);
        var prevFlow = state.flow;
        state = driver.dispatch(state, { type: 'REMOVE_SLOT', index: rIdx });
        renderState(state.flow === 'boundary_nudge' ? null : { clipId: 'clip_slot_remove', bayIndex: rIdx });
        return;
      }

      if (action === 'slot-add') {
        var aIdx = Number(btn.getAttribute('data-bay-index') || 0);
        var addItem = pickNextSwapItem('');
        state = driver.dispatch(state, {
          type: 'ADD_SLOT',
          index: aIdx,
          skuId: addItem.skuId,
          title: addItem.title,
          isMto: addItem.isMto,
          fromCrossPool: false,
          productUrl: buildMarketRoute('products/' + addItem.skuId.toLowerCase())
        });
        renderState({ clipId: 'clip_slot_add', bayIndex: aIdx, skuId: addItem.skuId });
        return;
      }

      if (action === 'cross-add') {
        var cSku = btn.getAttribute('data-sku-id');
        var cTitle = btn.getAttribute('data-title') || cSku;
        var cMto = btn.getAttribute('data-mto') === 'true';
        var emptyIdx = state.slots.findIndex(function (s) { return !s || !s.skuId; });
        if (emptyIdx >= 0) {
          state = driver.dispatch(state, {
            type: 'ADD_SLOT',
            index: emptyIdx,
            skuId: cSku,
            title: cTitle,
            isMto: cMto,
            fromCrossPool: true,
            productUrl: buildMarketRoute('products/' + cSku.toLowerCase())
          });
          renderState(state.flow === 'boundary_nudge' ? null : { clipId: 'clip_slot_add', bayIndex: emptyIdx, skuId: cSku });
        } else {
          // Swap into active bay when all 6 bays are full
          var targetBay = state.activeBayIndex >= 0 ? state.activeBayIndex : 5;
          state = driver.dispatch(state, {
            type: 'SWAP_SLOT',
            index: targetBay,
            skuId: cSku,
            title: cTitle,
            isMto: cMto,
            fromCrossPool: true,
            productUrl: buildMarketRoute('products/' + cSku.toLowerCase())
          });
          renderState(state.flow === 'boundary_nudge' ? null : { clipId: 'clip_slot_swap', bayIndex: targetBay, skuId: cSku });
        }
        return;
      }

      if (action === 'primary-commit') {
        if (state.flow === 'timeout_fallback') {
          state = driver.dispatch(state, { type: 'RETRY_FROM_TIMEOUT' });
          renderState();
          return;
        }
        if (state.flow === 'boundary_nudge') {
          state = driver.dispatch(state, { type: 'CLEAR_BOUNDARY' });
          renderState();
          return;
        }

        var prevCommitCount = state.commitCount;
        state = driver.dispatch(state, { type: 'ATTEMPT_COMMIT', lockMs: 2500 });
        renderState();

        // Only schedule commit resolution if this click was NOT blocked as duplicate!
        if (state.commitCount > prevCommitCount) {
          if (commitTimer) clearTimeout(commitTimer);
          var simulateTimeout = root.getAttribute('data-sv-simulate-timeout') === 'true';
          if (simulateTimeout) {
            commitTimer = setTimeout(function () {
              if (state.flow === 'submitting_cart') {
                state = driver.dispatch(state, {
                  type: 'TIMEOUT_FALLBACK',
                  message: 'Connection timed out. Your 6-bay selection is safely preserved.'
                });
                renderState();
              }
            }, 4050);
          } else {
            commitTimer = setTimeout(function () {
              if (state.flow === 'submitting_cart') {
                state = driver.dispatch(state, { type: 'COMMIT_OK' });
                renderState();
              }
            }, 320);
          }
        }
        return;
      }

      if (action === 'cancel-commit') {
        if (commitTimer) { clearTimeout(commitTimer); commitTimer = null; }
        state = driver.dispatch(state, { type: 'CANCEL_COMMIT' });
        renderState();
      }
    });

    // Escape key returns hotspot close-up camera to default 3/4 Tray View (L5 §6.3)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var handle = driver.getStageHandle(canvasEl);
        if (handle) {
          var camState = handle.getCameraState();
          if (camState.preset !== 'tray_view') {
            driver.updateStage(canvasEl, { hotspotId: null, cameraPreset: 'tray_view' });
            root.querySelectorAll('[data-action="focus-hotspot"]').forEach(function (b) {
              b.setAttribute('aria-pressed', 'false');
            });
            var trayBtn = root.querySelector('[data-action="camera-preset"][data-preset="tray_view"]');
            if (trayBtn) trayBtn.setAttribute('aria-pressed', 'true');
          }
        }
      }
    });

    // HTML5 Bidirectional Drag & Drop (reorder bays, drag cross-pool into bay/stage, drag bay out to remove zone)
    bayCards.forEach(function (card, idx) {
      card.addEventListener('dragstart', function (e) {
        if (!state.slots[idx]) { e.preventDefault(); return; }
        draggedBayIndex = idx;
        draggedPoolItem = null;
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', 'bay:' + idx);
        }
      });

      card.addEventListener('dragover', function (e) {
        e.preventDefault();
      });

      card.addEventListener('drop', function (e) {
        e.preventDefault();
        if (draggedBayIndex != null && draggedBayIndex !== idx) {
          state = driver.dispatch(state, { type: 'REORDER_SLOTS', from: draggedBayIndex, to: idx });
          draggedBayIndex = null;
          renderState({ clipId: 'clip_slot_swap', bayIndex: idx, skuId: state.slots[idx] ? state.slots[idx].skuId : '' });
        } else if (draggedPoolItem) {
          var pItem = draggedPoolItem;
          draggedPoolItem = null;
          var intentType = state.slots[idx] ? 'SWAP_SLOT' : 'ADD_SLOT';
          var clipName = state.slots[idx] ? 'clip_slot_swap' : 'clip_slot_add';
          state = driver.dispatch(state, {
            type: intentType,
            index: idx,
            skuId: pItem.skuId,
            title: pItem.title,
            isMto: pItem.isMto,
            fromCrossPool: true
          });
          renderState(state.flow === 'boundary_nudge' ? null : { clipId: clipName, bayIndex: idx, skuId: pItem.skuId });
        }
      });
    });

    root.querySelectorAll('[data-sv-cross-card]').forEach(function (card) {
      card.addEventListener('dragstart', function (e) {
        draggedBayIndex = null;
        draggedPoolItem = {
          skuId: card.getAttribute('data-sku-id'),
          title: (card.querySelector('.sv-bm-cold-card__name') || {}).textContent || card.getAttribute('data-sku-id'),
          isMto: card.getAttribute('data-is-mto') === 'true'
        };
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'copy';
          e.dataTransfer.setData('text/plain', 'pool:' + draggedPoolItem.skuId);
        }
      });
    });

    if (canvasEl) {
      canvasEl.addEventListener('dragover', function (e) { e.preventDefault(); });
      canvasEl.addEventListener('drop', function (e) {
        e.preventDefault();
        if (!draggedPoolItem) return;
        var pItem = draggedPoolItem;
        draggedPoolItem = null;
        var targetIdx = state.slots.findIndex(function (s) { return !s || !s.skuId; });
        var isSwap = targetIdx < 0;
        if (isSwap) targetIdx = state.activeBayIndex >= 0 ? state.activeBayIndex : 0;
        state = driver.dispatch(state, {
          type: isSwap ? 'SWAP_SLOT' : 'ADD_SLOT',
          index: targetIdx,
          skuId: pItem.skuId,
          title: pItem.title,
          isMto: pItem.isMto,
          fromCrossPool: true
        });
        renderState(state.flow === 'boundary_nudge' ? null : {
          clipId: isSwap ? 'clip_slot_swap' : 'clip_slot_add',
          bayIndex: targetIdx,
          skuId: pItem.skuId
        });
      });
    }

    if (dropRemoveEl) {
      dropRemoveEl.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropRemoveEl.setAttribute('data-dragover', 'true');
      });
      dropRemoveEl.addEventListener('dragleave', function () {
        dropRemoveEl.removeAttribute('data-dragover');
      });
      dropRemoveEl.addEventListener('drop', function (e) {
        e.preventDefault();
        dropRemoveEl.removeAttribute('data-dragover');
        if (draggedBayIndex != null) {
          var bIdx = draggedBayIndex;
          draggedBayIndex = null;
          state = driver.dispatch(state, { type: 'REMOVE_SLOT', index: bIdx });
          renderState(state.flow === 'boundary_nudge' ? null : { clipId: 'clip_slot_remove', bayIndex: bIdx });
        }
      });
    }

    // Expose inspection hook on element for deterministic verification
    root._svMotherController = {
      getState: function () { return state; },
      dispatchIntent: function (intent, clipHint) {
        state = driver.dispatch(state, intent);
        renderState(clipHint);
        return state;
      }
    };
  }

  function bootAll() {
    var nodes = document.querySelectorAll('[data-sv-module="sv_flow_bundle_v01"][data-sv-role="mother"]');
    for (var i = 0; i < nodes.length; i++) {
      initBundleMother(nodes[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAll);
  } else {
    bootAll();
  }

  global.SVBundleMother = { init: initBundleMother };
})(window);
