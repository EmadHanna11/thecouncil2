/* Cookie-authenticated friends API; no account emails are exposed. */
(() => {
  async function request(body) {
    const response = await fetch("/api/friends", {
      method: body ? "POST" : "GET", credentials: "same-origin", cache: "no-store",
      ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(data.message || "Friends could not be loaded."), { code: data.code, status: response.status });
    return data;
  }
  window.COUNCIL_FRIENDS = {
    load: () => request(),
    send: code => request({ action: "request", code }),
    accept: id => request({ action: "accept", id }),
    decline: id => request({ action: "decline", id }),
    cancel: id => request({ action: "cancel", id }),
    remove: id => request({ action: "remove", id }),
    block: id => request({ action: "block", id }),
    unblock: id => request({ action: "unblock", id })
  };
})();
