import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Thermometer, Radio, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
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
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-destructive text-foreground border-foreground";
      case "Medium":
        return "bg-accent text-foreground border-foreground";
      default:
        return "bg-primary text-foreground border-foreground";
    }
  };

  const chartData = latencyData?.map((d) => ({
    time: formatTime(d.timestamp),
    timestamp: d.timestamp,
    latency: d.latency,
    temperature: d.temperature,
    vibration: d.vibration * 100,
  }));

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b-4 border-foreground bg-card"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/home")}
                className="brutal-button bg-background px-4 py-2 hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight">
                  HFT LATENCY MONITOR
                </h1>
                <p className="text-sm font-mono text-muted-foreground mt-1">
                  Real-time infrastructure risk detection
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="brutal-border bg-card px-4 py-2">
                <div className="text-xs font-mono text-muted-foreground">
                  SYSTEM STATUS
                </div>
                <div className="text-lg font-black text-primary">ACTIVE</div>
              </div>
              <div className="brutal-border bg-card px-4 py-2">
                <div className="text-xs font-mono text-muted-foreground">
                  ZONES MONITORED
                </div>
                <div className="text-lg font-black">{zones?.length || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Risk Summary Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            INFRASTRUCTURE RISK SUMMARY
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskSummary?.map((zone, idx) => (
              <motion.div
                key={zone.zoneId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedZone(zone.zoneId)}
                className={`brutal-card cursor-pointer bg-card p-4 ${
                  selectedZone === zone.zoneId ? "ring-4 ring-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs font-mono text-muted-foreground">
                      {zone.zoneId}
                    </div>
                    <h3 className="font-black text-lg">{zone.name}</h3>
                    <div className="text-xs text-muted-foreground">
                      {zone.location}
                    </div>
                  </div>
                  <div
                    className={`brutal-border px-3 py-1 text-xs font-black ${getRiskColor(
                      zone.riskLevel
                    )}`}
                  >
                    {zone.riskLevel}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono text-muted-foreground">
                      Primary Cause
                    </span>
                    <span className="font-bold">{zone.primaryCause}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="brutal-border bg-background p-2">
                      <div className="text-xs font-mono text-muted-foreground">
                        LATENCY
                      </div>
                      <div className="font-black text-sm">
                        {zone.currentLatency.toFixed(2)}ms
                      </div>
                      <div
                        className={`text-xs font-bold ${
                          Math.abs(zone.latencyDeviation) > 15
                            ? "text-destructive"
                            : Math.abs(zone.latencyDeviation) > 8
                              ? "text-accent"
                              : "text-primary"
                        }`}
                      >
                        {zone.latencyDeviation > 0 ? "+" : ""}
                        {zone.latencyDeviation.toFixed(1)}%
                      </div>
                    </div>

                    <div className="brutal-border bg-background p-2">
                      <div className="text-xs font-mono text-muted-foreground">
                        TEMP
                      </div>
                      <div className="font-black text-sm">
                        {zone.currentTemperature.toFixed(1)}°C
                      </div>
                      <div
                        className={`text-xs font-bold ${
                          Math.abs(zone.temperatureDeviation) > 15
                            ? "text-destructive"
                            : Math.abs(zone.temperatureDeviation) > 8
                              ? "text-accent"
                              : "text-primary"
                        }`}
                      >
                        {zone.temperatureDeviation > 0 ? "+" : ""}
                        {zone.temperatureDeviation.toFixed(1)}%
                      </div>
                    </div>

                    <div className="brutal-border bg-background p-2">
                      <div className="text-xs font-mono text-muted-foreground">
                        VIBR
                      </div>
                      <div className="font-black text-sm">
                        {zone.currentVibration.toFixed(2)}g
                      </div>
                      <div
                        className={`text-xs font-bold ${
                          Math.abs(zone.vibrationDeviation) > 15
                            ? "text-destructive"
                            : Math.abs(zone.vibrationDeviation) > 8
                              ? "text-accent"
                              : "text-primary"
                        }`}
                      >
                        {zone.vibrationDeviation > 0 ? "+" : ""}
                        {zone.vibrationDeviation.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Detailed Analysis Section */}
        {selectedZone && chartData && baseline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Baseline Comparison */}
            <div className="brutal-card bg-card p-6">
              <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                BASELINE VS CURRENT LATENCY
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                <div className="brutal-border bg-background p-4">
                  <div className="text-xs font-mono text-muted-foreground mb-1">
                    BASELINE AVG
                  </div>
                  <div className="text-2xl font-black text-primary">
                    {baseline.avgLatency.toFixed(2)}ms
                  </div>
                </div>
                <div className="brutal-border bg-background p-4">
                  <div className="text-xs font-mono text-muted-foreground mb-1">
                    CURRENT AVG
                  </div>
                  <div className="text-2xl font-black">
                    {(
                      chartData.slice(-10).reduce((a, b) => a + b.latency, 0) /
                      10
                    ).toFixed(2)}
                    ms
                  </div>
                </div>
                <div className="brutal-border bg-background p-4">
                  <div className="text-xs font-mono text-muted-foreground mb-1">
                    BASELINE MAX
                  </div>
                  <div className="text-2xl font-black text-muted-foreground">
                    {baseline.maxLatency.toFixed(2)}ms
                  </div>
                </div>
                <div className="brutal-border bg-background p-4">
                  <div className="text-xs font-mono text-muted-foreground mb-1">
                    DEVIATION
                  </div>
                  <div
                    className={`text-2xl font-black ${
                      ((chartData.slice(-10).reduce((a, b) => a + b.latency, 0) /
                        10 -
                        baseline.avgLatency) /
                        baseline.avgLatency) *
                        100 >
                      15
                        ? "text-destructive"
                        : "text-accent"
                    }`}
                  >
                    {(
                      ((chartData.slice(-10).reduce((a, b) => a + b.latency, 0) /
                        10 -
                        baseline.avgLatency) /
                        baseline.avgLatency) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="oklch(0.65 0.22 142)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(0.65 0.22 142)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="0"
                    stroke="oklch(0.3 0 0)"
                    strokeWidth={2}
                  />
                  <XAxis
                    dataKey="time"
                    stroke="oklch(0.65 0 0)"
                    style={{ fontSize: "12px", fontWeight: "bold" }}
                  />
                  <YAxis
                    stroke="oklch(0.65 0 0)"
                    style={{ fontSize: "12px", fontWeight: "bold" }}
                    label={{
                      value: "Latency (ms)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontWeight: "bold" },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.2 0 0)",
                      border: "3px solid oklch(0.95 0 0)",
                      borderRadius: "0",
                      fontWeight: "bold",
                    }}
                  />
                  <ReferenceLine
                    y={baseline.avgLatency}
                    stroke="oklch(0.65 0.22 142)"
                    strokeWidth={3}
                    strokeDasharray="8 8"
                    label={{
                      value: "Baseline",
                      position: "right",
                      style: { fontWeight: "bold", fill: "oklch(0.65 0.22 142)" },
                    }}
                  />
                  <ReferenceLine
                    y={baseline.avgLatency * 1.15}
                    stroke="oklch(0.68 0.22 25)"
                    strokeWidth={3}
                    strokeDasharray="4 4"
                    label={{
                      value: "High Risk",
                      position: "right",
                      style: { fontWeight: "bold", fill: "oklch(0.68 0.22 25)" },
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="latency"
                    stroke="oklch(0.65 0.22 142)"
                    strokeWidth={4}
                    fill="url(#latencyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Time Series Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Temperature */}
              <div className="brutal-card bg-card p-6">
                <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  TEMPERATURE MONITORING
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="0"
                      stroke="oklch(0.3 0 0)"
                      strokeWidth={2}
                    />
                    <XAxis
                      dataKey="time"
                      stroke="oklch(0.65 0 0)"
                      style={{ fontSize: "11px", fontWeight: "bold" }}
                    />
                    <YAxis
                      stroke="oklch(0.65 0 0)"
                      style={{ fontSize: "11px", fontWeight: "bold" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.2 0 0)",
                        border: "3px solid oklch(0.95 0 0)",
                        borderRadius: "0",
                        fontWeight: "bold",
                      }}
                    />
                    <ReferenceLine
                      y={baseline.avgTemperature}
                      stroke="oklch(0.75 0.25 65)"
                      strokeWidth={3}
                      strokeDasharray="8 8"
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="oklch(0.75 0.25 65)"
                      strokeWidth={4}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Vibration */}
              <div className="brutal-card bg-card p-6">
                <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  VIBRATION ANALYSIS
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="0"
                      stroke="oklch(0.3 0 0)"
                      strokeWidth={2}
                    />
                    <XAxis
                      dataKey="time"
                      stroke="oklch(0.65 0 0)"
                      style={{ fontSize: "11px", fontWeight: "bold" }}
                    />
                    <YAxis
                      stroke="oklch(0.65 0 0)"
                      style={{ fontSize: "11px", fontWeight: "bold" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.2 0 0)",
                        border: "3px solid oklch(0.95 0 0)",
                        borderRadius: "0",
                        fontWeight: "bold",
                      }}
                    />
                    <ReferenceLine
                      y={baseline.avgVibration * 100}
                      stroke="oklch(0.85 0.18 85)"
                      strokeWidth={3}
                      strokeDasharray="8 8"
                    />
                    <Line
                      type="monotone"
                      dataKey="vibration"
                      stroke="oklch(0.85 0.18 85)"
                      strokeWidth={4}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
