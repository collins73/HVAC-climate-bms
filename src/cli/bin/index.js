#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable no-undef */

const { program } = require('commander');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const axios = require('axios');
const { table } = require('table');

// Config file location
const configDir = path.join(process.env.HOME || process.env.USERPROFILE, '.hvac');
const configFile = path.join(configDir, 'config.json');

// Ensure config directory exists
fs.ensureDirSync(configDir);

// Load config
function loadConfig() {
  if (fs.existsSync(configFile)) {
    return fs.readJsonSync(configFile);
  }
  return { apiUrl: '', apiKey: '' };
}

// Save config
function saveConfig(config) {
  fs.writeJsonSync(configFile, config, { spaces: 2 });
}

// Make API request
async function apiRequest(endpoint, params = {}) {
  const config = loadConfig();
  if (!config.apiUrl || !config.apiKey) {
    console.error(chalk.red('❌ Not configured. Run: hvac config --url <URL> --key <KEY>'));
    process.exit(1);
  }

  try {
    const url = `${config.apiUrl}${endpoint}`;
    const response = await axios.get(url, {
      params: { api_key: config.apiKey, ...params },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.error || error.message;
    throw new Error(msg);
  }
}

// Config command
program
  .command('config')
  .option('--url <url>', 'API endpoint URL')
  .option('--key <key>', 'API key')
  .description('Configure API connection')
  .action((options) => {
    const config = loadConfig();
    let updated = false;

    if (options.url) {
      config.apiUrl = options.url;
      updated = true;
    }
    if (options.key) {
      config.apiKey = options.key;
      updated = true;
    }

    if (!updated) {
      console.log(chalk.cyan('Current config:'));
      console.log(`  URL: ${config.apiUrl || chalk.gray('(not set)')}`);
      console.log(`  Key: ${config.apiKey ? config.apiKey.substring(0, 10) + '...' : chalk.gray('(not set)')}`);
      return;
    }

    saveConfig(config);
    console.log(chalk.green('✓ Configuration saved'));
  });

// List facilities
program
  .command('list')
  .description('List all facilities')
  .action(async () => {
    try {
      console.log(chalk.cyan('Fetching facilities...'));
      const result = await apiRequest('/api/v1/facilities');
      
      if (!result.data || result.data.length === 0) {
        console.log(chalk.yellow('No facilities found'));
        return;
      }

      const data = result.data.map(b => [
        b.id,
        b.name,
        b.address || '—',
        b.city || '—',
        b.status,
      ]);

      const config = {
        header: {
          alignment: 'center',
          content: chalk.bold.cyan('Facilities'),
        },
        columns: {
          0: { width: 20 },
          1: { width: 25 },
          2: { width: 30 },
          3: { width: 15 },
          4: { width: 10 },
        },
      };

      const output = table([
        [chalk.bold('ID'), chalk.bold('Name'), chalk.bold('Address'), chalk.bold('City'), chalk.bold('Status')],
        ...data,
      ], config);

      console.log(output);
      console.log(chalk.gray(`Total: ${result.count} facilities`));
    } catch (error) {
      console.error(chalk.red(`❌ ${error.message}`));
      process.exit(1);
    }
  });

// Get facility details
program
  .command('get <id>')
  .description('Get facility details and zones')
  .action(async (id) => {
    try {
      console.log(chalk.cyan(`Fetching facility ${id}...`));
      const result = await apiRequest(`/api/v1/facilities/${id}`);
      const facility = result.facility;
      const zones = result.zones || [];

      console.log(chalk.bold.cyan(`\n📍 ${facility.name}`));
      console.log(`   Address: ${facility.address || '—'} ${facility.city || ''} ${facility.state || ''}`);
      console.log(`   Status: ${facility.status}`);
      console.log(`   Floors: ${facility.floors || '—'}`);
      console.log(`   Sq Ft: ${facility.total_sqft || '—'}`);

      if (zones.length > 0) {
        console.log(chalk.bold.cyan(`\n📊 Zones (${zones.length}):`));
        const data = zones.map(z => [
          z.id.substring(0, 8),
          z.name,
          z.zone_type,
          z.sqft || '—',
          `Floor ${z.floor}`,
          z.status,
        ]);

        const config = {
          columns: {
            0: { width: 10 },
            1: { width: 20 },
            2: { width: 15 },
            3: { width: 10 },
            4: { width: 10 },
            5: { width: 10 },
          },
        };

        const output = table([
          [chalk.bold('ID'), chalk.bold('Name'), chalk.bold('Type'), chalk.bold('Sq Ft'), chalk.bold('Floor'), chalk.bold('Status')],
          ...data,
        ], config);

        console.log(output);
      }
    } catch (error) {
      console.error(chalk.red(`❌ ${error.message}`));
      process.exit(1);
    }
  });

// Get zone readings
program
  .command('readings <zoneId>')
  .option('--limit <n>', 'Number of readings to fetch', '20')
  .description('Get environmental readings for a zone')
  .action(async (zoneId, options) => {
    try {
      console.log(chalk.cyan(`Fetching readings for zone ${zoneId}...`));
      const result = await apiRequest(`/api/v1/zones/${zoneId}/readings`, {
        limit: options.limit,
      });

      if (!result.data || result.data.length === 0) {
        console.log(chalk.yellow('No readings found'));
        return;
      }

      console.log(chalk.bold.cyan(`\nLatest ${result.data.length} Readings`));
      const data = result.data.slice(0, 10).map(r => [
        new Date(r.timestamp).toLocaleString(),
        r.temperature ? r.temperature.toFixed(1) + '°F' : '—',
        r.humidity ? r.humidity.toFixed(1) + '%' : '—',
        r.co2_ppm ? r.co2_ppm.toFixed(0) + ' ppm' : '—',
        r.source || '—',
      ]);

      const config = {
        columns: {
          0: { width: 20 },
          1: { width: 12 },
          2: { width: 12 },
          3: { width: 12 },
          4: { width: 10 },
        },
      };

      const output = table([
        [chalk.bold('Timestamp'), chalk.bold('Temp'), chalk.bold('Humidity'), chalk.bold('CO2'), chalk.bold('Source')],
        ...data,
      ], config);

      console.log(output);
    } catch (error) {
      console.error(chalk.red(`❌ ${error.message}`));
      process.exit(1);
    }
  });

// Health check
program
  .command('health')
  .description('Check API health status')
  .action(async () => {
    try {
      console.log(chalk.cyan('Checking API health...'));
      const result = await apiRequest('/api/v1/health');
      if (result.status === 'ok') {
        console.log(chalk.green('✓ API is healthy'));
      }
    } catch (error) {
      console.error(chalk.red(`❌ API is down: ${error.message}`));
      process.exit(1);
    }
  });

// Version
program.version('1.0.0', '-v, --version', 'Display version');

// Help
program
  .helpOption('-h, --help')
  .on('--help', () => {
    console.log('\n' + chalk.bold('Examples:'));
    console.log('  hvac config --url https://example.com/api --key YOUR_KEY');
    console.log('  hvac list');
    console.log('  hvac get <facility-id>');
    console.log('  hvac readings <zone-id> --limit 50');
    console.log('  hvac health\n');
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}