/* Space Vanta · Core Runtime Bus v1.2.0 — window.SpaceVanta
   Stability rules (Antigravity_施工协议_v2.4 §5 & L5@v02 §4.3/§5):
   - Never throws, never redirects/reloads, never blocks first paint.
   - 3000ms fast-fail timeout on all Worker calls; silent fallback on missing endpoints.
   - Supports all 6 kill switches (?sv_kv / ?sv_season / ?sv_3d / ?sv_motion / ?sv_agent / ?sv_mock)
     across both location.search and location.hash.
   - Never guesses market from Accept-Language. */
(function (global) {
  'use strict';

  var SV = (global.SpaceVanta = global.SpaceVanta || {});
  if (SV.core === '1.2.0') return;
  SV.core = '1.2.0';

  function guard(fn, fallback) {
    return function () {
      try {
        return fn.apply(this, arguments);
      } catch (_e) {
        return fallback;
      }
    };
  }

  var store = {
    get: guard(function (k) { return global.localStorage ? global.localStorage.getItem(k) : null; }, null),
    set: guard(function (k, v) { if (global.localStorage) global.localStorage.setItem(k, v); }, undefined),
    del: guard(function (k) { if (global.localStorage) global.localStorage.removeItem(k); }, undefined)
  };

  function emit(name, detail) {
    try {
      global.dispatchEvent(new CustomEvent(name, { detail: detail }));
    } catch (_e) {
      // Silent guard
    }
  }

  SV.ready = function (fn) {
    if (document.readyState !== 'loading') {
      guard(fn)();
    } else {
      document.addEventListener('DOMContentLoaded', guard(fn));
    }
  };

  function parseRuntimeFlags() {
    var flags = Object.create(null);
    try {
      var chunks = [];
      if (global.location && global.location.search) {
        chunks.push(global.location.search.replace(/^\?/, ''));
      }
      if (global.location && global.location.hash) {
        var h = global.location.hash;
        var qIdx = h.indexOf('?');
        if (qIdx !== -1) chunks.push(h.slice(qIdx + 1));
        else if (h.indexOf('=') !== -1) chunks.push(h.replace(/^#/, ''));
      }
      for (var i = 0; i < chunks.length; i++) {
        var sp = new URLSearchParams(chunks[i]);
        sp.forEach(function (val, key) {
          flags[key] = val;
        });
      }
    } catch (_e) {
      // Ignore malformed URLs
    }
    return flags;
  }

  var flags = parseRuntimeFlags();
  var docEl = typeof document !== 'undefined' ? document.documentElement : null;

  /* ---- 6 Global Runtime Kill Switches (L5@v02 §4.3) ---- */
  var SEASON_GATE_KEY = 'sv_season_gate';
  if (flags.sv_season === 'off') {
    store.set(SEASON_GATE_KEY, 'off');
  } else if (flags.sv_season === 'on') {
    store.del(SEASON_GATE_KEY);
  }

  function syncHtmlGates() {
    if (!docEl) return;
    flags = parseRuntimeFlags();
    if (flags.sv_season === 'off') store.set(SEASON_GATE_KEY, 'off');
    else if (flags.sv_season === 'on') store.del(SEASON_GATE_KEY);

    if (store.get(SEASON_GATE_KEY) === 'off' || flags.sv_season === 'off') {
      docEl.setAttribute('data-sv-season', 'off');
    } else if (flags.sv_season === 'on') {
      docEl.setAttribute('data-sv-season', 'on');
    } else {
      docEl.removeAttribute('data-sv-season');
    }

    if (flags.sv_kv === 'off') docEl.setAttribute('data-sv-kv', 'off');
    else docEl.removeAttribute('data-sv-kv');

    if (flags.sv_3d === 'off' || flags.sv_3d === '0') docEl.setAttribute('data-sv-3d', 'off');
    else docEl.removeAttribute('data-sv-3d');

    if (flags.sv_motion === 'off' || flags.sv_motion === '0') docEl.setAttribute('data-sv-motion', 'off');
    else docEl.removeAttribute('data-sv-motion');

    if (flags.sv_agent === 'off' || flags.sv_agent === '0') docEl.setAttribute('data-sv-agent', 'off');
    else docEl.removeAttribute('data-sv-agent');

    // ?sv_mock=1 is stripped in production builds: zero embedded commercial data
    if (flags.sv_mock === '1') docEl.setAttribute('data-sv-mock', 'stripped');
    else docEl.removeAttribute('data-sv-mock');
  }

  syncHtmlGates();
  global.addEventListener('hashchange', guard(syncHtmlGates));

  SV.flags = {
    get: parseRuntimeFlags,
    sync: syncHtmlGates,
    isMotionOff: function () {
      var f = parseRuntimeFlags();
      if (f.sv_motion === 'off' || f.sv_motion === '0') return true;
      if (docEl && docEl.getAttribute('data-sv-motion') === 'off') return true;
      try {
        return Boolean(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
      } catch (_e) {
        return false;
      }
    },
    is3DOff: function () {
      var f = parseRuntimeFlags();
      return f.sv_3d === 'off' || f.sv_3d === '0' || Boolean(docEl && docEl.getAttribute('data-sv-3d') === 'off');
    },
    isAgentOff: function () {
      var f = parseRuntimeFlags();
      return f.sv_agent === 'off' || f.sv_agent === '0' || Boolean(docEl && docEl.getAttribute('data-sv-agent') === 'off');
    },
    isKvOff: function () {
      var f = parseRuntimeFlags();
      return f.sv_kv === 'off' || Boolean(docEl && docEl.getAttribute('data-sv-kv') === 'off');
    },
    isSeasonOff: function () {
      return store.get(SEASON_GATE_KEY) === 'off' || Boolean(docEl && docEl.getAttribute('data-sv-season') === 'off');
    }
  };

  /* ---- Config from <div data-sv-dna> ---- */
  var host = typeof document !== 'undefined' ? document.querySelector('[data-sv-dna]') : null;
  var ds = (host && host.dataset) || {};
  var cfg = (SV.config = SV.config || {
    endpoints: {
      market: ds.endpointMarket || '',
      shipping: ds.endpointShipping || '',
      bundle: ds.endpointBundle || '',
      mto: ds.endpointMto || '',
      pricing: ds.endpointPricing || '',
      season: ds.endpointSeason || ''
    },
    modelsBase: ds.modelsBase || '',
    defaultMarket: (ds.defaultMarket || 'en-us').toLowerCase(),
    storeCountry: (ds.country || '').toUpperCase(),
    locale: ds.locale || 'en',
    pageType: ds.pageType || '',
    seasonEnabled: ds.seasonEnabled !== 'false',
    timeout: 3000
  });

  /* ---- Market resolution strictly from URL /{market}/ prefix (NEVER Accept-Language) ---- */
  var MARKETS = {
    'en-us': { key: 'us', slug: 'en-us', country: 'US' },
    'en-gb': { key: 'gb', slug: 'en-gb', country: 'GB' },
    'en-au': { key: 'au', slug: 'en-au', country: 'AU' },
    'en-ca': { key: 'ca', slug: 'en-ca', country: 'CA' },
    'en-sg': { key: 'sg', slug: 'en-sg', country: 'SG' },
    'en-hk': { key: 'hk', slug: 'en-hk', country: 'HK' }
  };

  function parseUrlMarketSlug() {
    try {
      var p = (global.location && global.location.pathname) || '';
      var m = /^\/(en-(?:us|gb|au|ca|sg|hk))(?=\/|$)/i.exec(p);
      return m ? m[1].toLowerCase() : '';
    } catch (_e) {
      return '';
    }
  }

  var marketState = null;
  function computeMarket() {
    var slug = parseUrlMarketSlug();
    var fallbackSlug = MARKETS[cfg.defaultMarket] ? cfg.defaultMarket : 'en-us';
    var activeSlug = slug || fallbackSlug;
    var info = MARKETS[activeSlug] || MARKETS['en-us'];
    var country = cfg.storeCountry || info.country;
    return {
      key: info.key,
      slug: info.slug,
      code: info.slug,
      country: country,
      hasUrlPrefix: Boolean(slug)
    };
  }

  SV.market = {
    list: function () { return Object.keys(MARKETS); },
    get: function () {
      if (!marketState) marketState = computeMarket();
      return {
        key: marketState.key,
        slug: marketState.slug,
        code: marketState.code,
        country: marketState.country,
        hasUrlPrefix: marketState.hasUrlPrefix
      };
    },
    buildPath: function (subPath) {
      var m = SV.market.get();
      var clean = String(subPath || '').replace(/^\/+/, '');
      return '/' + m.slug + '/' + clean;
    },
    refresh: function () {
      var next = computeMarket();
      if (!marketState || next.slug !== marketState.slug || next.country !== marketState.country) {
        marketState = next;
        emit('sv:market', SV.market.get());
      }
      return SV.market.get();
    }
  };

  /* ---- Season read-only bus ---- */
  var seasonState = { id: '', skin: '', on: false, orderByLabel: '' };
  SV.season = {
    gateOff: function () { return SV.flags.isSeasonOff() || !cfg.seasonEnabled; },
    get: function () {
      return {
        id: seasonState.id,
        skin: seasonState.skin,
        on: Boolean(seasonState.on) && !SV.season.gateOff(),
        orderByLabel: seasonState.orderByLabel
      };
    },
    set: function (d) {
      d = d || {};
      seasonState = {
        id: String(d.id || ''),
        skin: String(d.skin || ''),
        on: Boolean(d.on || d.enabled),
        orderByLabel: String(d.orderByLabel || d.order_by || '')
      };
      emit('sv:season', SV.season.get());
    }
  };

  /* ---- API helper via logical contract keys (3000ms fast-fail, never throws) ---- */
  var cache = Object.create(null);
  function qs(params) {
    var out = [];
    Object.keys(params || {}).forEach(function (k) {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        out.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
      }
    });
    return out.length ? '?' + out.join('&') : '';
  }

  SV.api = {
    url: function (key, path, params) {
      var base = ((cfg.endpoints && cfg.endpoints[key]) || '').replace(/\/+$/, '');
      if (!base) return '';
      var merged = Object.assign({}, params || {});
      if (SV.flags.isKvOff()) merged.sv_kv = 'off';
      return base + '/' + String(path || '').replace(/^\/+/, '') + qs(merged);
    },
    get: function (key, path, params, opts) {
      opts = opts || {};
      var url = SV.api.url(key, path, params);
      if (!url || typeof fetch !== 'function') return Promise.resolve(null);
      var ttl = opts.ttl === undefined ? 60000 : opts.ttl;
      var hit = cache[url];
      if (hit && Date.now() - hit.t < ttl) return Promise.resolve(hit.d);
      var ctl = typeof AbortController === 'function' ? new AbortController() : null;
      var timer = global.setTimeout(function () { if (ctl) ctl.abort(); }, opts.timeout || cfg.timeout || 3000);
      return fetch(url, { method: 'GET', credentials: 'omit', signal: ctl ? ctl.signal : undefined })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          global.clearTimeout(timer);
          if (d) cache[url] = { t: Date.now(), d: d };
          return d || null;
        })
        .catch(function () {
          global.clearTimeout(timer);
          return null;
        });
    },
    request: function (method, key, path, body, opts) {
      opts = opts || {};
      var url = SV.api.url(key, path, opts.params);
      if (!url || typeof fetch !== 'function') {
        return Promise.resolve({ ok: false, status: 0, reason: 'endpoint_unconfigured', data: null });
      }
      var ctl = typeof AbortController === 'function' ? new AbortController() : null;
      var timer = global.setTimeout(function () { if (ctl) ctl.abort(); }, opts.timeout || cfg.timeout || 3000);
      var headers = Object.assign({ 'Accept': 'application/json' }, opts.headers || {});
      if (opts.idempotencyKey) {
        headers['Idempotency-Key'] = String(opts.idempotencyKey);
      }
      var fetchInit = {
        method: method || 'GET',
        credentials: 'omit',
        headers: headers,
        signal: ctl ? ctl.signal : undefined
      };
      if (body !== undefined && body !== null && method !== 'GET') {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        fetchInit.body = typeof body === 'string' ? body : JSON.stringify(body);
      }
      return fetch(url, fetchInit)
        .then(function (r) {
          return r.text().then(function (txt) {
            var parsed = null;
            if (txt) {
              try { parsed = JSON.parse(txt); } catch (_e) { parsed = null; }
            }
            return {
              ok: r.ok,
              status: r.status,
              reason: r.ok ? '' : ('http_' + r.status),
              data: parsed
            };
          });
        })
        .then(function (res) {
          global.clearTimeout(timer);
          return res;
        })
        .catch(function (err) {
          global.clearTimeout(timer);
          var isAbort = Boolean(err && (err.name === 'AbortError' || String(err.message || '').indexOf('abort') !== -1));
          return {
            ok: false,
            status: 0,
            reason: isAbort ? 'timeout' : 'network_error',
            data: null
          };
        });
    },
    post: function (key, path, body, opts) {
      return SV.api.request('POST', key, path, body, opts);
    }
  };

  /* ---- Slot Hydration ---- */
  function hydrateSlot(el) {
    var key = el.getAttribute('data-sv-endpoint-key');
    var path = el.getAttribute('data-sv-path');
    if (!key || !path || !SV.api.url(key, path)) {
      el.setAttribute('data-sv-state', 'slot_idle');
      return;
    }
    el.setAttribute('data-sv-state', 'slot_fetching');
    var m = SV.market.get();
    SV.api.get(key, path, { market: m.slug, country: m.country }).then(function (data) {
      el.setAttribute('data-sv-state', data ? 'slot_ready' : 'slot_degraded');
      if (data) {
        try {
          el.dispatchEvent(new CustomEvent('sv:data', {
            bubbles: true,
            detail: { kind: el.getAttribute('data-sv-slot'), key: key, path: path, data: data }
          }));
        } catch (_e) {}
      }
    });
  }

  SV.slots = { refresh: guard(hydrateSlot) };

  SV.ready(function () {
    syncHtmlGates();
    SV.market.get();
    var els = document.querySelectorAll('[data-sv-slot][data-sv-endpoint-key]');
    Array.prototype.forEach.call(els, guard(hydrateSlot));
  });
})(window);
