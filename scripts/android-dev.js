const { execSync, spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { ensureAndroidSdkConfig } = require('./android-sdk');
const { createAndroidAdbTooling, parseAdbDevices, runAdb } = require('./android-adb');

const projectRoot = path.resolve(__dirname, '..');
const { sdkRoot, avdHome } = ensureAndroidSdkConfig(projectRoot);
const tooling = createAndroidAdbTooling(projectRoot);
const emulatorPath = path.join(sdkRoot, 'emulator', 'emulator.exe');
const defaultAvdName = process.env.DDISCOVER_ANDROID_AVD || 'ddiscover_dev_device';
const devServerPort = Number(process.env.EXPO_DEV_SERVER_PORT || 8081);
const defaultEmulatorArgs = ['-no-boot-anim', '-no-audio', '-no-snapshot-save', '-gpu', 'host'];

function requireFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.error(`${label} not found: ${filePath}`);
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function adb(args, options = {}) {
  return runAdb(tooling, args, options);
}

function getEmulatorArgs() {
  const extraArgs = process.env.DDISCOVER_ANDROID_EMULATOR_ARGS
    ? process.env.DDISCOVER_ANDROID_EMULATOR_ARGS.split(/\s+/).filter(Boolean)
    : [];

  return [...defaultEmulatorArgs, ...extraArgs];
}

function listAdbDevices() {
  return parseAdbDevices(adb(['devices'])).filter((device) =>
    device.serial.startsWith('emulator-'),
  );
}

function getRunningEmulators() {
  return listAdbDevices()
    .filter((device) => device.state === 'device')
    .map((device) => device.serial);
}

function startAvdIfNeeded(avdName) {
  const running = getRunningEmulators();
  if (running.length > 0) {
    console.log(`Using running emulator: ${running[0]}`);
    return;
  }

  requireFile(emulatorPath, 'Android emulator');
  const installedAvds = getInstalledAvds();
  const targetAvd =
    avdName ||
    (installedAvds.includes(defaultAvdName) ? defaultAvdName : installedAvds[0]);

  if (!targetAvd) {
    console.error('No AVD available. Create one in Android Studio first.');
    process.exit(1);
  }

  const emulatorArgs = ['-avd', targetAvd, ...getEmulatorArgs()];
  spawn(emulatorPath, emulatorArgs, {
    detached: true,
    stdio: ['ignore', 'ignore', 'inherit'],
    env: {
      ...process.env,
      ANDROID_AVD_HOME: avdHome,
    },
  }).unref();

  console.log(`Started emulator: ${targetAvd} ${getEmulatorArgs().join(' ')}`);
}

async function waitForEmulator() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const running = getRunningEmulators();
    if (running.length > 0) {
      console.log(`Emulator detected: ${running[0]}`);
      return running[0];
    }
    await sleep(2000);
  }

  console.error('Timed out waiting for emulator to appear in adb.');
  process.exit(1);
}

function isDeviceBootCompleted(device) {
  try {
    const output = adb(['-s', device, 'shell', 'getprop', 'sys.boot_completed'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return output.trim() === '1';
  } catch {
    return false;
  }
}

function isDeviceResponsive(device) {
  try {
    const output = adb(['-s', device, 'shell', 'getprop', 'ro.product.cpu.abilist'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return output.trim().length > 0;
  } catch {
    return false;
  }
}

async function waitForDeviceReady(device) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const running = getRunningEmulators();
    if (!running.includes(device)) {
      await sleep(2000);
      continue;
    }

    if (isDeviceBootCompleted(device) && isDeviceResponsive(device)) {
      console.log(`Emulator ready: ${device}`);
      return;
    }

    await sleep(2000);
  }

  console.error(`Timed out waiting for emulator to finish booting: ${device}`);
  process.exit(1);
}

function enableReverse(device) {
  adb(['-s', device, 'reverse', `tcp:${devServerPort}`, `tcp:${devServerPort}`], { stdio: 'ignore' });
  console.log(
    `Enabled adb reverse for ${device}: tcp:${devServerPort} -> tcp:${devServerPort}`,
  );
}

function ensurePortIsFree(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano -p tcp | findstr ":${port}"`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const pids = new Set();

      for (const line of output.split(/\r?\n/)) {
        const columns = line.trim().split(/\s+/);
        const localAddress = columns[1] || '';
        const state = columns[3] || '';
        const pid = columns[4] || '';

        if (localAddress.endsWith(`:${port}`) && state === 'LISTENING' && pid) {
          pids.add(pid);
        }
      }

      for (const pid of pids) {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`Freed port ${port} by stopping PID ${pid}.`);
      }
      return;
    }

    execSync(`lsof -ti tcp:${port} | xargs kill -9`, { stdio: 'ignore' });
    console.log(`Freed port ${port}.`);
  } catch {
    // Ignore if port is already free.
  }
}

function runAndroidInstall() {
  const command =
    process.platform === 'win32'
      ? 'node .\\scripts\\android-run.js'
      : 'node ./scripts/android-run.js';
  const child = spawn(command, {
    stdio: 'inherit',
    shell: true,
    env: {
      ...tooling.baseEnv,
      EXPO_DEV_SERVER_PORT: String(devServerPort),
    },
    cwd: projectRoot,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

async function main() {
  const requestedAvd = process.argv[2];
  ensurePortIsFree(devServerPort);
  ensurePortIsFree(8082);
  startAvdIfNeeded(requestedAvd);
  const device = await waitForEmulator();
  await waitForDeviceReady(device);
  enableReverse(device);
  runAndroidInstall();
}

void main();
