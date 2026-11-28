/**
 * SpaceVanta Cold->Hot Promote 6-State Machine (L5@v02 §4.2 · S0..S5)
 * - S0_COLD_IDLE (0 WebGL, 0 GLB)
 * - S1_PROMOTE_ARM (<= 80ms, scale(1.02) + left 2px seam)
 * - S2_CROSSFADE (240ms tilt 90 deg -> 3/4; 0ms under ?sv_motion=off)
 * - S3_HOT_LIVE_PREVIEW (read-only 3D preview reusing persistent Hot Canvas)
 * - S4_DEMOTE (120ms, Esc restores focus to originating Cold card)
 * - S5_COLD_PARK (60s idle explicit 3-part dispose(), geometries back to baseline +-2)
 */

var DEFAULT_PROMOTE_TIMING = {
  s1MaxMs: 80,
  s2Ms: 240,
  s4Ms: 120,
  s5ParkIdleMs: 60000,
  motionOff: false
};

function s2DurationMs(timing) {
  var t = timing || DEFAULT_PROMOTE_TIMING;
  return t.motionOff ? 0 : t.s2Ms;
}

function s4DurationMs(timing) {
  var t = timing || DEFAULT_PROMOTE_TIMING;
  return t.motionOff ? 0 : t.s4Ms;
}

function reducePromote(state, event) {
  var type = event && event.type;
  switch (type) {
    case "ARM":
      if (state === "S0_COLD_IDLE" || state === "S5_COLD_PARK" || state === "S4_DEMOTE") {
        return "S1_PROMOTE_ARM";
      }
      return state;
    case "START_CROSSFADE":
      if (state === "S1_PROMOTE_ARM") return "S2_CROSSFADE";
      return state;
    case "CROSSFADE_DONE":
      if (state === "S1_PROMOTE_ARM" || state === "S2_CROSSFADE") {
        return "S3_HOT_LIVE_PREVIEW";
      }
      return state;
    case "LOD_FAIL":
      return "promote_vp5_poster";
    case "ESC":
    case "CLOSE":
      if (
        state === "S1_PROMOTE_ARM" ||
        state === "S2_CROSSFADE" ||
        state === "S3_HOT_LIVE_PREVIEW" ||
        state === "promote_vp5_poster"
      ) {
        return "S4_DEMOTE";
      }
      return state;
    case "DEMOTE_DONE":
      if (state === "S4_DEMOTE") return "S0_COLD_IDLE";
      return state;
    case "PARK":
      return "S5_COLD_PARK";
    case "RESET":
      return "S0_COLD_IDLE";
    default:
      return state;
  }
}

function shouldDisposeAfter(state) {
  return state === "S5_COLD_PARK";
}

export {
  DEFAULT_PROMOTE_TIMING,
  reducePromote,
  s2DurationMs,
  s4DurationMs,
  shouldDisposeAfter
};
