/**
 * Simple logging utility with color support
 */
import chalk from 'chalk';

export const logger = {
  error(message: string) {
    console.error(chalk.red('✗'), message);
  },
  info(message: string) {
    console.log(chalk.blue('ℹ'), message);
  },
  log(message: string) {
    console.log(message);
  },
  success(message: string) {
    console.log(chalk.green('✓'), message);
  },
  warning(message: string) {
    console.log(chalk.yellow('⚠'), message);
  },
};

