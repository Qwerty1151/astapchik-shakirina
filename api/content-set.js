const { kv } = require("@vercel/kv");
function json(res, code, obj){ res.statusCode=code; res.setHeader("Content-Type","application/json; charset=utf-8"); res.end(JSON.stringify(obj)); }
async function readBody(req){ return await new Promise((resolve,reject)=>{ let d=""; req.on("data",c=>d+=c); req.on("end",()=>{try{resolve(d?JSON.parse(d):{})}catch(e){reject(e)}}); req.on("error",reject); }); }

module.exports = async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { ok:false, error:"use POST" });
  const admin = process.env.CMS_ADMIN_TOKEN;
  if (!admin) return json(res, 500, { ok:false, error:"CMS_ADMIN_TOKEN is not set" });
  const token = req.headers["x-admin-token"];
  if (token !== admin) return json(res, 401, { ok:false, error:"bad token" });

  try {
    const { key="cms:page:index", value } = await readBody(req);
    if (typeof value !== "string") return json(res, 400, { ok:false, error:"value must be string" });
    await kv.set(key, value);
    return json(res, 200, { ok:true });
  } catch (e) {
    return json(res, 500, { ok:false, error:String(e && e.message || e) });
  }
};