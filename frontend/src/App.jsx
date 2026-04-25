import { useState, useEffect, useRef } from "react";


function useTelemetry() {
  const [data, setData] = useState({
    temperature: 24.5,
    humidity: 58,
    distance: 87,
    orientation: "STABIL",
    gyro: { x: 0.3, y: -0.1, z: 0.0 },
    servo: { pan: 112, tilt: 38 },
    state: "STABIL",
    risk: "LOW",
    decision: "Toate sistemele funcționează nominal. Menținere traiectorie.",
    uptime: 3821,
  });

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch(
          "http://172.20.10.13:5000/telemetry"
        );

        const json = await res.json();

        setData(prev => ({
            ...prev,
            ...json,

            temperature:
              json.temperature > 0 &&
              Math.abs(json.temperature - prev.temperature) < 8
                ? json.temperature
                : prev.temperature,

            distance:
                json.distance ??
                json.distance_cm ??
                prev.distance,

          gyro:
            json.gyro
              ? json.gyro
              : prev.gyro,

          servo:
            json.servo
              ? json.servo
              : prev.servo,
        }));

        setConnected(true);
      }
      catch {
        setConnected(false);
      }
    };

    fetchTelemetry();

    const id = setInterval(
      fetchTelemetry,
      500
    );

    return () => clearInterval(id);

  }, []);

  return {
    data,
    connected
  };
}

function uptime(s = 0) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sc = s % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sc).padStart(2,"0")}`;
}

function stateColor(s) {
  if (s === "CRITIC")     return "#dc2626";
  if (s === "AVERTIZARE") return "#d97706";
  return "#0369a1";
}

function sensorState(val, warn, crit) {
  if (val >= crit) return "CRITIC";
  if (val >= warn) return "AVERTIZARE";
  return "STABIL";
}

function Gauge({ value, min, max, unit, label, color, size = 120 }) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const r = 44, cx = 60, cy = 62;
  const startAngle = -210, sweep = 240;
  const toRad = d => d * Math.PI / 180;
  const arc = (angle) => {
    const rad = toRad(angle);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const s = arc(startAngle);
  const e = arc(startAngle + sweep);
  const endAngle = startAngle + sweep * pct;
  const ep = arc(endAngle);
  const lg = sweep * pct > 180 ? 1 : 0;
  const lg2 = sweep > 180 ? 1 : 0;

  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 120 108" style={{ overflow: "visible" }}>
      <path
        d={`M${s.x},${s.y} A${r},${r} 0 ${lg2},1 ${e.x},${e.y}`}
        fill="none" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round"
      />
      {pct > 0 && (
        <path
          d={`M${s.x},${s.y} A${r},${r} 0 ${lg},1 ${ep.x},${ep.y}`}
          fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}55)` }}
        />
      )}
      <text x="60" y="66" textAnchor="middle" fill="#0f172a" fontSize="20" fontFamily="Epilogue, sans-serif" fontWeight="700">{value}</text>
      <text x="60" y="78" textAnchor="middle" fill={color} fontSize="9" fontFamily="DM Mono, monospace" letterSpacing="1">{unit}</text>
      <text x="60" y="92" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="DM Mono, monospace" letterSpacing="2">{label}</text>
    </svg>
  );
}

