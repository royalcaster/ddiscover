const { spawn } = require('node:child_process');
const path = require('node:path');
const { createAndroidAdbTooling, parseAdbDevices, runAdb } = require('./android-adb');
const appJson = require('../app.json');

const projectRoot = path.resolve(__dirname, '..');
const tooling = createAndroidAdbTooling(projectRoot);
const appId = appJson?.expo?.android?.package || 'com.royalcaster.ddiscover';

function getFirstOnlineDeviceSerial() {
  try {
    const devices = parseAdbDevices(runAdb(tooling, ['devices']));
    const online = devices.filter((device) => device.state === 'device');
    if (online.length === 0) return null;
    return online[0].serial;
  } catch {
    return null;
  }
}

function getPid(serial, packageName) {
  try {
    const output = runAdb(tooling, ['-s', serial, 'shell', 'pidof', '-s', packageName], {
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const pid = output.trim();
    return pid.length > 0 ? pid : null;
  } catch {
    return null;
  }
}

try {
  runAdb(tooling, ['logcat', '-c'], { stdio: 'ignore' });
} catch {
  // Ignore clear failures and continue with live logs.
}

const serial = getFirstOnlineDeviceSerial();
if (!serial) {
  console.error('No online Android device/emulator found for log streaming.');
  process.exit(1);
}

console.log(`Streaming logs for ${serial} (${appId}) ...`);
const pid = getPid(serial, appId);
if (pid) {
  console.log(`Attached to PID ${pid}.`);
  const child = spawn(tooling.adbPath, ['-s', serial, 'logcat', '--pid', pid, '-v', 'time', '*:V'], {
    env: tooling.baseEnv,
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
} else {
  console.log('App process not running yet. Streaming startup/crash tags instead.');
  const child = spawn(
    tooling.adbPath,
    ['-s', serial, 'logcat', '-v', 'time', 'AndroidRuntime:E', 'ReactNative:V', 'ReactNativeJS:V', '*:S'],
    {
      env: tooling.baseEnv,
      stdio: 'inherit',
    },
  );

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}
