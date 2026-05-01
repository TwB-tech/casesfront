import { spawn } from 'child_process';
import { setTimeout as wait } from 'timers/promises';

console.log('🚀 Starting WakiliWorld development environment...\n');

const rootDir = process.cwd();
const processes = [];

function spawnProcess(command, args, name) {
  const proc = spawn(command, args, {
    cwd: rootDir,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: 'true' },
  });
  proc.processName = name;
  processes.push(proc);

  proc.on('error', (err) => {
    console.error(`❌ ${name} failed to start:`, err.message);
  });

  return proc;
}

async function main() {
  // Start API server
  const api = spawnProcess('node', ['api-server.js'], 'API Server');

  // Wait for API to be ready
  await wait(2000);

  // Start Vite dev server
  const vite = spawnProcess('npm', ['run', 'dev'], 'Vite Dev Server');

  console.log('✅ Both servers started. Press Ctrl+C to stop.\n');

  // Keep the process alive with a dummy interval.
  // Playwright will kill this process when tests complete.
  setInterval(() => {}, 1000);
}

main().catch((err) => {
  console.error('Failed to start dev environment:', err);
  process.exit(1);
});
