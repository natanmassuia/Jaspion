module.exports = {
  apps: [
    {
      name: 'jaspion-backend',
      script: './backend/dist/server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 6171,
        HOST: '0.0.0.0'
      }
    },
    {
      name: 'jaspion-frontend',
      script: 'node_modules/vite/bin/vite.js',
      args: 'preview --port 6172 --host 0.0.0.0',
      cwd: './frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
