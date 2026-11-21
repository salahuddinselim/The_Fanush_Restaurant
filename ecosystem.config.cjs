module.exports = {
  apps: [
    {
      name: 'restaurant-frontend-4200',
      cwd: './frontend',
      script: 'node_modules/@angular/cli/bin/ng.js',
      args: 'serve --host 0.0.0.0 --port 4200',
      interpreter: 'C:/Program Files/nodejs/node.exe',
      env: { NODE_ENV: 'development' },
      watch: false
    },
    {
      name: 'restaurant-backend-8000',
      cwd: './backend',
      script: 'start.cjs',
      interpreter: 'C:/Program Files/nodejs/node.exe',
      env: { PYTHONUNBUFFERED: '1' },
      watch: false
    }
  ]
}
