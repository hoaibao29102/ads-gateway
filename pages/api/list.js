import { get } from "@vercel/edge-config";

export default async function handler(_req, res) {
  const hosts = (await get("hosts")) || {};
  res.status(200).json({ hosts });
}
