(()=>{ const params=new URLSearchParams(location.search); if(params.get("cms")==="off") return;
  async function run(){ const root=document.getElementById("cms-root"); if(!root) return;
    try{ const r=await fetch("/api/content-get?key=cms:page:index",{cache:"no-store"}); const j=await r.json();
      if(j&&j.value&&typeof j.value==="string"&&j.value.trim().length){ root.innerHTML=j.value; }
    }catch(e){ console.warn("CMS content load error:", e); } }
  if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded", run); } else { run(); }
})();