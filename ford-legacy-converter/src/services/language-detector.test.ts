import { mkdir , readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SUPPORTED_SOURCE_LANGUAGES } from '../utils/constants.js';
import {
  detectFileLanguage,
  detectLanguageFromExtension,
  detectLanguages,
  getLanguageStats,
} from './language-detector.js';

vi.mock('node:fs/promises');

describe('language-detector', () => {
  const testDir = join(process.cwd(), 'test-temp');

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { force: true, recursive: true });
  });

  describe('detectLanguageFromExtension', () => {
    it('should detect Java from .java file', () => {
      const lang = detectLanguageFromExtension('test.java');
      expect(lang).toBeDefined();
      expect(lang?.name).toBe('java');
    });

    it('should detect Python from .py file', () => {
      const lang = detectLanguageFromExtension('script.py');
      expect(lang).toBeDefined();
      expect(lang?.name).toBe('python');
    });

    it('should detect TypeScript from .ts file', () => {
      const lang = detectLanguageFromExtension('app.ts');
      expect(lang).toBeDefined();
      expect(lang?.name).toBe('typescript');
    });

    it('should detect COBOL from .cbl file', () => {
      const lang = detectLanguageFromExtension('program.cbl');
      expect(lang).toBeDefined();
      expect(lang?.name).toBe('cobol');
    });

    it('should return undefined for unknown extensions', () => {
      const lang = detectLanguageFromExtension('file.unknown');
      expect(lang).toBeUndefined();
    });

    it('should handle files without extensions', () => {
      const lang = detectLanguageFromExtension('file');
      expect(lang).toBeUndefined();
    });
  });

  describe('detectFileLanguage', () => {
    it('should detect language from extension when available', async () => {
      const filePath = join(testDir, 'test.java');
      await writeFile(filePath, 'public class Test {}');

      const lang = await detectFileLanguage(filePath);
      expect(lang).toBeDefined();
      expect(lang?.name).toBe('java');
    });

    it('should detect COBOL from content when extension is missing', async () => {
      const filePath = join(testDir, 'program.txt');
      const cobolCode = `IDENTIFICATION DIVISION.
PROGRAM-ID. TEST.
DATA DIVISION.
PROCEDURE DIVISION.
    DISPLAY "Hello".
    STOP RUN.`;
      await writeFile(filePath, cobolCode);

      vi.mocked(readFile).mockResolvedValueOnce(cobolCode);

      const lang = await detectFileLanguage(filePath);
      expect(lang).toBeDefined();
      expect(lang?.name).toBe('cobol');
    });

    it('should detect Fortran from content', async () => {
      const filePath = join(testDir, 'program.txt');
      const fortranCode = `PROGRAM TEST
    WRITE(*,*) 'Hello'
END PROGRAM`;
      await writeFile(filePath, fortranCode);

      vi.mocked(readFile).mockResolvedValueOnce(fortranCode);

      const lang = await detectFileLanguage(filePath);
      expect(lang).toBeDefined();
      expect(lang?.name).toBe('fortran');
    });

    it('should detect VB6 from content', async () => {
      const filePath = join(testDir, 'module.txt');
      const vbCode = `Option Explicit

Private Sub Button1_Click()
    MsgBox "Hello"
End Sub`;
      await writeFile(filePath, vbCode);

      vi.mocked(readFile).mockResolvedValueOnce(vbCode);

      const lang = await detectFileLanguage(filePath);
      expect(lang).toBeDefined();
      expect(lang?.name).toBe('vb6');
    });

    it('should detect Pascal from content', async () => {
      const filePath = join(testDir, 'program.txt');
      const pascalCode = `UNIT Test;
USES Crt;
BEGIN
    WriteLn('Hello');
END.`;
      await writeFile(filePath, pascalCode);

      vi.mocked(readFile).mockResolvedValueOnce(pascalCode);

      const lang = await detectFileLanguage(filePath);
      expect(lang).toBeDefined();
      expect(lang?.name).toBe('pascal');
    });

    it('should detect Perl from content', async () => {
      const filePath = join(testDir, 'script.txt');
      const perlCode = `#!/usr/bin/perl
use strict;
print "Hello\\n";`;
      await writeFile(filePath, perlCode);

      vi.mocked(readFile).mockResolvedValueOnce(perlCode);

      const lang = await detectFileLanguage(filePath);
      expect(lang).toBeDefined();
      expect(lang?.name).toBe('perl');
    });

    it('should return undefined for unrecognized content', async () => {
      const filePath = join(testDir, 'unknown.txt');
      await writeFile(filePath, 'Some random text');

      vi.mocked(readFile).mockResolvedValueOnce('Some random text');

      const lang = await detectFileLanguage(filePath);
      expect(lang).toBeUndefined();
    });

    it('should handle file read errors gracefully', async () => {
      const filePath = join(testDir, 'nonexistent.txt');
      vi.mocked(readFile).mockRejectedValueOnce(new Error('File not found'));

      const lang = await detectFileLanguage(filePath);
      expect(lang).toBeUndefined();
    });
  });

  describe('detectLanguages', () => {
    it('should detect languages for multiple files', async () => {
      const file1 = join(testDir, 'test1.java');
      const file2 = join(testDir, 'test2.py');
      await writeFile(file1, 'public class Test {}');
      await writeFile(file2, 'print("Hello")');

      const detected = await detectLanguages([file1, file2]);
      expect(detected).toHaveLength(2);
      expect(detected[0]?.language.name).toBe('java');
      expect(detected[1]?.language.name).toBe('python');
    });

    it('should skip files with unrecognized languages', async () => {
      const file1 = join(testDir, 'test.java');
      const file2 = join(testDir, 'unknown.xyz');
      await writeFile(file1, 'public class Test {}');
      await writeFile(file2, 'random content');

      const detected = await detectLanguages([file1, file2]);
      expect(detected).toHaveLength(1);
      expect(detected[0]?.language.name).toBe('java');
    });

    it('should return empty array for no files', async () => {
      const detected = await detectLanguages([]);
      expect(detected).toHaveLength(0);
    });

    it('should include extension and path in detected files', async () => {
      const filePath = join(testDir, 'test.java');
      await writeFile(filePath, 'public class Test {}');

      const detected = await detectLanguages([filePath]);
      expect(detected[0]).toHaveProperty('extension');
      expect(detected[0]).toHaveProperty('path');
      expect(detected[0]).toHaveProperty('language');
      expect(detected[0]?.extension).toBe('.java');
      expect(detected[0]?.path).toBe(filePath);
    });
  });

  describe('getLanguageStats', () => {
    it('should count files by language', () => {
      const detectedFiles = [
        {
          extension: '.java',
          language: SUPPORTED_SOURCE_LANGUAGES.java,
          path: 'file1.java',
        },
        {
          extension: '.java',
          language: SUPPORTED_SOURCE_LANGUAGES.java,
          path: 'file2.java',
        },
        {
          extension: '.py',
          language: SUPPORTED_SOURCE_LANGUAGES.python,
          path: 'file1.py',
        },
      ];

      const stats = getLanguageStats(detectedFiles);
      expect(stats.java).toBe(2);
      expect(stats.python).toBe(1);
    });

    it('should return empty object for empty array', () => {
      const stats = getLanguageStats([]);
      expect(stats).toEqual({});
    });

    it('should handle single language', () => {
      const detectedFiles = [
        {
          extension: '.java',
          language: SUPPORTED_SOURCE_LANGUAGES.java,
          path: 'file1.java',
        },
      ];

      const stats = getLanguageStats(detectedFiles);
      expect(stats.java).toBe(1);
      expect(Object.keys(stats).length).toBe(1);
    });
  });
});

