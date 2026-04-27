/**
 * PM2 Ecosystem Configuration — ReadyPI API
 * Used inside the Docker container for process management.
 *
 * Features:
 * - Automatic restart on crash with exponential backoff
 * - Memory limit restart (256MB per instance)
 * - Cluster mode disabled (Cloud Run handles horizontal scaling)
 * - Graceful shutdown with SIGTERM handling
 * - Structured JSON logging for Cloud Logging ingestion
 */
module.exports = {
  apps: [
    {
      name: 'readypi-api',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 8080,
      },
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true,
      // Restart policy
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 1000,
      exp_backoff_restart_delay: 100,
      // Logging — stdout/stderr goes to Cloud Logging automatically
      log_type: 'json',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
      error_file: '/dev/stderr',
      out_file: '/dev/stdout',
    },
  ],
};
