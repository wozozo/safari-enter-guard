(() => {
  "use strict";

  const SUPPRESS_AFTER_COMPOSITION_MS = 700;
  const BLOCK_RELATED_EVENTS_MS = 700;
  const ENTER_KEYS = new Set(["Enter", "NumpadEnter"]);

  const targetStates = new WeakMap();
  const formBlockUntil = new WeakMap();
  const fallbackState = createState();

  function createState() {
    return {
      composing: false,
      suppressNextEnter: false,
      lastCompositionEnd: 0,
      blockRelatedEventsUntil: 0
    };
  }

  function now() {
    return Date.now();
  }

  function isEnter(event) {
    return ENTER_KEYS.has(event.key) || event.code === "Enter" || event.code === "NumpadEnter";
  }

  function editableHost(target) {
    if (!target || typeof target !== "object") {
      return document.documentElement || document;
    }

    let node = target.nodeType === Node.TEXT_NODE ? target.parentElement : target;

    if (!(node instanceof Element)) {
      return document.documentElement || document;
    }

    if (node.matches("input, textarea")) {
      return node;
    }

    const roleTextbox = node.closest("[role='textbox']");

    if (roleTextbox) {
      return roleTextbox;
    }

    if (node instanceof HTMLElement && node.isContentEditable) {
      let host = node;
      let parent = host.parentElement;

      while (parent instanceof HTMLElement && parent.isContentEditable) {
        host = parent;
        parent = parent.parentElement;
      }

      return host;
    }

    return target.nodeType === Node.TEXT_NODE ? target.parentElement : target;
  }

  function stateFor(target) {
    const host = editableHost(target);

    if (!host || typeof host !== "object") {
      return fallbackState;
    }

    let state = targetStates.get(host);

    if (!state) {
      state = createState();
      targetStates.set(host, state);
    }

    return state;
  }

  function containingForm(target) {
    const host = editableHost(target);

    if (!host || !(host instanceof Element)) {
      return null;
    }

    if ("form" in host && host.form instanceof HTMLFormElement) {
      return host.form;
    }

    return host.closest("form");
  }

  function blockEvent(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  function markRelatedEventsBlocked(target, timestamp) {
    const state = stateFor(target);
    state.blockRelatedEventsUntil = timestamp + BLOCK_RELATED_EVENTS_MS;

    const form = containingForm(target);

    if (form) {
      formBlockUntil.set(form, state.blockRelatedEventsUntil);
    }
  }

  function shouldBlockEnter(event, state, timestamp) {
    if (!isEnter(event)) {
      return false;
    }

    if (event.isComposing || event.keyCode === 229 || event.which === 229 || state.composing) {
      return true;
    }

    return state.suppressNextEnter && timestamp - state.lastCompositionEnd <= SUPPRESS_AFTER_COMPOSITION_MS;
  }

  function onCompositionStart(event) {
    const state = stateFor(event.target);
    state.composing = true;
    state.suppressNextEnter = false;
  }

  function onCompositionEnd(event) {
    const state = stateFor(event.target);
    state.composing = false;
    state.suppressNextEnter = true;
    state.lastCompositionEnd = now();
  }

  function onKeyDown(event) {
    const timestamp = now();
    const state = stateFor(event.target);

    if (!shouldBlockEnter(event, state, timestamp)) {
      return;
    }

    state.suppressNextEnter = false;
    markRelatedEventsBlocked(event.target, timestamp);
    blockEvent(event);
  }

  function onRelatedKeyEvent(event) {
    if (!isEnter(event)) {
      return;
    }

    const timestamp = now();
    const state = stateFor(event.target);

    if (timestamp > state.blockRelatedEventsUntil) {
      return;
    }

    if (event.type === "keyup") {
      state.blockRelatedEventsUntil = 0;
    }

    blockEvent(event);
  }

  function onSubmit(event) {
    const timestamp = now();
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    const blockedUntil = form ? formBlockUntil.get(form) || 0 : 0;
    const activeState = stateFor(document.activeElement);

    if (timestamp <= blockedUntil || timestamp <= activeState.blockRelatedEventsUntil) {
      blockEvent(event);
    }
  }

  document.addEventListener("compositionstart", onCompositionStart, true);
  document.addEventListener("compositionend", onCompositionEnd, true);
  document.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("keypress", onRelatedKeyEvent, true);
  document.addEventListener("keyup", onRelatedKeyEvent, true);
  document.addEventListener("submit", onSubmit, true);
})();
