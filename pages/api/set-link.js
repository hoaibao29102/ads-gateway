export default async function handler(req, res) {
  const { key, url } = req.query;          // ví dụ ?key=C&url=https://example.com/c
  const pass = req.headers["x-auth"];
  if (!key || !url || pass !== process.env.SWITCH_TOKEN) {
    return res.status(401).json({ ok: false, msg: "unauthorized" });
  }

  // Lấy LINKS hiện tại
  const getLinks = await fetch(`https://api.vercel.com/v1/edge-config/ITEMS?edgeConfigId=${process.env.EDGE_CONFIG_ID}&key=LINKS`, {
    headers: { "Authorization": `Bearer ${process.env.EDGE_CONFIG_RW_TOKEN}` }
  });
  const data = await getLinks.json();
  const current = (data.items && data.items[0] && data.items[0].value) || {};

  // Cập nhật
  current[key] = url;

  // Upsert LINKS
  const r = await fetch(`https://api.vercel.com/v1/edge-config/ITEMS?edgeConfigId=${process.env.EDGE_CONFIG_ID}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${process.env.EDGE_CONFIG_RW_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ items: [{ operation: "upsert", key: "LINKS", value: current }] })
  });

  return res.status(r.ok ? 200 : 500).json({ ok: r.ok });
}
