module.exports = {
  apps: [
    {
      name: 'jaspion-backend',
      script: './backend/dist/server.js',
      cwd: 'C:/Apps/Jaspion',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      out_file: 'C:/Apps/Jaspion/data/logs/backend-out.log',
      error_file: 'C:/Apps/Jaspion/data/logs/backend-err.log',
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
        PORT: 6171,
        HOST: '0.0.0.0'
      }
    },
    {
      name: 'jaspion-frontend',
      script: './frontend/server.cjs',
      cwd: 'C:/Apps/Jaspion',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      out_file: 'C:/Apps/Jaspion/data/logs/frontend-out.log',
      error_file: 'C:/Apps/Jaspion/data/logs/frontend-err.log',
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
        PORT: 6172,
        HOST: '0.0.0.0'
      }
    }
  ]
};
