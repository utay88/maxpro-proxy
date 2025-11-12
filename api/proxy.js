import crypto from "crypto";

export const config = { runtime: "edge" };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  const sig = searchParams.get("sig");
  const secret = process.env.SIGN_SECRET || "default_secret";

  if (!targetUrl) {
    return new Response("URL parametresi eksik.", { status: 400 });
  }

  const expectedSig = crypto
    .createHash("sha256")
    .update(targetUrl + secret)
    .digest("hex");

  if (expectedSig !== sig) {
    return new Response("Yetkisiz erişim – geçersiz imza.", { status: 401 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "Referer": "https://trgoalsgiris.xyz/",
        "Origin": "https://trgoalsgiris.xyz/",
        "User-Agent": "ExoPlayer/2.19.1 (Linux;Android 11)",
      },
    });

    if (!response.ok) {
      return new Response("Yayın yüklenemedi veya erişim reddedildi.", {
        status: response.status,
      });
    }

    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Headers", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    newHeaders.set("Content-Type", "application/vnd.apple.mpegurl");

    const body = await response.text();
    return new Response(body, { status: 200, headers: newHeaders });
  } catch (err) {
    return new Response("Bağlantı hatası veya yayın bulunamadı.", {
      status: 500,
    });
  }
}
