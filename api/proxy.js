export default async function handler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("URL parametresi eksik.");

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "Referer": "https://trgoalsgiris.xyz/",
        "Origin": "https://trgoalsgiris.xyz/",
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0"
      }
    });
    const data = await response.arrayBuffer();
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/vnd.apple.mpegurl");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(response.status).send(Buffer.from(data));
  } catch (e) {
    res.status(500).send("Bağlantı hatası veya yayın bulunamadı.");
  }
}
