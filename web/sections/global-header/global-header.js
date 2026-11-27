/**
 * SpaceVanta Global Header Runtime (L5@v01 · sv_flow_global_header_v01)
 *
 * Strict protocol boundaries (Antigravity_施工协议_v2.1 §5 & L5@v01 §5):
 * - NEVER reads shipping cookies directly.
 * - NEVER constructs backend Worker URLs.
 * - Consumes ONLY `window.SpaceVanta` (`market / season / api / slots`) and
 *   events `sv:data`, `sv:market`, `sv:season`.
 * - 12 explicit state names (zero blacklisted loading/error/success/processing).
 * - 3000ms fast-fail silent degradation; 2.5s idempotent lock on DEFERRED routes.
 * - Never throws, never refreshes, never blocks first paint.
 */
(function (global) {
  'use strict';

  var TIMEOUT_MS = 3000;
  var IDEMPOTENT_MS = 2500;
  var SEASON_PREF_KEY = 'sv_ui_season_pref';

  var MARKET_META = {
    'en-us': { code: 'US', currencySymbol: '$' },
    'en-gb': { code: 'GB', currencySymbol: '£' },
    'en-au': { code: 'AU', currencySymbol: 'A$' },
    'en-ca': { code: 'CA', currencySymbol: 'C$' },
    'en-sg': { code: 'SG', currencySymbol: 'S$' },
    'en-hk': { code: 'HK', currencySymbol: 'HK$' }
  };

  function parseFlags() {
    var flags = Object.create(null);
    try {
      var sources = [];
      if (global.location && global.location.search) {
        sources.push(global.location.search.replace(/^\?/, ''));
      }
      if (global.location && global.location.hash) {
        var hash = global.location.hash;
        var qIdx = hash.indexOf('?');
        if (qIdx !== -1) {
          sources.push(hash.slice(qIdx + 1));
        } else if (hash.indexOf('=') !== -1) {
          sources.push(hash.replace(/^#/, ''));
        }
      }
      for (var i = 0; i < sources.length; i++) {
        var params = new URLSearchParams(sources[i]);
        params.forEach(function (val, key) {
          flags[key] = val;
        });
      }
    } catch (_e) {
      // Never throw on malformed URLs
    }
    return flags;
  }

  function safeReadPref(key) {
    try {
      return global.sessionStorage ? global.sessionStorage.getItem(key) : null;
    } catch (_e) {
      return null;
    }
  }

  function safeWritePref(key, val) {
    try {
      if (!global.sessionStorage) return;
      if (val === null) {
        global.sessionStorage.removeItem(key);
      } else {
        global.sessionStorage.setItem(key, val);
      }
    } catch (_e) {
      // Ignore storage restrictions
    }
  }

  function emitTelemetry(eventName, detail) {
    try {
      global.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
    } catch (_e) {
      // Silent fail
    }
  }

  function detectRouteMarket(defaultMarket) {
    try {
      var m = (global.location && global.location.pathname || '').match(/^\/([a-z]{2}-[a-z]{2})(\/|$)/i);
      if (m && m[1]) return m[1].toLowerCase();
    } catch (_e) {
      // Fallback
    }
    return (defaultMarket || 'en-us').toLowerCase();
  }

  function initGlobalHeader(headerEl) {
    if (!headerEl || headerEl.getAttribute('data-sv-js-ready') === 'true') return;

    try {
      var flags = parseFlags();
      var docEl = document.documentElement;

      // Global runtime switches (search + hash)
      var seasonOff = false;
      if (flags.sv_season === 'off') {
        safeWritePref(SEASON_PREF_KEY, 'off');
        seasonOff = true;
      } else if (flags.sv_season === 'on') {
        safeWritePref(SEASON_PREF_KEY, null);
        seasonOff = false;
      } else if (safeReadPref(SEASON_PREF_KEY) === 'off') {
        seasonOff = true;
      }
      if (headerEl.getAttribute('data-sv-season-allow') === 'false') {
        seasonOff = true;
      }
      if (seasonOff) {
        docEl.setAttribute('data-sv-season', 'off');
      } else {
        docEl.removeAttribute('data-sv-season');
      }

      if (flags.sv_motion === 'off') {
        docEl.setAttribute('data-sv-motion', 'off');
      }
      if (flags.sv_agent === 'off') {
        docEl.setAttribute('data-sv-agent', 'off');
      }
      if (flags.sv_kv === 'off') {
        docEl.setAttribute('data-sv-kv', 'off');
      }
      if (flags.sv_3d === 'off') {
        docEl.setAttribute('data-sv-3d', 'off');
      }

      // State management (12 explicit states only)
      var activeMarket = detectRouteMarket(headerEl.getAttribute('data-sv-market-default'));
      var activeLang = 'en';
      var activeCurrency = (MARKET_META[activeMarket] && MARKET_META[activeMarket].currencySymbol) ||
        headerEl.getAttribute('data-sv-currency-default') || '$';
      var currentState = seasonOff ? 'season_off' : 'header_idle_top';
      var fulfillmentReceived = false;
      var marketListAvailable = true;
      var suggestAvailable = true;
      var lastRouteTs = Object.create(null);
      var toastTimer = null;

      function setState(nextState) {
        currentState = nextState;
        headerEl.setAttribute('data-sv-state', nextState);
      }

      // DOM refs
      var announceBar = headerEl.querySelector('[data-sv-slot="announcement-bar"]');
      var dutyEl = headerEl.querySelector('[data-sv-field="duty"]');
      var leadtimeEl = headerEl.querySelector('[data-sv-field="leadtime"]');
      var thresholdEl = headerEl.querySelector('[data-sv-field="threshold"]');
      var orderByEl = headerEl.querySelector('[data-sv-field="orderBy"]');
      var seasonSepEl = headerEl.querySelector('[data-sv-season-sep]');
      var seasonIconSlot = headerEl.querySelector('[data-sv-season-icon-slot]');
      var railR01 = headerEl.querySelector('[data-sv-rail="R-01"]');
      var railR02 = headerEl.querySelector('[data-sv-rail="R-02"]');
      var marketCodeEl = headerEl.querySelector('[data-sv-market-code]');
      var marketCurrEl = headerEl.querySelector('[data-sv-market-currency]');
      var cartCountEl = headerEl.querySelector('[data-sv-cart-count]');
      var toastEl = headerEl.querySelector('[data-sv-toast]');

      var shopPanel = headerEl.querySelector('#sv-hdr-shop-panel');
      var menuDrawer = headerEl.querySelector('#sv-hdr-menu-drawer');
      var searchOverlay = headerEl.querySelector('#sv-hdr-search-overlay');
      var marketDrawer = headerEl.querySelector('#sv-hdr-market-drawer');

      // Mount overlays into body-level RootModalPortal
      var portal = global.SVRootPortal && global.SVRootPortal.create({
        onOpen: function (slotId) {
          updateTriggerExpanded(slotId);
          var stateMap = {
            shop: 'shop_panel_open',
            menu: 'menu_drawer_open',
            search: suggestAvailable ? 'search_overlay_open' : 'search_suggest_degraded',
            market: marketListAvailable ? 'market_drawer_open' : 'market_config_degraded'
          };
          setState(stateMap[slotId] || 'header_idle_top');
          emitTelemetry('sv.header.overlay_opened', {
            market: activeMarket,
            slot: slotId
          });
        },
        onClose: function () {
          updateTriggerExpanded(null);
          syncScrollState();
        }
      });

      if (portal) {
        if (shopPanel) portal.registerSlot('shop', shopPanel);
        if (menuDrawer) portal.registerSlot('menu', menuDrawer);
        if (searchOverlay) portal.registerSlot('search', searchOverlay);
        if (marketDrawer) portal.registerSlot('market', marketDrawer);
      }

      function updateTriggerExpanded(openSlot) {
        var btns = headerEl.querySelectorAll('[data-sv-trigger]');
        for (var i = 0; i < btns.length; i++) {
          var s = btns[i].getAttribute('data-sv-trigger');
          btns[i].setAttribute('aria-expanded', s === openSlot ? 'true' : 'false');
        }
      }

      function showToast(msg) {
        if (!toastEl || !msg) return;
        toastEl.textContent = msg;
        toastEl.removeAttribute('hidden');
        if (toastTimer) global.clearTimeout(toastTimer);
        toastTimer = global.setTimeout(function () {
          toastEl.setAttribute('hidden', '');
        }, IDEMPOTENT_MS);
      }

      // Sync sticky scrolled seam (R-02)
      function syncScrollState() {
        var scrolled = (global.scrollY || global.pageYOffset || 0) > 0;
        if (railR02) {
          railR02.classList.toggle('sv-seam-rail--active', scrolled);
        }
        if (!portal || !portal.getActiveSlot()) {
          if (scrolled) {
            setState('header_sticky_scrolled');
          } else {
            setState(seasonOff ? 'season_off' : 'header_idle_top');
          }
        }
      }

      global.addEventListener('scroll', syncScrollState, { passive: true });
      syncScrollState();

      // Update market UI
      function renderMarket(codeSlug, currencySymbol, lang) {
        if (codeSlug) activeMarket = String(codeSlug).toLowerCase();
        var meta = MARKET_META[activeMarket] || {
          code: activeMarket.split('-').pop().toUpperCase(),
          currencySymbol: currencySymbol || activeCurrency
        };
        activeCurrency = currencySymbol || meta.currencySymbol;
        if (lang) activeLang = lang;

        if (marketCodeEl) marketCodeEl.textContent = meta.code;
        if (marketCurrEl) marketCurrEl.textContent = activeCurrency;

        var summaryText = meta.code + ' · ' + activeCurrency;
        var summaries = document.querySelectorAll('[data-sv-market-summary], [data-sv-market-readonly]');
        for (var i = 0; i < summaries.length; i++) {
          summaries[i].textContent = summaryText;
        }
        var mSel = document.querySelector('[data-sv-market-select]');
        if (mSel && MARKET_META[activeMarket]) {
          mSel.value = activeMarket;
        }
        var lSel = document.querySelector('[data-sv-lang-select]');
        if (lSel && activeLang) {
          lSel.value = activeLang;
        }
      }

      renderMarket(activeMarket, activeCurrency, activeLang);

      // Update announcement bar strictly from sv:data (0 hardcoded fallback numbers; null 0px on missing/timeout)
      function renderAnnouncement(data) {
        if (!announceBar) return;
        if (headerEl.getAttribute('data-sv-announcement-enabled') === 'false') {
          announceBar.setAttribute('hidden', '');
          return;
        }
        var duty = data && data.shipping && data.shipping.dutyLabel;
        var lead = data && data.shipping && data.shipping.leadtimeLabel;
        var thresh = data && data.bundle && data.bundle.thresholdLabel;

        if (!duty || !lead || !thresh) {
          announceBar.setAttribute('hidden', '');
          setState('announcement_timeout_hidden');
          emitTelemetry('sv.header.degraded', {
            market: activeMarket,
            reason: 'config_missing'
          });
          return;
        }

        fulfillmentReceived = true;
        if (dutyEl) dutyEl.textContent = String(duty);
        if (leadtimeEl) leadtimeEl.textContent = String(lead);
        if (thresholdEl) thresholdEl.textContent = String(thresh);
        announceBar.removeAttribute('hidden');
      }

      function renderSeason(season) {
        if (seasonOff || !season || !season.enabled || !season.reviewed) {
          if (orderByEl) {
            orderByEl.textContent = '';
            orderByEl.setAttribute('hidden', '');
          }
          if (seasonSepEl) seasonSepEl.setAttribute('hidden', '');
          if (seasonIconSlot) seasonIconSlot.setAttribute('hidden', '');
          if (railR01) railR01.classList.remove('sv-seam-rail--active');
          if (seasonOff) {
            emitTelemetry('sv.header.degraded', {
              market: activeMarket,
              reason: 'season_off'
            });
          }
          return;
        }

        if (season.orderByLabel && orderByEl) {
          orderByEl.textContent = String(season.orderByLabel);
          orderByEl.removeAttribute('hidden');
          if (seasonSepEl) seasonSepEl.removeAttribute('hidden');
        }
        if (seasonIconSlot) seasonIconSlot.removeAttribute('hidden');
        if (railR01) railR01.classList.add('sv-seam-rail--active');
      }

      // 3-second fast-fail timeout for fulfillment announcement
      var announceTimeout = global.setTimeout(function () {
        if (!fulfillmentReceived && announceBar) {
          announceBar.setAttribute('hidden', '');
          if (!portal || !portal.getActiveSlot()) {
            setState('announcement_timeout_hidden');
          }
          emitTelemetry('sv.header.degraded', {
            market: activeMarket,
            reason: 'timeout_3s'
          });
        }
      }, TIMEOUT_MS);

      // Listen to SpaceVanta bus events (read-only consumption; zero direct Worker fetch)
      global.addEventListener('sv:data', function (e) {
        var detail = e && e.detail ? e.detail : null;
        if (detail && detail.timeout) {
          fulfillmentReceived = false;
          if (announceBar) announceBar.setAttribute('hidden', '');
          setState('announcement_timeout_hidden');
          emitTelemetry('sv.header.degraded', { market: activeMarket, reason: 'timeout_3s' });
          return;
        }
        global.clearTimeout(announceTimeout);
        renderAnnouncement(detail);
        if (detail && detail.marketsUnavailable) {
          setMarketDegraded(true);
        }
        if (detail && detail.suggestUnavailable) {
          setSearchDegraded(true);
        }
      });

      global.addEventListener('sv:market', function (e) {
        var detail = e && e.detail ? e.detail : null;
        if (!detail) return;
        renderMarket(detail.code || detail.market, detail.currencySymbol, detail.lang);
      });

      global.addEventListener('sv:season', function (e) {
        var detail = e && e.detail ? e.detail : null;
        renderSeason(detail);
      });

      // Hydrate if window.SpaceVanta already holds state
      if (global.SpaceVanta) {
        var sv = global.SpaceVanta;
        if (sv.market && (sv.market.code || sv.market.market)) {
          renderMarket(sv.market.code || sv.market.market, sv.market.currencySymbol, sv.market.lang);
        }
        if (sv.slots && typeof sv.slots.cartCount !== 'undefined' && cartCountEl) {
          cartCountEl.textContent = String(sv.slots.cartCount);
        }
        if (sv.data) {
          global.clearTimeout(announceTimeout);
          renderAnnouncement(sv.data);
        }
        if (sv.season) {
          renderSeason(sv.season);
        }
      }

      // Market degraded helper (L3)
      function setMarketDegraded(isDegraded) {
        marketListAvailable = !isDegraded;
        var form = document.querySelector('[data-sv-market-form]');
        var deg = document.querySelector('[data-sv-market-degraded]');
        if (form) form.hidden = isDegraded;
        if (deg) deg.hidden = !isDegraded;
        if (isDegraded && portal && portal.getActiveSlot() === 'market') {
          setState('market_config_degraded');
        }
      }

      // Search suggest degraded helper (L3)
      function setSearchDegraded(isDegraded) {
        suggestAvailable = !isDegraded;
        var list = document.querySelector('[data-sv-suggest-list]');
        var hint = document.querySelector('[data-sv-search-hint]');
        if (list) list.hidden = true;
        if (hint) {
          if (isDegraded) {
            hint.textContent = 'Live suggestions are unavailable. Press Enter to search directly.';
            hint.hidden = false;
          } else {
            hint.hidden = true;
          }
        }
        if (isDegraded && portal && portal.getActiveSlot() === 'search') {
          setState('search_suggest_degraded');
        }
      }

      // L4 Empty menu / group graceful degradation
      var catList = document.querySelector('[data-sv-cat-list]');
      if (catList && catList.children.length === 0) {
        var fallbackLi = document.createElement('li');
        var fallbackA = document.createElement('a');
        fallbackA.className = 'sv-hdr-link sv-hdr-link--strong';
        fallbackA.href = '#tbd';
        fallbackA.setAttribute('data-sv-route-key', 'ROUTE_CAT_ALL');
        fallbackA.setAttribute('data-sv-deferred', 'true');
        fallbackA.textContent = 'All Products';
        fallbackLi.appendChild(fallbackA);
        catList.appendChild(fallbackLi);
      }
      var navGroups = document.querySelectorAll('[data-sv-nav-group]');
      for (var g = 0; g < navGroups.length; g++) {
        var links = navGroups[g].querySelectorAll('a');
        if (links.length === 0) {
          navGroups[g].setAttribute('hidden', '');
        }
      }

      // Cold scene card image error -> dashed silhouette placeholder
      var sceneImg = document.querySelector('.sv-hdr-scene-card__img');
      if (sceneImg) {
        sceneImg.addEventListener('error', function () {
          sceneImg.hidden = true;
          var media = sceneImg.closest('[data-sv-scene-media]');
          if (media) media.classList.add('sv-hdr-scene-card__media--silhouette');
        });
      }

      // Overlay triggers (A1..A4)
      headerEl.addEventListener('click', function (e) {
        var trigger = e.target && e.target.closest ? e.target.closest('[data-sv-trigger]') : null;
        if (!trigger || !portal) return;
        e.preventDefault();
        var slot = trigger.getAttribute('data-sv-trigger');
        if (portal.getActiveSlot() === slot) {
          portal.close('toggle');
        } else {
          portal.open(slot, trigger);
        }
      });

      // Mutual-exclusion chain: Menu (P2) -> Change Market (P4), preserving origin anchor on Esc
      document.addEventListener('click', function (e) {
        var switchBtn = e.target && e.target.closest ? e.target.closest('[data-sv-switch-to-market]') : null;
        if (switchBtn && portal) {
          e.preventDefault();
          portal.open('market', null, { preserveReturnFocus: true });
          return;
        }

        // DEFERRED external routes: 2.5s idempotent lock + /{market}/ context pass-through
        var routeLink = e.target && e.target.closest ? e.target.closest('[data-sv-deferred="true"]') : null;
        if (!routeLink) return;
        e.preventDefault();
        var routeKey = routeLink.getAttribute('data-sv-route-key') || 'ROUTE_UNKNOWN';
        var now = Date.now();
        var last = lastRouteTs[routeKey] || 0;
        var blocked = (now - last) < IDEMPOTENT_MS;

        if (!blocked) {
          lastRouteTs[routeKey] = now;
        }

        setState('deferred_route_handoff');
        emitTelemetry('sv.header.nav_intent', {
          market: activeMarket,
          routeKey: routeKey,
          prefixedPath: '/' + activeMarket + '/' + routeKey.toLowerCase(),
          idempotentBlocked: blocked
        });
        showToast(
          blocked
            ? 'Already triggered — ignoring duplicate click.'
            : '/' + activeMarket + '/ · ' + routeKey + ' queued.'
        );
      });

      // Market form submit: dispatch sv:market non-blocking
      var marketForm = document.querySelector('[data-sv-market-form]');
      if (marketForm) {
        marketForm.addEventListener('submit', function (e) {
          e.preventDefault();
          var mSel = marketForm.querySelector('[data-sv-market-select]');
          var lSel = marketForm.querySelector('[data-sv-lang-select]');
          var nextMarket = mSel ? mSel.value : activeMarket;
          var nextLang = lSel ? lSel.value : activeLang;
          var fromMarket = activeMarket;
          var meta = MARKET_META[nextMarket] || { code: nextMarket.toUpperCase(), currencySymbol: '$' };

          setState('market_switching');
          renderMarket(nextMarket, meta.currencySymbol, nextLang);

          global.dispatchEvent(new CustomEvent('sv:market', {
            detail: {
              code: nextMarket,
              currencySymbol: meta.currencySymbol,
              lang: nextLang
            }
          }));

          emitTelemetry('sv.header.market_switched', {
            fromMarket: fromMarket,
            toMarket: nextMarket,
            lang: nextLang
          });

          if (portal) portal.close('market_applied');
        });
      }

      // Search form submit: empty keyword inline hint (no navigation), non-empty dispatches intent
      var searchForm = document.querySelector('[data-sv-search-form]');
      if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
          var input = searchForm.querySelector('[data-sv-search-input]');
          var hint = document.querySelector('[data-sv-search-hint]');
          var q = input ? input.value.trim() : '';
          if (!q) {
            e.preventDefault();
            if (hint) {
              hint.textContent = 'Enter a keyword or select a category below.';
              hint.hidden = false;
            }
            if (input) input.focus();
            return;
          }
          // In L5@v01 ROUTE_SEARCH is DEFERRED
          e.preventDefault();
          setState('deferred_route_handoff');
          emitTelemetry('sv.header.nav_intent', {
            market: activeMarket,
            routeKey: 'ROUTE_SEARCH',
            idempotentBlocked: false
          });
          showToast('/' + activeMarket + '/ · ROUTE_SEARCH queued.');
        });
      }

      headerEl.setAttribute('data-sv-js-ready', 'true');
    } catch (_err) {
      // L5@v01 stability rule: never throw, never block first paint
    }
  }

  function boot() {
    var headers = document.querySelectorAll('[data-sv-section="global-header"]');
    for (var i = 0; i < headers.length; i++) {
      initGlobalHeader(headers[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.SVGlobalHeader = {
    init: initGlobalHeader
  };
})(window);
