?(() => {
  const DEFAULT = "ru";
  const SUPPORTED = ["ru","en","pl","fr"];
  const STORAGE_KEY = "lang";
  const cache = {};

  async function loadDict(lang) {
    if (lang === "ru") return {}; // ������� ������ � �������
    if (cache[lang]) return cache[lang];
    try {
      const res = await fetch(`/assets/i18n/${lang}.json`, { cache: "no-store" });
      if (!res.ok) return {};
      cache[lang] = await res.json();
      return cache[lang];
    } catch (_) { return {}; }
  }

  function walkTextNodes(root, cb) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        if (!n.nodeValue) return NodeFilter.FILTER_REJECT;
        const t = n.nodeValue.trim();
        if (!t) return NodeFilter.FILTER_REJECT;
        if (n.parentElement && ["SCRIPT","STYLE","NOSCRIPT"].includes(n.parentElement.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let node; while ((node = walker.nextNode())) cb(node);
  }

  async function applyLang(lang) {
    const dict = await loadDict(lang);
    document.documentElement.setAttribute("lang", lang);

    // 1) ����� ��������: [data-i18n="������ �����"]
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (key && dict[key]) el.textContent = dict[key];
    });

    // 2) ����������� / title
    ["placeholder","title","aria-label"].forEach(attr => {
      document.querySelectorAll(`[${attr}]`).forEach(el => {
        const key = el.getAttribute(attr);
        if (key && dict[key]) el.setAttribute(attr, dict[key]);
      });
    });

    // 3) ��������� ����: �������� ������ ���� ������ ��������� ����� = �����
    walkTextNodes(document.body, node => {
      const raw = node.nodeValue;
      const key = raw.trim();
      if (dict[key]) {
        const leading = raw.match(/^\s*/)[0] ?? "";
        const trailing = raw.match(/\s*$/)[0] ?? "";
        node.nodeValue = leading + dict[key] + trailing;
      }
    });
  }

  function initSwitcher() {
    const sw = document.getElementById("lang-switcher");
    if (!sw) return;
    const guess = (navigator.language || "ru").slice(0,2).toLowerCase();
    const saved = localStorage.getItem(STORAGE_KEY);
    const current = SUPPORTED.includes(saved || "") ? saved
                   : SUPPORTED.includes(guess) ? guess
                   : DEFAULT;
    sw.value = current;
    applyLang(current);
    sw.addEventListener("change", e => {
      const lang = e.target.value;
      localStorage.setItem(STORAGE_KEY, lang);
      applyLang(lang);
    });
  }

  document.addEventListener("DOMContentLoaded", initSwitcher);
})();
