import { useState, useEffect, useRef, useCallback } from "react";

function useTelemetry() {
  const [data, setData] = useState({
    temperature: 0,
    orientation: "STABLE",
    gx: 0,
    gy: 0,
    gz: 0,
    state: "STABLE",
    risk: "LOW",
    decision: "",
  });

  const [connected, setConnected] = useState(false);

  useEffect(() => {

    const fetchTelemetry = async () => {

      try {

        const res = await fetch(
          "http://172.20.10.13:5000/telemetry"
        );

        const json = await res.json();

        console.log("DATE REALE:", json);

        setData(json);

        setConnected(true);

      } catch (err) {

        console.log("EROARE:", err);

        setConnected(false);
      }
    };

    fetchTelemetry();

    const interval = setInterval(
      fetchTelemetry,
      1000
    );

    return () => clearInterval(interval);

  }, []);

  return {
    data,
    connected,
    history: {
      temp: [],
      dist: []
    }
  };
}

function getStateColors(state) {
  switch (state) {
    case "CRITIC": return { primary: "#ff2244", secondary: "#ff6680", glow: "rgba(255,34,68,0.4)", dim: "rgba(255,34,68,0.08)", border: "rgba(255,34,68,0.5)" };
    case "AVERTIZARE":  return { primary: "#ffaa00", secondary: "#ffd066", glow: "rgba(255,170,0,0.4)",  dim: "rgba(255,170,0,0.08)",  border: "rgba(255,170,0,0.5)"  };
    default:         return { primary: "#00e5ff", secondary: "#66f0ff", glow: "rgba(0,229,255,0.35)", dim: "rgba(0,229,255,0.07)", border: "rgba(0,229,255,0.4)" };
  }
}


