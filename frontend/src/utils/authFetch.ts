export async function authFetch(path: string, opts: RequestInit = {}) {
  const base = (import.meta as any).env?.VITE_API_URL || '';
  const url = base + path;
  const defaultOpts: RequestInit = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const finalOpts: RequestInit = Object.assign({}, defaultOpts, opts);
  if (finalOpts.body && typeof finalOpts.body === 'object')
    finalOpts.body = JSON.stringify(finalOpts.body as any);

  const res = await fetch(url, finalOpts);
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
  if (!res.ok) throw { status: res.status, body: json ?? text };
  return json;
}

export async function postJson(path: string, body: object) {
  return authFetch(path, { method: 'POST', body: body as any });
}
