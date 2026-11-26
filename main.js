// Draws Stockr's out-of-sample volatility forecast vs. realized volatility as an SVG line chart.
// One orchestrated motion: the forecast line draws in once on load (skipped for reduced motion).
// Hover, touch or arrow keys show the values for any week.
(function () {
  const host = document.getElementById("vol-chart");
  const readout = document.getElementById("chart-readout");
  if (!host) return;

  const NS = "http://www.w3.org/2000/svg";
  const el = (name, attrs, parent) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const pct = v => (v * 100).toFixed(0) + "%";
  const fmtDate = s => new Date(s + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  fetch("assets/vol.json")
    .then(r => r.json())
    .then(data => {
      const n = data.d.length;
      let svg, pts, idx = n - 1;

      function draw(animate) {
        host.innerHTML = "";
        const W = host.clientWidth, H = host.clientHeight;
        const pad = { l: 34, r: 6, t: 8, b: 22 };
        const yMax = 0.9;
        const x = i => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
        const y = v => pad.t + (1 - Math.min(v, yMax) / yMax) * (H - pad.t - pad.b);

        svg = el("svg", { viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true", focusable: "false" }, host);

        [0.2, 0.4, 0.6, 0.8].forEach(v => {
          el("line", { class: "axis", x1: pad.l, x2: W - pad.r, y1: y(v), y2: y(v) }, svg);
          el("text", { class: "tick", x: 0, y: y(v) + 4 }, svg).textContent = pct(v);
        });
        let lastYear = "";
        data.d.forEach((d, i) => {
          const yr = d.slice(0, 4);
          if (yr !== lastYear && +yr % 3 === 2) {
            const t = el("text", { class: "tick", x: x(i), y: H - 4, "text-anchor": "middle" }, svg);
            t.textContent = yr;
          }
          lastYear = yr;
        });

        const path = arr => arr.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join("");
        el("path", { class: "realized", d: path(data.r) }, svg);
        const f = el("path", { class: "forecast", d: path(data.f) }, svg);

        if (animate && !reduce) {
          const len = f.getTotalLength();
          f.style.strokeDasharray = len;
          f.style.strokeDashoffset = len;
          f.getBoundingClientRect();
          f.style.transition = "stroke-dashoffset 2.4s cubic-bezier(.45,.05,.25,1)";
          f.style.strokeDashoffset = "0";
        }

        const cursor = el("line", { class: "cursor", y1: pad.t, y2: H - pad.b }, svg);
        const dot = el("circle", { class: "dot", r: 3.5 }, svg);
        pts = { x, y, cursor, dot };
      }

      function show(i) {
        idx = Math.max(0, Math.min(n - 1, i));
        const { x, y, cursor, dot } = pts;
        cursor.setAttribute("x1", x(idx)); cursor.setAttribute("x2", x(idx));
        dot.setAttribute("cx", x(idx)); dot.setAttribute("cy", y(data.f[idx]));
        host.classList.add("active");
        readout.textContent = `${fmtDate(data.d[idx])}: forecast ${pct(data.f[idx])}, actual ${pct(data.r[idx])}`;
      }

      function pointer(e) {
        const rect = host.getBoundingClientRect();
        const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const frac = (cx - 34) / (rect.width - 40);
        show(Math.round(frac * (n - 1)));
      }

      draw(true);
      host.tabIndex = 0;
      host.addEventListener("mousemove", pointer);
      host.addEventListener("touchmove", pointer, { passive: true });
      host.addEventListener("mouseleave", () => host.classList.remove("active"));
      host.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") { show(idx - 4); e.preventDefault(); }
        if (e.key === "ArrowRight") { show(idx + 4); e.preventDefault(); }
      });
      host.addEventListener("focus", () => show(idx));
      host.addEventListener("blur", () => host.classList.remove("active"));

      let t;
      window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => draw(false), 120); });
    })
    .catch(() => { host.style.display = "none"; });
})();
