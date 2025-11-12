import crypto from "crypto";

export default async function handler(req, res) {
  const targetUrl = req.query.url;
  const sig = req.query.sig;
  const secret = process.env.SIGN_SECRET || "default_secret";

  if (!targetUrl) return res.status(400).send("URL parametresi eksik.");

  // ✅ İmza kontrolü
  const expectedSig = crypto
    .createHash("sha256")
    .update(targetUrl + secret)
    .digest("hex");

  if (expectedSig !== sig) {
    return res.status(401).send("Yetkisiz erişim – geçersiz imza.");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "Referer": "https://trgoalsgiris.xyz/",
        "Origin": "https://trgoalsgiris.xyz/",
        "User-Agent": req.headers["user-agent"] || "ExoPlayer",
      },
    });

    if (!response.ok) {
      return res.status(response.status).send("Yayın yüklenemedi veya erişim reddedildi.");
    }

    // 🔸 ExoPlayer için gerekli header ayarları
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

    // İçerik türünü doğru şekilde kopyala
    const contentType = response.headers.get("content-type") || "application/vnd.apple.mpegurl";
    res.setHeader("Content-Type", contentType);

    // 🔹 Yayını stream et
    const body = await response.text();
    res.send(body);
  } catch (e) {
    console.error("Proxy hatası:", e);
    res.status(500).send("Bağlantı hatası veya yayın bulunamadı.");
  }
}
