export default async function handler(req, res) {
  const to = req.query.to;                  // "A" | "B" | "C" | "D" ...
  const pass = req.headers["x-auth"];

  if (!to || pass !== process.env.SWITCH_TOKEN) {
    return res.status(401).json({ ok: false, msg: "unauthorized" });
  }

  const r = await fetch(`https://api.vercel.com/v1/edge-config/ITEMS?edgeConfigId=${process.env.EDGE_CONFIG_ID}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${process.env.EDGE_CONFIG_RW_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ items: [{ operation: "upsert", key: "ACTIVE", value: to }] })
  });

  return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
}
