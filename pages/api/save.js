export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const body = req.body || {};
  if (!body.hosts || typeof body.hosts !== "object") {
    return res.status(400).json({ ok:false, msg:"invalid payload" });
  }

  const base = `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`;
  const url  = process.env.VERCEL_TEAM_ID ? `${base}?teamId=${process.env.VERCEL_TEAM_ID}` : base;

  const r = await fetch(url, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${process.env.VERCEL_API_TOKEN}`, // <-- phải là Vercel API Token
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: [{ operation:"upsert", key:"hosts", value: body.hosts }]
    })
  });

  const text = await r.text();
  if (!r.ok) return res.status(500).json({ ok:false, status:r.status, msg:text });
  return res.status(200).json({ ok:true });
}
