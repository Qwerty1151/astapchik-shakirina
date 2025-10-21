const { kv } = require("@vercel/kv");
module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const key = url.searchParams.get("key") || "cms:page:index";
    const value = await kv.get(key);
    res.setHeader("Cache-Control", "no-store");
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: true, key, value: value ?? null }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: String(e && e.message || e) }));
  }
};