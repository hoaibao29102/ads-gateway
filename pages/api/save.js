// pages/api/save.js
import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, msg: "Method not allowed" });
    }

    const body = await req.json?.() || req.body;
    const { hosts } = body;

    if (!hosts || typeof hosts !== "object") {
      return res.status(400).json({ ok: false, msg: "Invalid data" });
    }

    await kv.set("hosts", JSON.stringify(hosts));
    return res.status(200).json({ ok: true, msg: "Saved to KV" });

  } catch (err) {
    console.error("Save failed", err);
    res.status(500).json({ ok: false, msg: err.message });
  }
}
