type LogLevel = 'info' | 'warn' | 'error';

export function log(message: string, level: LogLevel = 'info', source = 'express') {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const colors = {
    info: '\x1b[36m',    // cyan
    warn: '\x1b[33m',    // yellow  
    error: '\x1b[31m',   // red
    reset: '\x1b[0m'     // reset
  };

  const prefix = `${formattedTime} [${source}] ${colors[level]}[${level.toUpperCase()}]${colors.reset}`;
  
  switch (level) {
    case 'error':
      console.error(`${prefix} ${message}`);
      break;
    case 'warn':
      console.warn(`${prefix} ${message}`);
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}