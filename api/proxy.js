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

    res.setHeader("
