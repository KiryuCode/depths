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
  let mx = 0, my = 0, pointerIn = false;
  let hoverFish = null;
  let hitFlash = null; // {x,y,age,life}

  function fishHitRadius(f) {
    return Math.max(22, f.size * 0.85);
  }

  function pickFishAt(x, y) {
    if (!world) return null;
    // top-most (higher y draw order preference: closest by distance)
    let best = null, bestD = Infinity;
    for (const f of world.fish) {
      if (f.dead) continue;
      const dx = f.x - x, dy = f.y - y;
      const d = Math.hypot(dx, dy);
      const r = fishHitRadius(f);
      if (d <= r && d < bestD) {
        best = f;
        bestD = d;
      }
    }
    return best;
  }

  function killFish(f) {
    if (!f || f.dead) return;
    f.dead = true;
    f.facingDir = f.vx >= 0 ? 1 : -1;
    f.vx = 0;
    f.vy = 0;
    f.sink = 55 + Math.random() * 45;
    f.leader = null;
    hitFlash = { x: f.x, y: f.y, age: 0, life: 0.35, r: f.size * 0.7 };
    statusEl.textContent = "Hit - sinking belly-up";
  }

  function drawCrosshair(ctx) {
    if (!pointerIn) return;
    const hot = !!(hoverFish && !hoverFish.dead);
    const color = hot ? "#e23a3a" : "#121212";
    const glow = hot ? "rgba(226, 58, 58, 0.32)" : "rgba(0, 0, 0, 0.18)";
    const arm = hot ? 11 : 10;
    const gap = 3.5;
    const thick = hot ? 1.6 : 1.35;

    ctx.save();
    ctx.translate(mx, my);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.arc(0, 0, hot ? 14 : 12, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = thick;

    ctx.beginPath();
    ctx.moveTo(-arm, 0); ctx.lineTo(-gap, 0);
    ctx.moveTo(gap, 0); ctx.lineTo(arm, 0);
    ctx.moveTo(0, -arm); ctx.lineTo(0, -gap);
    ctx.moveTo(0, gap); ctx.lineTo(0, arm);
    ctx.stroke();

    const b = hot ? 8 : 7;
    const inset = hot ? 5 : 4.5;
    ctx.beginPath();
    ctx.moveTo(-b, -inset); ctx.lineTo(-b, -b); ctx.lineTo(-inset, -b);
    ctx.moveTo(inset, -b); ctx.lineTo(b, -b); ctx.lineTo(b, -inset);
    ctx.moveTo(b, inset); ctx.lineTo(b, b); ctx.lineTo(inset, b);
    ctx.moveTo(-inset, b); ctx.lineTo(-b, b); ctx.lineTo(-b, inset);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, hot ? 1.35 : 1.1, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    if (hot) {
      const ping = 11.5 + (Math.sin(t * 8) * 0.5 + 0.5) * 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, ping, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(226, 58, 58, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawHoverOutline(ctx) {
    if (!hoverFish || hoverFish.dead) return;
    const f = hoverFish;
    ctx.save();
    ctx.strokeStyle = "rgba(226, 58, 58, 0.35)";
    ctx.lineWidth = 1.1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.ellipse(f.x, f.y, f.size * 0.7, f.size * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawHitFlash(ctx) {
    if (!hitFlash) return;
    const u = hitFlash.age / hitFlash.life;
    if (u >= 1) return;
    const a = (1 - u) * 0.55;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const g = ctx.createRadialGradient(hitFlash.x, hitFlash.y, 2, hitFlash.x, hitFlash.y, hitFlash.r * (1 + u));
    g.addColorStop(0, `rgba(255, 240, 200, ${a})`);
    g.addColorStop(0.5, `rgba(120, 200, 255, ${a * 0.4})`);
    g.addColorStop(1, "rgba(80, 160, 220, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(hitFlash.x, hitFlash.y, hitFlash.r * (1 + u * 1.4), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }


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
      if (f.dead) {
        // Flip already applied in draw; sink to floor and stay belly-up
        const floorY = h - 22 - f.size * 0.15;
        if (f.y < floorY) {
          f.y = Math.min(floorY, f.y + f.sink * dt);
        } else {
          f.y = floorY;
          f.sink = 0;
        }
        continue;
      }
      f.flap += dt * (6 + Math.abs(f.vx) * 0.05);
      f.phase += dt;
      if (f.leader && !f.leader.dead) {
        f.x += (f.leader.x + (f.x - f.leader.x) * 0.92 - f.x) * 0.08 + f.vx * dt * 0.15;
        f.y += (f.leader.y + (f.y - f.leader.y) * 0.9 - f.y) * 0.08;
        f.vx = f.leader.vx * 0.95;
      } else {
        f.leader = null;
        f.x += f.vx * dt;
        f.y += Math.sin(f.phase) * f.vy * dt * 0.4;
      }
      if (f.x > w + 120) f.x = -120;
      if (f.x < -120) f.x = w + 120;
      f.y = R.clamp(f.y, h * 0.08, h * 0.82);
    }
    if (hitFlash) {
      hitFlash.age += dt;
      if (hitFlash.age >= hitFlash.life) hitFlash = null;
    }
    hoverFish = pointerIn ? pickFishAt(mx, my) : null;

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
      drawHoverOutline(ctx);
      for (const p of world.props) {
        if (p.kind === "bubbles") R.drawProp(ctx, p, t, h);
      }
    }

    R.drawFloor(ctx, w, h);
    drawHitFlash(ctx);
    drawCrosshair(ctx);

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

  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
    pointerIn = true;
  });
  canvas.addEventListener("pointerenter", () => { pointerIn = true; });
  canvas.addEventListener("pointerleave", () => { pointerIn = false; hoverFish = null; });
  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    // ignore clicks on chrome — canvas only
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
    const hit = pickFishAt(mx, my);
    if (hit) {
      killFish(hit);
      e.preventDefault();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") statusEl.textContent = "Looking up · " + current.name;
  });

  buildDock();
  resize();
  applyCssTint(current);
  syncUi(false);
  requestAnimationFrame(frame);
})();
