import crypto from "crypto";

const SIGN_SECRET = process.env.SIGN_SECRET || "secret_987654321"; // Vercel’deki gizli anahtar

// URL + SIGN_SECRET ile imza doğrulama
function verifySig(targetUrl, sig) {
  if (!sig) return false;
  const h = crypto.createHmac("sha256", SIGN_SECRET).update(targetUrl).digest("hex");
  return h === sig;
}

export default async function handler(req, res) {
  const targetUrl = req.query.url;
  const sig = req.query.sig; // ?url=...&sig=...

  if (!targetUrl) return res.status(400).send("URL parametresi eksik.");

  // 🔒 İmza kontrolü
  if (!verifySig(targetUrl, sig)) {
    return res.status(401).send("Geçersiz imza veya erişim yetkisi yok.");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "Referer": "https://trgoalsgiris.xyz/",
        "Origin": "https://trgoalsgiris.xyz/",
      },
    });

    if (!response.ok) {
      return res.status(response.status).send("Yayın yüklenemedi veya erişim reddedildi.");
    }

    // Gerekli header’lar
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/vnd.apple.mpegurl");

    const data = await response.arrayBuffer();
    res.send(Buffer.from(data));
  } catch (e) {
    console.error("Proxy hatası:", e);
    res.status(500).send("Bağlantı hatası veya yayın bulunamadı.");
  }
}
