/**
 * Constants and configuration for the legacy code converter
 */

export interface LanguageInfo {
  displayName: string;
  extensions: readonly string[];
  name: string;
}

/**
 * Supported source languages with their file extensions
 */
export const SUPPORTED_SOURCE_LANGUAGES: Record<string, LanguageInfo> = {
  c: {
    displayName: 'C',
    extensions: ['.c', '.h'],
    name: 'c',
  },
  cobol: {
    displayName: 'COBOL',
    extensions: ['.cbl', '.cob', '.cpy'],
    name: 'cobol',
  },
  cpp: {
    displayName: 'C++',
    extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.hxx'],
    name: 'cpp',
  },
  csharp: {
    displayName: 'C#',
    extensions: ['.cs'],
    name: 'csharp',
  },
  fortran: {
    displayName: 'Fortran',
    extensions: ['.f', '.for', '.f90', '.f95', '.f03', '.f08'],
    name: 'fortran',
  },
  go: {
    displayName: 'Go',
    extensions: ['.go'],
    name: 'go',
  },
  java: {
    displayName: 'Java',
    extensions: ['.java'],
    name: 'java',
  },
  javascript: {
    displayName: 'JavaScript',
    extensions: ['.js', '.jsx', '.mjs'],
    name: 'javascript',
  },
  pascal: {
    displayName: 'Pascal',
    extensions: ['.pas', '.pp', '.p'],
    name: 'pascal',
  },
  perl: {
    displayName: 'Perl',
    extensions: ['.pl', '.pm'],
    name: 'perl',
  },
  php: {
    displayName: 'PHP',
    extensions: ['.php', '.phtml'],
    name: 'php',
  },
  python: {
    displayName: 'Python',
    extensions: ['.py', '.pyw'],
    name: 'python',
  },
  ruby: {
    displayName: 'Ruby',
    extensions: ['.rb'],
    name: 'ruby',
  },
  rust: {
    displayName: 'Rust',
    extensions: ['.rs'],
    name: 'rust',
  },
  typescript: {
    displayName: 'TypeScript',
    extensions: ['.ts', '.tsx'],
    name: 'typescript',
  },
  vb6: {
    displayName: 'Visual Basic 6',
    extensions: ['.bas', '.frm', '.cls', '.ctl'],
    name: 'vb6',
  },
} as const;

/**
 * Supported target languages for conversion
 */
export const SUPPORTED_TARGET_LANGUAGES = [
  { name: 'TypeScript', value: 'typescript' },
  { name: 'JavaScript', value: 'javascript' },
  { name: 'Python', value: 'python' },
  { name: 'Java', value: 'java' },
  { name: 'C#', value: 'csharp' },
  { name: 'Go', value: 'go' },
  { name: 'Rust', value: 'rust' },
  { name: 'PHP', value: 'php' },
  { name: 'Ruby', value: 'ruby' },
] as const;

/**
 * File extension mapping for target languages
 */
export const TARGET_LANGUAGE_EXTENSIONS: Record<string, string> = {
  csharp: '.cs',
  go: '.go',
  java: '.java',
  javascript: '.js',
  php: '.php',
  python: '.py',
  ruby: '.rb',
  rust: '.rs',
  typescript: '.ts',
} as const;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  defaultModel: 'codellama',
  maxFileSize: 100 * 1024, // 100KB
  maxRetries: 3,
  ollamaUrl: 'http://localhost:11434',
  retryDelay: 1000, // 1 second
} as const;

/**
 * Patterns to ignore when scanning codebases
 */
export const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/.svn/**',
  '**/.hg/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/.nuxt/**',
  '**/.cache/**',
  '**/coverage/**',
  '**/.idea/**',
  '**/.vscode/**',
  '**/.vs/**',
  '**/*.min.js',
  '**/*.min.css',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',
] as const;

/**
 * Get all supported file extensions
 */
export function getAllSupportedExtensions(): string[] {
  const extensions: string[] = [];
  for (const lang of Object.values(SUPPORTED_SOURCE_LANGUAGES)) {
    extensions.push(...lang.extensions);
  }

  return extensions;
}

/**
 * Get language info by extension
 */
export function getLanguageByExtension(ext: string): LanguageInfo | undefined {
  const normalizedExt = ext.toLowerCase();
  for (const lang of Object.values(SUPPORTED_SOURCE_LANGUAGES)) {
    if (lang.extensions.includes(normalizedExt)) {
      return lang;
    }
  }

  return undefined;
}

/**
 * Get target language extension
 */
export function getTargetExtension(targetLanguage: string): string {
  return TARGET_LANGUAGE_EXTENSIONS[targetLanguage] || '.txt';
}

