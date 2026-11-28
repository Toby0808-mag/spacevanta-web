/**
 * SpaceVanta MTO Live Status Tracker Controller (L5@v01 · CHG-W04 / CHG-W05 · V-06)
 * - Enforces Max 1 complimentary revision (2nd attempt strictly blocked 409).
 * - Enforces Quote Approval Gate: {{LOCALE_PRICE}} and {{QUOTE_TTL}} ONLY appear when state === "approved"
 *   and unexpired; expired quotes (410 / > TTL) disable payment and offer 1-click Re-submit with Zero Reset.
 * - Zero hardcoded commercial prices, zero PII in telemetry events.
 */
(function (global) {
  "use strict";

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

  async function initStatusSection(root) {
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
    var findMtoSku = driver.findMtoSku;
    var market = detectMarketSlug();

    var lookupForm = root.querySelector("[data-sv-status-lookup]");
    var reqInput = root.querySelector("[data-sv-req-input]");
    var cardEl = root.querySelector("[data-sv-status-card]");
    var badgeEl = root.querySelector("[data-sv-status-badge]");
    var reqHeadingEl = root.querySelector("[data-sv-card-req-id]");
    var slaEl = root.querySelector("[data-sv-card-sla]");
    var specEl = root.querySelector("[data-sv-card-spec]");

    var quoteBoxEl = root.querySelector("[data-sv-quote-box]");
    var localePriceEl = root.querySelector("[data-sv-locale-price]");
    var quoteTtlEl = root.querySelector("[data-sv-quote-ttl]");
    var expiredBoxEl = root.querySelector("[data-sv-expired-box]");

    var revisePanelEl = root.querySelector("[data-sv-revise-panel]");
    var reviseNoteEl = root.querySelector("[data-sv-revise-note]");
    var reviseBtn = root.querySelector("[data-sv-revise-btn]");
    var approveBtn = root.querySelector("[data-sv-approve-btn]");
    var approveLbl = root.querySelector("[data-sv-approve-label]");
    var resubmitBtn = root.querySelector("[data-sv-resubmit-btn]");
    var noticeEl = root.querySelector("[data-sv-status-notice]");
    var backStudioLink = root.querySelector("[data-sv-back-studio]");

    if (backStudioLink) {
      backStudioLink.href = "/" + market + "/pages/made-to-order";
    }

    var tracker = {
      reqId: "",
      state: "mto_status_idle",
      track: "02",
      sku: "SV_MTO_SKU_01",
      form: "base_fluted",
      finish: "surface_warm_glaze",
      spec: "pack_single_box",
      note: "",
      revisionCount: 0,
      maxRevisions: 1,
      slaLabel: "",
      approved: false,
      expired: false,
      localePrice: "",
      quoteTtlLabel: "",
      commitLockedUntil: 0
    };

    function showNotice(msg) {
      if (!noticeEl) return;
      if (msg) {
        noticeEl.textContent = msg;
        noticeEl.removeAttribute("hidden");
      } else {
        noticeEl.textContent = "";
        noticeEl.setAttribute("hidden", "");
      }
    }

    function renderTracker() {
      root.setAttribute("data-sv-state", tracker.state);
      if (!tracker.reqId) {
        cardEl.setAttribute("hidden", "");
        return;
      }

      cardEl.removeAttribute("hidden");
      reqHeadingEl.textContent = tracker.reqId;

      var skuObj = findMtoSku(tracker.sku);
      specEl.textContent = skuObj.title + " · " + tracker.form + " · " + tracker.finish + " · " + tracker.spec;

      if (tracker.slaLabel) {
        slaEl.textContent = "Reply window: " + tracker.slaLabel + " · Revisions used: " + tracker.revisionCount + "/" + tracker.maxRevisions;
      } else {
        slaEl.textContent = "Confirm every detail before you pay · Revisions used: " + tracker.revisionCount + "/" + tracker.maxRevisions;
      }

      // STRICT PRICE GATE (L5@v01 §4.1 #9 / §5 CHG-W05 / §8 V-06):
      // {{LOCALE_PRICE}} & {{QUOTE_TTL}} ONLY appear when approved === true && !expired && localePrice non-empty!
      var canShowPrice = Boolean(tracker.approved && !tracker.expired && tracker.localePrice);
      if (canShowPrice) {
        badgeEl.textContent = "Quote Approved";
        localePriceEl.textContent = tracker.localePrice;
        quoteTtlEl.textContent = tracker.quoteTtlLabel ? ("Quote validity: " + tracker.quoteTtlLabel) : "Quote unlocked via Magic Link";
        quoteBoxEl.removeAttribute("hidden");
        expiredBoxEl.setAttribute("hidden", "");
        approveBtn.removeAttribute("hidden");
        approveBtn.disabled = false;
        resubmitBtn.setAttribute("hidden", "");
      } else if (tracker.expired) {
        badgeEl.textContent = "Quote Expired";
        localePriceEl.textContent = "";
        quoteTtlEl.textContent = "";
        quoteBoxEl.setAttribute("hidden", "");
        expiredBoxEl.removeAttribute("hidden");
        approveBtn.removeAttribute("hidden");
        approveBtn.disabled = true;
        resubmitBtn.removeAttribute("hidden");
      } else {
        badgeEl.textContent = tracker.revisionCount > 0 ? "Revision In Review" : "Request In Review";
        localePriceEl.textContent = "";
        quoteTtlEl.textContent = "";
        quoteBoxEl.setAttribute("hidden", "");
        expiredBoxEl.setAttribute("hidden", "");
        approveBtn.setAttribute("hidden", "");
        approveBtn.disabled = true;
        resubmitBtn.setAttribute("hidden", "");
      }

      if (revisePanelEl) {
        if (tracker.expired) revisePanelEl.setAttribute("hidden", "");
        else revisePanelEl.removeAttribute("hidden");
      }
    }

    function applyStatusData(data) {
      if (!data || !data.reqId) {
        tracker.reqId = "";
        tracker.state = "mto_status_idle";
        renderTracker();
        return;
      }
      tracker.reqId = String(data.reqId);
      if (reqInput) reqInput.value = tracker.reqId;
      if (data.track) tracker.track = String(data.track);
      if (data.sku) tracker.sku = String(data.sku);
      if (data.form) tracker.form = String(data.form);
      if (data.finish) tracker.finish = String(data.finish);
      if (data.spec) tracker.spec = String(data.spec);
      if (typeof data.revisionCount === "number") tracker.revisionCount = data.revisionCount;
      if (data.policy && typeof data.policy.maxRevisions === "number") {
        tracker.maxRevisions = data.policy.maxRevisions;
      } else if (typeof data.maxRevisions === "number") {
        tracker.maxRevisions = data.maxRevisions;
      }
      if (data.slaLabel || data.slaCustom) {
        tracker.slaLabel = String(data.slaLabel || data.slaCustom);
      }

      var expiresAt = (data.quote && data.quote.expiresAt) || data.quoteExpiresAt || "";
      var isExpired = data.state === "expired" || data.expired === true ||
        (expiresAt && !isNaN(Date.parse(expiresAt)) && Date.now() > Date.parse(expiresAt));

      var pQuote = data.pricingQuote || data.quote || {};
      var priceStr = (pQuote && pQuote.localePrice) || data.localePrice || "";
      var isApproved = (data.state === "approved" || Boolean(pQuote.unlocked)) && !isExpired && Boolean(priceStr);

      tracker.expired = Boolean(isExpired);
      tracker.approved = Boolean(isApproved);
      tracker.localePrice = isApproved ? String(priceStr) : "";
      tracker.quoteTtlLabel = isApproved
        ? String(data.quoteTtl || (pQuote.ttlHours ? (pQuote.ttlHours + "h window") : ""))
        : "";

      if (tracker.expired) {
        tracker.state = "quote_expired";
        driver.emitEvent("mto.expired", { reqId: tracker.reqId, market: market });
      } else if (tracker.approved) {
        tracker.state = "quote_approved_magic_link";
        driver.emitEvent("mto.approved", { reqId: tracker.reqId, market: market });
      } else {
        tracker.state = "mto_status_tracking";
      }

      renderTracker();
    }

    async function loadRequestStatus(reqId) {
      var cleanId = String(reqId || "").trim();
      if (!cleanId || cleanId === "undefined" || cleanId === "null") {
        tracker.reqId = "";
        renderTracker();
        return;
      }
      showNotice("");

      if (global.SpaceVanta && global.SpaceVanta.api && global.SpaceVanta.api.url("mto", "status")) {
        var remote = await global.SpaceVanta.api.get("mto", "status", { reqId: cleanId, market: market }, { ttl: 0 });
        if (remote && remote.reqId) {
          applyStatusData(remote);
          return;
        }
      }

      // Check local Remember storage if Worker endpoint is unconfigured
      var rem = driver.loadMtoRemember();
      if (rem && rem.reqId === cleanId) {
        applyStatusData(rem);
      } else {
        applyStatusData({
          reqId: cleanId,
          state: "in_review",
          revisionCount: 0,
          maxRevisions: 1
        });
      }
    }

    if (lookupForm) {
      lookupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        loadRequestStatus(reqInput ? reqInput.value : "");
      });
    }

    root.addEventListener("click", async function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-action]") : null;
      if (!btn) return;
      var act = btn.getAttribute("data-action");

      if (act === "status-revise") {
        // CHG-W04: Single complimentary revision hard cap = 1; 2nd attempt strictly blocked!
        if (tracker.revisionCount >= tracker.maxRevisions) {
          showNotice("Complimentary revision allowance reached (" + tracker.maxRevisions + "/" + tracker.maxRevisions + ") — second revision blocked (409).");
          return;
        }

        var noteText = (reviseNoteEl && reviseNoteEl.value) ? reviseNoteEl.value.trim() : "";
        if (global.SpaceVanta && global.SpaceVanta.api && global.SpaceVanta.api.url("mto", tracker.reqId + "/revise")) {
          var revRes = await global.SpaceVanta.api.post("mto", tracker.reqId + "/revise", {
            reqId: tracker.reqId,
            note: noteText
          });
          if (revRes.status === 409) {
            tracker.revisionCount = tracker.maxRevisions;
            showNotice("Complimentary revision allowance reached — second revision blocked (409).");
            renderTracker();
            return;
          }
          if (!revRes.ok) {
            showNotice("Connection timed out while submitting revision — your notes are preserved.");
            return;
          }
        }

        // 1st revision succeeds & immediately invalidates any prior Magic Link quote!
        tracker.revisionCount += 1;
        tracker.approved = false;
        tracker.localePrice = "";
        tracker.quoteTtlLabel = "";
        tracker.state = "mto_status_tracking";
        if (noteText) tracker.note = noteText;

        driver.saveMtoRemember({
          reqId: tracker.reqId,
          track: tracker.track,
          sku: tracker.sku,
          form: tracker.form,
          finish: tracker.finish,
          spec: tracker.spec,
          market: market,
          revisionCount: tracker.revisionCount
        });

        driver.emitEvent("mto.revised", {
          reqId: tracker.reqId,
          revisionCount: tracker.revisionCount,
          market: market
        });

        showNotice("Revision 1/" + tracker.maxRevisions + " submitted — prior quote link invalidated pending studio review.");
        renderTracker();
        return;
      }

      if (act === "status-approve-cart") {
        if (!tracker.approved || tracker.expired) return;
        if (Date.now() < tracker.commitLockedUntil) {
          showNotice("Already added to bag — duplicate click ignored.");
          return;
        }
        tracker.commitLockedUntil = Date.now() + 2500;
        approveBtn.setAttribute("data-submitting", "true");
        var aura = approveBtn.querySelector("[data-sv-seam-aura]");
        if (aura) aura.removeAttribute("hidden");
        if (approveLbl) approveLbl.textContent = "Added to Cart ✓";
        showNotice("Approved custom piece added to your shopping bag.");
        return;
      }

      if (act === "status-resubmit") {
        var studioUrl = driver.buildMtoMotherUrl({
          track: tracker.track || "02",
          sku: tracker.sku,
          form: tracker.form,
          finish: tracker.finish,
          spec: tracker.spec,
          note: tracker.note
        });
        global.location.assign(studioUrl);
      }
    });

    // Listen to Worker data events (including Magic Link approved / expired injection)
    global.addEventListener("sv:data", function (e) {
      var d = e && e.detail ? (e.detail.data || e.detail) : null;
      if (!d) return;
      if (d.shipping && d.shipping.duty && d.shipping.leadtime && (d.bundle || d.shipping).threshold) {
        var trustBar = root.querySelector('[data-sv-slot="mto-status-trust"]');
        if (trustBar) {
          root.querySelector('[data-sv-field="duty"]').textContent = d.shipping.duty;
          root.querySelector('[data-sv-field="leadtime"]').textContent = d.shipping.leadtime;
          root.querySelector('[data-sv-field="threshold"]').textContent = (d.bundle || d.shipping).threshold;
          trustBar.removeAttribute("hidden");
        }
      }
      if (d.mtoStatus || d.reqId) {
        applyStatusData(d.mtoStatus || d);
      }
    });

    // Auto-hydrate from URL ?reqId= or Remember storage
    var urlReqId = "";
    try {
      var sp = new URLSearchParams(global.location.search || "");
      urlReqId = sp.get("reqId") || "";
    } catch (_e) {}

    if (urlReqId) {
      loadRequestStatus(urlReqId);
    } else {
      var saved = driver.loadMtoRemember();
      if (saved && saved.reqId) {
        loadRequestStatus(saved.reqId);
      }
    }
  }

  function boot() {
    document.querySelectorAll("#sv-mto-status-page, .sv-ms[data-sv-role='mto_status']").forEach(initStatusSection);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window);