function Bar({ value, max, color, label, unit, warn, crit }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const col = label === "DISTANȚĂ" ? value <= 25 ? "#dc2626" : value <= 50 ? "#d97706" : "#0369a1" : value >= crit ? "#dc2626" : value >= warn ? "#d97706" : color;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 10, fontFamily: "DM Mono, monospace", letterSpacing: "0.15em", color: "#64748b" }}>{label}</span>
        <span style={{ fontSize: 14, fontFamily: "Epilogue, sans-serif", fontWeight: 700, color: "#0f172a" }}>{value}<span style={{ fontSize: 10, color: col, marginLeft: 2 }}>{unit}</span></span>
      </div>
      <div style={{ height: 6, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct * 100}%`, background: col, borderRadius: 99,
          transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
          boxShadow: `0 0 8px ${col}55`,
        }} />
      </div>
    </div>
  );
}

function GyroLevel({ gx = 0, gy = 0, color }) {
  const cx = 50, cy = 50, R = 36;
  const bx = Math.max(cx - R + 8, Math.min(cx + R - 8, cx + gy * 5));
  const by = Math.max(cy - R + 8, Math.min(cy + R - 8, cy + gx * 5));
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      {[R, R * 0.6, R * 0.25].map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={i === 0 ? "#e2e8f0" : "#f1f5f9"} strokeWidth={i === 0 ? 1.5 : 1} />
      ))}
      <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke="#e2e8f0" strokeWidth="0.8" />
      <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke="#e2e8f0" strokeWidth="0.8" />
      <circle cx={bx} cy={by} r="8" fill={`${color}22`} stroke={color} strokeWidth="2"
        style={{ transition: "cx 0.5s ease, cy 0.5s ease", filter: `drop-shadow(0 0 3px ${color}66)` }} />
      <circle cx={cx} cy={cy} r="2" fill="#cbd5e1" />
    </svg>
  );
}

function ServoDial({ value, max, label, color }) {
  const pct = value / max;
  const r = 28, c = 36;
  const startA = -220, sweepA = 260;
  const toR = d => d * Math.PI / 180;
  const pt = a => ({ x: c + r * Math.cos(toR(a)), y: c + r * Math.sin(toR(a)) });
  const s = pt(startA), e = pt(startA + sweepA), ep = pt(startA + sweepA * pct);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <path d={`M${s.x},${s.y} A${r},${r} 0 1,1 ${e.x},${e.y}`} fill="none" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
        {pct > 0 && <path d={`M${s.x},${s.y} A${r},${r} 0 ${pct > 0.72 ? 1 : 0},1 ${ep.x},${ep.y}`} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 3px ${color}55)` }} />}
        <text x={c} y={c + 5} textAnchor="middle" fill="#0f172a" fontSize="13" fontFamily="Epilogue, sans-serif" fontWeight="700">{value}°</text>
      </svg>
      <span style={{ fontSize: 9, fontFamily: "DM Mono, monospace", letterSpacing: "0.15em", color: "#94a3b8" }}>{label}</span>
    </div>
  );
}

