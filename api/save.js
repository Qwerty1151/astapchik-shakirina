const OWNER  = process.env.REPO_OWNER  || "Qwerty1151";
const REPO   = process.env.REPO_NAME   || "astapchik-shakirina";
const BRANCH = process.env.REPO_BRANCH || "vetka2";
const TOKEN  = process.env.GH_PAT;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
  if (req.headers["x-admin-secret"] !== process.env.ADMIN_SECRET) return res.status(401).send("Unauthorized");
  try{
    const { path, content, message } = req.body || {};
    if(!TOKEN)  return res.status(500).json({error:"Missing GH_PAT env"});
    if(!path || !content) return res.status(400).json({error:"path & content required"});

    // получить sha файла, если уже существует
    let sha;
    const getUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(BRANCH)}`;
    const g = await fetch(getUrl, { headers:{ Authorization:`Bearer ${TOKEN}`, "User-Agent":"vercel-cms"}});
    if (g.status === 200){ const j = await g.json(); sha = j.sha; }

    const body = {
      message: message || `cms: update ${path}`,
      content: Buffer.from(content, "utf8").toString("base64"),
      branch:  BRANCH,
      sha
    };
    const putUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`;
    const r = await fetch(putUrl, {
      method:"PUT",
      headers:{ Authorization:`Bearer ${TOKEN}`, "User-Agent":"vercel-cms", "Content-Type":"application/json" },
      body: JSON.stringify(body)
    });
    const out = await r.json();
    if(!r.ok) return res.status(500).json({error:out});
    return res.status(200).json({ ok:true, commit: out.commit && out.commit.sha });
  }catch(e){
    return res.status(500).json({error:e.message});
  }
};