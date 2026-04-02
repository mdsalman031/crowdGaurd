import React from 'react';
import { Activity, Clock3, Radio, ShieldAlert, Wifi } from 'lucide-react';
import { VideoFeed } from './VideoFeed';
import { CrowdFlowChart } from './charts/CrowdFlowChart';
import { ZoneOccupancyChart } from './charts/ZoneOccupancyChart';
import { AlertsPanel } from './AlertsPanel';

function formatLastUpdated(lastUpdated) {
  if (!lastUpdated) {
    return 'Waiting for live telemetry';
  }

  return new Date(lastUpdated).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function CameraTelemetryCard({ icon, label, value, tone = 'text-white' }) {
  const Icon = icon;

  return (
    <div className="glass-panel border ghost-border p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-surface-container-highest flex items-center justify-center border ghost-border">
        {Icon && <Icon size={18} className="text-primary" />}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant font-bold">{label}</p>
        <p className={`text-xl font-display ${tone}`}>{value}</p>
      </div>
    </div>
  );
}

export function CamerasView({
  isConnected,
  liveData,
  history,
  activeAlerts,
  dispatchAlert,
  ignoreAlert,
  alertActionState,
  alertSummary,
  lastUpdated,
  connectionError,
  videoUrl,
  socketUrl,
}) {
  const densityTone = liveData.density?.toLowerCase() === 'high'
    ? 'text-error'
    : liveData.density?.toLowerCase() === 'medium'
      ? 'text-tertiary'
      : 'text-secondary';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <section className="glass-card border ghost-border p-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div className="space-y-3">
          <p className="text-[11px] tracking-[0.22em] uppercase text-primary font-bold">Camera Operations</p>
          <h2 className="text-3xl font-display text-white">Live crowd surveillance is running from the backend stream.</h2>
          <p className="text-sm text-on-surface-variant max-w-3xl">
            This panel follows the real-time MJPEG feed and Socket.IO telemetry from the Python service so operators can watch live occupancy, density shifts, and zone pressure without leaving the Cameras tab.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-[280px]">
          <CameraTelemetryCard
            icon={Wifi}
            label="Backend Link"
            value={isConnected ? 'Connected' : 'Offline'}
            tone={isConnected ? 'text-secondary' : 'text-error'}
          />
          <CameraTelemetryCard
            icon={Clock3}
            label="Last Packet"
            value={formatLastUpdated(lastUpdated)}
          />
          <CameraTelemetryCard
            icon={Activity}
            label="People In Frame"
            value={`${liveData.people_count || 0}`}
          />
          <CameraTelemetryCard
            icon={ShieldAlert}
            label="Density State"
            value={liveData.density || 'LOW'}
            tone={densityTone}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card border ghost-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b ghost-border">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant font-bold">Camera Node</p>
                <h3 className="text-xl font-display text-white">Station 04 Live Feed</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ghost-border ${isConnected ? 'bg-secondary/10' : 'bg-error/10'}`}>
                  <Radio size={14} className={isConnected ? 'text-secondary' : 'text-error'} />
                  <span className={`text-[10px] uppercase tracking-[0.18em] font-bold ${isConnected ? 'text-secondary' : 'text-error'}`}>
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant font-bold">Feed URL</p>
                  <p className="text-xs text-white">{videoUrl}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <VideoFeed videoUrl={videoUrl} isConnected={isConnected} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CrowdFlowChart data={history} />
            <ZoneOccupancyChart zones={liveData.zones} total={liveData.people_count} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card border ghost-border p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant font-bold">Stream Status</p>
                <h3 className="text-lg font-display text-white">Realtime diagnostics</h3>
              </div>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-secondary animate-pulse' : 'bg-error'}`}></div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="text-on-surface-variant">Socket endpoint</span>
                <span className="text-white text-right break-all">{socketUrl}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-on-surface-variant">Telemetry refresh</span>
                <span className="text-white text-right">Continuous live updates</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-on-surface-variant">Most active zone</span>
                <span className="text-white text-right">
                  {`Zone ${liveData.zones.indexOf(Math.max(...liveData.zones, 0)) + 1}`}
                </span>
              </div>
              <div className="rounded-xl bg-surface-container-low p-4 border ghost-border">
                <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant font-bold mb-2">Operator note</p>
                <p className="text-sm text-white">
                  {connectionError || 'Backend heartbeat detected. Camera telemetry is flowing into the dashboard.'}
                </p>
              </div>
            </div>
          </div>

          <div className="h-[520px]">
            <AlertsPanel
              alerts={activeAlerts}
              onDispatchAlert={dispatchAlert}
              onIgnoreAlert={ignoreAlert}
              actionState={alertActionState}
              activeCount={alertSummary?.active_alerts_count ?? activeAlerts.length}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
