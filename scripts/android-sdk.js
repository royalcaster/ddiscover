const fs = require('node:fs');
const path = require('node:path');

function getSdkRoot() {
  return (
    process.env.ANDROID_SDK_ROOT ||
    process.env.ANDROID_HOME ||
    path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk')
  );
}

function getAndroidUserHome() {
  return path.join(process.env.USERPROFILE || '', '.android');
}

function getAvdHome() {
  return process.env.ANDROID_AVD_HOME || path.join(process.env.USERPROFILE || '', '.android', 'avd');
}

function ensureAndroidSdkConfig(projectRoot) {
  const sdkRoot = getSdkRoot();

  if (!sdkRoot || !fs.existsSync(sdkRoot)) {
    throw new Error(`Android SDK not found: ${sdkRoot}`);
  }

  const androidDir = path.join(projectRoot, 'android');
  const localPropertiesPath = path.join(androidDir, 'local.properties');
  const escapedSdkDir = sdkRoot.replace(/\\/g, '\\\\');
  const contents = `sdk.dir=${escapedSdkDir}\n`;

  if (!fs.existsSync(androidDir)) {
    throw new Error(`Android directory not found: ${androidDir}`);
  }

  if (!fs.existsSync(localPropertiesPath) || fs.readFileSync(localPropertiesPath, 'utf8') !== contents) {
    fs.writeFileSync(localPropertiesPath, contents, 'utf8');
  }

  return {
    sdkRoot,
    androidUserHome: getAndroidUserHome(),
    avdHome: getAvdHome(),
    localPropertiesPath,
  };
}

module.exports = {
  ensureAndroidSdkConfig,
  getAndroidUserHome,
  getAvdHome,
  getSdkRoot,
};
