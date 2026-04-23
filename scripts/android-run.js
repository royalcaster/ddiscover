const { spawn } = require('node:child_process');
const path = require('node:path');

const { ensureAndroidSdkConfig } = require('./android-sdk');

function run() {
  const projectRoot = path.resolve(__dirname, '..');
  const { sdkRoot, androidUserHome, avdHome } = ensureAndroidSdkConfig(projectRoot);
  const command = process.platform === 'win32' ? 'npx.cmd expo run:android' : 'npx expo run:android';

  const child = spawn(command, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      ANDROID_HOME: sdkRoot,
      ANDROID_SDK_ROOT: sdkRoot,
      ANDROID_USER_HOME: androidUserHome,
      ANDROID_AVD_HOME: avdHome,
    },
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

run();
