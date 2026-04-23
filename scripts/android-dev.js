const { execFileSync, execSync, spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { ensureAndroidSdkConfig } = require('./android-sdk');

const projectRoot = path.resolve(__dirname, '..');
const { sdkRoot, androidUserHome, avdHome } = ensureAndroidSdkConfig(projectRoot);
const emulatorPath = path.join(sdkRoot, 'emulator', 'emulator.exe');
const adbPath = path.join(sdkRoot, 'platform-tools', 'adb.exe');

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
  requireFile(adbPath, 'adb');
  return execFileSync(adbPath, args, {
    encoding: 'utf8',
    env: {
      ...process.env,
      ANDROID_USER_HOME: androidUserHome,
      ANDROID_AVD_HOME: avdHome,
    },
    ...options,
  });
}

function getRunningEmulators() {
  const output = adb(['devices']);
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('emulator-'))
    .map((line) => line.split(/\s+/)[0]);
}

function startAvdIfNeeded(avdName) {
  const running = getRunningEmulators();
  if (running.length > 0) {
    console.log(`Using running emulator: ${running[0]}`);
    return;
  }

  requireFile(emulatorPath, 'Android emulator');
  const installedAvds = getInstalledAvds();
  const targetAvd = avdName || installedAvds[0];

  if (!targetAvd) {
    console.error('No AVD available. Create one in Android Studio first.');
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

async function waitForEmulator() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
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

function enableReverse(device) {
  adb(['-s', device, 'reverse', 'tcp:8081', 'tcp:8081'], { stdio: 'ignore' });
  console.log(`Enabled adb reverse for ${device}: tcp:8081 -> tcp:8081`);
}

function isMetroRunning() {
  try {
    if (process.platform === 'win32') {
      const output = execSync(
        "powershell -NoProfile -Command \"Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique\"",
        { encoding: 'utf8' },
      )
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      return output.length > 0;
    }

    execSync('lsof -ti tcp:8081', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function startMetroIfNeeded() {
  if (isMetroRunning()) {
    console.log('Metro is already running on port 8081.');
    return;
  }

  const command =
    process.platform === 'win32'
      ? 'npm.cmd run start -- --dev-client'
      : 'npm run start -- --dev-client';

  spawn(command, {
    shell: true,
    detached: true,
    stdio: 'ignore',
  }).unref();

  console.log('Started Metro in the background.');
}

function runAndroidInstall() {
  const command =
    process.platform === 'win32'
      ? 'node .\\scripts\\android-run.js --no-bundler'
      : 'node ./scripts/android-run.js --no-bundler';
  const child = spawn(command, {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      ANDROID_HOME: sdkRoot,
      ANDROID_SDK_ROOT: sdkRoot,
      ANDROID_USER_HOME: androidUserHome,
      ANDROID_AVD_HOME: avdHome,
    },
    cwd: projectRoot,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

async function main() {
  const requestedAvd = process.argv[2];
  startAvdIfNeeded(requestedAvd);
  const device = await waitForEmulator();
  enableReverse(device);
  startMetroIfNeeded();
  await sleep(3000);
  runAndroidInstall();
}

void main();
