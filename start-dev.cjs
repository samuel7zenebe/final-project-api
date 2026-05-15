#!/usr/bin/env node
const { exec } = require('child_process');
exec('npm run dev', (err, stdout, stderr) => {
  if (err) console.error(err);
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
});