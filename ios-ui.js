/* Minimal JS for segmented indicator and tab highlight */
(function () {
  document.querySelectorAll(".ios-segmented").forEach(seg => {
    const buttons = Array.from(seg.querySelectorAll("button"));
    let indicator = seg.querySelector(".indicator");
    if (!indicator) { indicator = document.createElement("div"); indicator.className = "indicator"; seg.appendChild(indicator); }
    const activate = (btn) => {
      buttons.forEach(b => b.classList.toggle("active", b === btn));
      const box = btn.getBoundingClientRect(); const first = buttons[0].getBoundingClientRect();
      indicator.style.width = box.width + "px";
      indicator.style.transform = `translateX(${box.left - first.left}px)`;
    };
    const initBtn = buttons.find(b => b.classList.contains("active")) || buttons[0];
    if (initBtn) activate(initBtn);
    buttons.forEach(btn => btn.addEventListener("click", () => activate(btn)));
    window.addEventListener("resize", () => {
      const active = buttons.find(b => b.classList.contains("active")) || buttons[0];
      if (active) activate(active);
    });
  });

  // Optional tabbar highlighting based on location hash/path
  const tabs = document.querySelectorAll(".ios-tabbar .tab");
  if (tabs.length) {
    const mark = () => {
      const cur = location.pathname + location.hash;
      tabs.forEach(t => {
        const href = t.getAttribute("href") || "";
        t.classList.toggle("active", href && cur.startsWith(href));
      });
    };
    window.addEventListener("hashchange", mark);
    window.addEventListener("popstate", mark);
    mark();
  }
})();