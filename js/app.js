(function () {
  "use strict";

  const canvas = document.getElementById("sea");
  const ctx = canvas.getContext("2d");
  const listEl = document.getElementById("locationList");
  const statusEl = document.getElementById("status");
  const metaEl = document.getElementById("locMeta");
  const dockEl = document.getElementById("dock");
  const toggleBtn = document.getElementById("toggleDock");

  const locations = window.DEPTHS_LOCATIONS;
  const R = window.DepthsRender;

  let w = 0, h = 0, dpr = 1;
  let current = locations[0];
  let world = null;
  let fade = 1;
  let pendingLoc = null;
  let lastTs = 0;
  let t = 0;

  function applyCssTint(loc, mix) {
    const wt = loc.waterTint;
    const root = document.documentElement;
    root.style.setProperty("--water-top", wt.top);
    root.style.setProperty("--water-mid", wt.mid);
    root.style.setProperty("--water-deep", wt.deep);
    root.style.setProperty("--water-tint", wt.tint);
    root.style.setProperty("--caustic-opacity", String(wt.caustic ?? 0.2));
    root.style.setProperty("--ray-opacity", String(wt.ray ?? 0.15));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (current) {
      world = R.spawnWorld(current, w, h);
    }
  }

  function selectLocation(id, animate) {
    const loc = locations.find((l) => l.id === id);
    if (!loc || loc === current) return;
    if (animate === false) {
      current = loc;
      applyCssTint(loc);
      world = R.spawnWorld(loc, w, h);
      fade = 1;
      pendingLoc = null;
      syncUi();
      return;
    }
    pendingLoc = loc;
    fade = 1;
    syncUi(true);
  }

  function syncUi(switching) {
    [...listEl.querySelectorAll(".loc-btn")].forEach((btn) => {
      const active = btn.dataset.id === (pendingLoc || current).id;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    const loc = pendingLoc || current;
    metaEl.textContent = loc.name + " · " + loc.region;
    statusEl.textContent = switching ? "Diving…" : "Looking up · " + loc.name;
  }

  function buildDock() {
    listEl.innerHTML = "";
    locations.forEach((loc) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "loc-btn";
      btn.dataset.id = loc.id;
      btn.setAttribute("role", "option");
      btn.innerHTML = '<span class="name"></span><span class="region"></span>';
      btn.querySelector(".name").textContent = loc.name;
      btn.querySelector(".region").textContent = loc.region;
      btn.addEventListener("click", () => selectLocation(loc.id, true));
      listEl.appendChild(btn);
    });
  }

  function update(dt) {
    t += dt;
    if (pendingLoc) {
      fade -= dt * 1.4;
      if (fade <= 0) {
        current = pendingLoc;
        pendingLoc = null;
        applyCssTint(current);
        world = R.spawnWorld(current, w, h);
        fade = 0;
        syncUi(false);
      }
    } else if (fade < 1) {
      fade = Math.min(1, fade + dt * 1.2);
    }

    if (!world) return;

    for (const f of world.fish) {
      f.flap += dt * (6 + Math.abs(f.vx) * 0.05);
      f.phase += dt;
      if (f.leader) {
        f.x += (f.leader.x + (f.x - f.leader.x) * 0.92 - f.x) * 0.08 + f.vx * dt * 0.15;
        f.y += (f.leader.y + (f.y - f.leader.y) * 0.9 - f.y) * 0.08;
        f.vx = f.leader.vx * 0.95;
      } else {
        f.x += f.vx * dt;
        f.y += Math.sin(f.phase) * f.vy * dt * 0.4;
      }
      if (f.x > w + 120) f.x = -120;
      if (f.x < -120) f.x = w + 120;
      f.y = R.clamp(f.y, h * 0.08, h * 0.82);
    }

    for (const p of world.props) {
      if (p.kind === "bubbles") {
        p.y += p.vy * dt;
        p.x += Math.sin(t * 2 + p.sway) * 8 * dt;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = R.rand(0, w);
        }
      }
    }
  }

  function paint() {
    const wt = current.waterTint;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, wt.top);
    g.addColorStop(0.45, wt.mid);
    g.addColorStop(1, wt.deep);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = wt.tint;
    ctx.fillRect(0, 0, w, h);

    const causticOp = (wt.caustic ?? 0.2) * fade;
    const rayOp = (wt.ray ?? 0.15) * fade;
    R.drawRays(ctx, w, h, t, rayOp);
    R.drawCaustics(ctx, w, h, t, causticOp);

    if (world) {
      for (const p of world.props) {
        if (p.kind === "wall_rock" || p.kind === "roots") R.drawProp(ctx, p, t, h);
      }
      for (const p of world.props) {
        if (p.kind !== "bubbles" && p.kind !== "wall_rock" && p.kind !== "roots") {
          R.drawProp(ctx, p, t, h);
        }
      }
      const sorted = world.fish.slice().sort((a, b) => a.y - b.y);
      for (const f of sorted) R.drawFish(ctx, f, t);
      for (const p of world.props) {
        if (p.kind === "bubbles") R.drawProp(ctx, p, t, h);
      }
    }

    R.drawFloor(ctx, w, h);

    if (fade < 1) {
      ctx.fillStyle = `rgba(4, 16, 24, ${1 - fade})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function frame(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    update(dt);
    paint();
    requestAnimationFrame(frame);
  }

  toggleBtn.addEventListener("click", () => {
    const hidden = dockEl.classList.toggle("hidden");
    toggleBtn.setAttribute("aria-expanded", hidden ? "false" : "true");
  });

  window.addEventListener("resize", resize);
  buildDock();
  resize();
  applyCssTint(current);
  syncUi(false);
  requestAnimationFrame(frame);
})();
