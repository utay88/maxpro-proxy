export default async function handler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("URL parametresi eksik.");

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "Referer": "https://trgoalsgiris.xyz/",
        "Origin": "https://trgoalsgiris.xyz/",
        "User-Agent": "ExoPlayer/2.19.1 (Linux;Android 11)"
      }
    });

    if (!response.ok) {
      return res.status(response.status).send("Yayın yüklenemedi veya erişim reddedildi.");
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

    const data = await response.text();
    res.send(data);
  } catch (e) {
    console.error("Proxy hatası:", e);
    res.status(500).send("Bağlantı hatası veya yayın bulunamadı.");
  }
}
