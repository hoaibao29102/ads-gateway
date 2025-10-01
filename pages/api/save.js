export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // auth đơn giản
  const pass = req.headers["x-admin-pass"];
  if (pass !== process.env.ADMIN_PASS) {
    return res.status(401).json({ ok: false, msg: "unauthorized (wrong ADMIN_PASS)" });
  }

  // body: { hosts: { ... } }
  const body = req.body || {};
  if (!body.hosts || typeof body.hosts !== "object") {
    return res.status(400).json({ ok: false, msg: "invalid payload: missing hosts" });
  }

  // gọi Edge Config API (endpoint CHUẨN)
  const url = `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${process.env.EDGE_CONFIG_RW_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ operation: "upsert", key: "hosts", value: body.hosts }]
    }),
  });

  const text = await r.text(); // đọc thông điệp lỗi
  if (!r.ok) {
    console.error("Edge Config update failed:", r.status, text);
    return res.status(500).json({ ok: false, status: r.status, msg: text });
  }
  return res.status(200).json({ ok: true });
}
