import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all needed data in parallel
    const [buildings, zones, alerts, readings, thermostats] = await Promise.all([
      base44.asServiceRole.entities.Building.list(),
      base44.asServiceRole.entities.Zone.list(),
      base44.asServiceRole.entities.Alert.list('-created_date', 500),
      base44.asServiceRole.entities.EnvironmentReading.list('-timestamp', 500),
      base44.asServiceRole.entities.ThermostatSetting.list(),
    ]);

    // --- Date range: last 7 days ---
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // --- Top recurring alert types in the last 7 days ---
    const recentAlerts = alerts.filter(a => new Date(a.created_date) >= weekAgo);
    const alertTypeCounts = {};
    recentAlerts.forEach(a => {
      alertTypeCounts[a.alert_type] = (alertTypeCounts[a.alert_type] || 0) + 1;
    });
    const topAlerts = Object.entries(alertTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const openAlerts = recentAlerts.filter(a => a.status === 'Open');
    const criticalAlerts = recentAlerts.filter(a => a.severity === 'Critical');

    // --- Energy / environment trends ---
    const recentReadings = readings.filter(r => new Date(r.timestamp) >= weekAgo);
    const temps = recentReadings.map(r => r.temperature).filter(v => v != null);
    const humidity = recentReadings.map(r => r.humidity).filter(v => v != null);
    const co2 = recentReadings.map(r => r.co2_ppm).filter(v => v != null);

    const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 'N/A';
    const max = arr => arr.length ? Math.max(...arr).toFixed(1) : 'N/A';

    // Per-building breakdown
    const buildingStats = buildings.map(b => {
      const bReadings = recentReadings.filter(r => r.building_id === b.id);
      const bAlerts = recentAlerts.filter(a => a.building_id === b.id);
      const bZones = zones.filter(z => z.building_id === b.id);
      const bTemps = bReadings.map(r => r.temperature).filter(v => v != null);
      return {
        name: b.name,
        zones: bZones.length,
        alerts: bAlerts.length,
        openAlerts: bAlerts.filter(a => a.status === 'Open').length,
        avgTemp: avg(bTemps),
      };
    });

    // --- Build HTML email ---
    const weekStr = `${weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    const topAlertsRows = topAlerts.length
      ? topAlerts.map(([type, count]) => `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #1e2a3a;color:#e2e8f0;">${type}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #1e2a3a;color:#06b6d4;font-weight:600;text-align:center;">${count}</td>
          </tr>`).join('')
      : `<tr><td colspan="2" style="padding:12px;color:#64748b;text-align:center;">No alerts this week</td></tr>`;

    const buildingRows = buildingStats.map(b => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #1e2a3a;color:#e2e8f0;">${b.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1e2a3a;color:#94a3b8;text-align:center;">${b.zones}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1e2a3a;color:#94a3b8;text-align:center;">${b.alerts}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1e2a3a;color:${b.openAlerts > 0 ? '#f87171' : '#4ade80'};text-align:center;font-weight:600;">${b.openAlerts}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1e2a3a;color:#06b6d4;text-align:center;">${b.avgTemp}°F</td>
      </tr>`).join('');

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f172a,#162032);border:1px solid #1e3a4a;border-radius:12px;padding:28px 32px;margin-bottom:24px;">
      <div style="color:#06b6d4;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">EMS AI Technologies</div>
      <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 6px;">Weekly Facility Summary</h1>
      <div style="color:#64748b;font-size:13px;">${weekStr}</div>
    </div>

    <!-- KPI Row -->
    <div style="display:flex;gap:12px;margin-bottom:24px;">
      <div style="flex:1;background:#0f172a;border:1px solid #1e2a3a;border-radius:10px;padding:18px;text-align:center;">
        <div style="color:#f87171;font-size:28px;font-weight:700;">${openAlerts.length}</div>
        <div style="color:#94a3b8;font-size:12px;margin-top:4px;">Open Alerts</div>
      </div>
      <div style="flex:1;background:#0f172a;border:1px solid #1e2a3a;border-radius:10px;padding:18px;text-align:center;">
        <div style="color:#fb923c;font-size:28px;font-weight:700;">${criticalAlerts.length}</div>
        <div style="color:#94a3b8;font-size:12px;margin-top:4px;">Critical Alerts</div>
      </div>
      <div style="flex:1;background:#0f172a;border:1px solid #1e2a3a;border-radius:10px;padding:18px;text-align:center;">
        <div style="color:#06b6d4;font-size:28px;font-weight:700;">${avg(temps)}°F</div>
        <div style="color:#94a3b8;font-size:12px;margin-top:4px;">Avg Temperature</div>
      </div>
      <div style="flex:1;background:#0f172a;border:1px solid #1e2a3a;border-radius:10px;padding:18px;text-align:center;">
        <div style="color:#a78bfa;font-size:28px;font-weight:700;">${avg(co2)}</div>
        <div style="color:#94a3b8;font-size:12px;margin-top:4px;">Avg CO₂ (ppm)</div>
      </div>
    </div>

    <!-- Top Recurring Alerts -->
    <div style="background:#0f172a;border:1px solid #1e2a3a;border-radius:10px;margin-bottom:24px;overflow:hidden;">
      <div style="padding:14px 16px;border-bottom:1px solid #1e2a3a;background:#162032;">
        <span style="color:#f1f5f9;font-size:14px;font-weight:600;">🔔 Top Recurring Alert Types</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#0a0f1a;">
            <th style="padding:8px 12px;text-align:left;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Alert Type</th>
            <th style="padding:8px 12px;text-align:center;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Count</th>
          </tr>
        </thead>
        <tbody>${topAlertsRows}</tbody>
      </table>
    </div>

    <!-- Environment Trends -->
    <div style="background:#0f172a;border:1px solid #1e2a3a;border-radius:10px;margin-bottom:24px;padding:18px;">
      <div style="color:#f1f5f9;font-size:14px;font-weight:600;margin-bottom:14px;">🌡️ Environment Trends (7-Day)</div>
      <div style="display:flex;gap:16px;">
        <div style="flex:1;background:#0a0f1a;border-radius:8px;padding:12px;text-align:center;">
          <div style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Avg Humidity</div>
          <div style="color:#38bdf8;font-size:20px;font-weight:700;">${avg(humidity)}%</div>
        </div>
        <div style="flex:1;background:#0a0f1a;border-radius:8px;padding:12px;text-align:center;">
          <div style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Peak Temp</div>
          <div style="color:#fb923c;font-size:20px;font-weight:700;">${max(temps)}°F</div>
        </div>
        <div style="flex:1;background:#0a0f1a;border-radius:8px;padding:12px;text-align:center;">
          <div style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Peak CO₂</div>
          <div style="color:#c084fc;font-size:20px;font-weight:700;">${max(co2)} ppm</div>
        </div>
        <div style="flex:1;background:#0a0f1a;border-radius:8px;padding:12px;text-align:center;">
          <div style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Sensor Readings</div>
          <div style="color:#4ade80;font-size:20px;font-weight:700;">${recentReadings.length}</div>
        </div>
      </div>
    </div>

    <!-- Per-Building Breakdown -->
    ${buildingStats.length > 0 ? `
    <div style="background:#0f172a;border:1px solid #1e2a3a;border-radius:10px;margin-bottom:24px;overflow:hidden;">
      <div style="padding:14px 16px;border-bottom:1px solid #1e2a3a;background:#162032;">
        <span style="color:#f1f5f9;font-size:14px;font-weight:600;">🏢 Building Breakdown</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#0a0f1a;">
            <th style="padding:8px 12px;text-align:left;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;">Building</th>
            <th style="padding:8px 12px;text-align:center;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;">Zones</th>
            <th style="padding:8px 12px;text-align:center;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;">Alerts</th>
            <th style="padding:8px 12px;text-align:center;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;">Open</th>
            <th style="padding:8px 12px;text-align:center;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;">Avg Temp</th>
          </tr>
        </thead>
        <tbody>${buildingRows}</tbody>
      </table>
    </div>` : ''}

    <!-- Footer -->
    <div style="text-align:center;padding:16px;color:#334155;font-size:11px;">
      EMS AI Technologies · Omni Climate Flow · Automated Weekly Report<br>
      Generated ${now.toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' })} ET
    </div>
  </div>
</body>
</html>`;

    // Get admin users to send to
    const users = await base44.asServiceRole.entities.User.list();
    const admins = users.filter(u => u.role === 'admin' && u.email);

    if (admins.length === 0) {
      return Response.json({ message: 'No admin users found to send email to.' });
    }

    // Send email to all admins
    const emailPromises = admins.map(admin =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        from_name: 'Omni Climate Flow',
        subject: `Weekly Facility Summary — ${weekStr}`,
        body: htmlBody,
      })
    );
    await Promise.all(emailPromises);

    return Response.json({
      success: true,
      sent_to: admins.map(u => u.email),
      stats: {
        buildings: buildings.length,
        open_alerts: openAlerts.length,
        critical_alerts: criticalAlerts.length,
        recent_alerts: recentAlerts.length,
        sensor_readings: recentReadings.length,
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});