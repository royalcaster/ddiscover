const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { createAndroidAdbTooling, parseAdbDevices, runAdb } = require('./android-adb');

const projectRoot = path.resolve(__dirname, '..');
const tooling = createAndroidAdbTooling(projectRoot);
const sdkRoot = tooling.sdkRoot;
const emulatorPath = path.join(sdkRoot, 'emulator', 'emulator.exe');
const avdHome = process.env.ANDROID_AVD_HOME || path.join(process.env.USERPROFILE || '', '.android', 'avd');
const defaultAvdName = process.env.DDISCOVER_ANDROID_AVD || 'ddiscover_dev_device';

function requireFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.error(`${label} not found: ${filePath}`);
    process.exit(1);
  }
}

function getInstalledAvds() {
  if (!fs.existsSync(avdHome)) {
    return [];
  }

  return fs
    .readdirSync(avdHome)
    .filter((file) => file.endsWith('.ini'))
    .map((file) => path.basename(file, '.ini'));
}

function getRunningEmulators() {
  const devices = parseAdbDevices(runAdb(tooling, ['devices']));
  return devices
    .filter((device) => device.serial.startsWith('emulator-') && device.state === 'device')
    .map((device) => device.serial);
}

function listAvds() {
  const avds = getInstalledAvds();
  if (avds.length === 0) {
    console.log('No Android Virtual Devices found.');
    return;
  }

  for (const avd of avds) {
    console.log(avd);
  }
}

function startAvd(avdName) {
  requireFile(emulatorPath, 'Android emulator');

  const installedAvds = getInstalledAvds();
  const targetAvd =
    avdName ||
    (installedAvds.includes(defaultAvdName) ? defaultAvdName : installedAvds[0]);

  if (!targetAvd) {
    console.error('No AVD available. Create one in Android Studio first.');
    process.exit(1);
  }

  if (!installedAvds.includes(targetAvd)) {
    console.error(`AVD not found: ${targetAvd}`);
    console.error(`Available AVDs: ${installedAvds.join(', ')}`);
    process.exit(1);
  }

  spawn(emulatorPath, ['-avd', targetAvd], {
    detached: true,
    stdio: 'ignore',
    env: {
      ...process.env,
      ANDROID_AVD_HOME: avdHome,
    },
  }).unref();

  console.log(`Started emulator: ${targetAvd}`);
}

function reverseMetro() {
  const running = getRunningEmulators();

  if (running.length === 0) {
    console.log('No running emulators for adb reverse.');
    return;
  }

  for (const device of running) {
    runAdb(tooling, ['-s', device, 'reverse', 'tcp:8081', 'tcp:8081'], { stdio: 'ignore' });
    console.log(`Enabled adb reverse for ${device}: tcp:8081 -> tcp:8081`);
  }
}

function stopEmulators() {
  const running = getRunningEmulators();

  if (running.length === 0) {
    console.log('No running emulators.');
    return;
  }

  for (const device of running) {
    runAdb(tooling, ['-s', device, 'emu', 'kill'], { stdio: 'ignore' });
    console.log(`Stopped emulator: ${device}`);
  }
}

const command = process.argv[2];
const avdName = process.argv[3];

switch (command) {
  case 'list':
    listAvds();
    break;
  case 'start':
    startAvd(avdName);
    break;
  case 'stop':
    stopEmulators();
    break;
  case 'reverse':
    reverseMetro();
    break;
  default:
    console.log('Usage: node scripts/android-emulator.js <list|start|stop|reverse> [avdName]');
    process.exit(command ? 1 : 0);
}
