import { get } from "@vercel/edge-config";

export default async function handler(_req, res) {
  const cfg = (await get()) || { hosts: {} };
  res.status(200).json(cfg);
}
