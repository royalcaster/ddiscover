const { execFileSync, spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const { ensureAndroidSdkConfig } = require('./android-sdk');

function run() {
  const projectRoot = path.resolve(__dirname, '..');
  const { sdkRoot, androidUserHome, avdHome } = ensureAndroidSdkConfig(projectRoot);
  const adbPath = path.join(sdkRoot, 'platform-tools', 'adb.exe');
  const extraArgs = process.argv.slice(2).join(' ');
  const baseCommand = process.platform === 'win32' ? 'npx.cmd expo run:android' : 'npx expo run:android';
  const command = extraArgs ? `${baseCommand} ${extraArgs}` : baseCommand;
  const env = {
    ...process.env,
    ANDROID_HOME: sdkRoot,
    ANDROID_SDK_ROOT: sdkRoot,
    ANDROID_USER_HOME: androidUserHome,
    ANDROID_AVD_HOME: avdHome,
  };

  if (fs.existsSync(adbPath)) {
    try {
      const output = execFileSync(adbPath, ['devices'], {
        encoding: 'utf8',
        env,
      });
      const emulatorSerials = output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.startsWith('emulator-') && line.includes('\tdevice'))
        .map((line) => line.split('\t')[0]);

      for (const serial of emulatorSerials) {
        execFileSync(adbPath, ['-s', serial, 'reverse', 'tcp:8081', 'tcp:8081'], {
          stdio: 'ignore',
          env,
        });
        console.log(`Enabled adb reverse for ${serial}: tcp:8081 -> tcp:8081`);
      }
    } catch {
      // Best effort only. expo run:android can still proceed on physical devices or LAN.
    }
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

run();
