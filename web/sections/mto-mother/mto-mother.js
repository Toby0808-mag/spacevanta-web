/**
 * SpaceVanta MTO Ecosystem Studio Controller (L5@v01 · sv_flow_mto_ecosystem_v02 · r2)
 * - Strictly consumes global BundleDriver.mountStage / BundleDriver.dispatch & window.SpaceVanta.
 * - Enforces D-09 Trust -> Motivate -> Remember, zero bare hex, zero hardcoded commercial numbers/prices.
 * - Implements mto-whisper-i1 (<= 80ms in-place update), clip_submit_in_place_ack (0 scroll, 0 jump, 0 collapse),
 *   r2 -> r1 -> Poster weak-network auto-downgrade, Desktop SEO (JSON-LD + canonical + hreflang),
 *   Mobile 375px D1, and reserved G-1/G-2 agent read-only invocation listeners.
 */
(function (global) {
  "use strict";

  var SUPPORTED_MARKETS = ["en-us", "en-gb", "en-au", "en-ca", "en-sg", "en-hk"];

  var SCENARIO_LABELS = {
    desk_fit: "Desk Architecture Fit",
    material_pair: "Custom Material Pairing",
    gift_edition: "Bespoke Studio Edition",
    archive_piece: "Off-Catalog Sourcing"
  };

  var FORM_LABELS = {
    base_fluted: "Fluted Base",
    body_slim_a5: "Slim Proportion",
    body_tapered: "Tapered Profile",
    base_compact_tray: "Compact Footprint"
  };

  var FINISH_LABELS = {
    surface_warm_glaze: "Warm Glaze",
    coat_raw_linen: "Oatmeal Linen",
    surface_satin_slate: "Satin Gunmetal Collar",
    surface_honed_stone: "Honed Travertine"
  };

  var SPEC_LABELS = {
    pack_single_box: "Warm Paper Box",
    label_blind_deboss: "Blind Deboss",
    pack_gift_sleeve: "Archival Linen Sleeve",
    label_monogram_tag: "Engraved Slate Tag"
  };

  function detectMarketSlug() {
    if (global.SpaceVanta && global.SpaceVanta.market && global.SpaceVanta.market.get) {
      return global.SpaceVanta.market.get().slug || "en-us";
    }
    try {
      var m = /^\/(en-(?:us|gb|au|ca|sg|hk))(?=\/|$)/i.exec(global.location.pathname || "");
      return m ? m[1].toLowerCase() : "en-us";
    } catch (_e) {
      return "en-us";
    }
  }

  function buildMarketPath(subPath, marketOverride) {
    var mkt = (marketOverride || detectMarketSlug()).toLowerCase();
    var clean = String(subPath || "").replace(/^\/+/, "");
    return "/" + mkt + "/" + clean;
  }

  function evaluateLocalImportHint(marketSlug, text) {
    var mkt = String(marketSlug || "en-us").toUpperCase();
    var q = String(text || "").toLowerCase();
    if (/(lithium|battery|powerbank|aerosol|pressurized)/.test(q)) {
      return {
        level: "restricted_hint",
        note: "Restricted air-freight item detected for " + mkt + " — studio team will review compliant surface or battery-free alternatives before quoting."
      };
    }
    if (/(liquid|oil|fragrance|perfume|wax|food|tea|coffee|flora|seed|timber|wood)/.test(q)) {
      return {
        level: "warn_review",
        note: "regulated material note for " + mkt + " — customs declaration & phyto/material certificate pre-checked prior to confirmation."
      };
    }
    return {
      level: "pass",
      note: "Standard studio craft clearance for " + mkt + " — import compliance verified before quote confirmation."
    };
  }

  function injectDesktopSeoHead(marketSlug) {
    if (typeof document === "undefined" || !document.head) return;
    var origin = (global.location && global.location.origin && global.location.origin !== "null")
      ? global.location.origin
      : "https://spacevanta.com";
    var canonicalHref = origin + "/" + marketSlug + "/pages/made-to-order";

    var canon = document.head.querySelector('link[rel="canonical"][data-sv-mto-seo]');
    if (!canon) {
      canon = document.createElement("link");
      canon.rel = "canonical";
      canon.setAttribute("data-sv-mto-seo", "1");
      document.head.appendChild(canon);
    }
    canon.href = canonicalHref;

    SUPPORTED_MARKETS.forEach(function (mkt) {
      var sel = 'link[rel="alternate"][hreflang="' + mkt + '"][data-sv-mto-seo]';
      var link = document.head.querySelector(sel);
      if (!link) {
        link = document.createElement("link");
        link.rel = "alternate";
        link.hreflang = mkt;
        link.setAttribute("data-sv-mto-seo", "1");
        document.head.appendChild(link);
      }
      link.href = origin + "/" + mkt + "/pages/made-to-order";
    });

    var xDef = document.head.querySelector('link[rel="alternate"][hreflang="x-default"][data-sv-mto-seo]');
    if (!xDef) {
      xDef = document.createElement("link");
      xDef.rel = "alternate";
      xDef.hreflang = "x-default";
      xDef.setAttribute("data-sv-mto-seo", "1");
      document.head.appendChild(xDef);
    }
    xDef.href = origin + "/en-us/pages/made-to-order";

    var ldId = "sv-mto-seo-jsonld";
    var ldEl = document.getElementById(ldId);
    if (!ldEl) {
      ldEl = document.createElement("script");
      ldEl.type = "application/ld+json";
      ldEl.id = ldId;
      document.head.appendChild(ldEl);
    }
    var schema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "SpaceVanta Made to Order Studio",
      "url": canonicalHref,
      "description": "Explore ready-to-make pieces, customize proportions and finishes, or request bespoke sourcing with zero upfront charge until approved.",
      "mainEntity": {
        "@type": "Service",
        "name": "SpaceVanta Made-to-Order & Bespoke Sourcing",
        "provider": {
          "@type": "Brand",
          "name": "SpaceVanta"
        },
        "areaServed": SUPPORTED_MARKETS.map(function (m) { return m.slice(3).toUpperCase(); })
      }
    };
    ldEl.textContent = JSON.stringify(schema);
  }

  function sanitizeWhisperText(raw) {
    var str = String(raw || "").trim();
    if (!str) return "";
    // AGENT_ASSET_REGISTRY_mto.md §1/§2: Never allow agent/whisper to emit commercial price/currency facts
    if (/[$€£¥]|\b(usd|hkd|gbp|aud|cad|sgd)\b/i.test(str)) {
      return "";
    }
    return str;
  }

  function generateFallbackReqId(track) {
    var stamp = Date.now().toString(36);
    var rand = Math.abs((Date.now() * 17) % 46656).toString(36);
    return "mto_" + (track || "02") + "_" + stamp + "_" + rand;
  }

  async function initMtoMotherSection(root) {
    if (!root || root.dataset.svInitialized === "true") return;
    root.dataset.svInitialized = "true";

    // 1) Enforce ?sv_agent=off & ?sv_season=off DOM removal gates immediately
    var agentEl = root.querySelector('[data-sv-agent-slot="g0"]');
    if (agentEl && global.SpaceVanta && global.SpaceVanta.flags && global.SpaceVanta.flags.isAgentOff()) {
      agentEl.remove();
    }
    var seasonStripEl = root.querySelector("[data-sv-mto-season-strip]");
    if (seasonStripEl && global.SpaceVanta && global.SpaceVanta.flags && global.SpaceVanta.flags.isSeasonOff()) {
      seasonStripEl.remove();
    }

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
    var MTO_ANCHOR_LABELS = driver.mtoRig.labels;
    var MTO_AGENT_EVENTS = driver.mtoRig.agentEvents;
    var findMtoSku = driver.findMtoSku;

    var state = driver.createMtoInitialState("mto_mother");
    var initialMarket = detectMarketSlug();
    state = driver.dispatch(state, { type: "MTO_SET_MARKET", market: initialMarket });

    // Check Remember storage for existing reqId
    var remembered = driver.loadMtoRemember();
    if (remembered && remembered.reqId) {
      state.reqId = remembered.reqId;
      state.reqTrack = remembered.track || "02";
    }

    // Check Hot/Cold Child deep-link / 30m sessionStorage handoff (Zero Reset!)
    var handoff = driver.consumeMtoHandoff();
    if (handoff) {
      state = driver.dispatch(state, {
        type: "MTO_HYDRATE_HANDOFF",
        track: handoff.track || "02",
        sku: handoff.sku,
        pool: handoff.pool,
        form: handoff.form,
        finish: handoff.finish,
        spec: handoff.spec,
        note: handoff.note
      });
    }

    injectDesktopSeoHead(state.market);

    // DOM References
    var trustBarEl = root.querySelector('[data-sv-slot="mto-key-trust-bar"]');
    var dutyEl = root.querySelector('[data-sv-field="duty"]');
    var leadtimeEl = root.querySelector('[data-sv-field="leadtime"]');
    var thresholdEl = root.querySelector('[data-sv-field="threshold"]');
    var orderByEl = root.querySelector('[data-sv-field="order-by"]');

    var canvasEl = root.querySelector("[data-sv-mto-canvas]");
    var posterBoxEl = root.querySelector("[data-sv-mto-poster-box]");
    var posterImgEl = root.querySelector("[data-sv-mto-poster-img]");
    var fullPosterLink = root.querySelector("[data-sv-view-full-poster]");
    var leftDockEl = root.querySelector("[data-sv-left-sku-dock]");

    var whisperTextEl = root.querySelector("[data-sv-whisper-text]");
    var popoverEl = root.querySelector("[data-sv-anchor-popover]");
    var popoverTitleEl = root.querySelector("[data-sv-popover-title]");
    var popoverDescEl = root.querySelector("[data-sv-popover-desc]");

    var formSelect = root.querySelector('[data-sv-input="form"]');
    var finishSelect = root.querySelector('[data-sv-input="finish"]');
    var specSelect = root.querySelector('[data-sv-input="spec"]');
    var noteInput = root.querySelector('[data-sv-input="note"]');

    var folioClosedView = root.querySelector("[data-sv-folio-closed-view]");
    var folioOpenView = root.querySelector("[data-sv-folio-open-view]");
    var folioNoteInput = root.querySelector('[data-sv-input="folio-note"]');
    var targetMarketSelect = root.querySelector('[data-sv-input="targetMarket"]');
    var budgetBandSelect = root.querySelector('[data-sv-input="budgetBand"]');
    var qtyBandSelect = root.querySelector('[data-sv-input="qtyBand"]');
    var emailInput = root.querySelector('[data-sv-input="email"]');
    var marketBadgeEl = root.querySelector("[data-sv-market-badge]");
    var importTextEl = root.querySelector("[data-sv-import-text]");
    var scenarioBadgeEl = root.querySelector("[data-sv-scenario-badge]");

    var submitBtn02 = root.querySelector("[data-sv-submit-btn-02]");
    var submitLbl02 = root.querySelector("[data-sv-submit-label-02]");
    var ackBox02 = root.querySelector("[data-sv-ack-02]");
    var ackReq02 = root.querySelector("[data-sv-ack-req-02]");
    var ackSla02 = root.querySelector("[data-sv-ack-sla-02]");
    var ackTracker02 = root.querySelector("[data-sv-ack-tracker-02]");

    var submitBtn03 = root.querySelector("[data-sv-submit-btn-03]");
    var submitLbl03 = root.querySelector("[data-sv-submit-label-03]");
    var ackBox03 = root.querySelector("[data-sv-ack-03]");
    var ackReq03 = root.querySelector("[data-sv-ack-req-03]");
    var ackSla03 = root.querySelector("[data-sv-ack-sla-03]");
    var ackTracker03 = root.querySelector("[data-sv-ack-tracker-03]");

    var toastEl = root.querySelector("[data-sv-mto-toast]");
    var toastTextEl = root.querySelector("[data-sv-mto-toast-text]");
    var retryBtn = root.querySelector("[data-sv-mto-retry]");

    var rememberSelEl = root.querySelector("[data-sv-remember-selection]");
    var rememberReqEl = root.querySelector("[data-sv-remember-req]");
    var mobileStickyLbl = root.querySelector("[data-sv-mobile-sticky-label]");

    var stageHovered = false;
    var autoCycleTimer = null;
    var submitTimer = null;
    var anchorTriggerFocusEl = null;

    function getGlbUrlForSku(skuId) {
      var found = findMtoSku(skuId);
      var idx = MTO_SKUS.indexOf(found) + 1;
      return root.getAttribute("data-sv-glb-0" + (idx > 0 ? idx : 1)) || "";
    }

    function getPosterUrlForTrack(tr) {
      if (tr === "02") return root.getAttribute("data-sv-poster-02") || "";
      if (tr === "03") return root.getAttribute("data-sv-poster-03") || "";
      return root.getAttribute("data-sv-poster-01") || "";
    }

    // <= 80ms synchronous in-place whisper update (L5@v01 §2 / §6)
    function setWhisper(sentence) {
      if (!whisperTextEl || !sentence) return;
      var t0 = (global.performance && global.performance.now) ? global.performance.now() : Date.now();
      whisperTextEl.textContent = sentence;
      var elapsed = ((global.performance && global.performance.now) ? global.performance.now() : Date.now()) - t0;
      whisperTextEl.dataset.latencyMs = String(Math.max(0, Math.round(elapsed)));
    }

    function syncAllMarketLinks() {
      var statusBase = buildMarketPath("pages/mto-status", state.market);
      var statusHref = state.reqId ? (statusBase + "?reqId=" + encodeURIComponent(state.reqId)) : statusBase;
      root.querySelectorAll("[data-sv-guide-link], [data-sv-status-link], [data-sv-d1-target-link]").forEach(function (a) {
        a.href = statusHref;
      });
      if (ackTracker02) ackTracker02.href = statusHref;
      if (ackTracker03) ackTracker03.href = statusHref;
    }

    function syncFormControlsFromState() {
      if (formSelect && formSelect.value !== state.form) formSelect.value = state.form;
      if (finishSelect && finishSelect.value !== state.finish) finishSelect.value = state.finish;
      if (specSelect && specSelect.value !== state.spec) specSelect.value = state.spec;
      if (noteInput && noteInput.value !== state.note) noteInput.value = state.note;
      if (folioNoteInput && folioNoteInput.value !== state.note && state.track === "03") {
        folioNoteInput.value = state.note;
      }
      if (targetMarketSelect && targetMarketSelect.value !== state.targetMarket) {
        targetMarketSelect.value = state.targetMarket;
      }
      if (budgetBandSelect && budgetBandSelect.value !== state.budgetBand) {
        budgetBandSelect.value = state.budgetBand;
      }
      if (qtyBandSelect && qtyBandSelect.value !== state.qtyBand) {
        qtyBandSelect.value = state.qtyBand;
      }
    }

    function buildAckSlaCopy(track) {
      if (track === "03") {
        var mktCode = String(state.targetMarket || state.market || "en-us").toUpperCase();
        if (state.slaNew) {
          return "Free sourcing research (Max " + state.slaNew + ") · " + mktCode + " import compliance verified before confirmation.";
        }
        return "Free sourcing research · " + mktCode + " import compliance verified before you confirm.";
      }
      var parts = [];
      if (state.slaCustom) {
        parts.push("Reply in " + state.slaCustom);
      } else {
        parts.push("Confirm every detail before you pay");
      }
      if (state.maxRevisions != null && state.maxRevisions !== "") {
        parts.push("Includes up to " + state.maxRevisions + " free revision before you confirm");
      } else {
        parts.push("Complimentary pre-approval revision included");
      }
      parts.push("Zero charge until approved.");
      return parts.join(" · ");
    }

    function refreshImportPrecheck() {
      var mkt = (targetMarketSelect && targetMarketSelect.value) || state.targetMarket || state.market;
      var q = (folioNoteInput && folioNoteInput.value) || state.note || "";
      if (marketBadgeEl) marketBadgeEl.textContent = mkt.toUpperCase();

      var localRes = evaluateLocalImportHint(mkt, q);
      state.importRuleLevel = localRes.level;
      state.importRuleNote = localRes.note;
      if (importTextEl) importTextEl.textContent = localRes.note;

      if (global.SpaceVanta && global.SpaceVanta.api && global.SpaceVanta.api.url("mto", "import-check")) {
        global.SpaceVanta.api.get("mto", "import-check", { market: mkt, q: q.slice(0, 120) }, { ttl: 15000 }).then(function (d) {
          if (d && (d.note || d.importRuleNote)) {
            var remoteNote = String(d.note || d.importRuleNote);
            state.importRuleNote = remoteNote;
            if (importTextEl) importTextEl.textContent = remoteNote;
          }
        });
      }
    }

    async function mountOrSyncStage() {
      var pUrl = getPosterUrlForTrack(state.track);
      if (posterImgEl && pUrl) posterImgEl.src = pUrl;
      if (fullPosterLink && pUrl) fullPosterLink.href = pUrl;

      var threeDOff = global.SpaceVanta && global.SpaceVanta.flags && global.SpaceVanta.flags.is3DOff();
      var simVp5 = Boolean(global.SpaceVanta && global.SpaceVanta.flags && global.SpaceVanta.flags.get().sv_vp5 === "1");

      if (threeDOff || state.tier === "poster" || simVp5) {
        driver.unmountStage(canvasEl, threeDOff ? "sv_3d_off" : "poster_mode");
        canvasEl.hidden = true;
        if (posterBoxEl) posterBoxEl.removeAttribute("hidden");
        return;
      }

      var existing = driver.getStageHandle(canvasEl);
      if (!existing) {
        canvasEl.hidden = false;
        if (posterBoxEl) posterBoxEl.setAttribute("hidden", "");
        var res = await driver.mountStage(canvasEl, {
          pack: "mto",
          role: "mto_mother",
          track: state.track,
          tier: state.tier,
          sku: state.sku,
          glbUrl: getGlbUrlForSku(state.sku),
          posterUrl: pUrl,
          skipRemotePack: !Boolean(global.SpaceVanta && global.SpaceVanta.config && global.SpaceVanta.config.modelsBase)
        });
        if (!res.ok) {
          canvasEl.hidden = true;
          if (posterBoxEl) posterBoxEl.removeAttribute("hidden");
          return;
        }
        // Mobile 375px single gentle entry peek breath
        if ((global.innerWidth || 1280) <= 767 && !driver.isReducedMotion() && state.tier === "r2") {
          driver.updateStage(canvasEl, { clipId: "mto_mobile_peek" });
        }
      } else {
        canvasEl.hidden = false;
        if (posterBoxEl) posterBoxEl.setAttribute("hidden", "");
        driver.updateStage(canvasEl, {
          tier: state.tier,
          track: state.track,
          sku: state.sku
        });
      }
    }

    function renderUI() {
      var skuInfo = findMtoSku(state.sku);
      root.setAttribute("data-sv-track", state.track);
      root.setAttribute("data-sv-model-tier", state.tier);
      root.setAttribute("data-sv-state", state.flow);

      // Tabs
      root.querySelectorAll('[data-action="mto-switch-track"]').forEach(function (tab) {
        var isSel = tab.getAttribute("data-track") === state.track;
        tab.setAttribute("aria-selected", isSel ? "true" : "false");
      });

      // Tier buttons
      root.querySelectorAll('[data-action="mto-set-tier"]').forEach(function (pill) {
        var isPressed = pill.getAttribute("data-tier") === state.tier;
        pill.setAttribute("aria-pressed", isPressed ? "true" : "false");
      });

      // Left Cold 2D SKU Dock (visible on Track 02)
      if (leftDockEl) {
        if (state.track === "02") leftDockEl.removeAttribute("hidden");
        else leftDockEl.setAttribute("hidden", "");
        leftDockEl.querySelectorAll('[data-action="mto-select-sku"]').forEach(function (card) {
          card.setAttribute("aria-pressed", card.getAttribute("data-sku") === state.sku ? "true" : "false");
        });
      }

      // Hotspot overlay groups
      root.querySelectorAll("[data-hotspot-track]").forEach(function (grp) {
        if (grp.getAttribute("data-hotspot-track") === state.track && state.tier === "r2") {
          grp.removeAttribute("hidden");
        } else {
          grp.setAttribute("hidden", "");
        }
      });

      // Panels 01 / 02 / 03
      root.querySelectorAll("[data-track-panel]").forEach(function (pnl) {
        if (pnl.getAttribute("data-track-panel") === state.track) pnl.removeAttribute("hidden");
        else pnl.setAttribute("hidden", "");
      });

      // Active SKU titles
      var activeCatEl = root.querySelector("[data-sv-active-cat]");
      var activeTitleEl = root.querySelector("[data-sv-active-sku-title]");
      var t02TitleEl = root.querySelector("[data-sv-t02-sku-title]");
      if (activeCatEl) activeCatEl.textContent = skuInfo.category;
      if (activeTitleEl) activeTitleEl.textContent = skuInfo.title;
      if (t02TitleEl) t02TitleEl.textContent = skuInfo.title;

      // Track 01 Two-Stage Relay copy (CHG-W02)
      var relayTextEl = root.querySelector("[data-sv-relay-text]");
      if (relayTextEl) {
        if (state.slaHandover && leadtimeEl && leadtimeEl.textContent) {
          relayTextEl.textContent = "Prep & Handover (" + state.slaHandover + ") → Carrier transit (" + leadtimeEl.textContent + ").";
        } else if (state.slaHandover) {
          relayTextEl.textContent = "Prep & Handover (" + state.slaHandover + ") followed by tracked Space Express carrier transit.";
        } else {
          relayTextEl.textContent = "Made-to-order preparation & handover followed by tracked Space Express carrier transit.";
        }
      }

      var autoCycleBtn = root.querySelector('[data-action="mto-toggle-autocycle"]');
      if (autoCycleBtn) {
        autoCycleBtn.setAttribute("aria-pressed", state.autoCycle && state.tier === "r2" ? "true" : "false");
      }

      // Track 03 Closed vs Open 3-Wing View
      if (folioClosedView && folioOpenView) {
        if (state.folioOpen) {
          folioClosedView.setAttribute("hidden", "");
          folioOpenView.removeAttribute("hidden");
        } else {
          folioClosedView.removeAttribute("hidden");
          folioOpenView.setAttribute("hidden", "");
        }
      }
      if (scenarioBadgeEl) {
        scenarioBadgeEl.textContent = "Scenario · " + (SCENARIO_LABELS[state.scenarioId] || "Desk Architecture Fit");
      }
      root.querySelectorAll(".sv-mm-wing-pill").forEach(function (pill) {
        pill.setAttribute("aria-pressed", pill.getAttribute("data-scenario") === state.scenarioId ? "true" : "false");
      });

      // Submitting & In-Place Ack Bars (Track 02 & Track 03)
      var isSubmitting = state.flow === "submitting_request";
      var isAck02 = state.flow === "submit_in_place_ack" && state.reqTrack === "02";
      var isAck03 = state.flow === "submit_in_place_ack" && state.reqTrack === "03";

      if (submitBtn02) {
        submitBtn02.setAttribute("data-submitting", isSubmitting && state.track === "02" ? "true" : "false");
        var aura02 = submitBtn02.querySelector("[data-sv-seam-aura]");
        if (aura02) {
          if (isSubmitting && state.track === "02") aura02.removeAttribute("hidden");
          else aura02.setAttribute("hidden", "");
        }
      }
      if (submitLbl02) {
        submitLbl02.textContent = (isSubmitting && state.track === "02")
          ? "Sending Request ···"
          : "Send Request — No Charge Yet";
      }
      if (ackBox02) {
        if (isAck02 && state.reqId) {
          if (ackReq02) ackReq02.textContent = state.reqId;
          if (ackSla02) ackSla02.textContent = buildAckSlaCopy("02");
          ackBox02.removeAttribute("hidden");
        } else {
          ackBox02.setAttribute("hidden", "");
        }
      }

      if (submitBtn03) {
        submitBtn03.setAttribute("data-submitting", isSubmitting && state.track === "03" ? "true" : "false");
        var aura03 = submitBtn03.querySelector("[data-sv-seam-aura]");
        if (aura03) {
          if (isSubmitting && state.track === "03") aura03.removeAttribute("hidden");
          else aura03.setAttribute("hidden", "");
        }
      }
      if (submitLbl03) {
        submitLbl03.textContent = (isSubmitting && state.track === "03")
          ? "Sending Request ···"
          : "Send Free Request — No Charge Yet";
      }
      if (ackBox03) {
        if (isAck03 && state.reqId) {
          if (ackReq03) ackReq03.textContent = state.reqId;
          if (ackSla03) ackSla03.textContent = buildAckSlaCopy("03");
          ackBox03.removeAttribute("hidden");
        } else {
          ackBox03.setAttribute("hidden", "");
        }
      }

      // Toast (duplicate click or timeout_fallback)
      if (toastEl && toastTextEl) {
        if (state.toast) {
          toastTextEl.textContent = state.toast;
          toastEl.removeAttribute("hidden");
          if (retryBtn) {
            if (state.flow === "timeout_fallback") retryBtn.removeAttribute("hidden");
            else retryBtn.setAttribute("hidden", "");
          }
        } else {
          toastEl.setAttribute("hidden", "");
        }
      }

      // Remember Strip
      if (rememberSelEl) {
        var fLbl = FORM_LABELS[state.form] || state.form;
        var fnLbl = FINISH_LABELS[state.finish] || state.finish;
        var spLbl = SPEC_LABELS[state.spec] || state.spec;
        rememberSelEl.textContent = skuInfo.title + " · " + fLbl + " · " + fnLbl + " · " + spLbl;
      }
      if (rememberReqEl) {
        if (state.reqId) {
          rememberReqEl.textContent = state.reqId;
          rememberReqEl.removeAttribute("hidden");
        } else {
          rememberReqEl.setAttribute("hidden", "");
        }
      }

      // Mobile D1 Sticky Primary CTA label
      if (mobileStickyLbl) {
        if (state.track === "01") mobileStickyLbl.textContent = "Add to Cart";
        else if (state.track === "02") mobileStickyLbl.textContent = "Send Request — No Charge Yet";
        else mobileStickyLbl.textContent = state.folioOpen ? "Send Free Request — No Charge Yet" : "Open Sourcing Folio";
      }

      syncFormControlsFromState();
      syncAllMarketLinks();
    }

    async function executeRequestSubmit(track) {
      var prevCommits = state.commitCount;
      var noteVal = track === "03"
        ? ((folioNoteInput && folioNoteInput.value) || state.note)
        : ((noteInput && noteInput.value) || state.note);
      state = driver.dispatch(state, {
        type: "MTO_UPDATE_SPEC",
        note: noteVal,
        targetMarket: (targetMarketSelect && targetMarketSelect.value) || state.targetMarket,
        budgetBand: (budgetBandSelect && budgetBandSelect.value) || state.budgetBand,
        qtyBand: (qtyBandSelect && qtyBandSelect.value) || state.qtyBand
      });

      var idemKey = driver.mtoIdempotencyKey(
        state.market,
        track,
        state.sku,
        state.form,
        state.finish,
        state.spec,
        noteVal
      );

      state = driver.dispatch(state, {
        type: "MTO_ATTEMPT_SUBMIT",
        idempotencyKey: idemKey,
        lockMs: 2500
      });
      renderUI();

      // Blocked duplicate rapid click -> stop here with visible duplicate prevention notice!
      if (state.commitCount <= prevCommits) {
        setWhisper(
          state.reqId
            ? "Duplicate click ignored — Request " + state.reqId + " is already recorded in place."
            : "Duplicate click ignored — your request is already locked with Idempotency-Key."
        );
        return;
      }

      var scrollBefore = global.scrollY || 0;
      var flags = (global.SpaceVanta && global.SpaceVanta.flags && global.SpaceVanta.flags.get()) || {};
      var simTimeout = flags.sv_sim_timeout === "1" || root.getAttribute("data-sv-simulate-timeout") === "true";

      if (simTimeout) {
        if (submitTimer) clearTimeout(submitTimer);
        submitTimer = setTimeout(function () {
          state = driver.dispatch(state, {
            type: "MTO_TIMEOUT_FALLBACK",
            message: "Connection timed out. Your custom selections and notes are safely preserved."
          });
          setWhisper("Connection timed out — every selected specification and note remains intact.");
          renderUI();
        }, 120);
        return;
      }

      var reqPayload = {
        track: track,
        sku: state.sku,
        pool: state.poolId,
        form: state.form,
        finish: state.finish,
        spec: state.spec,
        note: noteVal,
        scenarioId: state.scenarioId,
        targetMarket: state.targetMarket,
        budgetBand: state.budgetBand,
        qtyBand: state.qtyBand,
        email: (emailInput && emailInput.value) ? emailInput.value.trim() : null
      };

      var resolvedReqId = "";
      if (global.SpaceVanta && global.SpaceVanta.api && global.SpaceVanta.api.url("mto", "request")) {
        var apiRes = await global.SpaceVanta.api.post("mto", "request", reqPayload, {
          idempotencyKey: idemKey
        });
        if (apiRes.status === 409 && apiRes.data && apiRes.data.reqId) {
          resolvedReqId = String(apiRes.data.reqId);
        } else if (apiRes.status === 429) {
          state = driver.dispatch(state, {
            type: "MTO_TIMEOUT_FALLBACK",
            message: "Daily request allowance reached for this email — your draft is preserved."
          });
          renderUI();
          return;
        } else if (!apiRes.ok) {
          state = driver.dispatch(state, {
            type: "MTO_TIMEOUT_FALLBACK",
            message: "Service temporarily unreachable. Your custom selections and notes are safely preserved."
          });
          renderUI();
          return;
        } else if (apiRes.data) {
          resolvedReqId = String(apiRes.data.reqId || "");
          if (apiRes.data.slaCustom) state.slaCustom = String(apiRes.data.slaCustom);
          if (apiRes.data.slaNew) state.slaNew = String(apiRes.data.slaNew);
          if (apiRes.data.policy && apiRes.data.policy.maxRevisions != null) {
            state.maxRevisions = apiRes.data.policy.maxRevisions;
          }
        }
      }

      if (!resolvedReqId) {
        resolvedReqId = generateFallbackReqId(track);
      }

      // ★ L5@v01 §4.1 #7 & V-05: clip_submit_in_place_ack (0 jump, 0 scroll, 0 collapse!)
      state = driver.dispatch(state, {
        type: "MTO_SUBMIT_IN_PLACE_ACK",
        reqId: resolvedReqId
      });

      driver.saveMtoRemember({
        reqId: resolvedReqId,
        track: track,
        sku: state.sku,
        form: state.form,
        finish: state.finish,
        spec: state.spec,
        market: state.market,
        revisionCount: 0
      });

      driver.updateStage(canvasEl, {
        clipId: "clip_submit_in_place_ack",
        track: track
      });

      // Emit read-only completion notification for G-1/G-2 contract
      driver.emitEvent(track === "03" ? MTO_AGENT_EVENTS.ackSubmit03 : MTO_AGENT_EVENTS.ackSubmit02, {
        reqId: resolvedReqId,
        track: track,
        zeroCollapse: true
      });

      var slaWhisper = buildAckSlaCopy(track);
      setWhisper("Request " + resolvedReqId + " recorded in place — " + slaWhisper);
      renderUI();

      // Focus stays inside in-place confirmation bar WITHOUT scrolling viewport!
      var targetAckEl = track === "03" ? ackBox03 : ackBox02;
      if (targetAckEl && typeof targetAckEl.focus === "function") {
        try {
          targetAckEl.focus({ preventScroll: true });
        } catch (_e) {}
      }
      if (typeof global.scrollTo === "function" && (global.scrollY || 0) !== scrollBefore) {
        global.scrollTo(0, scrollBefore);
      }
    }

    // Worker Data Hydration (Trust 50 + MTO SLA/Policy/Import Rules)
    function applyWorkerPayload(payload) {
      if (!payload) return;
      var shipping = payload.shipping || payload;
      var bdl = payload.bundle || payload;
      var mto = payload.mto || payload;

      var duty = shipping.duty || "";
      var lead = shipping.leadtime || shipping.deadline || "";
      var thresh = bdl.threshold || shipping.threshold || "";

      if (trustBarEl) {
        if (duty && lead && thresh && !payload.shippingUnavailable) {
          if (dutyEl) dutyEl.textContent = String(duty);
          if (leadtimeEl) leadtimeEl.textContent = String(lead);
          if (thresholdEl) thresholdEl.textContent = String(thresh);
          trustBarEl.removeAttribute("hidden");
        } else {
          trustBarEl.setAttribute("hidden", "");
        }
      }

      var slaCfg = mto.sla_config || mto.slaConfig || {};
      if (slaCfg.handover || mto.handoverSla) state.slaHandover = String(slaCfg.handover || mto.handoverSla);
      if (slaCfg.custom || mto.customSla) state.slaCustom = String(slaCfg.custom || mto.customSla);
      if (slaCfg.new_sourcing || slaCfg.newSla || mto.newSla) {
        state.slaNew = String(slaCfg.new_sourcing || slaCfg.newSla || mto.newSla);
      }

      var pol = mto.policy || {};
      if (pol.maxRevisions != null || mto.maxRevisions != null) {
        state.maxRevisions = pol.maxRevisions != null ? pol.maxRevisions : mto.maxRevisions;
      }

      if (mto.import_rules && mto.import_rules.note) {
        state.importRuleNote = String(mto.import_rules.note);
        if (importTextEl) importTextEl.textContent = state.importRuleNote;
      }

      renderUI();
    }

    function applySeasonPayload(season) {
      if (!seasonStripEl || !document.contains(seasonStripEl)) return;
      var allowSeason = root.getAttribute("data-sv-season-allow") !== "false";
      var seasonOff = global.SpaceVanta && global.SpaceVanta.flags && global.SpaceVanta.flags.isSeasonOff();
      var flags = (global.SpaceVanta && global.SpaceVanta.flags && global.SpaceVanta.flags.get()) || {};
      var seasonOnFlag = flags.sv_season === "on" || Boolean(season && (season.on || season.enabled));
      var label = (season && (season.orderByLabel || season.order_by)) || "";

      if (allowSeason && !seasonOff && seasonOnFlag && label) {
        if (orderByEl) orderByEl.textContent = String(label);
        seasonStripEl.removeAttribute("hidden");
      } else {
        if (orderByEl) orderByEl.textContent = "";
        seasonStripEl.setAttribute("hidden", "");
      }
      driver.updateStage(canvasEl, { refreshTokens: true });
    }

    global.addEventListener("sv:data", function (e) {
      applyWorkerPayload(e && e.detail ? (e.detail.data || e.detail) : null);
    });
    global.addEventListener("sv:market", function (e) {
      var d = (e && e.detail) || {};
      var nextMkt = d.slug || d.code || detectMarketSlug();
      state = driver.dispatch(state, { type: "MTO_SET_MARKET", market: nextMkt });
      injectDesktopSeoHead(state.market);
      refreshImportPrecheck();
      setWhisper("Destination updated to " + state.market.toUpperCase() + " — import pre-check synchronized.");
      renderUI();
    });
    global.addEventListener("sv:season", function (e) {
      applySeasonPayload(e && e.detail ? e.detail : null);
    });

    // Delegated Click Handler
    root.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-action]") : null;
      if (!btn) return;
      var act = btn.getAttribute("data-action");

      if (act === "mto-switch-track") {
        var nextTr = btn.getAttribute("data-track") || "01";
        state = driver.dispatch(state, { type: "MTO_SWITCH_TRACK", track: nextTr });
        if (popoverEl) popoverEl.setAttribute("hidden", "");
        setWhisper(
          nextTr === "01"
            ? "Track 01 Ready to Make — inspect satellites or add curated piece directly."
            : (nextTr === "02"
              ? "Track 02 Shape It Your Way — switch SKUs on the left without losing Form, Finish, or Spec."
              : "Track 03 Ask for Anything — unfold the warm linen folio for zero-fee bespoke sourcing.")
        );
        renderUI();
        mountOrSyncStage();
        return;
      }

      if (act === "mto-set-tier") {
        var nextTier = btn.getAttribute("data-tier") || "r2";
        state = driver.dispatch(state, { type: "MTO_SET_TIER", tier: nextTier });
        setWhisper(
          nextTier === "poster"
            ? "Static 2D Poster mode active — zero WebGL overhead, full customization & tracking available."
            : (nextTier === "r1"
              ? "Tier r1 active — manual orbit & zoom enabled, hotspots and C1 clips stripped."
              : "Tier r2 active — interactive hotspots and triggered C1 clips enabled.")
        );
        renderUI();
        mountOrSyncStage();
        return;
      }

      if (act === "mto-toggle-autocycle") {
        state.autoCycle = !state.autoCycle;
        renderUI();
        return;
      }

      if (act === "mto-select-sku") {
        var nextSku = btn.getAttribute("data-sku");
        var poolId = btn.getAttribute("data-pool-id");
        state = driver.dispatch(state, { type: "MTO_SELECT_SKU", sku: nextSku, poolId: poolId });
        var info = findMtoSku(state.sku);
        setWhisper("Switched to " + info.title + " — your selected Form, Finish, and Spec remain preserved.");
        renderUI();
        mountOrSyncStage();
        return;
      }

      if (act === "mto-sat-swap") {
        var sIdx = Number(btn.getAttribute("data-sat-index") || 0);
        var sSku = btn.getAttribute("data-sku") || MTO_SKUS[(sIdx + 1) % MTO_SKUS.length].sku;
        state = driver.dispatch(state, { type: "MTO_SELECT_SKU", sku: sSku });
        driver.updateStage(canvasEl, { clipId: "clip_sat_arc_swap", satIndex: sIdx, sku: sSku });
        setWhisper(findMtoSku(sSku).title + " swapped into center showcase — ready to add or customize.");
        renderUI();
        return;
      }

      if (act === "mto-hotspot") {
        var hsId = btn.getAttribute("data-hotspot-id") || "";
        driver.updateStage(canvasEl, { hotspotId: hsId });
        if (hsId.indexOf("HS_MTO_01_SAT_0") === 0) {
          var satI = Number(btn.getAttribute("data-sat-index") || 0);
          var targetSku = MTO_SKUS[(satI + 1) % MTO_SKUS.length].sku;
          state = driver.dispatch(state, { type: "MTO_SELECT_SKU", sku: targetSku });
          driver.updateStage(canvasEl, { clipId: "clip_sat_arc_swap", satIndex: satI, sku: targetSku });
          setWhisper("Satellite " + (satI + 1) + " swapped smoothly along arc — zero interpenetration.");
          renderUI();
        } else if (hsId.indexOf("HS_MTO_02_") === 0) {
          anchorTriggerFocusEl = btn;
          var anchorKey = btn.getAttribute("data-anchor") || "anchor_form";
          var layerIdx = anchorKey === "anchor_form" ? 0 : (anchorKey === "anchor_finish" ? 1 : 2);
          driver.updateStage(canvasEl, { clipId: "clip_layer_part", layerIndex: layerIdx });
          root.querySelectorAll('[data-hotspot-track="02"] .sv-mm-hs-pin').forEach(function (p) {
            p.setAttribute("aria-expanded", p === btn ? "true" : "false");
          });
          if (popoverEl) {
            if (popoverTitleEl) popoverTitleEl.textContent = MTO_ANCHOR_LABELS[anchorKey] || anchorKey;
            if (popoverDescEl) popoverDescEl.textContent = "Adjust " + anchorKey + " in the panel — adjacent layers dampened +3.5px.";
            popoverEl.removeAttribute("hidden");
          }
          setWhisper("Inspecting " + anchorKey + " — target layer lifted +12px with +3.5px neighbor damping.");
        } else if (hsId === "HS_MTO_03_FOLIO_COVER") {
          state = driver.dispatch(state, { type: "MTO_TOGGLE_FOLIO", open: true });
          driver.updateStage(canvasEl, { clipId: "clip_folio_unfold", open: true });
          refreshImportPrecheck();
          setWhisper("Warm linen folio unfolded — complete three lightweight intent fields with zero fee.");
          renderUI();
        }
        return;
      }

      if (act === "mto-close-popover") {
        if (popoverEl) popoverEl.setAttribute("hidden", "");
        driver.updateStage(canvasEl, { hotspotId: "" });
        root.querySelectorAll('[data-hotspot-track="02"] .sv-mm-hs-pin').forEach(function (p) {
          p.setAttribute("aria-expanded", "false");
        });
        if (anchorTriggerFocusEl && typeof anchorTriggerFocusEl.focus === "function") {
          anchorTriggerFocusEl.focus({ preventScroll: true });
        }
        return;
      }

      if (act === "mto-handoff-02") {
        state = driver.dispatch(state, { type: "MTO_SWITCH_TRACK", track: "02", sku: state.sku });
        setWhisper("Carried " + findMtoSku(state.sku).title + " into Track 02 Shape It Your Way.");
        renderUI();
        mountOrSyncStage();
        return;
      }

      if (act === "mto-handoff-03") {
        state = driver.dispatch(state, { type: "MTO_TOGGLE_FOLIO", open: true });
        driver.updateStage(canvasEl, { track: "03", clipId: "clip_folio_unfold", open: true });
        refreshImportPrecheck();
        setWhisper("Using " + findMtoSku(state.sku).title + " as reference in Track 03 sourcing folio.");
        renderUI();
        return;
      }

      if (act === "mto-add-01") {
        var prevC = state.commitCount;
        var addKey = driver.mtoIdempotencyKey(state.market, "01", state.sku, "curated", "curated", "curated", "");
        state = driver.dispatch(state, {
          type: "MTO_ATTEMPT_SUBMIT",
          idempotencyKey: addKey,
          duplicateMessage: "Already queued in bag — duplicate click ignored.",
          lockMs: 2200
        });
        if (state.commitCount <= prevC) {
          renderUI();
          return;
        }
        state.flow = "track1_square_showcase";
        state.toast = findMtoSku(state.sku).title + " queued for your shopping bag.";
        var lbl01 = root.querySelector("[data-sv-add01-label]");
        if (lbl01) lbl01.textContent = "Added to Bag ✓";
        setWhisper("Ready-to-make item added — proceed to Cart whenever ready.");
        renderUI();
        return;
      }

      if (act === "mto-pick-scenario") {
        var scId = btn.getAttribute("data-scenario") || "desk_fit";
        state = driver.dispatch(state, { type: "MTO_TOGGLE_FOLIO", open: true, scenarioId: scId });
        driver.updateStage(canvasEl, { clipId: "clip_folio_unfold", open: true });
        refreshImportPrecheck();
        setWhisper("Selected " + (SCENARIO_LABELS[scId] || scId) + " — three-wing sourcing form ready.");
        renderUI();
        return;
      }

      if (act === "mto-unfold-folio") {
        state = driver.dispatch(state, { type: "MTO_TOGGLE_FOLIO", open: true });
        driver.updateStage(canvasEl, { clipId: "clip_folio_unfold", open: true });
        refreshImportPrecheck();
        setWhisper("Warm linen sourcing folio unfolded — zero upfront fee.");
        renderUI();
        return;
      }

      if (act === "mto-fold-folio") {
        state = driver.dispatch(state, { type: "MTO_TOGGLE_FOLIO", open: false });
        driver.updateStage(canvasEl, { clipId: "clip_folio_unfold", open: false });
        setWhisper("Folio folded back — your draft notes remain preserved.");
        renderUI();
        return;
      }

      if (act === "mto-submit-02") {
        executeRequestSubmit("02");
        return;
      }

      if (act === "mto-submit-03") {
        executeRequestSubmit("03");
        return;
      }

      if (act === "mto-new-request") {
        state = driver.dispatch(state, { type: "MTO_NEW_REQUEST" });
        setWhisper("Ready for a new specification adjustment — zero charge until approved.");
        renderUI();
        return;
      }

      if (act === "mto-retry") {
        state = driver.dispatch(state, { type: "MTO_RETRY_FROM_TIMEOUT" });
        renderUI();
        return;
      }

      if (act === "mto-mobile-sticky-cta") {
        if (state.track === "01") {
          var addBtn = root.querySelector('[data-action="mto-add-01"]');
          if (addBtn) addBtn.click();
        } else if (state.track === "02") {
          executeRequestSubmit("02");
        } else if (!state.folioOpen) {
          state = driver.dispatch(state, { type: "MTO_TOGGLE_FOLIO", open: true });
          driver.updateStage(canvasEl, { clipId: "clip_folio_unfold", open: true });
          refreshImportPrecheck();
          renderUI();
        } else {
          executeRequestSubmit("03");
        }
      }
    });

    // Hover / Focus Whisper & 3D Micro-Linkage (<= 80ms response!)
    root.addEventListener("pointerover", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest("[data-sv-hot-stage-shell]")) {
        stageHovered = true;
      }
      var hs = t.closest('[data-action="mto-hotspot"]');
      if (hs && state.tier === "r2") {
        var hid = hs.getAttribute("data-hotspot-id") || "";
        driver.updateStage(canvasEl, { hotspotId: hid, peek: true });
        setWhisper("Inspecting " + hid + " — click to trigger r2 interactive transition.");
        return;
      }
      var scCard = t.closest('[data-action="mto-pick-scenario"]');
      if (scCard && state.track === "03" && !state.folioOpen && state.tier === "r2") {
        driver.updateStage(canvasEl, { hotspotId: "HS_MTO_03_FOLIO_COVER", peek: true });
        setWhisper("Linen folio seam ajar 25% — click scenario card to unfold sourcing wings.");
      }
    });

    root.addEventListener("pointerout", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest("[data-sv-hot-stage-shell]")) {
        stageHovered = false;
      }
    });

    // Form input listeners
    root.addEventListener("change", function (e) {
      var el = e.target;
      if (!el || !el.getAttribute) return;
      var kind = el.getAttribute("data-sv-input");
      if (!kind) return;
      if (kind === "form" || kind === "finish" || kind === "spec") {
        var patch = { type: "MTO_UPDATE_SPEC" };
        patch[kind] = el.value;
        state = driver.dispatch(state, patch);
        var layerIdx = kind === "form" ? 0 : (kind === "finish" ? 1 : 2);
        driver.updateStage(canvasEl, { clipId: "clip_layer_part", layerIndex: layerIdx });
        setWhisper("Updated " + kind + " layer — preserved across any SKU selection.");
        renderUI();
      } else if (kind === "targetMarket") {
        state = driver.dispatch(state, { type: "MTO_UPDATE_SPEC", targetMarket: el.value });
        refreshImportPrecheck();
        setWhisper("Import compliance pre-check refreshed for " + el.value.toUpperCase() + ".");
        renderUI();
      } else if (kind === "budgetBand" || kind === "qtyBand") {
        var p2 = { type: "MTO_UPDATE_SPEC" };
        p2[kind] = el.value;
        state = driver.dispatch(state, p2);
        renderUI();
      }
    });

    root.addEventListener("input", function (e) {
      var el = e.target;
      if (!el || !el.getAttribute) return;
      var kind = el.getAttribute("data-sv-input");
      if (kind === "note") {
        state = driver.dispatch(state, { type: "MTO_UPDATE_SPEC", note: el.value });
      } else if (kind === "folio-note") {
        state = driver.dispatch(state, { type: "MTO_UPDATE_SPEC", note: el.value });
        refreshImportPrecheck();
      }
    });

    // Escape closes Track 02 anchor popover and restores focus
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && popoverEl && !popoverEl.hasAttribute("hidden")) {
        popoverEl.setAttribute("hidden", "");
        driver.updateStage(canvasEl, { hotspotId: "" });
        if (anchorTriggerFocusEl && typeof anchorTriggerFocusEl.focus === "function") {
          anchorTriggerFocusEl.focus({ preventScroll: true });
        }
      }
    });

    // Track 01 Satellite Auto-Cycle (4.5s, pauses on hover, disabled on reduced motion / r1 / poster)
    autoCycleTimer = setInterval(function () {
      if (!document.contains(root)) {
        clearInterval(autoCycleTimer);
        return;
      }
      if (state.track !== "01" || !state.autoCycle || state.tier !== "r2" || stageHovered || driver.isReducedMotion()) {
        return;
      }
      var curIdx = MTO_SKUS.indexOf(findMtoSku(state.sku));
      var nextSku = MTO_SKUS[(curIdx + 1) % MTO_SKUS.length].sku;
      state = driver.dispatch(state, { type: "MTO_SELECT_SKU", sku: nextSku }, "ephemeral");
      driver.updateStage(canvasEl, { clipId: "clip_sat_arc_swap", satIndex: curIdx % 4, sku: nextSku });
      renderUI();
    }, 4500);

    // Reserved G-1/G-2 Agent Read-Only Invocation Listeners (AGENT_ASSET_REGISTRY_mto.md §2)
    global.addEventListener(MTO_AGENT_EVENTS.focusSatellite, function (e) {
      var satIndex = Number((e && e.detail && e.detail.satIndex) || 0);
      driver.updateStage(canvasEl, { hotspotId: "HS_MTO_01_SAT_0" + ((satIndex % 4) + 1) });
    });
    global.addEventListener(MTO_AGENT_EVENTS.swapCenter, function (e) {
      var d = (e && e.detail) || {};
      var sku = d.sku || MTO_SKUS[1].sku;
      state = driver.dispatch(state, { type: "MTO_SELECT_SKU", sku: sku });
      driver.updateStage(canvasEl, { clipId: "clip_sat_arc_swap", satIndex: Number(d.satIndex || 0), sku: sku });
      renderUI();
    });
    global.addEventListener(MTO_AGENT_EVENTS.highlightAnchor, function (e) {
      var anc = (e && e.detail && e.detail.anchor) || "anchor_form";
      var hs = anc === "anchor_finish" ? "HS_MTO_02_FINISH" : (anc === "anchor_spec" ? "HS_MTO_02_SPEC" : "HS_MTO_02_FORM");
      driver.updateStage(canvasEl, { hotspotId: hs });
    });
    global.addEventListener(MTO_AGENT_EVENTS.openAnchor, function (e) {
      var anc = (e && e.detail && e.detail.anchor) || "anchor_form";
      state = driver.dispatch(state, { type: "MTO_SWITCH_TRACK", track: "02" });
      var idx = anc === "anchor_finish" ? 1 : (anc === "anchor_spec" ? 2 : 0);
      renderUI();
      mountOrSyncStage().then(function () {
        driver.updateStage(canvasEl, { clipId: "clip_layer_part", layerIndex: idx });
      });
    });
    global.addEventListener(MTO_AGENT_EVENTS.unfoldFolio, function () {
      state = driver.dispatch(state, { type: "MTO_TOGGLE_FOLIO", open: true });
      renderUI();
      mountOrSyncStage().then(function () {
        driver.updateStage(canvasEl, { clipId: "clip_folio_unfold", open: true });
      });
    });
    global.addEventListener(MTO_AGENT_EVENTS.whisperAnnounce, function (e) {
      var safeText = sanitizeWhisperText(e && e.detail && e.detail.text);
      if (safeText) setWhisper(safeText);
    });

    // Initial render & async Worker hydration (never blocks first paint!)
    refreshImportPrecheck();
    renderUI();
    mountOrSyncStage();

    if (global.SpaceVanta) {
      if (global.SpaceVanta.data) applyWorkerPayload(global.SpaceVanta.data);
      if (global.SpaceVanta.season && global.SpaceVanta.season.get) {
        applySeasonPayload(global.SpaceVanta.season.get());
      }
      if (global.SpaceVanta.api) {
        if (global.SpaceVanta.api.url("mto", "config")) {
          global.SpaceVanta.api.get("mto", "config", { market: state.market }).then(function (d) {
            if (d) applyWorkerPayload({ mto: d });
          });
        }
        if (global.SpaceVanta.api.url("shipping", "duty")) {
          global.SpaceVanta.api.get("shipping", "duty", { market: state.market }).then(function (d) {
            if (d) applyWorkerPayload({ shipping: d });
          });
        }
      }
    }
  }

  function bootAll() {
    document.querySelectorAll("#sv-mto-ecosystem-page, .sv-mm[data-sv-role='mto_mother']").forEach(initMtoMotherSection);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootAll);
  } else {
    bootAll();
  }
})(window);
