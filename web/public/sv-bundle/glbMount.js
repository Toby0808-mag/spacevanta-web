/**
 * SpaceVanta Bounded GLB Loader (L5@v02 §6 · V-P5 <= 300MB guard)
 * Zero bare hex values. Enforces Content-Length & byteLength <= 300MB before GLTFLoader.parse.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

var GLB_MAX_BYTES = 300 * 1024 * 1024;

function parseLength(header) {
  if (!header) return null;
  var n = Number(header);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

async function loadGlbBounded(url, signal) {
  if (!url) return { ok: false, reason: "no_url" };
  try {
    var res = await fetch(url, { signal: signal, credentials: "same-origin" });
    if (!res.ok) {
      return { ok: false, reason: "http_" + res.status };
    }
    var declared = parseLength(res.headers.get("content-length"));
    if (declared != null && declared > GLB_MAX_BYTES) {
      return { ok: false, reason: "oversize_header", bytes: declared };
    }
    var buf = await res.arrayBuffer();
    if (buf.byteLength > GLB_MAX_BYTES) {
      return { ok: false, reason: "oversize_body", bytes: buf.byteLength };
    }
    var loader = new GLTFLoader();
    var gltf = await new Promise(function (resolve, reject) {
      loader.parse(
        buf,
        url.replace(/[^/]+$/, ""),
        function (g) { resolve(g); },
        function (err) { reject(err); }
      );
    });
    var root = new THREE.Group();
    root.name = "sv_glb_hot_root";
    root.add(gltf.scene);
    root.traverse(function (node) {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    root.userData.svGlbBytes = buf.byteLength;
    root.userData.svGlbUrl = url;
    root.userData.svAnimations = Array.isArray(gltf.animations) ? gltf.animations.map(function (a) { return a.name; }) : [];
    return { ok: true, root: root, bytes: buf.byteLength, url: url, animations: root.userData.svAnimations };
  } catch (e) {
    if (signal && signal.aborted) return { ok: false, reason: "aborted" };
    return {
      ok: false,
      reason: "parse_failed",
      detail: e instanceof Error ? e.message : "glb_load_failed"
    };
  }
}

function pickHotGlbUrl(childPkg, manifestChild) {
  if (childPkg && childPkg.hotGlb) {
    var g = childPkg.hotGlb;
    if (typeof g === "string") return g;
    if (g.lod0 || g.lod1 || g.lod2) return g.lod0 || g.lod1 || g.lod2;
  }
  if (manifestChild && manifestChild.glb) {
    return manifestChild.glb;
  }
  return "child/lod0/Child_Tray.glb";
}

function resolveGlbUrl(base, rel) {
  if (!rel) return null;
  if (/^https?:\/\//i.test(rel) || rel.indexOf("/") === 0) {
    return base && rel.indexOf("/") !== 0 ? rel : (rel.indexOf("/") === 0 ? rel : rel);
  }
  var b = String(base || "").replace(/\/$/, "");
  if (!b) return null;
  var r = String(rel).replace(/^\//, "");
  return b + "/" + r;
}

export {
  GLB_MAX_BYTES,
  loadGlbBounded,
  pickHotGlbUrl,
  resolveGlbUrl
};
