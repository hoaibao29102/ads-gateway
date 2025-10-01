import { get } from "@vercel/edge-config";
export default async function handler(_req, res) {
  const ACTIVE = await get("ACTIVE");
  const LINKS = await get("LINKS");
  res.status(200).json({ ACTIVE, LINKS });
}