function AlertPill({ msg, sev, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 14px", borderRadius: 10,
      background: sev === "STABIL" ? "#f0fdf4" : sev === "AVERTIZARE" ? "#fffbeb" : "#fef2f2",
      border: `1px solid ${color}33`,
      animation: sev === "CRITIC" ? "critBlink 2s ease-in-out infinite" : "none",
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}` }} />
      <span style={{ fontSize: 12, fontFamily: "Epilogue, sans-serif", color: "#1e293b" }}>{msg}</span>
    </div>
  );
}

function DecisionLog({ decision, state }) {
  const [log, setLog] = useState([]);
  const prev = useRef("");
  useEffect(() => {
    if (!decision || decision === prev.current) return;
    prev.current = decision;
    setLog(l => [{
      id: Date.now(),
      msg: decision,
      time: new Date().toLocaleTimeString("ro-RO"),
      state,
    }, ...l].slice(0, 8));
  }, [decision, state]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {log.length === 0 && (
        <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "DM Mono, monospace" }}>— în așteptare —</span>
      )}
      {log.map((e, i) => (
        <div key={e.id} style={{
          display: "flex", gap: 10, alignItems: "flex-start",
          opacity: 1 - i * 0.1,
          animation: i === 0 ? "slideIn 0.3s ease" : "none",
          paddingBottom: i < log.length - 1 ? 5 : 0,
          borderBottom: i < log.length - 1 ? "1px solid #f1f5f9" : "none",
        }}>
          <span style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#94a3b8", whiteSpace: "nowrap", paddingTop: 1 }}>{e.time}</span>
          <span style={{ fontSize: 11, fontFamily: "Epilogue, sans-serif", color: i === 0 ? "#0f172a" : "#64748b", lineHeight: 1.5 }}>{e.msg}</span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [commandOpen, setCommandOpen] = useState(false);
  const { data, connected } = useTelemetry();
  const state = data.state ?? "STABIL";
  const sc = stateColor(state);
  const gyro = data.gyro ?? { x: 0, y: 0, z: 0 };
  const servo = data.servo ?? { pan: 90, tilt: 45 };
  const ts = sensorState(data.temperature, 30, 34);
  const os = data.orientation === "INSTABIL" ? "CRITIC" : "STABIL";

  const alerts = [];
  const sendCommand = async (command) => {
    try {
      await fetch("http://172.20.10.13:5000/command", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          command,
        }),
      });

    } catch (err) {

      console.error(err);
    }
  };

  if (data.temperature > 34)
  if (data.temperature > 34) alerts.push({ msg: "Supraîncălzire — protocol răcire activ", sev: "CRITIC", color: "#dc2626" });
  else if (data.temperature > 30) alerts.push({ msg: "Temperatură ridicată — monitorizare activă", sev: "AVERTIZARE", color: "#d97706" });
  if ((data.distance ?? 100) < 25) alerts.push({ msg: "Coliziune iminentă — evitare activă", sev: "CRITIC", color: "#dc2626" });
  else if ((data.distance ?? 100) < 50) alerts.push({ msg: "Obiect detectat în proximitate", sev: "AVERTIZARE", color: "#d97706" });
  if (data.orientation === "INSTABIL") alerts.push({ msg: "Instabilitate orbitală — stabilizare în curs", sev: "CRITIC", color: "#dc2626" });
  if (alerts.length === 0) alerts.push({ msg: "Toate sistemele funcționează nominal", sev: "STABIL", color: "#16a34a" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body {
          font-family: 'Epilogue', sans-serif;
          background: #f8fafc;
          color: #0f172a;
          -webkit-font-smoothing: antialiased;
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes critBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 22px 24px;
          box-shadow: 0 1px 4px rgba(15,23,42,0.06);
          animation: fadeIn 0.5s ease both;
        }
        .card-label {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .span3 { grid-column: span 3; }

        @media (max-width: 1100px) {
          .grid { grid-template-columns: repeat(2, 1fr); }
          .span3 { grid-column: span 2; }
        }
        @media (max-width: 680px) {
          .grid { grid-template-columns: 1fr; }
          .span3 { grid-column: span 1; }
        }
        @media (max-width: 480px) {
          .sensor-summary-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
        <header style={{
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          padding: "0 32px",
          height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 1px 8px rgba(15,23,42,0.06)",
        }}>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", width: 32, height: 32 }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: `2px solid ${sc}`,
                animation: "spin 8s linear infinite",
                opacity: 0.35,
              }} />
              <div style={{ position: "absolute", inset: 6, borderRadius: "50%", background: sc, opacity: 0.15 }} />
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                width: 8, height: 8, borderRadius: "50%",
                background: sc, boxShadow: `0 0 8px ${sc}`,
              }} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a", lineHeight: 1 }}>QUARTZ</div>
              <div style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#94a3b8", letterSpacing: "0.2em" }}>SAT-001 · DIGITAL TWIN</div>
            </div>
          </div>

          <div style={{
            padding: "6px 20px", borderRadius: 99,
            background: state === "CRITIC" ? "#fef2f2" : state === "AVERTIZARE" ? "#fffbeb" : "#eff6ff",
            border: `1.5px solid ${sc}44`,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: sc, animation: "ping 1.5s ease infinite", opacity: 0.5 }} />
              <span style={{ position: "relative", width: 8, height: 8, borderRadius: "50%", background: sc, display: "block" }} />
            </span>
            <span style={{ fontSize: 11, fontFamily: "DM Mono, monospace", letterSpacing: "0.2em", color: sc, fontWeight: 500 }}>{state}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 8, fontFamily: "DM Mono, monospace", color: "#94a3b8", letterSpacing: "0.15em" }}>UPTIME</div>
              <div style={{ fontSize: 13, fontFamily: "DM Mono, monospace", color: "#0f172a", fontWeight: 500 }}>{uptime(data.uptime)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 8, fontFamily: "DM Mono, monospace", color: "#94a3b8", letterSpacing: "0.15em" }}>RISC</div>
              <div style={{ fontSize: 13, fontFamily: "DM Mono, monospace", fontWeight: 500,
                color: data.risk === "RIDICAT" ? "#dc2626" : data.risk === "MEDIU" ? "#d97706" : "#16a34a" }}>
                {data.risk ?? "LOW"}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 99,
              background: connected ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${connected ? "#16a34a" : "#dc2626"}33`,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: connected ? "#16a34a" : "#dc2626" }} />
              <span style={{ fontSize: 10, fontFamily: "DM Mono, monospace", color: connected ? "#16a34a" : "#dc2626", letterSpacing: "0.12em" }}>
                {connected ? "LIVE" : "SIM"}
              </span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "20px 28px 0 28px", maxWidth: 1360, margin: "0 auto", width: "100%" }}>
          <div className="grid" style={{ marginBottom: 14 }}>
            <div className="card" style={{ animationDelay: "0.05s" }}>
              <div className="card-label">Senzor Termic · DHT22</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Gauge value={data.temperature} min={10} max={45} unit="°C" label="TEMPERATURĂ" color={stateColor(ts)} />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "inline-block",
                      fontSize: 9,
                      fontFamily: "DM Mono, monospace",
                      letterSpacing: "0.15em",
                      color: stateColor(ts),
                      background: `${stateColor(ts)}15`,
                      border: `1px solid ${stateColor(ts)}33`,
                      padding: "4px 10px",
                      borderRadius: 4
                    }}
                  >
                    {ts}
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ animationDelay: "0.1s" }}>
              <div className="card-label">Proximitate · HC-SR04</div>
              {(() => {
                const distState = (data.distance ?? 100) < 25 ? "CRITIC" : (data.distance ?? 100) < 50 ? "AVERTIZARE" : "STABIL";
                const dColor = stateColor(distState);
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Gauge value={data.distance ?? 0} min={0} max={150} unit="km" label="DISTANȚĂ" color={dColor} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontFamily: "DM Mono, monospace", color: "#94a3b8", marginBottom: 4 }}>STARE</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: dColor, fontFamily: "DM Mono, monospace", letterSpacing: "0.1em", lineHeight: 1.4 }}>
                        {(data.distance ?? 0) < 25 ? "COLIZIUNE\nIMINENTĂ" : (data.distance ?? 0) < 50 ? "ALERTĂ\nPROXIMITATE" : "SPAȚIU\nLIBER"}
                      </div>
                      <div style={{ marginTop: 12 }}>
                        {[25, 50, 100].map(mark => (
                          <div key={mark} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 8, fontFamily: "DM Mono, monospace", color: "#94a3b8", width: 28 }}>{mark}km</span>
                            <div style={{ flex: 1, height: 4, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                              <div style={{
                                height: "100%",
                                width: `${Math.min(100, ((data.distance ?? 0) / mark) * 100)}%`,
                                background:
                                          (data.distance ?? 0) <= mark
                                              ? "#dc2626"
                                              : "#0369a1",
                                borderRadius: 99, transition: "width 0.6s ease",
                              }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="card" style={{ animationDelay: "0.15s" }}>
              <div className="card-label">Orientare · MPU6050</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <GyroLevel gx={gyro.x} gy={gyro.y} color={stateColor(os)} />
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 10, display: "inline-block", fontSize: 10, fontFamily: "DM Mono, monospace",
                    letterSpacing: "0.15em", color: stateColor(os),
                    background: `${stateColor(os)}15`, border: `1px solid ${stateColor(os)}33`, padding: "3px 10px", borderRadius: 5 }}>
                    {data.orientation}
                  </div>
                  {[["P", gyro.x], ["R", gyro.y], ["Y", gyro.z]].map(([l, v]) => (
                    <div key={l} style={{ marginBottom: 7 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#94a3b8" }}>{l}</span>
                        <span style={{ fontSize: 10, fontFamily: "DM Mono, monospace", color: "#0f172a", fontWeight: 500 }}>{v > 0 ? "+" : ""}{v}°</span>
                      </div>
                      <div style={{ height: 4, background: "#f1f5f9", borderRadius: 99, position: "relative", overflow: "hidden" }}>
                        <div style={{
                          position: "absolute", top: 0, height: "100%",
                          left: v >= 0 ? "50%" : `${50 + (v / 10) * 50}%`,
                          width: `${(Math.abs(v) / 10) * 50}%`,
                          background: stateColor(os), borderRadius: 99, transition: "all 0.5s ease",
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid" style={{ marginBottom: 14 }}>
            <div className="card" style={{ animationDelay: "0.2s" }}>
              <div className="card-label">Actuatori Servo</div>
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 16 }}>
                <ServoDial value={servo.pan} max={180} label="PAN · ROTAȚIE" color="#0369a1" />
                <ServoDial value={servo.tilt} max={90} label="TILT · ÎNCLINARE" color="#0369a1" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  ["INTERVAL", "1000 ms"],
                  ["MOTOR IA", "ONLINE"],
                  ["TELEMETRIE", connected ? "LIVE" : "SIM"],
                  ["BACKEND", "RPI+ESP32"],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ fontSize: 8, fontFamily: "DM Mono, monospace", color: "#94a3b8", letterSpacing: "0.15em", marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 12, fontFamily: "DM Mono, monospace", color: "#0f172a", fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ animationDelay: "0.25s" }}>
              <div className="card-label">Motor Decizie IA v3.1</div>
              <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 14, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <div style={{ fontSize: 8, fontFamily: "DM Mono, monospace", color: "#3b82f6", letterSpacing: "0.2em", marginBottom: 4 }}>DIRECTIVĂ ACTIVĂ</div>
                <div style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.5 }}>{data.decision || "—"}</div>
              </div>
              <div className="card-label" style={{ marginBottom: 8 }}>Jurnal Decizii</div>
              <DecisionLog decision={data.decision} state={state} />
            </div>

            <div className="card" style={{ animationDelay: "0.3s" }}>
              <div className="card-label">Sistem Alerte</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {alerts.map((a, i) => <AlertPill key={i} {...a} />)}
              </div>
              <div style={{ marginTop: 24 }}>
                <button
                  onClick={() => setCommandOpen(!commandOpen)}

                  style={{

                    width: "100%",

                    padding: "14px 18px",

                    borderRadius: 14,

                    border: "1px solid #0369a1",

                    background: commandOpen
                      ? "#0369a1"
                      : "#0369a1",

                    color: "white",

                    cursor: "pointer",

                    fontFamily: "DM Mono, monospace",

                    fontSize: 11,

                    letterSpacing: "0.12em",

                    textTransform: "uppercase",

                    transition: "all 0.25s ease",

                    boxShadow: commandOpen
                      ? "0 0 0 3px rgba(59,130,246,0.08)"
                      : "0 1px 2px rgba(15,23,42,0.04)",

                    transform: commandOpen
                      ? "scale(1.01)"
                      : "scale(1)",
                  }}

                  onMouseEnter={(e) => {

                    e.currentTarget.style.transform =
                      "translateY(-2px)";

                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(3,105,161,0.35)";
                  }}

                  onMouseLeave={(e) => {

                    e.currentTarget.style.transform =
                      commandOpen
                        ? "scale(1.01)"
                        : "scale(1)";

                    e.currentTarget.style.boxShadow =
                      commandOpen
                        ? "0 0 0 3px rgba(59,130,246,0.08)"
                        : "0 1px 2px rgba(15,23,42,0.04)";
                  }}
                >

                  {commandOpen
                    ? "Trimite comanda"
                    : "Trimite comanda"}

                </button>

                <div
                  style={{

                    maxHeight: commandOpen
                      ? "200px"
                      : "0px",

                    opacity: commandOpen
                      ? 1
                      : 0,

                    overflow: "hidden",

                    transition:
                      "all 0.35s cubic-bezier(.4,0,.2,1)",

                    marginTop: commandOpen
                      ? 14
                      : 0,
                  }}
                >

                  <button

                    onClick={() =>
                      sendCommand("STOP_BUZZER")
                    }

                    style={{

                      width: "100%",

                      padding: "14px",

                      borderRadius: 14,

                      border: "1px solid rgba(220,38,38,0.15)",

                      background: "#fef2f2",

                      color: "#dc2626",

                      cursor: "pointer",

                      fontWeight: 700,

                      fontSize: 12,

                      letterSpacing: "0.08em",

                      transition: "all 0.25s ease",

                    }}

                    onMouseEnter={(e) => {

                      e.currentTarget.style.background =
                        "#dc2626";

                      e.currentTarget.style.color =
                        "white";

                      e.currentTarget.style.transform =
                        "translateY(-2px)";
                    }}

                    onMouseLeave={(e) => {

                      e.currentTarget.style.background =
                        "#fef2f2";

                      e.currentTarget.style.color =
                        "#dc2626";

                      e.currentTarget.style.transform =
                        "translateY(0px)";
                    }}
                  >

                    OPRIRE BUZZER

                  </button>

                </div>

              </div>
            </div>

          </div>

          <div className="card span3" style={{ animationDelay: "0.35s" }}>
            <div className="card-label">Rezumat Senzori — Valori Curente</div>
            <div className="sensor-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px 36px" }}>
              <Bar value={data.temperature} max={45} color="#0369a1" label="TEMPERATURĂ" unit="°C" warn={30} crit={34} />
              <Bar value={data.distance ?? 0} max={150} color="#0369a1" label="DISTANȚĂ" unit="km" warn={50} crit={25} />
              <Bar value={Math.round((Math.abs(gyro.x) + Math.abs(gyro.y) + Math.abs(gyro.z)) * 10) / 10} max={15} color="#0369a1" label="DEVIAȚIE GIROSCOP" unit="°" warn={5} crit={10} />
            </div>
          </div>

        </main>

        <footer style={{
          background: "#ffffff", borderTop: "1px solid #e2e8f0",
          padding: "10px 32px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 9, fontFamily: "Epilogue, sans-serif", color: "#94a3b8", letterSpacing: "0.04em" }}>
            SISTEM AUTONOM · SAT-001 · RASPBERRY PI + ESP32
          </span>
          <span style={{ fontSize: 9, fontFamily: "DM Mono, monospace", color: "#94a3b8" }}>
            {new Date().toISOString().replace("T", " ").slice(0, 19)} UTC
          </span>
        </footer>

      </div>
    </>
  );
}