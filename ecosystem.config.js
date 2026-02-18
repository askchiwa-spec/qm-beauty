module.exports = {
  apps: [
    {
      name: 'qm-beauty-whatsapp',
      script: './whatsapp-server.ts',
      interpreter: 'node',
      interpreter_args: '--loader ts-node/esm --experimental-specifier-resolution=node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      log_file: './logs/whatsapp-server.log',
      out_file: './logs/whatsapp-server-out.log',
      error_file: './logs/whatsapp-server-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
