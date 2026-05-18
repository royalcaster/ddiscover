const path = require('node:path');
const appJson = require('../app.json');
const { createAndroidAdbTooling, parseAdbDevices, runAdb } = require('./android-adb');

const projectRoot = path.resolve(__dirname, '..');
const tooling = createAndroidAdbTooling(projectRoot);
const appId = appJson?.expo?.android?.package || 'com.royalcaster.ddiscover';

function adb(args) {
  return runAdb(tooling, args);
}

function getFirstOnlineDeviceSerial() {
  const devices = parseAdbDevices(adb(['devices']));
  const online = devices.filter((device) => device.state === 'device');
  if (online.length === 0) {
    return { serial: null, devices };
  }

  const emulator = online.find((device) => device.serial.startsWith('emulator-'));
  return { serial: emulator?.serial || online[0].serial, devices };
}

function main() {
  const command = process.argv[2];
  const { serial, devices } = getFirstOnlineDeviceSerial();

  if (!serial) {
    const states = devices.length
      ? devices.map((device) => `${device.serial} (${device.state})`).join(', ')
      : 'none';
    console.error(`No online Android device/emulator found. Detected: ${states}`);
    process.exit(1);
  }

  if (command === 'clear') {
    const output = adb(['-s', serial, 'shell', 'pm', 'clear', appId]).trim();
    console.log(output || `Cleared app data for ${appId} on ${serial}.`);
    process.exit(0);
  }

  if (command === 'stop') {
    adb(['-s', serial, 'shell', 'am', 'force-stop', appId]).trim();
    console.log(`Stopped ${appId} on ${serial}.`);
    process.exit(0);
  }

  console.error('Usage: node ./scripts/android-app.js <clear|stop>');
  process.exit(1);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`android-app failed: ${message}`);
  process.exit(1);
}
