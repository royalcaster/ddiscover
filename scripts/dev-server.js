const { execSync, spawn } = require('node:child_process');

function startExpoDevClient() {
  const command =
    process.platform === 'win32'
      ? 'npm.cmd run start -- --dev-client --clear'
      : 'npm run start -- --dev-client --clear';
  const child = spawn(command, {
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

function stopMetroOnPort(port) {
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

      if (pids.size === 0) {
        console.log(`No process is listening on port ${port}.`);
        return;
      }

      for (const pid of pids) {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`Stopped process on port ${port}: PID ${pid}`);
      }
      return;
    }

    execSync(`lsof -ti tcp:${port} | xargs kill -9`, { stdio: 'ignore' });
    console.log(`Stopped process on port ${port}.`);
  } catch {
    console.log(`No process is listening on port ${port}.`);
  }
}

function stopMetroDefault() {
  stopMetroOnPort(8081);
}

function stopMetroAllKnown() {
  stopMetroOnPort(8081);
  stopMetroOnPort(8082);
}

const command = process.argv[2];

switch (command) {
  case 'start':
    startExpoDevClient();
    break;
  case 'stop':
    stopMetroDefault();
    break;
  case 'stop-all':
    stopMetroAllKnown();
    break;
  default:
    console.log('Usage: node scripts/dev-server.js <start|stop|stop-all>');
    process.exit(command ? 1 : 0);
}
