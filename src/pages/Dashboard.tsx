import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Circle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ReferenceArea,
} from "recharts";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const riskSummary = useQuery(api.hftMonitoring.getRiskSummary);
  const zones = useQuery(api.hftMonitoring.getZones);
  const latencyData = useQuery(
    api.hftMonitoring.getLatencyData,
    selectedZone ? { zoneId: selectedZone, limit: 60 } : "skip"
  );
  const baseline = useQuery(
    api.hftMonitoring.getBaseline,
    selectedZone ? { zoneId: selectedZone } : "skip"
  );

  useEffect(() => {
    const zoneParam = searchParams.get("zone");
    if (zoneParam) {
      setSelectedZone(zoneParam);
    } else if (zones && zones.length > 0 && !selectedZone) {
      setSelectedZone(zones[0].zoneId);
    }
  }, [zones, selectedZone, searchParams]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High":
        return "text-destructive";
      case "Medium":
        return "text-accent";
      default:
        return "text-primary";
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case "High":
        return "bg-destructive/10 border-destructive";
      case "Medium":
        return "bg-accent/10 border-accent";
      default:
        return "bg-primary/10 border-primary";
    }
  };

  const chartData = latencyData?.map((d) => ({
    time: formatTime(d.timestamp),
    timestamp: d.timestamp,
    latency: d.latency,
    temperature: d.temperature,
    vibration: d.vibration * 100,
  }));

  // Calculate aggregate stats
  const currentZoneData = riskSummary?.find(z => z.zoneId === selectedZone);
  const avgLatency = chartData ? chartData.slice(-10).reduce((a, b) => a + b.latency, 0) / 10 : 0;
  const latencyVolatility = chartData ? Math.sqrt(chartData.slice(-10).reduce((acc, d) => acc + Math.pow(d.latency - avgLatency, 2), 0) / 10) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground dark font-mono">
      {/* System Header */}
      <header className="border-b border-border bg-card">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/home")}
                className="px-2 py-1 text-xs border border-border hover:border-primary transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Infrastructure Operations</div>
                <h1 className="text-sm font-semibold uppercase tracking-wide">
                  HFT Latency Monitor
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Circle className="w-2 h-2 fill-primary text-primary animate-pulse" />
                <span className="text-xs text-muted-foreground uppercase">Live</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-4 space-y-4">
        {/* System Health Overview */}
        <section>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">System Health</div>
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-2 border border-border bg-card p-3">
              <div className="text-xs text-muted-foreground mb-1">Overall Risk Status</div>
              <div className={`text-2xl font-bold ${currentZoneData ? getRiskColor(currentZoneData.riskLevel) : 'text-primary'}`}>
                {currentZoneData?.riskLevel || "STABLE"}
              </div>
              {currentZoneData && (
                <div className="text-xs text-muted-foreground mt-1">{currentZoneData.primaryCause}</div>
              )}
            </div>
            <div className="border border-border bg-card p-3">
              <div className="text-xs text-muted-foreground mb-1">Avg Latency</div>
              <div className="text-xl font-bold">{avgLatency.toFixed(3)}</div>
              <div className="text-xs text-muted-foreground">milliseconds</div>
            </div>
            <div className="border border-border bg-card p-3">
              <div className="text-xs text-muted-foreground mb-1">Volatility</div>
              <div className="text-xl font-bold">{latencyVolatility.toFixed(4)}</div>
              <div className="text-xs text-muted-foreground">std deviation</div>
            </div>
            <div className="border border-border bg-card p-3">
              <div className="text-xs text-muted-foreground mb-1">Temperature</div>
              <div className="text-xl font-bold">{currentZoneData?.currentTemperature.toFixed(1) || "—"}</div>
              <div className="text-xs text-muted-foreground">celsius</div>
            </div>
            <div className="border border-border bg-card p-3">
              <div className="text-xs text-muted-foreground mb-1">Vibration</div>
              <div className="text-xl font-bold">{currentZoneData?.currentVibration.toFixed(3) || "—"}</div>
              <div className="text-xs text-muted-foreground">g-force</div>
            </div>
          </div>
        </section>

        {/* Zone Selector */}
        <section className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Selected Zone:</div>
          <div className="flex gap-2">
            {zones?.map((zone) => (
              <button
                key={zone.zoneId}
                onClick={() => setSelectedZone(zone.zoneId)}
                className={`px-3 py-1 text-xs border transition-colors ${
                  selectedZone === zone.zoneId
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:border-primary'
                }`}
              >
                {zone.zoneId}
              </button>
            ))}
          </div>
        </section>

        {/* Baseline vs Current */}
        {chartData && baseline && (
          <section>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Baseline vs Current Behavior
            </div>
            <div className="border border-border bg-card p-4">
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">Baseline Avg</div>
                  <div className="text-lg font-bold text-primary">{baseline.avgLatency.toFixed(3)} ms</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Current Avg</div>
                  <div className="text-lg font-bold">{avgLatency.toFixed(3)} ms</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Deviation</div>
                  <div className={`text-lg font-bold ${
                    Math.abs(((avgLatency - baseline.avgLatency) / baseline.avgLatency) * 100) > 15
                      ? 'text-destructive'
                      : Math.abs(((avgLatency - baseline.avgLatency) / baseline.avgLatency) * 100) > 8
                        ? 'text-accent'
                        : 'text-primary'
                  }`}>
                    {((avgLatency - baseline.avgLatency) / baseline.avgLatency * 100).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Risk Threshold</div>
                  <div className="text-lg font-bold text-destructive">{(baseline.avgLatency * 1.15).toFixed(3)} ms</div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="latencyArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.62 0.15 150)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="oklch(0.62 0.15 150)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.010 260)" />
                  <XAxis
                    dataKey="time"
                    stroke="oklch(0.58 0.008 260)"
                    style={{ fontSize: "10px" }}
                    tick={{ fill: "oklch(0.58 0.008 260)" }}
                  />
                  <YAxis
                    stroke="oklch(0.58 0.008 260)"
                    style={{ fontSize: "10px" }}
                    tick={{ fill: "oklch(0.58 0.008 260)" }}
                    label={{
                      value: "Latency (ms)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: "10px", fill: "oklch(0.58 0.008 260)" },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.22 0.008 260)",
                      border: "1px solid oklch(0.32 0.010 260)",
                      borderRadius: "2px",
                      fontSize: "10px",
                    }}
                  />
                  <ReferenceLine
                    y={baseline.avgLatency}
                    stroke="oklch(0.62 0.15 150)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    label={{
                      value: "Baseline",
                      position: "right",
                      style: { fontSize: "10px", fill: "oklch(0.62 0.15 150)" },
                    }}
                  />
                  <ReferenceLine
                    y={baseline.avgLatency * 1.15}
                    stroke="oklch(0.58 0.20 25)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    label={{
                      value: "Risk Threshold",
                      position: "right",
                      style: { fontSize: "10px", fill: "oklch(0.58 0.20 25)" },
                    }}
                  />
                  {/* Highlight deviation zone */}
                  {chartData.some(d => d.latency > baseline.avgLatency * 1.08) && (
                    <ReferenceArea
                      y1={baseline.avgLatency * 1.08}
                      y2={baseline.avgLatency * 1.20}
                      fill="oklch(0.58 0.20 25)"
                      fillOpacity={0.05}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="latency"
                    stroke="oklch(0.62 0.15 150)"
                    strokeWidth={2}
                    fill="url(#latencyArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Time-Series Environmental Monitoring */}
        {chartData && baseline && (
          <section>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Time-Series Environmental Monitoring
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Temperature */}
              <div className="border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground mb-3">Temperature (°C)</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.010 260)" />
                    <XAxis
                      dataKey="time"
                      stroke="oklch(0.58 0.008 260)"
                      style={{ fontSize: "9px" }}
                      tick={{ fill: "oklch(0.58 0.008 260)" }}
                    />
                    <YAxis
                      stroke="oklch(0.58 0.008 260)"
                      style={{ fontSize: "9px" }}
                      tick={{ fill: "oklch(0.58 0.008 260)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.22 0.008 260)",
                        border: "1px solid oklch(0.32 0.010 260)",
                        borderRadius: "2px",
                        fontSize: "10px",
                      }}
                    />
                    <ReferenceLine
                      y={baseline.avgTemperature}
                      stroke="oklch(0.58 0.008 260)"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="oklch(0.70 0.16 85)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Vibration */}
              <div className="border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground mb-3">Vibration (g-force × 100)</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.010 260)" />
                    <XAxis
                      dataKey="time"
                      stroke="oklch(0.58 0.008 260)"
                      style={{ fontSize: "9px" }}
                      tick={{ fill: "oklch(0.58 0.008 260)" }}
                    />
                    <YAxis
                      stroke="oklch(0.58 0.008 260)"
                      style={{ fontSize: "9px" }}
                      tick={{ fill: "oklch(0.58 0.008 260)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.22 0.008 260)",
                        border: "1px solid oklch(0.32 0.010 260)",
                        borderRadius: "2px",
                        fontSize: "10px",
                      }}
                    />
                    <ReferenceLine
                      y={baseline.avgVibration * 100}
                      stroke="oklch(0.58 0.008 260)"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                    <Line
                      type="monotone"
                      dataKey="vibration"
                      stroke="oklch(0.60 0.12 200)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {/* Infrastructure Risk Summary */}
        <section>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Infrastructure Risk Summary
          </div>
          <div className="border border-border bg-card">
            <table className="w-full text-xs">
              <thead className="border-b border-border bg-muted">
                <tr>
                  <th className="text-left p-3 font-semibold uppercase tracking-wider">Zone ID</th>
                  <th className="text-left p-3 font-semibold uppercase tracking-wider">Location</th>
                  <th className="text-left p-3 font-semibold uppercase tracking-wider">Risk Level</th>
                  <th className="text-left p-3 font-semibold uppercase tracking-wider">Primary Cause</th>
                  <th className="text-right p-3 font-semibold uppercase tracking-wider">Latency</th>
                  <th className="text-right p-3 font-semibold uppercase tracking-wider">Deviation</th>
                </tr>
              </thead>
              <tbody>
                {riskSummary?.map((zone, idx) => (
                  <tr
                    key={zone.zoneId}
                    className={`border-b border-border hover:bg-muted/30 cursor-pointer transition-colors ${
                      selectedZone === zone.zoneId ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedZone(zone.zoneId)}
                  >
                    <td className="p-3 font-mono font-semibold">{zone.zoneId}</td>
                    <td className="p-3 text-muted-foreground">{zone.location}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 border ${getRiskBg(zone.riskLevel)} ${getRiskColor(zone.riskLevel)} font-semibold`}>
                        {zone.riskLevel}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{zone.primaryCause}</td>
                    <td className="p-3 text-right font-mono">{zone.currentLatency.toFixed(3)} ms</td>
                    <td className={`p-3 text-right font-mono font-semibold ${
                      Math.abs(zone.latencyDeviation) > 15
                        ? 'text-destructive'
                        : Math.abs(zone.latencyDeviation) > 8
                          ? 'text-accent'
                          : 'text-primary'
                    }`}>
                      {zone.latencyDeviation > 0 ? '+' : ''}{zone.latencyDeviation.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Early Warning Panel */}
        {currentZoneData && currentZoneData.riskLevel !== "Low" && (
          <section>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Early Warning Analysis
            </div>
            <div className={`border p-4 ${getRiskBg(currentZoneData.riskLevel)}`}>
              <div className="flex items-start justify-between mb-2">
                <div className={`text-sm font-bold uppercase ${getRiskColor(currentZoneData.riskLevel)}`}>
                  {currentZoneData.riskLevel} Risk Detected
                </div>
                <div className="text-xs text-muted-foreground">
                  Confidence: {(100 - Math.abs(currentZoneData.latencyDeviation) * 2).toFixed(0)}%
                </div>
              </div>
              <div className="text-xs space-y-2">
                <div>
                  <span className="text-muted-foreground">Zone:</span>{" "}
                  <span className="font-mono font-semibold">{currentZoneData.zoneId}</span> ({currentZoneData.name})
                </div>
                <div>
                  <span className="text-muted-foreground">Primary Cause:</span>{" "}
                  <span className="font-semibold">{currentZoneData.primaryCause}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border">
                  <div>
                    <div className="text-muted-foreground">Latency Deviation</div>
                    <div className={`font-mono font-bold ${getRiskColor(currentZoneData.riskLevel)}`}>
                      {currentZoneData.latencyDeviation > 0 ? '+' : ''}{currentZoneData.latencyDeviation.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Temperature Deviation</div>
                    <div className={`font-mono font-bold ${
                      Math.abs(currentZoneData.temperatureDeviation) > 10 ? 'text-accent' : 'text-muted-foreground'
                    }`}>
                      {currentZoneData.temperatureDeviation > 0 ? '+' : ''}{currentZoneData.temperatureDeviation.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Vibration Deviation</div>
                    <div className={`font-mono font-bold ${
                      Math.abs(currentZoneData.vibrationDeviation) > 10 ? 'text-accent' : 'text-muted-foreground'
                    }`}>
                      {currentZoneData.vibrationDeviation > 0 ? '+' : ''}{currentZoneData.vibrationDeviation.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
