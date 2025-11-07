import { describe, expect, it } from 'vitest';

import {
  DEFAULT_CONFIG,
  getAllSupportedExtensions,
  getLanguageByExtension,
  getTargetExtension,
  SUPPORTED_SOURCE_LANGUAGES,
  SUPPORTED_TARGET_LANGUAGES,
  TARGET_LANGUAGE_EXTENSIONS,
} from './constants.js';

describe('constants', () => {
  describe('getAllSupportedExtensions', () => {
    it('should return all supported file extensions', () => {
      const extensions = getAllSupportedExtensions();
      expect(extensions).toBeInstanceOf(Array);
      expect(extensions.length).toBeGreaterThan(0);
      expect(extensions).toContain('.java');
      expect(extensions).toContain('.py');
      expect(extensions).toContain('.ts');
      expect(extensions).toContain('.cbl');
    });

    it('should include extensions from all source languages', () => {
      const extensions = getAllSupportedExtensions();
      const totalExpected = Object.values(SUPPORTED_SOURCE_LANGUAGES).reduce(
        (sum, lang) => sum + lang.extensions.length,
        0,
      );
      expect(extensions.length).toBe(totalExpected);
    });
  });

  describe('getLanguageByExtension', () => {
    it('should detect Java from .java extension', () => {
      const lang = getLanguageByExtension('.java');
      expect(lang).toBeDefined();
      expect(lang?.name).toBe('java');
      expect(lang?.displayName).toBe('Java');
    });

    it('should detect Python from .py extension', () => {
      const lang = getLanguageByExtension('.py');
      expect(lang).toBeDefined();
      expect(lang?.name).toBe('python');
    });

    it('should detect COBOL from .cbl extension', () => {
      const lang = getLanguageByExtension('.cbl');
      expect(lang).toBeDefined();
      expect(lang?.name).toBe('cobol');
    });

    it('should be case insensitive', () => {
      const lang1 = getLanguageByExtension('.JAVA');
      const lang2 = getLanguageByExtension('.java');
      expect(lang1).toEqual(lang2);
    });

    it('should return undefined for unknown extensions', () => {
      const lang = getLanguageByExtension('.unknown');
      expect(lang).toBeUndefined();
    });

    it('should detect TypeScript from .ts extension', () => {
      const lang = getLanguageByExtension('.ts');
      expect(lang).toBeDefined();
      expect(lang?.name).toBe('typescript');
    });

    it('should detect C++ from .cpp extension', () => {
      const lang = getLanguageByExtension('.cpp');
      expect(lang).toBeDefined();
      expect(lang?.name).toBe('cpp');
    });
  });

  describe('getTargetExtension', () => {
    it('should return correct extension for TypeScript', () => {
      expect(getTargetExtension('typescript')).toBe('.ts');
    });

    it('should return correct extension for Python', () => {
      expect(getTargetExtension('python')).toBe('.py');
    });

    it('should return correct extension for Java', () => {
      expect(getTargetExtension('java')).toBe('.java');
    });

    it('should return correct extension for Go', () => {
      expect(getTargetExtension('go')).toBe('.go');
    });

    it('should return .txt for unknown languages', () => {
      expect(getTargetExtension('unknown')).toBe('.txt');
    });

    it('should return correct extension for all supported target languages', () => {
      for (const lang of SUPPORTED_TARGET_LANGUAGES) {
        const ext = getTargetExtension(lang.value);
        expect(ext).toBe(TARGET_LANGUAGE_EXTENSIONS[lang.value]);
      }
    });
  });

  describe('SUPPORTED_SOURCE_LANGUAGES', () => {
    it('should contain all expected languages', () => {
      expect(SUPPORTED_SOURCE_LANGUAGES).toHaveProperty('java');
      expect(SUPPORTED_SOURCE_LANGUAGES).toHaveProperty('python');
      expect(SUPPORTED_SOURCE_LANGUAGES).toHaveProperty('typescript');
      expect(SUPPORTED_SOURCE_LANGUAGES).toHaveProperty('cobol');
      expect(SUPPORTED_SOURCE_LANGUAGES).toHaveProperty('fortran');
    });

    it('should have correct structure for each language', () => {
      for (const lang of Object.values(SUPPORTED_SOURCE_LANGUAGES)) {
        expect(lang).toHaveProperty('name');
        expect(lang).toHaveProperty('extensions');
        expect(lang).toHaveProperty('displayName');
        expect(Array.isArray(lang.extensions)).toBe(true);
        expect(lang.extensions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('DEFAULT_CONFIG', () => {
    it('should have all required properties', () => {
      expect(DEFAULT_CONFIG).toHaveProperty('ollamaUrl');
      expect(DEFAULT_CONFIG).toHaveProperty('defaultModel');
      expect(DEFAULT_CONFIG).toHaveProperty('maxFileSize');
      expect(DEFAULT_CONFIG).toHaveProperty('maxRetries');
      expect(DEFAULT_CONFIG).toHaveProperty('retryDelay');
    });

    it('should have correct default values', () => {
      expect(DEFAULT_CONFIG.ollamaUrl).toBe('http://localhost:11434');
      expect(DEFAULT_CONFIG.defaultModel).toBe('codellama');
      expect(DEFAULT_CONFIG.maxFileSize).toBe(100 * 1024);
      expect(DEFAULT_CONFIG.maxRetries).toBe(3);
      expect(DEFAULT_CONFIG.retryDelay).toBe(1000);
    });
  });
});

