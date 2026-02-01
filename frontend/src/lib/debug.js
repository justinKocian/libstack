export function isDebugEnabled() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "1") return true;
    return localStorage.getItem("debug") === "1";
  } catch {
    return false;
  }
}

export function persistDebug(debug) {
  try {
    localStorage.setItem("debug", debug ? "1" : "0");
  } catch {
    // ignore
  }
}

export function logDebug(enabled, label, obj) {
  if (!enabled) return;
  console.groupCollapsed(`[debug] ${label}`);
  if (obj !== undefined) console.log(obj);
  console.groupEnd();
}
