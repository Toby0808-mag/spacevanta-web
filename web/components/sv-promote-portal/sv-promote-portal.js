/**
 * SpaceVanta Root-Level PromoteOverlayPortal Runtime (L5@v02 §2.2 / §4.2 / §7.7 / V-07 / V-08)
 * - Strictly appends #sv-promote-portal as direct child of document.body (outside clip-path/3D ancestors).
 * - Orchestrates S0_COLD_IDLE -> S1_PROMOTE_ARM (<=80ms) -> S2_CROSSFADE (240ms / 0ms) ->
 *   S3_HOT_LIVE_PREVIEW (read-only 3D preview reusing persistent Hot Canvas) ->
 *   S4_DEMOTE (120ms, Esc restores focus to exact Cold card trigger, NEVER document.body) ->
 *   S5_COLD_PARK (60s idle explicit 3-part dispose(), geometries back to baseline +-2).
 * - Screen-reader polite 3-stage announcements (S1 loading, S3 ready, V-P5 poster fallback; silent on close).
 */
(function (global) {
  'use strict';

  var singleton = null;

  function isMotionOff() {
    if (global.SpaceVanta && global.SpaceVanta.flags && global.SpaceVanta.flags.isMotionOff()) return true;
    if (document.documentElement && document.documentElement.getAttribute('data-sv-motion') === 'off') return true;
    try {
      return Boolean(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (_e) {
      return false;
    }
  }

  function createPortalSingleton() {
    if (singleton) return singleton;

    var host = document.getElementById('sv-promote-portal');
    if (!host) {
      host = document.createElement('div');
      host.id = 'sv-promote-portal';
      host.className = 'sv-promote-portal';
      host.setAttribute('hidden', '');
      host.setAttribute('data-promote-state', 'S0_COLD_IDLE');

      var backdrop = document.createElement('div');
      backdrop.className = 'sv-promote-portal__backdrop';
      backdrop.setAttribute('data-action', 'promote-close');
      backdrop.setAttribute('aria-hidden', 'true');
      host.appendChild(backdrop);

      var dialog = document.createElement('div');
      dialog.className = 'sv-promote-portal__dialog';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-labelledby', 'sv-promote-portal-title');

      var head = document.createElement('div');
      head.className = 'sv-promote-portal__head';

      var title = document.createElement('h2');
      title.id = 'sv-promote-portal-title';
      title.className = 'sv-promote-portal__title';
      title.textContent = '3D Tray Preview (Read-Only)';
      head.appendChild(title);

      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'sv-promote-portal__close';
      closeBtn.setAttribute('data-action', 'promote-close');
      closeBtn.setAttribute('aria-label', 'Close 3D preview and return to card');
      closeBtn.textContent = 'Close (Esc)';
      head.appendChild(closeBtn);
      dialog.appendChild(head);

      // Mandatory <Seam aura="true"/> under deep-metal gunmetal header
      var seamAura = document.createElement('span');
      seamAura.className = 'sv-seam-aura-bar';
      seamAura.setAttribute('data-sv-seam-aura', 'true');
      seamAura.setAttribute('aria-hidden', 'true');
      dialog.appendChild(seamAura);

      var srLive = document.createElement('div');
      srLive.className = 'svd-visually-hidden';
      srLive.setAttribute('role', 'status');
      srLive.setAttribute('aria-live', 'polite');
      srLive.setAttribute('data-sv-promote-sr', '');
      dialog.appendChild(srLive);

      var stageWrap = document.createElement('div');
      stageWrap.className = 'sv-promote-portal__stage-wrap';
      stageWrap.setAttribute('tabindex', '-1');
      stageWrap.setAttribute('data-sv-promote-stage-wrap', '');

      var canvas = document.createElement('canvas');
      canvas.className = 'sv-promote-portal__canvas';
      canvas.setAttribute('data-sv-promote-canvas', '');
      stageWrap.appendChild(canvas);

      var vp5Box = document.createElement('div');
      vp5Box.className = 'sv-promote-portal__vp5';
      vp5Box.setAttribute('hidden', '');
      vp5Box.setAttribute('data-sv-promote-vp5', '');

      var vp5Img = document.createElement('img');
      vp5Img.className = 'sv-promote-portal__vp5-img';
      vp5Img.alt = 'SpaceVanta 6-bay planar bundle poster';
      vp5Box.appendChild(vp5Img);

      var vp5Caption = document.createElement('p');
      vp5Caption.textContent = '3D model unavailable on current connection — showing high-clarity 2D planar view.';
      vp5Box.appendChild(vp5Caption);

      var vp5Link = document.createElement('a');
      vp5Link.className = 'svd-btn';
      vp5Link.target = '_blank';
      vp5Link.rel = 'noopener';
      vp5Link.setAttribute('data-sv-vp5-full-link', '');
      vp5Link.textContent = 'View Full Poster';
      vp5Box.appendChild(vp5Link);

      stageWrap.appendChild(vp5Box);
      dialog.appendChild(stageWrap);

      var controls = document.createElement('div');
      controls.className = 'sv-promote-portal__controls';

      var btnGroup = document.createElement('div');
      btnGroup.className = 'sv-promote-portal__btn-group';

      var presets = [
        { id: 'tray_view', label: '3/4 Tray View' },
        { id: 'HS_BAY_GRID', label: '6-Bay Grid (HS_BAY_GRID)' },
        { id: 'HS_SV_CREST', label: 'SV Crest (HS_SV_CREST)' },
        { id: 'lid_toggle', label: 'Open / Close Lid' }
      ];
      presets.forEach(function (pr, idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'sv-promote-portal__ctrl-btn';
        b.setAttribute('data-action', 'promote-stage-cmd');
        b.setAttribute('data-cmd', pr.id);
        b.setAttribute('aria-pressed', idx === 0 ? 'true' : 'false');
        b.textContent = pr.label;
        btnGroup.appendChild(b);
      });
      controls.appendChild(btnGroup);

      var customizeLink = document.createElement('a');
      customizeLink.className = 'svd-btn';
      customizeLink.setAttribute('data-sv-promote-mother-link', '');
      customizeLink.textContent = 'Customize on Bundle Page ↗';
      controls.appendChild(customizeLink);

      dialog.appendChild(controls);
      host.appendChild(dialog);
      document.body.appendChild(host);
    } else if (host.parentElement !== document.body) {
      document.body.appendChild(host);
    }

    var state = 'S0_COLD_IDLE';
    var returnFocusEl = null;
    var activeCardEl = null;
    var inertSiblings = [];
    var parkTimer = null;
    var crossfadeTimer = null;
    var demoteTimer = null;

    var titleEl = host.querySelector('#sv-promote-portal-title');
    var srEl = host.querySelector('[data-sv-promote-sr]');
    var stageWrapEl = host.querySelector('[data-sv-promote-stage-wrap]');
    var canvasEl = host.querySelector('[data-sv-promote-canvas]');
    var vp5El = host.querySelector('[data-sv-promote-vp5]');
    var vp5ImgEl = vp5El.querySelector('img');
    var vp5FullLink = host.querySelector('[data-sv-vp5-full-link]');
    var motherLinkEl = host.querySelector('[data-sv-promote-mother-link]');

    function setPromoteState(next) {
      state = next;
      host.setAttribute('data-promote-state', next);
      if (activeCardEl) {
        activeCardEl.setAttribute('data-sv-promote-state', next);
      }
    }

    function announceSr(text) {
      if (!srEl) return;
      srEl.textContent = text || '';
    }

    function setBackgroundInert(enable) {
      if (enable) {
        inertSiblings = [];
        Array.prototype.forEach.call(document.body.children, function (el) {
          if (el === host || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
          if (!el.hasAttribute('inert')) {
            el.setAttribute('inert', '');
            inertSiblings.push(el);
          }
        });
      } else {
        inertSiblings.forEach(function (el) {
          el.removeAttribute('inert');
        });
        inertSiblings = [];
      }
    }

    function getFocusable() {
      var nodes = host.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
      return Array.prototype.filter.call(nodes, function (n) {
        return !n.hidden && n.offsetParent !== null;
      });
    }

    function clearTimers() {
      if (parkTimer) { clearTimeout(parkTimer); parkTimer = null; }
      if (crossfadeTimer) { clearTimeout(crossfadeTimer); crossfadeTimer = null; }
      if (demoteTimer) { clearTimeout(demoteTimer); demoteTimer = null; }
    }

    async function promoteFromColdCard(triggerEl, options) {
      var opts = options || {};
      clearTimers();

      var armT0 = (global.performance && global.performance.now) ? global.performance.now() : Date.now();
      returnFocusEl = triggerEl || document.activeElement;
      activeCardEl = triggerEl && triggerEl.closest ? triggerEl.closest('[data-sv-cold-card]') : null;

      // S1_PROMOTE_ARM (<= 80ms: scale(1.02) + left 2px seam highlight + SR Stage 1)
      setPromoteState('S1_PROMOTE_ARM');
      announceSr('Loading 3D bundle tray preview.');
      var armElapsed = Math.round(((global.performance && global.performance.now) ? global.performance.now() : Date.now()) - armT0);
      if (global.BundleDriver && global.BundleDriver.emitEvent) {
        global.BundleDriver.emitEvent('sv_bundle_promote_arm', {
          poolId: opts.poolId || '',
          armElapsedMs: armElapsed
        });
      }

      if (titleEl && opts.poolName) {
        titleEl.textContent = opts.poolName + ' · 3D Preview';
      }
      if (motherLinkEl) {
        motherLinkEl.href = opts.motherUrl || '/en-us/pages/bundles';
      }

      host.removeAttribute('hidden');
      setBackgroundInert(true);

      // S2_CROSSFADE (240ms tilt 90 deg -> 3/4; 0ms under ?sv_motion=off)
      var motionOff = isMotionOff();
      var s2Ms = motionOff ? 0 : 240;
      setPromoteState('S2_CROSSFADE');

      var driver = global.BundleDriver;
      if (!driver && opts.driverUrl) {
        try {
          var mod = await import(opts.driverUrl);
          driver = mod.BundleDriver || mod.default || global.BundleDriver;
        } catch (_e) {
          driver = null;
        }
      }

      if (!driver || opts.simulateVp5Fail) {
        canvasEl.hidden = true;
        vp5El.removeAttribute('hidden');
        if (opts.posterUrl) {
          vp5ImgEl.src = opts.posterUrl;
          vp5FullLink.href = opts.posterUrl;
        }
        setPromoteState('promote_vp5_poster');
        // SR Stage 3 (V-P5 fallback)
        announceSr('3D preview unavailable, showing high-clarity 2D planar poster.');
        if (driver && driver.emitEvent) {
          driver.emitEvent('sv_bundle_promote_fallback_vp5', {
            poolId: opts.poolId || '',
            reason: opts.simulateVp5Fail ? 'simulated_lod_fail' : 'driver_unavailable'
          });
        }
        stageWrapEl.setAttribute('tabindex', '0');
        stageWrapEl.focus();
        return { ok: false, state: state };
      }

      vp5El.setAttribute('hidden', '');
      canvasEl.hidden = false;

      var mountRes = await driver.mountStage(canvasEl, {
        role: 'hot_child',
        poolId: opts.poolId || '',
        slots: opts.slots || [],
        lidOpenDeg: 72,
        glbUrl: opts.glbUrl || '',
        posterUrl: opts.posterUrl || '',
        strictPosterOnGlbFail: Boolean(opts.strictPosterOnGlbFail)
      });

      if (!mountRes.ok) {
        canvasEl.hidden = true;
        vp5El.removeAttribute('hidden');
        var pUrl = mountRes.poster || opts.posterUrl || '';
        if (pUrl) {
          vp5ImgEl.src = pUrl;
          vp5FullLink.href = pUrl;
        }
        setPromoteState('promote_vp5_poster');
        announceSr('3D preview unavailable, showing high-clarity 2D planar poster.');
        stageWrapEl.setAttribute('tabindex', '0');
        stageWrapEl.focus();
        return { ok: false, state: state, reason: mountRes.reason };
      }

      var finalizeS3 = function () {
        if (state !== 'S2_CROSSFADE' && state !== 'S1_PROMOTE_ARM') return;
        setPromoteState('S3_HOT_LIVE_PREVIEW');
        // SR Stage 2 (S3 ready)
        announceSr('3D tray preview ready. Drag to inspect, use hotspot buttons, or press Escape to close.');
        stageWrapEl.setAttribute('tabindex', '0');
        stageWrapEl.focus();
        if (driver && driver.emitEvent) {
          driver.emitEvent('sv_bundle_promote_live', {
            poolId: opts.poolId || '',
            geoSource: mountRes.geoSource || 'procedural',
            transitionMs: s2Ms
          });
        }
      };

      if (s2Ms === 0) {
        finalizeS3();
      } else {
        crossfadeTimer = setTimeout(finalizeS3, s2Ms);
      }
      return { ok: true, state: 'S3_HOT_LIVE_PREVIEW', geoSource: mountRes.geoSource };
    }

    function demote(reason) {
      if (state === 'S0_COLD_IDLE' || state === 'S5_COLD_PARK') return false;
      if (crossfadeTimer) { clearTimeout(crossfadeTimer); crossfadeTimer = null; }

      // S4_DEMOTE (120ms / 0ms under motion off; silent SR on close!)
      announceSr('');
      setPromoteState('S4_DEMOTE');
      if (global.BundleDriver) {
        global.BundleDriver.updateStage(canvasEl, { paused: true });
      }

      var s4Ms = isMotionOff() ? 0 : 120;
      var finishDemote = function () {
        host.setAttribute('hidden', '');
        setBackgroundInert(false);
        var originTrigger = returnFocusEl;
        returnFocusEl = null;

        if (activeCardEl) {
          activeCardEl.setAttribute('data-sv-promote-state', 'S0_COLD_IDLE');
        }
        setPromoteState('S0_COLD_IDLE');

        // Strictly restore focus to originating Cold card trigger (NEVER document.body)
        if (originTrigger && typeof originTrigger.focus === 'function' && document.contains(originTrigger)) {
          originTrigger.focus();
        }

        // Schedule S5_COLD_PARK 60s idle explicit 3-part dispose()
        if (parkTimer) clearTimeout(parkTimer);
        parkTimer = setTimeout(function () {
          parkNow('idle_60s');
        }, 60000);
      };

      if (s4Ms === 0) {
        finishDemote();
      } else {
        demoteTimer = setTimeout(finishDemote, s4Ms);
      }
      return true;
    }

    function parkNow(reason) {
      if (parkTimer) { clearTimeout(parkTimer); parkTimer = null; }
      var mem = null;
      if (global.BundleDriver) {
        mem = global.BundleDriver.unmountStage(canvasEl, reason || 'S5_COLD_PARK');
      }
      setPromoteState('S5_COLD_PARK');
      return mem;
    }

    host.addEventListener('click', function (e) {
      var actionEl = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
      if (!actionEl) return;
      var act = actionEl.getAttribute('data-action');
      if (act === 'promote-close') {
        e.preventDefault();
        demote('close_click');
        return;
      }
      if (act === 'promote-stage-cmd' && global.BundleDriver) {
        e.preventDefault();
        var cmd = actionEl.getAttribute('data-cmd');
        var allBtns = host.querySelectorAll('[data-action="promote-stage-cmd"]');
        allBtns.forEach(function (b) {
          if (b.getAttribute('data-cmd') !== 'lid_toggle') {
            b.setAttribute('aria-pressed', b === actionEl ? 'true' : 'false');
          }
        });
        if (cmd === 'lid_toggle') {
          global.BundleDriver.updateStage(canvasEl, { clipId: 'clip_lid_toggle' });
        } else if (cmd === 'HS_BAY_GRID' || cmd === 'HS_SV_CREST') {
          global.BundleDriver.updateStage(canvasEl, { hotspotId: cmd });
        } else {
          global.BundleDriver.updateStage(canvasEl, { hotspotId: null, cameraPreset: 'tray_view' });
        }
      }
    });

    document.addEventListener('keydown', function (e) {
      if (host.hasAttribute('hidden')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        // If focused inside SV crest or bay grid closeup, Escape closes Promote overlay & restores Cold card focus per L5 §4.2 / V-08
        demote('escape');
        return;
      }
      if (e.key === 'Tab') {
        var focusables = getFocusable();
        if (focusables.length === 0) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    singleton = {
      host: host,
      canvas: canvasEl,
      promote: promoteFromColdCard,
      demote: demote,
      parkNow: parkNow,
      getState: function () { return state; }
    };
    return singleton;
  }

  global.SVPromotePortal = {
    getInstance: createPortalSingleton
  };
})(window);
