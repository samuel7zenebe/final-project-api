import { spawn } from 'child_process';

// Kill existing node/tsx processes on Windows
const { exec } = require('child_process');
exec('taskkill /F /IM node.exe 2>nul && taskkill /F /IM tsx.exe 2>nul && taskkill /F /IM nodemon.exe 2>nul', () => {
  setTimeout(() => {
    const child = spawn('npm', ['run', 'dev'], {
      cwd: 'D:\\projects\\FinalProject\\backend',
      shell: true,
      stdio: 'inherit',
    });
  }, 2000);
});
