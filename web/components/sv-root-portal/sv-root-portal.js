/**
 * SpaceVanta RootModalPortal (L5@v01)
 * Mounts overlay slots (P1..P4) as direct children of <body> to physically
 * isolate them from ancestor clip-path / 3D transform stacking contexts.
 * Guarantees mutual exclusion, background `inert`, Esc/backdrop/[X] close,
 * and exact keyboard focus restoration to the original trigger anchor (A1..A4).
 */
(function (global) {
  'use strict';

  function createRootPortal(options) {
    var opts = options || {};
    var onOpen = typeof opts.onOpen === 'function' ? opts.onOpen : function () {};
    var onClose = typeof opts.onClose === 'function' ? opts.onClose : function () {};

    var host = document.getElementById('sv-root-portal');
    if (!host) {
      host = document.createElement('div');
      host.id = 'sv-root-portal';
      host.className = 'sv-root-portal';
      host.setAttribute('data-open', 'false');

      var backdrop = document.createElement('div');
      backdrop.className = 'sv-root-portal__backdrop';
      backdrop.setAttribute('data-portal-backdrop', 'true');
      backdrop.setAttribute('aria-hidden', 'true');
      host.appendChild(backdrop);

      document.body.appendChild(host);
    }

    var backdropEl = host.querySelector('[data-portal-backdrop="true"]');
    var slots = Object.create(null);
    var activeSlotId = null;
    var returnFocusEl = null;
    var inertNodes = [];

    function setBackgroundInert(enable) {
      var children = Array.prototype.slice.call(document.body.children);
      if (enable) {
        inertNodes = [];
        for (var i = 0; i < children.length; i++) {
          var node = children[i];
          if (node === host || node.tagName === 'SCRIPT' || node.tagName === 'STYLE') {
            continue;
          }
          if (!node.hasAttribute('inert')) {
            node.setAttribute('inert', '');
            inertNodes.push(node);
          }
        }
      } else {
        for (var j = 0; j < inertNodes.length; j++) {
          inertNodes[j].removeAttribute('inert');
        }
        inertNodes = [];
      }
    }

    function registerSlot(slotId, el) {
      if (!slotId || !el) return;
      el.classList.add('sv-root-portal__slot');
      el.setAttribute('data-portal-slot', slotId);
      el.setAttribute('hidden', '');
      host.appendChild(el);
      slots[slotId] = el;
    }

    function getFocusable(container) {
      if (!container) return [];
      var list = container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      return Array.prototype.filter.call(list, function (el) {
        return !el.hidden && el.offsetParent !== null;
      });
    }

    function open(slotId, triggerEl, extraOpts) {
      var target = slots[slotId];
      if (!target) return false;

      var preserveOrigin = extraOpts && extraOpts.preserveReturnFocus;
      var prevSlot = activeSlotId;

      if (prevSlot && prevSlot !== slotId && slots[prevSlot]) {
        slots[prevSlot].setAttribute('hidden', '');
      }

      if (!preserveOrigin) {
        returnFocusEl = triggerEl || document.activeElement;
      } else if (!returnFocusEl && triggerEl) {
        returnFocusEl = triggerEl;
      }

      activeSlotId = slotId;
      target.removeAttribute('hidden');
      host.setAttribute('data-open', 'true');
      host.setAttribute('data-active-slot', slotId);
      if (!prevSlot) {
        setBackgroundInert(true);
      }

      var focusables = getFocusable(target);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        target.setAttribute('tabindex', '-1');
        target.focus();
      }

      onOpen(slotId, prevSlot);
      return true;
    }

    function close(reason) {
      if (!activeSlotId) return false;
      var closedSlot = activeSlotId;
      var el = slots[closedSlot];
      if (el) {
        el.setAttribute('hidden', '');
      }
      activeSlotId = null;
      host.setAttribute('data-open', 'false');
      host.removeAttribute('data-active-slot');
      setBackgroundInert(false);

      var anchor = returnFocusEl;
      returnFocusEl = null;

      onClose(closedSlot, reason || 'close');

      if (anchor && typeof anchor.focus === 'function' && document.contains(anchor)) {
        // If trigger anchor is hidden (e.g. viewport resized), fall back to visible header anchor
        if (anchor.offsetParent !== null) {
          anchor.focus();
        } else {
          var fallbackAnchor = document.querySelector('[data-sv-anchor="A2"]:not([hidden]), [data-sv-anchor="A4"]');
          if (fallbackAnchor && fallbackAnchor.offsetParent !== null) {
            fallbackAnchor.focus();
          }
        }
      }
      return true;
    }

    function onKeyDown(e) {
      if (!activeSlotId) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        close('escape');
        return;
      }
      if (e.key === 'Tab') {
        var activeEl = slots[activeSlotId];
        var focusables = getFocusable(activeEl);
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
    }

    if (backdropEl) {
      backdropEl.addEventListener('click', function () {
        close('backdrop');
      });
    }

    host.addEventListener('click', function (e) {
      var closeBtn = e.target && e.target.closest ? e.target.closest('[data-portal-close]') : null;
      if (closeBtn) {
        e.preventDefault();
        close('close_button');
      }
    });

    document.addEventListener('keydown', onKeyDown);

    return {
      host: host,
      registerSlot: registerSlot,
      open: open,
      close: close,
      getActiveSlot: function () {
        return activeSlotId;
      },
      destroy: function () {
        document.removeEventListener('keydown', onKeyDown);
        setBackgroundInert(false);
      }
    };
  }

  global.SVRootPortal = {
    create: createRootPortal
  };
})(window);
