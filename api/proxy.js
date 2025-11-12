import crypto from "crypto";

export default async function handler(req, res) {
  const targetUrl = req.query.url;
  const sig = req.query.sig;
  const exp = req.query.exp;
  const SECRET = process.env.SIGN_SECRET; // Vercel'de gizli anahtar olacak

  if (!targetUrl || !sig || !exp)
    return res.status(400).send("Eksik parametre.");

  if (Date.now() > Number(exp) * 1000)
    return res.status(403).send("İmza süresi dolmuş.");

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(`${targetUrl}|${exp}`)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig)))
    return res.status(403).send("Geçersiz imza.");

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "Referer": "https://trgoalsgiris.xyz/",
        "Origin": "https://trgoalsgiris.xyz/",
        "User-Agent": "ExoPlayer/2.19.1 (Linux;Android 11)"
      }
    });

    if (!response.ok)
      return res.status(response.status).send("Yayın yüklenemedi.");

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

    const data = await response.text();
    res.send(data);
  } catch (e) {
    console.error("Proxy hatası:", e);
    res.status(500).send("Bağlantı hatası veya yayın bulunamadı.");
  }
}