const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@300;400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#000;overflow-x:hidden}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:rgba(0,229,255,0.05)}
  ::-webkit-scrollbar-thumb{background:rgba(0,229,255,0.3);border-radius:2px}
  .font-orb{font-family:'Orbitron',monospace}
  .font-mono{font-family:'Share Tech Mono',monospace}
  .font-raj{font-family:'Rajdhani',sans-serif}
  @keyframes float{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-14px) rotate(1deg)}}
  @keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes spin-rev{from{transform:rotate(360deg)}to{transform:rotate(0deg)}}
  @keyframes pulse-ring{0%{transform:scale(1);opacity:0.7}100%{transform:scale(2.2);opacity:0}}
  @keyframes radar-sweep{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
  @keyframes blink-crit{0%,100%{opacity:1}50%{opacity:0.15}}
  @keyframes ticker{0%{transform:translateX(50%)}100%{transform:translateX(-100%)}}
  @keyframes grid-move{0%{background-position:0 0}100%{background-position:60px 60px}}
  @keyframes earth-rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes atmo-pulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:0.9;transform:scale(1.01)}}
  @keyframes star-twinkle{0%,100%{opacity:0.3}50%{opacity:1}}
  @keyframes data-flow{0%{stroke-dashoffset:200}100%{stroke-dashoffset:0}}
  @keyframes slide-in{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes holo-flicker{0%,100%{opacity:1}92%{opacity:1}93%{opacity:0.4}94%{opacity:1}97%{opacity:0.7}98%{opacity:1}}
  .float{animation:float 6s ease-in-out infinite}
  .blink-crit{animation:blink-crit 0.8s ease-in-out infinite}
  .holo{animation:holo-flicker 8s infinite}
  .slide-in{animation:slide-in 0.4s ease-out forwards}
  .glass{background:rgba(0,229,255,0.04);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(0,229,255,0.15);border-radius:12px}
  .glass-warn{background:rgba(255,170,0,0.04);backdrop-filter:blur(16px);border:1px solid rgba(255,170,0,0.2);border-radius:12px}
  .glass-crit{background:rgba(255,34,68,0.05);backdrop-filter:blur(16px);border:1px solid rgba(255,34,68,0.25);border-radius:12px}
`;

function EarthBackground({ state }) {
  const canvasRef = useRef(null);
  const starsRef = useRef(Array.from({ length: 200 }, () => ({
    x: Math.random() * 1600, y: Math.random() * 900,
    r: Math.random() * 1.5 + 0.3,
    phase: Math.random() * Math.PI * 2,
    speed: 0.3 + Math.random() * 0.7,
  })));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame = 0, raf;
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      frame++;
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);

      const bg = ctx.createRadialGradient(W * 0.3, H * 0.2, 0, W * 0.3, H * 0.2, W * 1.2);
      bg.addColorStop(0, "#020a14"); bg.addColorStop(0.5, "#01050d"); bg.addColorStop(1, "#000000");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      starsRef.current.forEach(s => {
        const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(frame * 0.02 * s.speed + s.phase));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,220,255,${tw})`; ctx.fill();
      });

      const neb = ctx.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, W * 0.4);
      neb.addColorStop(0, "rgba(0,100,180,0.06)"); neb.addColorStop(0.5, "rgba(0,50,120,0.03)"); neb.addColorStop(1, "transparent");
      ctx.fillStyle = neb; ctx.fillRect(0, 0, W, H);

      const ex = W * 0.12, ey = H * 0.85, er = Math.min(W, H) * 0.45;
      const earthRot = (frame * 0.002) % (Math.PI * 2);

      ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2);
      const oceanGrad = ctx.createRadialGradient(ex - er * 0.3, ey - er * 0.3, 0, ex, ey, er);
      oceanGrad.addColorStop(0, "#1a6fa8"); oceanGrad.addColorStop(0.5, "#0d4d7a"); oceanGrad.addColorStop(1, "#071e30");
      ctx.fillStyle = oceanGrad; ctx.fill(); ctx.restore();

      ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.clip();
      const landPieces = [
        { ox: 0.15, oy: -0.15, rx: 0.22, ry: 0.28 },
        { ox: -0.1, oy: 0.1, rx: 0.18, ry: 0.2 },
        { ox: 0.3, oy: 0.2, rx: 0.12, ry: 0.15 },
        { ox: -0.3, oy: -0.05, rx: 0.14, ry: 0.1 },
      ];
      landPieces.forEach(({ ox, oy, rx, ry }) => {
        const lx = ex + (ox * Math.cos(earthRot) - oy * Math.sin(earthRot)) * er;
        const ly = ey + (ox * Math.sin(earthRot) + oy * Math.cos(earthRot)) * er;
        const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, rx * er);
        g.addColorStop(0, "rgba(34,120,50,0.9)"); g.addColorStop(0.6, "rgba(20,80,35,0.7)"); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(lx, ly, rx * er, ry * er, earthRot * 0.5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();

      ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.clip();
      const icePole = ctx.createRadialGradient(ex, ey - er * 0.7, 0, ex, ey - er * 0.7, er * 0.45);
      icePole.addColorStop(0, "rgba(200,230,255,0.9)"); icePole.addColorStop(1, "transparent");
      ctx.fillStyle = icePole; ctx.fillRect(ex - er, ey - er, er * 2, er * 0.7);
      ctx.restore();

      ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.clip();
      const dark = ctx.createLinearGradient(ex - er, ey, ex + er * 0.3, ey);
      dark.addColorStop(0, "rgba(0,0,0,0.0)"); dark.addColorStop(0.4, "rgba(0,0,0,0.0)"); dark.addColorStop(0.65, "rgba(0,5,15,0.85)"); dark.addColorStop(1, "rgba(0,5,15,0.98)");
      ctx.fillStyle = dark; ctx.fillRect(ex - er, ey - er, er * 2, er * 2);
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 + earthRot;
        const dist = er * (0.3 + Math.random() * 0.55);
        const cx2 = ex + Math.cos(angle) * dist, cy2 = ey + Math.sin(angle) * dist * 0.6;
        if (cx2 < ex - er * 0.1) {
          ctx.fillStyle = `rgba(255,220,100,${0.3 + Math.random() * 0.4})`;
          ctx.fillRect(cx2, cy2, 1.5, 1.5);
        }
      }
      ctx.restore();

      const atmoCol = state === "CRITIC" ? "rgba(255,60,60," : state === "AVERTIZARE" ? "rgba(255,200,0," : "rgba(80,160,255,";
      for (let i = 3; i >= 1; i--) {
        const atmo = ctx.createRadialGradient(ex, ey, er * (1 + 0.01 * i), ex, ey, er * (1 + 0.08 * i));
        atmo.addColorStop(0, atmoCol + (0.18 / i) + ")");
        atmo.addColorStop(1, "transparent");
        ctx.fillStyle = atmo; ctx.beginPath(); ctx.arc(ex, ey, er * (1 + 0.08 * i), 0, Math.PI * 2); ctx.fill();
      }
      ctx.save();
      ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2);
      const shine = ctx.createRadialGradient(ex - er * 0.35, ey - er * 0.35, 0, ex, ey, er);
      shine.addColorStop(0, "rgba(255,255,255,0.12)"); shine.addColorStop(0.4, "rgba(255,255,255,0.04)"); shine.addColorStop(1, "transparent");
      ctx.fillStyle = shine; ctx.fill(); ctx.restore();

      ctx.strokeStyle = `rgba(0,229,255,0.03)`; ctx.lineWidth = 0.5;
      const gs = 60;
      for (let x = (frame * 0.2) % gs; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = (frame * 0.15) % gs; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      const scanY = ((frame * 2) % (H + 40)) - 20;
      const scan = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
      scan.addColorStop(0, "transparent"); scan.addColorStop(0.5, "rgba(0,229,255,0.04)"); scan.addColorStop(1, "transparent");
      ctx.fillStyle = scan; ctx.fillRect(0, scanY - 2, W, 4);

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [state]);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

