const { execSync, spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const { ensureAndroidSdkConfig } = require('./android-sdk');
const { createAndroidAdbTooling, parseAdbDevices, runAdb } = require('./android-adb');

function loadEnvFileIntoProcess(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const equalsIndex = line.indexOf('=');
    if (equalsIndex <= 0) continue;
    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function run() {
  const projectRoot = path.resolve(__dirname, '..');
  loadEnvFileIntoProcess(path.join(projectRoot, '.env.local'));
  loadEnvFileIntoProcess(path.join(projectRoot, '.env'));
  const { sdkRoot } = ensureAndroidSdkConfig(projectRoot);
  const tooling = createAndroidAdbTooling(projectRoot);
  const devServerPort = Number(process.env.EXPO_DEV_SERVER_PORT || 8081);
  const extraArgs = process.argv.slice(2).join(' ');
  const baseCommand =
    process.platform === 'win32'
      ? `npx.cmd expo run:android -p ${devServerPort}`
      : `npx expo run:android -p ${devServerPort}`;
  const command = extraArgs ? `${baseCommand} ${extraArgs}` : baseCommand;
  const env = {
    ...tooling.baseEnv,
    REACT_NATIVE_PACKAGER_HOSTNAME: '127.0.0.1',
    EXPO_PACKAGER_PROXY_URL: `http://127.0.0.1:${devServerPort}`,
  };

  ensurePortIsFree(devServerPort);

  try {
    const devices = parseAdbDevices(runAdb(tooling, ['devices'], { env }));
    const emulatorSerials = devices
      .filter((device) => device.serial.startsWith('emulator-') && device.state === 'device')
      .map((device) => device.serial);

    for (const serial of emulatorSerials) {
      runAdb(tooling, ['-s', serial, 'reverse', 'tcp:8081', 'tcp:8081'], {
        stdio: 'ignore',
        env,
      });
      console.log(`Enabled adb reverse for ${serial}: tcp:8081 -> tcp:8081`);
    }
  } catch {
    // Best effort only. expo run:android can still proceed on physical devices or LAN.
  }

  const child = spawn(command, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    env,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

function ensurePortIsFree(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(
        `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique"`,
        { encoding: 'utf8' },
      )
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      for (const pid of output) {
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

run();
