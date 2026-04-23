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

function stopMetro() {
  try {
    if (process.platform === 'win32') {
      const output = execSync(
        "powershell -NoProfile -Command \"Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique\"",
        { encoding: 'utf8' },
      )
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (output.length === 0) {
        console.log('No process is listening on port 8081.');
        return;
      }

      for (const pid of output) {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`Stopped Metro process on port 8081: PID ${pid}`);
      }
      return;
    }

    execSync("lsof -ti tcp:8081 | xargs kill -9", { stdio: 'ignore' });
    console.log('Stopped Metro process on port 8081.');
  } catch {
    console.log('No process is listening on port 8081.');
  }
}

const command = process.argv[2];

switch (command) {
  case 'start':
    startExpoDevClient();
    break;
  case 'stop':
    stopMetro();
    break;
  default:
    console.log('Usage: node scripts/dev-server.js <start|stop>');
    process.exit(command ? 1 : 0);
}