function FloatingSatellite({ state }) {
  const colors = getStateColors(state);
  return (
    <div className="float" style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
      <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`, animation: "atmo-pulse 3s ease-in-out infinite" }} />
      {[0, 1, 2].map(i => (
        <div key={i} style={{ position: "absolute", width: 160 + i * 30, height: 160 + i * 30, borderRadius: "50%", border: `1px solid ${colors.primary}`, opacity: 0.1 - i * 0.025, animation: `spin-slow ${8 + i * 4}s linear infinite` }} />
      ))}
      <svg width="140" height="100" viewBox="0 0 140 100" style={{ filter: `drop-shadow(0 0 12px ${colors.primary}) drop-shadow(0 0 4px ${colors.secondary})`, position: "relative", zIndex: 1 }}>
        {/* Body */}
        <rect x="52" y="36" width="36" height="28" rx="4" fill="#1a2a3a" stroke={colors.primary} strokeWidth="1.5" />
        <rect x="55" y="39" width="30" height="22" rx="2" fill="none" stroke={colors.secondary} strokeWidth="0.5" strokeDasharray="4 2" />
        <circle cx="70" cy="50" r="6" fill="none" stroke={colors.primary} strokeWidth="1.2" />
        <circle cx="70" cy="50" r="3" fill={colors.secondary} opacity="0.7" />
        {/* Solar panels */}
        {[[-44, 0], [44, 0]].map(([dx], idx) => (
          <g key={idx}>
            <rect x={52 + dx} y="42" width="38" height="16" rx="2" fill="#0a1520" stroke={colors.primary} strokeWidth="1" />
            {[0, 1, 2, 3, 4].map(j => <line key={j} x1={54 + dx + j * 7} y1="42" x2={54 + dx + j * 7} y2="58" stroke={colors.secondary} strokeWidth="0.5" opacity="0.6" />)}
            {[0, 1].map(j => <line key={j} x1={52 + dx} y1={46 + j * 7} x2={90 + dx} y2={46 + j * 7} stroke={colors.secondary} strokeWidth="0.5" opacity="0.6" />)}
            <rect x={51 + dx} y="48" width="2.5" height="4" fill={colors.primary} />
            <rect x={88 + dx} y="48" width="2.5" height="4" fill={colors.primary} />
          </g>
        ))}
        {/* Antenna */}
        <line x1="70" y1="36" x2="70" y2="20" stroke={colors.primary} strokeWidth="1.2" />
        <circle cx="70" cy="18" r="3" fill="none" stroke={colors.primary} strokeWidth="1" />
        <line x1="66" y1="24" x2="62" y2="16" stroke={colors.secondary} strokeWidth="0.8" />
        <line x1="74" y1="24" x2="78" y2="16" stroke={colors.secondary} strokeWidth="0.8" />
        {/* Thruster */}
        <polygon points="58,64 62,72 78,72 82,64" fill="#0d1e2e" stroke={colors.primary} strokeWidth="1" />
        <line x1="65" y1="64" x2="65" y2="72" stroke={colors.secondary} strokeWidth="0.6" opacity="0.5" />
        <line x1="70" y1="64" x2="70" y2="72" stroke={colors.secondary} strokeWidth="0.6" opacity="0.5" />
        <line x1="75" y1="64" x2="75" y2="72" stroke={colors.secondary} strokeWidth="0.6" opacity="0.5" />
        {/* Engine glow */}
        {state !== "STABIL" && (
          <ellipse cx="70" cy="74" rx="8" ry="4" fill={colors.primary} opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="0.8s" repeatCount="indefinite" />
          </ellipse>
        )}
        {/* Status light */}
        <circle cx="88" cy="40" r="2.5" fill={colors.primary}>
          <animate attributeName="opacity" values="1;0.2;1" dur={state === "CRITIC" ? "0.5s" : "2s"} repeatCount="indefinite" />
        </circle>
        {/* Comm beam */}
        <line x1="70" y1="64" x2="70" y2="90" stroke={colors.primary} strokeWidth="0.6" strokeDasharray="3 3" opacity="0.4">
          <animate attributeName="stroke-dashoffset" values="0;-12" dur="1s" repeatCount="indefinite" />
        </line>
      </svg>
    </div>
  );
}

function TemperatureCard({ temp, humidity, history, state }) {
  const colors = getStateColors(state);
  const high = temp > 34, warn = temp > 30;
  const cardColor = high ? getStateColors("CRITIC") : warn ? getStateColors("AVERTIZARE") : colors;
  const W = 260, H = 60, max = 42, min = 15;
  const pts = history.temp.map((v, i) => {
    const x = (i / (history.temp.length - 1)) * W;
    const y = H - ((v - min) / (max - min)) * H;
    return `${x},${y}`;
  }).join(" ");
  const areaPath = history.temp.length > 1
    ? `M0,${H} ${history.temp.map((v, i) => { const x = (i / (history.temp.length - 1)) * W; const y = H - ((v - min) / (max - min)) * H; return `${x},${y}`; }).join(" ")} ${W},${H} Z`
    : "";

  return (
    <div className={`glass holo`} style={{ padding: "16px", border: `1px solid ${cardColor.border}`, boxShadow: `0 0 20px ${cardColor.glow}, inset 0 0 20px ${cardColor.dim}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div className="font-mono" style={{ fontSize: 10, color: cardColor.primary, letterSpacing: 3, marginBottom: 4 }}>SENZOR TERMIC / DHT22</div>
          <div className="font-orb" style={{ fontSize: 32, fontWeight: 900, color: cardColor.primary, lineHeight: 1, textShadow: `0 0 20px ${cardColor.glow}` }}>
            {temp}°C
          </div>
          <div className="font-raj" style={{ fontSize: 12, color: "rgba(180,220,255,0.5)", marginTop: 3 }}>
            UMID <span style={{ color: cardColor.secondary }}>{humidity}%</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <StatusBadge label={high ? "SUPRAÎNCĂLZIRE" : warn ? "RIDICATĂ" : "NOMINALĂ"} color={cardColor.primary} />
          <div className="font-mono" style={{ fontSize: 9, color: "rgba(0,229,255,0.4)", marginTop: 6 }}>
            MAX 42°C | MIN 15°C
          </div>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        <defs>
          <linearGradient id="tgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={cardColor.primary} stopOpacity="0.4" />
            <stop offset="1" stopColor={cardColor.primary} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {history.temp.length > 1 && <path d={areaPath} fill="url(#tgrad)" />}
        {history.temp.length > 1 && <polyline points={pts} fill="none" stroke={cardColor.primary} strokeWidth="1.5" />}
        <line x1="0" y1={H - ((30 - min) / (max - min)) * H} x2={W} y2={H - ((30 - min) / (max - min)) * H} stroke="rgba(255,170,0,0.3)" strokeWidth="0.5" strokeDasharray="4 3" />
        <line x1="0" y1={H - ((34 - min) / (max - min)) * H} x2={W} y2={H - ((34 - min) / (max - min)) * H} stroke="rgba(255,34,68,0.3)" strokeWidth="0.5" strokeDasharray="4 3" />
      </svg>
      {high && <CritAlert msg="PRAG TERMIC DEPĂȘIT" />}
    </div>
  );
}

