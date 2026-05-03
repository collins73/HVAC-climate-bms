import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { building_id, month, year } = body; // month: 1-12, year: e.g. 2026

    // Date range
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
    const monthLabel = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

    // Fetch data in parallel using user context
    const [buildings, zones, readings, thermostatSettings] = await Promise.all([
      building_id
        ? base44.entities.Building.filter({ id: building_id })
        : base44.entities.Building.list(),
      building_id
        ? base44.entities.Zone.filter({ building_id })
        : base44.entities.Zone.list(),
      base44.entities.EnvironmentReading.list('-timestamp', 1000),
      base44.entities.ThermostatSetting.list(),
    ]);

  // Filter readings to the selected month
  const monthReadings = readings.filter(r => {
    if (!r.timestamp) return false;
    const d = r.timestamp;
    return d >= startDate && d <= endDate;
  });

  // --- Energy estimation helpers ---
  const W_PER_SQFT_PER_DEG = 0.08;
  const BASE_KW = 0.5;

  function estimateKw(zone, ts, temp) {
    if (!temp || ts?.mode === 'Off') return BASE_KW * 0.1;
    const sqft = zone.sqft || 500;
    const mode = ts?.mode || 'Auto';
    let delta = 0;
    if (mode === 'Cool' || mode === 'Auto') {
      const sc = ts?.setpoint_cooling ?? 74;
      if (temp > sc) delta = temp - sc;
    }
    if ((mode === 'Heat' || mode === 'Auto') && delta === 0) {
      const sh = ts?.setpoint_heating ?? 68;
      if (temp < sh) delta = sh - temp;
    }
    return Math.max(0.05, BASE_KW + (sqft * W_PER_SQFT_PER_DEG * delta) / 1000);
  }

  // Group readings by zone
  const readingsByZone = {};
  monthReadings.forEach(r => {
    if (!readingsByZone[r.zone_id]) readingsByZone[r.zone_id] = [];
    readingsByZone[r.zone_id].push(r);
  });

  // Per-zone summary
  const zoneSummaries = zones.map(zone => {
    const zReadings = readingsByZone[zone.id] || [];
    const ts = thermostatSettings.find(t => t.zone_id === zone.id);
    const temps = zReadings.map(r => r.temperature).filter(Boolean);
    const humids = zReadings.map(r => r.humidity).filter(Boolean);
    const co2s = zReadings.map(r => r.co2_ppm).filter(Boolean);
    const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 'N/A';
    const avgTemp = avg(temps);
    // Estimate monthly kWh: avg kW * 10 hrs/day * days_in_month
    const daysInMonth = new Date(year, month, 0).getDate();
    const estKw = avgTemp !== 'N/A' ? estimateKw(zone, ts, parseFloat(avgTemp)) : BASE_KW * 0.1;
    const estKwh = (estKw * 10 * daysInMonth).toFixed(1);
    const building = buildings.find(b => b.id === zone.building_id);
    return {
      zoneName: zone.name,
      buildingName: building?.name || 'Unknown',
      zoneType: zone.zone_type || 'Office',
      floor: zone.floor || '-',
      readings: zReadings.length,
      avgTemp: avgTemp !== 'N/A' ? `${avgTemp}°F` : 'N/A',
      avgHumidity: avg(humids) !== 'N/A' ? `${avg(humids)}%` : 'N/A',
      avgCo2: avg(co2s) !== 'N/A' ? `${avg(co2s)} ppm` : 'N/A',
      hvacMode: ts?.mode || 'N/A',
      setpointCool: ts?.setpoint_cooling ? `${ts.setpoint_cooling}°F` : 'N/A',
      setpointHeat: ts?.setpoint_heating ? `${ts.setpoint_heating}°F` : 'N/A',
      estKw: estKw.toFixed(2),
      estKwh,
    };
  });

  const totalKwh = zoneSummaries.reduce((sum, z) => sum + parseFloat(z.estKwh), 0).toFixed(1);
  const totalReadings = zoneSummaries.reduce((sum, z) => sum + z.readings, 0);

  // --- Build PDF ---
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = 20;

  const line = () => {
    doc.setDrawColor(60, 80, 100);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  };

  // Header
  doc.setFillColor(10, 25, 47);
  doc.rect(0, 0, pageW, 32, 'F');
  doc.setTextColor(34, 211, 238);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('HVAC Environmental Control', margin, 13);
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text(`Monthly Facility Report — ${monthLabel}`, margin, 22);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - margin, 22, { align: 'right' });

  y = 40;

  // Summary box
  doc.setFillColor(20, 30, 48);
  doc.roundedRect(margin, y, contentW, 22, 2, 2, 'F');
  doc.setTextColor(34, 211, 238);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const summaryItems = [
    `Buildings: ${buildings.length}`,
    `Zones: ${zones.length}`,
    `Total Readings: ${totalReadings}`,
    `Est. Energy: ${totalKwh} kWh`,
  ];
  summaryItems.forEach((item, i) => {
    doc.text(item, margin + 6 + i * (contentW / 4), y + 9);
    doc.setTextColor(200, 210, 230);
    doc.setFont('helvetica', 'normal');
  });
  y += 28;

  // Section: Zone Energy & Environment Summary
  doc.setTextColor(34, 211, 238);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Zone Energy & Environment Summary', margin, y);
  y += 5;
  line();

  // Table header
  const cols = [
    { label: 'Zone', w: 38 },
    { label: 'Building', w: 30 },
    { label: 'Avg Temp', w: 20 },
    { label: 'Avg Humid', w: 22 },
    { label: 'Avg CO₂', w: 22 },
    { label: 'HVAC Mode', w: 22 },
    { label: 'Est. kWh', w: 20 },
  ];

  doc.setFillColor(15, 30, 50);
  doc.rect(margin, y, contentW, 7, 'F');
  doc.setTextColor(100, 180, 220);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  let colX = margin + 2;
  cols.forEach(col => {
    doc.text(col.label, colX, y + 5);
    colX += col.w;
  });
  y += 8;

  // Table rows
  zoneSummaries.forEach((z, idx) => {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }
    if (idx % 2 === 0) {
      doc.setFillColor(22, 32, 48);
      doc.rect(margin, y, contentW, 7, 'F');
    }
    doc.setTextColor(220, 230, 240);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const row = [z.zoneName, z.buildingName, z.avgTemp, z.avgHumidity, z.avgCo2, z.hvacMode, z.estKwh];
    colX = margin + 2;
    cols.forEach((col, ci) => {
      doc.text(String(row[ci]).substring(0, 18), colX, y + 5);
      colX += col.w;
    });
    y += 7;
  });

  y += 6;

  // Section: HVAC Setpoints
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setTextColor(34, 211, 238);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('HVAC Setpoints per Zone', margin, y);
  y += 5;
  line();

  const setpointCols = [
    { label: 'Zone', w: 50 },
    { label: 'Mode', w: 28 },
    { label: 'Cool Setpoint', w: 32 },
    { label: 'Heat Setpoint', w: 32 },
    { label: 'Est. kW Load', w: 30 },
  ];
  doc.setFillColor(15, 30, 50);
  doc.rect(margin, y, contentW, 7, 'F');
  doc.setTextColor(100, 180, 220);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  colX = margin + 2;
  setpointCols.forEach(col => {
    doc.text(col.label, colX, y + 5);
    colX += col.w;
  });
  y += 8;

  zoneSummaries.forEach((z, idx) => {
    if (y > 265) { doc.addPage(); y = 20; }
    if (idx % 2 === 0) {
      doc.setFillColor(22, 32, 48);
      doc.rect(margin, y, contentW, 7, 'F');
    }
    doc.setTextColor(220, 230, 240);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const row = [z.zoneName, z.hvacMode, z.setpointCool, z.setpointHeat, `${z.estKw} kW`];
    colX = margin + 2;
    setpointCols.forEach((col, ci) => {
      doc.text(String(row[ci]).substring(0, 22), colX, y + 5);
      colX += col.w;
    });
    y += 7;
  });

  // Footer
  doc.setTextColor(80, 100, 120);
  doc.setFontSize(7);
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`HVAC Control Platform · ${monthLabel} Report · Page ${i} of ${pageCount}`, pageW / 2, 290, { align: 'center' });
  }

    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=hvac-report-${year}-${String(month).padStart(2, '0')}.pdf`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});