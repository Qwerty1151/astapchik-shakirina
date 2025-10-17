(function(){
  const SUPPORTED = ["ru","en","es","fr","pt"];
  const guess = () => {
    const l = (localStorage.getItem("lang") || navigator.language || "ru").slice(0,2).toLowerCase();
    return SUPPORTED.includes(l) ? l : "ru";
  };
  const lang = guess();
  document.documentElement.setAttribute("lang", lang);

  // UI: селект в правом верхнем углу
  const ui = document.createElement("div");
  ui.id = "lang-switcher";
  ui.style.position = "fixed";
  ui.style.top = "12px";
  ui.style.right = "12px";
  ui.style.zIndex = 9999;
  ui.style.background = "rgba(255,255,255,.9)";
  ui.style.backdropFilter = "blur(4px)";
  ui.style.border = "1px solid #e5e7eb";
  ui.style.borderRadius = "8px";
  ui.style.padding = "4px 8px";
  const sel = document.createElement("select");
  [["ru","RU"],["en","EN"],["es","ES"],["fr","FR"],["pt","PT"]].forEach(([v,l])=>{
    const o=document.createElement("option"); o.value=v; o.textContent=l; sel.appendChild(o);
  });
  sel.value = lang;
  sel.onchange = (e)=>{ localStorage.setItem("lang", e.target.value); location.reload(); };
  ui.appendChild(sel);
  document.body.appendChild(ui);

  // агрузка словаря (кроме RU — он базовый)
  if(lang === "ru") return;

  fetch("/assets/i18n/"+lang+".json")
    .then(r=>r.json())
    .then(tr=>{
      // рямая замена по точным RU-строкам (без разметки)
      const walk = (node) => {
        if(!node || node.nodeType===8) return;                // комментарии — пропускаем
        if(node.nodeType===1){                                // элемент
          if(["SCRIPT","STYLE","NOSCRIPT"].includes(node.tagName)) return;
          // атрибуты-плейсхолдеры
          ["placeholder","title","aria-label"].forEach(a=>{
            const v=node.getAttribute && node.getAttribute(a);
            if(v && tr[v]) node.setAttribute(a, tr[v]);
          });
          Array.from(node.childNodes).forEach(walk);
        } else if(node.nodeType===3){                         // текстовый
          const txt = node.nodeValue.trim();
          if(tr[txt]){
            node.nodeValue = node.nodeValue.replace(txt, tr[txt]);
          }
        }
      };
      walk(document.body);
    })
    .catch(()=>{ /* ignore */ });
})();
