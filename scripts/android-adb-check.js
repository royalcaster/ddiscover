const path = require('node:path');
const { createAndroidAdbTooling, parseAdbDevices, runAdb } = require('./android-adb');

function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const tooling = createAndroidAdbTooling(projectRoot);

  console.log(`Using adb: ${tooling.adbPath}`);
  const version = runAdb(tooling, ['version']).trim();
  console.log(version);

  const devices = parseAdbDevices(runAdb(tooling, ['devices']));
  if (devices.length === 0) {
    console.log('No Android devices detected.');
    return;
  }

  for (const device of devices) {
    console.log(`- ${device.serial} (${device.state})`);
  }
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`android-adb-check failed: ${message}`);
  process.exit(1);
}
