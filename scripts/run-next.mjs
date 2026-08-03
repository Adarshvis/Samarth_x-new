/**
 * Launches Next.js with the port taken from the environment (.env supported).
 *
 * Next.js resolves its port before loading .env files, so `PORT=...` in .env is
 * ignored by `next dev` / `next start`. This wrapper loads .env first, then
 * passes the resolved port explicitly via `-p`.
 *
 * Usage: node scripts/run-next.mjs dev|start
 */
import 'dotenv/config'
import { spawn } from 'node:child_process'

const mode = process.argv[2]

if (!['dev', 'start'].includes(mode)) {
  console.error(`run-next: expected "dev" or "start", received "${mode ?? ''}"`)
  process.exit(1)
}

const port = process.env.PORT || '3000'
const extraArgs = process.argv.slice(3)

const child = spawn('next', [mode, '-p', port, ...extraArgs], {
  stdio: 'inherit',
  shell: true,
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 0)
})
