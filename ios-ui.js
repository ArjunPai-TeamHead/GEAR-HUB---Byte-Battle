/* Minimal UI behavior: segmented indicator + tab highlight + simple theme toggle */
(function(){
  // segmented control indicator
  document.querySelectorAll(".ios-segmented").forEach(seg=>{
    const btns = Array.from(seg.querySelectorAll("button"));
    let ind = seg.querySelector(".indicator");
    if(!ind){ ind = document.createElement("div"); ind.className="indicator"; seg.appendChild(ind); }
    const activate = (b)=>{
      btns.forEach(x=> x.classList.toggle("active", x===b));
      const r = b.getBoundingClientRect();
      const f = btns[0].getBoundingClientRect();
      ind.style.width = r.width + "px";
      ind.style.transform = `translateX(${r.left - f.left}px)`;
    };
    const initial = btns.find(b=>b.classList.contains("active")) || btns[0];
    if(initial) activate(initial);
    btns.forEach(b=> b.addEventListener("click", ()=> activate(b)));
    window.addEventListener("resize", ()=> {
      const active = btns.find(b=>b.classList.contains("active")) || btns[0];
      if(active) activate(active);
    });
  });

  // simple tab highlight
  const tabs = document.querySelectorAll(".ios-tabbar .tab");
  if(tabs.length){
    const mark = ()=> {
      const path = location.pathname + location.hash;
      tabs.forEach(t=> {
        const href = t.getAttribute("href") || "";
        t.classList.toggle("active", href && path.startsWith(href));
      });
    };
    window.addEventListener("hashchange", mark); window.addEventListener("popstate", mark); mark();
  }

  // theme toggle if element present
  document.addEventListener("click", e=>{
    const t = e.target.closest("[data-action='toggle-theme']");
    if(!t) return;
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("gearhub_theme", next);
  });

  // load persisted theme
  const stored = localStorage.getItem("gearhub_theme");
  if(stored) document.documentElement.dataset.theme = stored;
})();