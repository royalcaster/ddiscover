const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { delimiter } = require('node:path');
const fs = require('node:fs');

const { ensureAndroidSdkConfig } = require('./android-sdk');

const DEFAULT_TIMEOUT_MS = Number(process.env.DDISCOVER_ADB_TIMEOUT_MS || 15000);

function createAndroidAdbTooling(projectRoot) {
  const { sdkRoot, androidUserHome, avdHome } = ensureAndroidSdkConfig(projectRoot);
  const platformToolsDir = path.join(sdkRoot, 'platform-tools');
  const adbBinary = process.platform === 'win32' ? 'adb.exe' : 'adb';
  const adbPath = path.join(platformToolsDir, adbBinary);

  if (!fs.existsSync(adbPath)) {
    throw new Error(`adb not found: ${adbPath}`);
  }

  const baseEnv = {
    ...process.env,
    ANDROID_HOME: sdkRoot,
    ANDROID_SDK_ROOT: sdkRoot,
    ANDROID_USER_HOME: androidUserHome,
    ANDROID_AVD_HOME: avdHome,
    PATH: `${platformToolsDir}${delimiter}${process.env.PATH || ''}`,
  };

  return {
    sdkRoot,
    androidUserHome,
    avdHome,
    platformToolsDir,
    adbPath,
    baseEnv,
    defaultTimeoutMs: DEFAULT_TIMEOUT_MS,
  };
}

function formatAdbError(error, args, timeoutMs) {
  if (error?.code === 'ETIMEDOUT') {
    return `adb timed out after ${timeoutMs}ms: adb ${args.join(' ')}`;
  }
  if (error?.code === 'EPERM') {
    return `adb could not start due to OS permissions: adb ${args.join(' ')}`;
  }

  const stderr = String(error?.stderr || '').trim();
  const stdout = String(error?.stdout || '').trim();
  if (stderr) return stderr;
  if (stdout) return stdout;
  return error?.message || `adb failed: adb ${args.join(' ')}`;
}

function runAdb(tooling, args, options = {}) {
  const timeoutMs = options.timeoutMs ?? tooling.defaultTimeoutMs;
  const retryOnTimeout = options.retryOnTimeout ?? true;
  const env = {
    ...tooling.baseEnv,
    ...(options.env || {}),
  };

  try {
    return execFileSync(tooling.adbPath, args, {
      env,
      timeout: timeoutMs,
      windowsHide: true,
      encoding: options.encoding ?? 'utf8',
      stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
      maxBuffer: options.maxBuffer ?? 1024 * 1024,
    });
  } catch (error) {
    const message = formatAdbError(error, args, timeoutMs);

    if (!retryOnTimeout || !message.includes('adb timed out')) {
      throw new Error(message);
    }

    // Auto-recover a stuck adb daemon once before failing.
    runAdbBestEffort(tooling, ['kill-server'], { timeoutMs: 8000 });
    runAdbBestEffort(tooling, ['start-server'], { timeoutMs: 10000 });

    try {
      return runAdb(tooling, args, {
        ...options,
        retryOnTimeout: false,
      });
    } catch (retryError) {
      const retryMessage = retryError instanceof Error ? retryError.message : String(retryError);
      throw new Error(retryMessage);
    }
  }
}

function runAdbBestEffort(tooling, args, options = {}) {
  try {
    runAdb(tooling, args, {
      ...options,
      retryOnTimeout: false,
    });
  } catch {
    // Best-effort command; ignore failure.
  }
}

function parseAdbDevices(output) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('List of devices attached'))
    .map((line) => {
      const [serial, state] = line.split(/\s+/);
      return { serial, state };
    })
    .filter((entry) => entry.serial && entry.state);
}

module.exports = {
  createAndroidAdbTooling,
  parseAdbDevices,
  runAdb,
  runAdbBestEffort,
};
