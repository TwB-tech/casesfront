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

  // Handle graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received, stopping servers...`);
    processes.forEach((p) => {
      try { p.kill('SIGTERM'); } catch (_) {}
    });
    // Force exit after 5 seconds if any still running
    setTimeout(() => process.exit(0), 5000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // If any child exits unexpectedly, propagate exit
  const handleChildExit = (p) => () => {
    console.log(`⚠️ ${p.processName} exited. Shutting down.`);
    shutdown('child-exit');
  };
  processes.forEach((p) => p.on('exit', handleChildExit(p)));
}

main().catch((err) => {
  console.error('Failed to start dev environment:', err);
  process.exit(1);
});
