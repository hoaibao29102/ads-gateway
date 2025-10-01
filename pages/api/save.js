export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (req.headers["x-admin-pass"] !== process.env.ADMIN_PASS) {
    return res.status(401).json({ ok: false });
  }

  // Ghi đè toàn bộ JSON root (vì Edge Config UI tối giản)
  const payload = req.body;

  const r = await fetch(
    `https://api.vercel.com/v1/edge-config/ITEMS?edgeConfigId=${process.env.EDGE_CONFIG_ID}`,
    {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${process.env.EDGE_CONFIG_RW_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: [{ operation: "upsert", key: "", value: payload }]
      })
    }
  );

  res.status(r.ok ? 200 : 500).json({ ok: r.ok });
}
