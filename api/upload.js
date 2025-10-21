const OWNER  = process.env.REPO_OWNER  || "Qwerty1151";
const REPO   = process.env.REPO_NAME   || "astapchik-shakirina";
const BRANCH = process.env.REPO_BRANCH || "vetka2";
const TOKEN  = process.env.GH_PAT;

function safe(name){ return String(name||"file.bin").replace(/[^a-zA-Z0-9._-]/g,"_"); }

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
  if (req.headers["x-admin-secret"] !== process.env.ADMIN_SECRET) return res.status(401).send("Unauthorized");
  try{
    const { filename, dataUrl, subdir } = req.body || {};
    if(!TOKEN) return res.status(500).json({error:"Missing GH_PAT env"});
    if(!filename || !dataUrl) return res.status(400).json({error:"filename & dataUrl required"});

    const base64 = String(dataUrl).split(",")[1];
    if(!base64) return res.status(400).json({error:"invalid dataUrl"});

    const name = `${Date.now()}-${safe(filename)}`;
    const path = `${subdir || "uploads"}/${name}`;

    const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`, {
      method:"PUT",
      headers:{ Authorization:`Bearer ${TOKEN}`, "User-Agent":"vercel-cms", "Content-Type":"application/json" },
      body: JSON.stringify({ message:`cms: upload ${name}`, content: base64, branch: BRANCH })
    });
    const out = await r.json();
    if(!r.ok) return res.status(500).json({error:out});
    return res.status(200).json({ ok:true, path:`/${path}`, url:`/${path}` });
  }catch(e){
    return res.status(500).json({error:e.message});
  }
};