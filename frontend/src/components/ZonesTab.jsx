import React from 'react';
import { ZoneOccupancyChart } from './charts/ZoneOccupancyChart';
import { KpiCard } from './KpiCard';

export function ZonesTab({ liveData, refreshZones }) {
  const total = liveData.people_count || 1;
  const mostActiveZone = liveData.zones?.length === 4
    ? liveData.zones.indexOf(Math.max(...liveData.zones)) + 1
    : 1;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard title="Total Occupancy" value={(liveData.people_count ?? 0).toLocaleString()} accentColor="secondary" />
        <KpiCard title="Active Zone" value={`Zone ${mostActiveZone}`} accentColor="tertiary" />
        <KpiCard title="Alert Pressure" value={`${liveData.alerts_count ?? 0}`} accentColor="error" />
        <KpiCard title="Refresh" value="Now" subtext="Tap refresh" accentColor="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card border ghost-border p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold tracking-[0.15em] text-on-surface-variant uppercase">Zone Occupancy Tracker</h3>
            <button onClick={refreshZones} className="text-xs text-primary font-bold">Refresh</button>
          </div>
          <ZoneOccupancyChart zones={liveData.zones} total={total} />
        </div>

        <div className="glass-card border ghost-border p-6">
          <h3 className="text-xs font-bold tracking-[0.15em] text-on-surface-variant uppercase mb-4">Zone Breakdown</h3>
          <ul className="space-y-3">
            {(liveData.zones || []).map((value, idx) => (
              <li key={idx} className="flex justify-between items-center">
                <span className="font-bold">Zone {idx + 1}</span>
                <span className="text-secondary">{value} people ({total > 0 ? Math.round((value / total) * 100) : 0}%)</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
