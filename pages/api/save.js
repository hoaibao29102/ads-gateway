// Ghi cập nhật vào key "hosts" trong Edge Config
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // Bảo vệ bằng mật khẩu đơn giản
  if (req.headers["x-admin-pass"] !== process.env.ADMIN_PASS) {
    return res.status(401).json({ ok: false, msg: "unauthorized" });
  }

  // Body kỳ vọng dạng: { hosts: { "ad1.com": {...}, "ad2.com": {...} } }
  const body = req.body || {};
  if (!body.hosts || typeof body.hosts !== "object") {
    return res.status(400).json({ ok: false, msg: "invalid payload: missing hosts" });
  }

  // PATCH lên Edge Config: upsert key "hosts"
  const resp = await fetch(
    `https://api.vercel.com/v1/edge-config/ITEMS?edgeConfigId=${process.env.EDGE_CONFIG_ID}`,
    {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${process.env.EDGE_CONFIG_RW_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: [
          { operation: "upsert", key: "hosts", value: body.hosts }
        ]
      })
    }
  );

  return res.status(resp.ok ? 200 : 500).json({ ok: resp.ok });
}
