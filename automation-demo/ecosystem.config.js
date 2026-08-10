module.exports = {
  apps: [
    {
      name: 'portfolio-automation-demo',
      script: './server.js',
      cwd: __dirname,
      autorestart: true,
      max_restarts: 10,
      env: { PORT: '3000' },
    },
  ],
};