function DistanceRadar({ distance, state }) {
  const colors = getStateColors(state);
  const danger = distance < 25;
  const warning = distance < 50;
  const cardColor = danger ? getStateColors("CRITIC") : warning ? getStateColors("AVERTIZARE") : colors;
  const pct = Math.max(0, Math.min(1, 1 - distance / 150));

  return (
    <div className="glass holo" style={{ padding: "16px", border: `1px solid ${cardColor.border}`, boxShadow: `0 0 20px ${cardColor.glow}, inset 0 0 20px ${cardColor.dim}` }}>
      <div className="font-mono" style={{ fontSize: 10, color: cardColor.primary, letterSpacing: 3, marginBottom: 10 }}>PROXIMITATE / HC-SR04</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
          <svg width="90" height="90" viewBox="0 0 90 90">
            <defs>
              <radialGradient id="radarsweep" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={cardColor.primary} stopOpacity="0.5" />
                <stop offset="100%" stopColor={cardColor.primary} stopOpacity="0" />
              </radialGradient>
            </defs>
            {[1, 2, 3].map(r => (
              <circle key={r} cx="45" cy="45" r={r * 12} fill="none" stroke={cardColor.primary} strokeWidth="0.5" opacity="0.25" />
            ))}
            <line x1="45" y1="45" x2="45" y2="9" stroke={cardColor.primary} strokeWidth="0.5" opacity="0.2" />
            <line x1="45" y1="45" x2="81" y2="45" stroke={cardColor.primary} strokeWidth="0.5" opacity="0.2" />
            <line x1="45" y1="45" x2="45" y2="81" stroke={cardColor.primary} strokeWidth="0.5" opacity="0.2" />
            <line x1="45" y1="45" x2="9" y2="45" stroke={cardColor.primary} strokeWidth="0.5" opacity="0.2" />
            <g style={{ transformOrigin: "45px 45px", animation: "radar-sweep 3s linear infinite" }}>
              <path d="M45,45 L80,45 A35,35 0 0,0 45,10 Z" fill={`url(#radarsweep)`} opacity="0.6" />
              <line x1="45" y1="45" x2="80" y2="45" stroke={cardColor.primary} strokeWidth="1.5" opacity="0.9" />
            </g>
            {pct > 0.3 && (
              <circle cx={45 + Math.cos(2) * 35 * (1 - pct)} cy={45 + Math.sin(2) * 35 * (1 - pct)} r="3" fill={cardColor.primary}>
                <animate attributeName="opacity" values="1;0.3;1" dur={danger ? "0.4s" : "1.2s"} repeatCount="indefinite" />
              </circle>
            )}
            <circle cx="45" cy="45" r="3" fill={cardColor.primary} />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div className="font-orb" style={{ fontSize: 28, fontWeight: 900, color: cardColor.primary, textShadow: `0 0 15px ${cardColor.glow}`, lineHeight: 1 }}>{distance}<span style={{ fontSize: 12, marginLeft: 4 }}>cm</span></div>
          <StatusBadge label={danger ? "RISC COLIZIUNE" : warning ? "ALERTĂ PROXIMITATE" : "LIBER"} color={cardColor.primary} />
          <div style={{ marginTop: 8 }}>
            <div className="font-mono" style={{ fontSize: 9, color: "rgba(0,229,255,0.4)", marginBottom: 3 }}>INDEX PROXIMITATE</div>
            <div style={{ height: 4, background: "rgba(0,229,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct * 100}%`, background: `linear-gradient(90deg, ${cardColor.secondary}, ${cardColor.primary})`, borderRadius: 2, transition: "width 0.5s ease", boxShadow: `0 0 8px ${cardColor.primary}` }} />
            </div>
          </div>
        </div>
      </div>
      {danger && <CritAlert msg="COLIZIUNE IMINENTĂ — PROTOCOL EVITARE ACTIV" />}
    </div>
  );
}

function OrbitalStabilityPanel({ gyro, orientation, state }) {
  const colors = getStateColors(state);
  const unstable = orientation === "INSTABIL";
  const cardColor = unstable ? getStateColors("CRITIC") : colors;
  const cx = 50, cy = 50, r = 35;

  const toX = (angle, radius = r) => cx + Math.cos(angle * Math.PI / 180) * radius;
  const toY = (angle, radius = r) => cy + Math.sin(angle * Math.PI / 180) * radius;

  return (
    <div className="glass holo" style={{ padding: "16px", border: `1px solid ${cardColor.border}`, boxShadow: `0 0 20px ${cardColor.glow}, inset 0 0 20px ${cardColor.dim}` }}>
      <div className="font-mono" style={{ fontSize: 10, color: cardColor.primary, letterSpacing: 3, marginBottom: 10 }}>ORIENTARE / MPU6050</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            {/* Outer ring */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={cardColor.primary} strokeWidth="1" opacity="0.3" style={{ transformOrigin: `${cx}px ${cy}px`, animation: "spin-slow 12s linear infinite" }} />
            {/* Middle ring */}
            <circle cx={cx} cy={cy} r={r * 0.65} fill="none" stroke={cardColor.secondary} strokeWidth="0.8" opacity="0.25" style={{ transformOrigin: `${cx}px ${cy}px`, animation: "spin-rev 8s linear infinite" }} />
            {/* Horizon line */}
            <line x1={cx - r * 0.9} y1={cy + gyro.x * 5} x2={cx + r * 0.9} y2={cy - gyro.x * 5} stroke={cardColor.primary} strokeWidth="1" opacity="0.6" />
            {/* Center cross */}
            <line x1={cx - 8} y1={cy} x2={cx + 8} y2={cy} stroke={cardColor.primary} strokeWidth="0.8" />
            <line x1={cx} y1={cy - 8} x2={cx} y2={cy + 8} stroke={cardColor.primary} strokeWidth="0.8" />
            {/* Gyro dot */}
            <circle cx={cx + gyro.y * 6} cy={cy + gyro.x * 6} r="4" fill={cardColor.primary} opacity="0.9">
              {unstable && <animate attributeName="r" values="4;6;4" dur="0.6s" repeatCount="indefinite" />}
            </circle>
            {/* Tick marks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => (
              <line key={a} x1={toX(a, r - 3)} y1={toY(a, r - 3)} x2={toX(a, r + 3)} y2={toY(a, r + 3)} stroke={cardColor.primary} strokeWidth={a % 90 === 0 ? 1.5 : 0.5} opacity="0.5" />
            ))}
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <StatusBadge label={orientation} color={cardColor.primary} />
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
            {[[ "TANGAJ (P)", gyro.x, 5], ["RULIU (R)", gyro.y, 5], ["GIRARE (Y)", gyro.z, 5]].map(([label, val, maxV]) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span className="font-mono" style={{ fontSize: 9, color: "rgba(0,229,255,0.5)" }}>{label}</span>
                  <span className="font-mono" style={{ fontSize: 9, color: cardColor.primary }}>{val > 0 ? "+" : ""}{val}°</span>
                </div>
                <div style={{ height: 3, background: "rgba(0,229,255,0.08)", borderRadius: 2, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: "50%", width: `${Math.abs(val) / maxV * 50}%`, height: "100%", background: `linear-gradient(90deg, ${cardColor.primary}, ${cardColor.secondary})`, transform: val > 0 ? "none" : "scaleX(-1)", transformOrigin: "left", borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AIAnalysisPanel({ decision, state, data }) {
  const colors = getStateColors(state);
  const [log, setLog] = useState([]);
  const logRef = useRef([]);

  useEffect(() => {
    if (!decision) return;
    const last = logRef.current[0];
    if (last && last.msg === decision) return;
    const entry = { id: Date.now(), msg: decision, time: new Date().toISOString().substr(11, 8), state };
    logRef.current = [entry, ...logRef.current.slice(0, 6)];
    setLog([...logRef.current]);
  }, [decision, state]);

  return (
    <div className="glass holo" style={{ padding: "16px", border: `1px solid ${colors.border}`, boxShadow: `0 0 20px ${colors.glow}, inset 0 0 30px ${colors.dim}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.primary, boxShadow: `0 0 8px ${colors.primary}`, animation: "blink-crit 1.5s infinite" }} />
        <span className="font-mono" style={{ fontSize: 10, color: colors.primary, letterSpacing: 3 }}>MOTOR DE DECIZIE IA v3.1</span>
      </div>
      {/* Decizie curentă */}
      <div style={{ background: "rgba(0,229,255,0.04)", border: `1px solid ${colors.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
        <div className="font-mono" style={{ fontSize: 9, color: "rgba(0,229,255,0.4)", marginBottom: 5, letterSpacing: 2 }}>DIRECTIVĂ ACTIVĂ</div>
        <div className="font-raj" style={{ fontSize: 14, color: colors.primary, fontWeight: 600, lineHeight: 1.4 }}>{decision}</div>
      </div>
      {/* Mini-grid metrici */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
        {[
          ["TERMIC", `${data.temperature}°C`, data.temperature > 30],
          ["PROXIM.", `${data.distance}cm`, data.distance < 50],
          ["STABIL.", data.orientation, data.orientation === "INSTABIL"],
        ].map(([label, val, warn]) => (
          <div key={label} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${warn ? "rgba(255,170,0,0.3)" : "rgba(0,229,255,0.1)"}`, borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
            <div className="font-mono" style={{ fontSize: 10, color: "rgba(0,229,255,0.4)", letterSpacing: 1 }}>{label}</div>
            <div className="font-mono" style={{ fontSize: 11, color: warn ? "#ffaa00" : "#00e5ff", fontWeight: 700 }}>{val}</div>
          </div>
        ))}
      </div>
      {/* Log */}
      <div className="font-mono" style={{ fontSize: 9, color: "rgba(0,229,255,0.3)", marginBottom: 5, letterSpacing: 2 }}>JURNAL DECIZII</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 120, overflowY: "auto" }}>
        {log.map((e, i) => {
          const c = getStateColors(e.state);
          return (
            <div key={e.id} className="slide-in" style={{ display: "flex", gap: 6, alignItems: "flex-start", opacity: 1 - i * 0.12 }}>
              <span className="font-mono" style={{ fontSize: 9, color: "rgba(0,229,255,0.3)", whiteSpace: "nowrap", flexShrink: 0 }}>{e.time}</span>
              <span className="font-mono" style={{ fontSize: 9, color: i === 0 ? c.primary : "rgba(0,229,255,0.4)" }}>▶ {e.msg}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlertPanel({ data, state }) {
  const colors = getStateColors(state);

  const alerts = [];

  if (data.temperature > 34)
    alerts.push({
      sev: "CRITIC",
      msg: "SUPRAÎNCĂLZIRE — Protocol de răcire activat",
      icon: "⚠"
    });

  else if (data.temperature > 30)
    alerts.push({
      sev: "AVERTIZARE",
      msg: "Temperatură ridicată — Monitorizare necesară",
      icon: "!"
    });

  if (data.distance < 25)
    alerts.push({
      sev: "CRITIC",
      msg: "COLIZIUNE IMINENTĂ — Manevrată de evitare activă",
      icon: "⚠"
    });

  else if (data.distance < 50)
    alerts.push({
      sev: "AVERTIZARE",
      msg: "Alertă proximitate — Obiect detectat",
      icon: "!"
    });

  if (data.orientation === "INSTABIL")
    alerts.push({
      sev: "CRITIC",
      msg: "INSTABILITATE ORBITALĂ — Stabilizare activată",
      icon: "⚠"
    });

  if (alerts.length === 0)
    alerts.push({
      sev: "OK",
      msg: "Toate sistemele funcționează nominal",
      icon: "✓"
    });

  return (
    <div
      className="glass holo"
      style={{
        padding: "16px",
        border: `1px solid ${colors.border}`,
        boxShadow: `0 0 20px ${colors.glow}`
      }}
    >
      <div
        className="font-mono"
        style={{
          fontSize: 12,
          color: colors.primary,
          letterSpacing: 4,
          marginBottom: 14,
          textAlign: "center",
          fontWeight: 700
        }}
      >
        SISTEM DE ALERTE
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10
        }}
      >
        {alerts.map((a, i) => {

          const ac =
            a.sev === "CRITIC"
              ? getStateColors("CRITIC")
              : a.sev === "AVERTIZARE"
              ? getStateColors("AVERTIZARE")
              : {
                  primary: "#00ff88",
                  border: "rgba(0,255,136,0.3)",
                  glow: "rgba(0,255,136,0.2)",
                  dim: "rgba(0,255,136,0.05)"
                };

          return (
            <div
              key={i}
              className={a.sev === "CRITIC" ? "blink-crit" : ""}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                gap: 14,

                padding: "16px",

                minHeight: 90,

                background: ac.dim,

                border: `1px solid ${ac.border}`,

                borderRadius: 8,

                textAlign: "center",

                boxShadow:
                  a.sev === "CRITIC"
                    ? `0 0 14px ${ac.glow}`
                    : `0 0 8px ${ac.glow}`
              }}
            >
              <span
                style={{
                  color: ac.primary,
                  fontSize: 24,
                  flexShrink: 0,

                  textShadow: `0 0 10px ${ac.glow}`
                }}
              >
                {a.icon}
              </span>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",

                  alignItems: "center",

                  justifyContent: "center",

                  gap: 6
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 11,

                    color: ac.primary,

                    letterSpacing: 2,

                    fontWeight: 700
                  }}
                >
                  [{a.sev}]
                </div>

                <div
                  className="font-raj"
                  style={{
                    fontSize: 15,

                    color:
                      a.sev === "OK"
                        ? ac.primary
                        : "rgba(220,240,255,0.95)",

                    fontWeight: 600,

                    lineHeight: 1.4,

                    maxWidth: 280
                  }}
                >
                  {a.msg}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ServoPanel({ servo, state }) {
  const colors = getStateColors(state);
  return (
    <div className="glass holo" style={{ padding: "16px", border: `1px solid ${colors.border}`, boxShadow: `0 0 20px ${colors.glow}` }}>
      <div className="font-mono" style={{ fontSize: 10, color: colors.primary, letterSpacing: 3, marginBottom: 12 }}>ACTUATORI SERVO</div>
      {[["ROTATIE (PAN)", servo.pan, 180], ["INCLINARE (TILT)", servo.tilt, 90]].map(([label, val, max]) => (
        <div key={label} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span className="font-raj" style={{ fontSize: 13, color: "rgba(180,220,255,0.7)", fontWeight: 600 }}>{label}</span>
            <span className="font-orb" style={{ fontSize: 14, color: colors.primary }}>{val}°</span>
          </div>
          <div style={{ position: "relative", height: 6, background: "rgba(0,229,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(val / max) * 100}%`, background: `linear-gradient(90deg, ${colors.secondary}, ${colors.primary})`, borderRadius: 3, transition: "width 0.5s ease", boxShadow: `0 0 8px ${colors.glow}` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span className="font-mono" style={{ fontSize: 10, color: "rgba(0,229,255,0.3)" }}>0°</span>
            <span className="font-mono" style={{ fontSize: 10, color: "rgba(0,229,255,0.3)" }}>{max}°</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SystemStatusHeader({ state, uptime, connected, risk }) {
  const colors = getStateColors(state);
  const uptimeStr = (() => {
    const s = uptime || 0; const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  })();

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${colors.border}`, position: "relative", zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.primary, boxShadow: `0 0 10px ${colors.primary}`, animation: state === "CRITIC" ? "blink-crit 0.5s infinite" : "blink-crit 2s infinite" }} />
          <span className="font-orb" style={{ fontSize: 18, fontWeight: 900, color: colors.primary, letterSpacing: 2, textShadow: `0 0 20px ${colors.glow}` }}>QUARTZ</span>
          <span className="font-mono" style={{ fontSize: 9, color: "rgba(0,229,255,0.4)", letterSpacing: 3, marginTop: 1 }}>Digital Twin</span>
        </div>
        <div style={{ height: 20, width: 1, background: "rgba(0,229,255,0.2)" }} />
        <div className="font-mono" style={{ fontSize: 10, color: "rgba(0,229,255,0.5)" }}>MISSION QUARTZ / AI ACTIVE</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Badge stare */}
        <div style={{ padding: "5px 14px", border: `1px solid ${colors.primary}`, borderRadius: 4, background: colors.dim, boxShadow: `0 0 12px ${colors.glow}` }}>
          <span className={`font-orb ${state === "CRITIC" ? "blink-crit" : ""}`} style={{ fontSize: 12, fontWeight: 700, color: colors.primary, letterSpacing: 2 }}>{state}</span>
        </div>
        {/* Uptime */}
        <div style={{ textAlign: "center" }}>
          <div className="font-mono" style={{ fontSize: 9, color: "rgba(0,229,255,0.3)", letterSpacing: 1 }}>UPTIME</div>
          <div className="font-mono" style={{ fontSize: 12, color: "#00e5ff" }}>{uptimeStr}</div>
        </div>
        {/* Conexiune */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: connected ? "#00ff88" : "#ff4466", boxShadow: `0 0 8px ${connected ? "#00ff88" : "#ff4466"}` }} />
          <span className="font-mono" style={{ fontSize: 9, color: connected ? "#00ff88" : "#ff4466" }}>{connected ? "LIVE" : "SIM"}</span>
        </div>
        {/* Risc */}
        <div style={{ textAlign: "center" }}>
          <div className="font-mono" style={{ fontSize: 9, color: "rgba(0,229,255,0.3)", letterSpacing: 1 }}>RISC</div>
          <div className="font-mono" style={{ fontSize: 12, color: risk === "RIDICAT" ? "#ff2244" : risk === "MEDIU" ? "#ffaa00" : "#00ff88" }}>{risk}</div>
        </div>
      </div>
    </div>
  );
}

function Ticker({ data, state }) {
  const colors = getStateColors(state);
  const items = [
    `TEMP ${data.temperature}°C`, `UMIDITATE ${data.humidity}%`, `PROXIMITATE ${data.distance}cm`,
    `ORIENTARE ${data.orientation}`, `NIVEL RISC ${data.risk}`, `PAN ${data.servo?.pan ?? 90}°`, `TILT ${data.servo?.tilt ?? 45}°`,
    `TANGAJ ${data.gyro?.x ?? 0}°`, `RULIU ${data.gyro?.y ?? 0}°`, `GIRARE ${data.gyro?.z ?? 0}°`,
  ];
  return (
    <div style={{ background: "rgba(0,0,0,0.7)", borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, overflow: "hidden", height: 26, display: "flex", alignItems: "center" }}>
      <div style={{ whiteSpace: "nowrap", animation: "ticker 50s linear infinite", display: "flex", gap: 40 }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="font-mono" style={{ fontSize: 9, color: colors.primary, letterSpacing: 2, opacity: 0.8 }}>
            ◆ {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ label, color }) {
  return (
    <div style={{ display: "inline-block", padding: "2px 8px", border: `1px solid ${color}`, borderRadius: 3, background: `${color}15`, marginTop: 4 }}>
      <span className="font-mono" style={{ fontSize: 9, color, letterSpacing: 2 }}>{label}</span>
    </div>
  );
}
function CritAlert({ msg }) {
  return (
    <div className="blink-crit" style={{ marginTop: 8, padding: "5px 8px", background: "rgba(255,34,68,0.08)", border: "1px solid rgba(255,34,68,0.4)", borderRadius: 4, display: "flex", gap: 6, alignItems: "center" }}>
      <span style={{ color: "#ff2244", fontSize: 10 }}>⚠</span>
      <span className="font-mono" style={{ fontSize: 9, color: "#ff6680", letterSpacing: 1 }}>{msg}</span>
    </div>
  );
}

function MiniStat({ label, value, unit, state }) {
  const colors = getStateColors(state);
  return (
    <div style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${colors.border}`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
      <div className="font-mono" style={{ fontSize: 10, color: "rgba(0,229,255,0.4)", letterSpacing: 2, marginBottom: 4 }}>{label}</div>
      <div className="font-orb" style={{ fontSize: 18, fontWeight: 700, color: colors.primary, lineHeight: 1 }}>{value}</div>
      {unit && <div className="font-mono" style={{ fontSize: 10, color: "rgba(0,229,255,0.4)", marginTop: 2 }}>{unit}</div>}
    </div>
  );
}

export default function App() {
  const { data, history, connected } = useTelemetry();
  const { state } = data;
  const colors = getStateColors(state);

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", position: "relative", fontFamily: "'Rajdhani', sans-serif" }}>
        <EarthBackground state={state} />

        {/* Layout principal */}
        <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <SystemStatusHeader state={state} uptime={data.uptime} connected={connected} risk={data.risk} />
          <Ticker data={data} state={state} />

          {/* ── CONȚINUT ── */}
          <div style={{ flex: 1, padding: "16px", display: "grid", gridTemplateColumns: "1fr 320px", gridTemplateRows: "auto 1fr auto", gap: 12, maxWidth: 1400, margin: "0 auto", width: "100%" }}>

            {/* COLOANA STÂNGA */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* SATELIT + MINI STATS */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 12, alignItems: "stretch" }}>
                {/* Panou central satelit */}
                <div className="glass holo" style={{ padding: "20px", border: `1px solid ${colors.border}`, boxShadow: `0 0 40px ${colors.glow}, inset 0 0 40px ${colors.dim}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <div className="font-mono" style={{ fontSize: 9, color: colors.primary, letterSpacing: 4 }}>SAT-001 / GEMĂNARE DIGITALĂ AUTONOMĂ</div>
                  <FloatingSatellite state={state} />
                  <div style={{ textAlign: "center" }}>
                    <div className={`font-orb ${state === "CRITIC" ? "blink-crit" : ""}`} style={{ fontSize: 22, fontWeight: 900, color: colors.primary, letterSpacing: 4, textShadow: `0 0 30px ${colors.glow}` }}>{state}</div>
                    <div className="font-raj" style={{ fontSize: 11, color: "rgba(180,220,255,0.5)", marginTop: 4 }}>STARE MISIUNE</div>
                  </div>
                  {/* Indicatori inelari animați */}
                  <div style={{ display: "flex", gap: 16 }}>
                    {["TERMIC", "PROXIMITATE", "ORBITAL"].map((label, i) => {
                      const ok = [data.temperature <= 30, data.distance >= 50, data.orientation === "STABIL"][i];
                      const c = ok ? "#00e5ff" : "#ffaa00";
                      return (
                        <div key={label} style={{ textAlign: "center" }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: ok ? c : "transparent", border: `1.5px solid ${c}`, boxShadow: `0 0 8px ${c}`, margin: "0 auto 4px" }}>
                            {!ok && <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: c, animation: "blink-crit 1s infinite", opacity: 0.6 }} />}
                          </div>
                          <div className="font-mono" style={{ fontSize: 7, color: `${c}aa`, letterSpacing: 1 }}>{label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Coloană mini stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8, alignContent: "start" }}>
                  <MiniStat label="TEMPERATURĂ" value={data.temperature} unit="°C" state={data.temperature > 34 ? "CRITIC" : data.temperature > 30 ? "AVERTIZARE" : "STABIL"} />
                  <MiniStat label="UMIDITATE" value={data.humidity} unit="%" state="STABIL" />
                  <MiniStat label="DISTANȚĂ" value={data.distance} unit="cm" state={data.distance < 25 ? "CRITIC" : data.distance < 50 ? "AVERTIZARE" : "STABIL"} />
                  <MiniStat label="ORIENTARE" value={data.orientation === "STABIL" ? "STB" : "INS"} state={data.orientation === "STABIL" ? "STABIL" : "CRITIC"} />
                </div>
              </div>

              {/* RÂND PANOURI SENZORI */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <TemperatureCard temp={data.temperature} humidity={data.humidity} history={history} state={data.temperature > 34 ? "CRITIC" : data.temperature > 30 ? "AVERTIZARE" : "STABIL"} />
                <DistanceRadar distance={data.distance} state={data.distance < 25 ? "CRITIC" : data.distance < 50 ? "AVERTIZARE" : "STABIL"} />
              </div>

              {/* RÂND ORBITAL + SERVO */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <OrbitalStabilityPanel gyro={data.gyro ?? { x: 0, y: 0, z: 0 }} orientation={data.orientation} state={data.orientation === "INSTABIL" ? "CRITIC" : "STABIL"} />
                <ServoPanel servo={data.servo ?? { pan: 90, tilt: 45 }} state={state} />
              </div>
            </div>

            {/* COLOANA DREAPTĂ */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <AIAnalysisPanel decision={data.decision} state={state} data={data} />
              <AlertPanel data={data} state={state} />

              {/* Ceas misiune */}
              <div className="glass holo" style={{ padding: "14px", border: `1px solid ${colors.border}` }}>
                <div className="font-mono" style={{ fontSize: 10, color: colors.primary, letterSpacing: 3, marginBottom: 10 }}>TELEMETRIE MISIUNE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {[
                    ["TELEMETRIE", connected ? "LIVE" : "MOD-SIM"],
                    ["INTERVAL", "1000ms"],
                    ["NIVEL RISC", data.risk],
                    ["SERVO PAN", `${data.servo?.pan ?? 90}°`],
                    ["SERVO TILT", `${data.servo?.tilt ?? 45}°`],
                    ["MOTOR IA", "ONLINE"],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 4, padding: "6px 8px" }}>
                      <div className="font-mono" style={{ fontSize: 10, color: "rgba(0,229,255,0.35)", letterSpacing: 1 }}>{label}</div>
                      <div className="font-mono" style={{ fontSize: 10, color: colors.primary }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vizualizare putere semnal */}
              <div className="glass holo" style={{ padding: "14px", border: `1px solid ${colors.border}` }}>
                <div className="font-mono" style={{ fontSize: 10, color: colors.primary, letterSpacing: 3, marginBottom: 10 }}>INTEGRITATE SEMNAL</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40, justifyContent: "center" }}>
                  {Array.from({ length: 12 }).map((_, i) => {
                    const active = connected ? i < 9 : i < 4;
                    const h = 8 + i * 2.5;
                    return (
                      <div key={i} style={{ width: 10, height: h, borderRadius: 2, background: active ? colors.primary : "rgba(0,229,255,0.1)", boxShadow: active ? `0 0 6px ${colors.glow}` : "none", transition: "background 0.5s ease" }} />
                    );
                  })}
                </div>
                <div className="font-mono" style={{ fontSize: 9, color: "rgba(0,229,255,0.4)", textAlign: "center", marginTop: 6 }}>
                  {connected ? "PUTERNIC — 98.7% UPLINK" : "MOD SIMULARE — LOCAL"}
                </div>
              </div>
            </div>
          </div>

          {/* SUBSOL */}
          <div style={{ padding: "8px 20px", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", borderTop: `1px solid rgba(0,229,255,0.1)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="font-mono" style={{ fontSize: 9, color: "rgba(0,229,255,0.3)" }}>SISTEM AUTONOM DE GEMĂNARE DIGITALĂ SATELITARĂ — SAT-001 — BACKEND RASPBERRY PI + ESP32</span>
            <span className="font-mono" style={{ fontSize: 9, color: "rgba(0,229,255,0.3)" }}>{new Date().toISOString().replace("T", " ").substr(0, 19)} UTC</span>
          </div>
        </div>
      </div>
    </>
  );
}