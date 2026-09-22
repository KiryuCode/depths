(function () {
  "use strict";

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }
  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }
  function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }

  const FISH_COLORS = {
    clownfish: ["#ff7a18", "#ffffff", "#1a1a1a"],
    angelfish: ["#f0e060", "#2a4a8a", "#e8e8e8"],
    reef_shark: ["#7a8a98", "#4a5560", "#c0c8d0"],
    school_small: ["#c8e8ff", "#8ab8d8", "#e8f4ff"],
    rockfish: ["#c05040", "#803028", "#e09070"],
    otter: ["#8a6a48", "#5a4030", "#c8a888"],
    parrotfish: ["#40c898", "#e050a0", "#f0e080"],
    barracuda: ["#708090", "#405060", "#a8b8c8"],
    trout: ["#c89060", "#806040", "#e8c8a0"],
    perch: ["#d0a040", "#806020", "#f0d080"],
    discus: ["#e06060", "#e8a040", "#f0e0c0"],
    grouper: ["#6a8070", "#405048", "#a0b8a8"],
    tropical: ["#40c0e0", "#e04080", "#f0c040"],
    sea_lion: ["#6a6a70", "#404048", "#a0a0a8"],
    cod: ["#9aa8a0", "#606860", "#c8d0c8"],
    lionfish: ["#e8a040", "#d04030", "#f0e0c0"],
    salmon: ["#d07060", "#a04840", "#e8a898"]
  };

  function spawnWorld(loc, w, h) {
    const fish = [];
    for (const spec of loc.fish) {
      let leader = null;
      for (let i = 0; i < spec.count; i++) {
        const size = rand(spec.size[0], spec.size[1]);
        const speed = rand(spec.speed[0], spec.speed[1]) * (Math.random() < 0.5 ? 1 : -1);
        const f = {
          type: spec.type,
          x: rand(-40, w + 40),
          y: rand(h * 0.12, h * 0.75),
          size,
          vx: speed,
          vy: rand(8, 22),
          flap: rand(0, Math.PI * 2),
          phase: rand(0, Math.PI * 2),
          colors: FISH_COLORS[spec.type] || FISH_COLORS.tropical,
          rare: !!spec.rare,
          school: !!spec.school,
          leader: null
        };
        if (spec.school) {
          if (i === 0) leader = f;
          else f.leader = leader;
        }
        fish.push(f);
      }
    }

    const props = [];
    for (const spec of loc.props) {
      const n = spec.count || 1;
      for (let i = 0; i < n; i++) {
        if (spec.kind === "bubbles") {
          props.push({
            kind: "bubbles",
            x: rand(0, w),
            y: rand(0, h),
            r: rand(2, 6),
            vy: -rand(18, 42),
            sway: rand(0, Math.PI * 2)
          });
          continue;
        }
        const baseY = spec.kind === "wall_rock" || spec.kind === "roots"
          ? rand(h * 0.15, h * 0.7)
          : h - rand(8, 40);
        props.push({
          kind: spec.kind,
          variant: spec.variant || "",
          x: rand(w * 0.02, w * 0.98),
          y: baseY,
          scale: rand(0.7, 1.35),
          sway: rand(0, Math.PI * 2),
          seed: Math.random() * 1000
        });
      }
    }
    return { fish, props };
  }

  function drawRays(ctx, w, h, t, opacity) {
    if (opacity <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 7; i++) {
      const x = ((i / 7) * w + Math.sin(t * 0.15 + i) * 40) % w;
      const g = ctx.createLinearGradient(x, 0, x + 40, h * 0.7);
      g.addColorStop(0, `rgba(200, 240, 255, ${opacity * 0.55})`);
      g.addColorStop(1, "rgba(200, 240, 255, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x - 10, 0);
      ctx.lineTo(x + 28 + Math.sin(t * 0.3 + i) * 12, 0);
      ctx.lineTo(x + 90, h * 0.75);
      ctx.lineTo(x - 50, h * 0.75);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCaustics(ctx, w, h, t, opacity) {
    if (opacity <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = opacity;
    for (let i = 0; i < 5; i++) {
      const ox = Math.sin(t * 0.4 + i * 1.7) * 60;
      const oy = Math.cos(t * 0.35 + i) * 30;
      const g = ctx.createRadialGradient(
        w * (0.15 + i * 0.18) + ox,
        h * (0.25 + (i % 3) * 0.15) + oy,
        10,
        w * (0.15 + i * 0.18) + ox,
        h * (0.25 + (i % 3) * 0.15) + oy,
        120 + i * 20
      );
      g.addColorStop(0, "rgba(180, 230, 255, 0.35)");
      g.addColorStop(0.5, "rgba(120, 200, 230, 0.08)");
      g.addColorStop(1, "rgba(80, 160, 200, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(
        w * (0.15 + i * 0.18) + ox,
        h * (0.28 + (i % 3) * 0.12) + oy,
        90 + Math.sin(t + i) * 20,
        40 + Math.cos(t * 0.8 + i) * 10,
        t * 0.2 + i,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFish(ctx, f, t) {
    ctx.save();
    ctx.translate(f.x, f.y);
    const dir = f.vx >= 0 ? 1 : -1;
    ctx.scale(dir, 1);
    const flap = Math.sin(f.flap) * 0.25;
    const [c0, c1, c2] = f.colors;
    const s = f.size;

    // body
    ctx.fillStyle = c0;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.55, s * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // belly stripe
    ctx.fillStyle = c2;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.08, s * 0.4, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // mid band
    ctx.strokeStyle = c1;
    ctx.lineWidth = Math.max(1.5, s * 0.06);
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, -s * 0.15);
    ctx.lineTo(-s * 0.2, s * 0.15);
    ctx.stroke();

    // tail
    ctx.fillStyle = c1;
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, 0);
    ctx.lineTo(-s * 0.85, -s * 0.28 + flap * s);
    ctx.lineTo(-s * 0.75, 0);
    ctx.lineTo(-s * 0.85, s * 0.28 - flap * s);
    ctx.closePath();
    ctx.fill();

    // dorsal
    ctx.fillStyle = c1;
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.25);
    ctx.quadraticCurveTo(s * 0.1, -s * 0.55, s * 0.25, -s * 0.2);
    ctx.closePath();
    ctx.fill();

    // eye
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(s * 0.28, -s * 0.05, Math.max(1.5, s * 0.06), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s * 0.3, -s * 0.07, Math.max(0.6, s * 0.025), 0, Math.PI * 2);
    ctx.fill();

    if (f.rare) {
      ctx.strokeStyle = "rgba(255,220,120,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawProp(ctx, p, t, h) {
    ctx.save();
    ctx.translate(p.x, p.y);
    const sc = p.scale || 1;
    const sway = Math.sin(t * 1.2 + p.sway) * 0.08;

    if (p.kind === "bubbles") {
      ctx.strokeStyle = "rgba(220, 245, 255, 0.55)";
      ctx.fillStyle = "rgba(200, 235, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.scale(sc, sc);
    ctx.rotate(sway);

    if (p.kind === "coral") {
      const cols = p.variant === "brain"
        ? ["#d07090", "#a04868"]
        : p.variant === "soft"
          ? ["#e878a0", "#c05080"]
          : ["#e89040", "#c06028"];
      ctx.fillStyle = cols[0];
      if (p.variant === "brain") {
        ctx.beginPath();
        ctx.ellipse(0, 0, 28, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = cols[1];
        ctx.lineWidth = 2;
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.arc(i * 8, 0, 10, 0.2, Math.PI - 0.2);
          ctx.stroke();
        }
      } else {
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 8);
          ctx.quadraticCurveTo(i * 14, -20, i * 18 + Math.sin(t + i) * 4, -48);
          ctx.lineWidth = 6;
          ctx.strokeStyle = cols[i === 0 ? 0 : 1];
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }
    } else if (p.kind === "kelp" || p.kind === "seagrass" || p.kind === "eelgrass" || p.kind === "plant") {
      const tall = p.kind === "kelp" ? 120 : p.kind === "seagrass" || p.kind === "eelgrass" ? 70 : 55;
      const green = p.kind === "kelp" ? "#2a6a40" : "#3a7a50";
      ctx.strokeStyle = green;
      ctx.lineWidth = p.kind === "kelp" ? 5 : 3;
      ctx.lineCap = "round";
      for (let i = 0; i < (p.kind === "kelp" ? 3 : 5); i++) {
        ctx.beginPath();
        ctx.moveTo(i * 4 - 6, 10);
        const tipX = Math.sin(t * 1.5 + p.sway + i) * 18 + i * 3;
        ctx.quadraticCurveTo(tipX * 0.5, -tall * 0.5, tipX, -tall);
        ctx.stroke();
      }
    } else if (p.kind === "anemone") {
      ctx.fillStyle = "#d06090";
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + t;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(Math.cos(a) * 12, -20, Math.cos(a) * 18, -32 + Math.sin(t * 3 + i) * 4);
        ctx.lineWidth = 3;
        ctx.strokeStyle = i % 2 ? "#e880a8" : "#c04878";
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 4, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === "rock" || p.kind === "volcanic" || p.kind === "wall_rock") {
      ctx.fillStyle = p.kind === "volcanic" ? "#2a2828" : "#4a5560";
      ctx.beginPath();
      ctx.moveTo(-30, 10);
      ctx.lineTo(-22, -18);
      ctx.lineTo(0, -28);
      ctx.lineTo(24, -14);
      ctx.lineTo(32, 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.moveTo(-10, -8);
      ctx.lineTo(8, -16);
      ctx.lineTo(14, 0);
      ctx.closePath();
      ctx.fill();
    } else if (p.kind === "wreck" || p.kind === "boat" || p.kind === "log") {
      ctx.fillStyle = p.kind === "log" ? "#5a4030" : "#3a4450";
      ctx.save();
      ctx.rotate(-0.12);
      ctx.fillRect(-55, -18, 110, 28);
      if (p.kind === "wreck" || p.kind === "boat") {
        ctx.fillRect(-20, -48, 12, 30);
        ctx.fillStyle = "rgba(200,210,220,0.15)";
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(-40 + i * 22, -10, 10, 12);
        }
      }
      ctx.restore();
      // soft silt
      ctx.fillStyle = "rgba(180, 200, 160, 0.15)";
      ctx.beginPath();
      ctx.ellipse(0, 16, 70, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === "roots") {
      ctx.strokeStyle = "#4a3020";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.quadraticCurveTo(
          Math.sin(t + i) * 20 + i * 8,
          20,
          Math.sin(p.sway + i) * 30 + i * 10,
          60
        );
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawFloor(ctx, w, h) {
    const g = ctx.createLinearGradient(0, h * 0.78, 0, h);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0, 8, 12, 0.55)");
    ctx.fillStyle = g;
    ctx.fillRect(0, h * 0.78, w, h * 0.22);

    ctx.fillStyle = "rgba(40, 60, 50, 0.35)";
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 40) {
      ctx.lineTo(x, h - 18 - Math.sin(x * 0.02) * 10);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  window.DepthsRender = {
    rand,
    clamp,
    spawnWorld,
    drawRays,
    drawCaustics,
    drawFish,
    drawProp,
    drawFloor
  };
})();
