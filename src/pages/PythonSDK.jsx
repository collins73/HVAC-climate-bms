import { Copy, Check, Download } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const CODE_EXAMPLES = {
  install: 'pip install hvac-client',
  basic: `from hvac_client import HVACClient

client = HVACClient(
    api_key="your_api_key",
    base_url="https://[endpoint]/api/v1"
)

# List all facilities
facilities = client.facilities.list()
for f in facilities:
    print(f"{f['name']}: {f['zone_count']} zones")

# Get facility details
facility = client.facilities.get("facility_id")

# Get zone readings
readings = client.zones.get_readings(
    zone_id="zone_id",
    limit=50
)

# Update thermostat
client.thermostats.update(
    zone_id="zone_id",
    cooling_setpoint=74,
    heating_setpoint=68
)`,
  async: `import asyncio
from hvac_client import AsyncHVACClient

async def main():
    client = AsyncHVACClient(api_key="your_api_key")
    
    # Fetch all facilities concurrently
    facilities = await client.facilities.list()
    
    # Get readings for each zone in parallel
    readings = await asyncio.gather(*[
        client.zones.get_readings(z['id'])
        for z in facilities[0]['zones']
    ])
    
    print(f"Fetched {len(readings)} readings")

asyncio.run(main())`,
  docker: `FROM python:3.11-slim

WORKDIR /app

# Install the HVAC client
RUN pip install hvac-client

# Copy your script
COPY script.py .

# Set environment variable
ENV HVAC_API_KEY=your_key_here

# Run the script
CMD ["python", "script.py"]`,
};

export default function PythonSDK() {
  const [copied, setCopied] = useState(null);

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const CodeBlock = ({ label, code, id }) => (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <span className="text-sm font-mono text-cyan-400">{label}</span>
        <button
          onClick={() => copyCode(code, id)}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          {copied === id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap break-words">
          {code}
        </pre>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Python SDK"
        subtitle="Use the official HVAC Python client to integrate with your applications"
      />

      {/* Quick start */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Quick Start</h3>
        <CodeBlock label="$ pip install" code={CODE_EXAMPLES.install} id="install" />
      </div>

      {/* Basic usage */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Basic Usage</h2>
        <CodeBlock label="python" code={CODE_EXAMPLES.basic} id="basic" />
      </div>

      {/* Async example */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Async Operations</h2>
        <p className="text-sm text-muted-foreground">
          For high-performance applications, use the async client to fetch multiple endpoints in parallel:
        </p>
        <CodeBlock label="python async" code={CODE_EXAMPLES.async} id="async" />
      </div>

      {/* Docker example */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Docker Integration</h2>
        <p className="text-sm text-muted-foreground">
          Run HVAC client scripts inside Docker containers for automation:
        </p>
        <CodeBlock label="Dockerfile" code={CODE_EXAMPLES.docker} id="docker" />
      </div>

      {/* API Methods */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Available Methods</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { category: 'Facilities', methods: ['list()', 'get(id)', 'create(data)', 'update(id, data)'] },
            { category: 'Zones', methods: ['list(facility_id)', 'get(id)', 'get_readings(id, limit)', 'update(id, data)'] },
            { category: 'Thermostats', methods: ['get(zone_id)', 'update(zone_id, data)', 'set_mode(zone_id, mode)'] },
            { category: 'Alerts', methods: ['list()', 'filter(status)', 'acknowledge(id)', 'resolve(id)'] },
          ].map(g => (
            <div key={g.category} className="bg-card border border-border rounded-xl p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">{g.category}</h4>
              <ul className="space-y-2">
                {g.methods.map(m => (
                  <li key={m} className="text-xs text-muted-foreground font-mono">
                    <span className="text-cyan-400">client.{g.category.toLowerCase()}.</span>{m}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Download SDK */}
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Get the SDK</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Available on PyPI and GitHub. Full source code, examples, and documentation included.
        </p>
        <div className="flex gap-3 justify-center">
          <a href="https://pypi.org/project/hvac-client/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" /> View on PyPI
          </a>
          <a href="https://github.com/hvac-client/python-sdk" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 border border-border text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors">
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}