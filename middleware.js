import { get } from "@vercel/edge-config";

export const config = { matcher: "/:path*" };

export default async function middleware() {
  // Đọc cấu hình từ Edge Config
  const active = (await get("ACTIVE")) || "A";
  const links = (await get("LINKS")) || {};

  // Lấy URL theo key ACTIVE; nếu thiếu thì lấy phần tử đầu tiên trong LINKS
  let url = links[active];
  if (!url) {
    const first = Object.values(links)[0];
    url = first || "https://example.com"; // fallback cuối cùng nếu LINKS rỗng
  }

  return Response.redirect(url, 302);
}
