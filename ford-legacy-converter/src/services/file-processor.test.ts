import {existsSync, statSync} from 'node:fs'
import {mkdir, readFile, rm, writeFile} from 'node:fs/promises'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import {
  ensureOutputDirectory,
  getOutputPath,
  getRelativePath,
  processFiles,
  readFileContent,
  scanCodebase,
  writeConvertedFile,
} from './file-processor.js'

vi.mock('node:fs/promises')
vi.mock('node:fs')
vi.mock('glob', () => ({
  glob: vi.fn(),
}))

describe('file-processor', () => {
  const testDir = join(process.cwd(), 'test-temp')
  const testFile = join(testDir, 'test.java')

  beforeEach(async () => {
    vi.clearAllMocks()
    await mkdir(testDir, {recursive: true})
    await writeFile(testFile, 'public class Test {}')
  })

  afterEach(async () => {
    await rm(testDir, {force: true, recursive: true})
    vi.clearAllMocks()
  })

  describe('scanCodebase', () => {
    it('should throw error if path does not exist', async () => {
      vi.mocked(existsSync).mockReturnValue(false)

      await expect(scanCodebase('/nonexistent')).rejects.toThrow('Path does not exist')
    })

    it('should return empty array for directory with no code files', async () => {
      vi.mocked(existsSync).mockReturnValue(true)
      const {glob} = await import('glob')
      vi.mocked(glob).mockResolvedValue([])

      const files = await scanCodebase(testDir)
      expect(files).toEqual([])
    })

    it('should filter out files larger than max size', async () => {
      vi.mocked(existsSync).mockReturnValue(true)
      const {glob} = await import('glob')
      const largeFile = join(testDir, 'large.java')
      vi.mocked(glob).mockResolvedValue([largeFile])
      vi.mocked(statSync).mockReturnValue({
        isFile: () => true,
        size: 200 * 1024, // 200KB
      } as unknown as ReturnType<typeof statSync>)

      const files = await scanCodebase(testDir)
      expect(files).not.toContain(largeFile)
    })

    it('should filter out directories', async () => {
      vi.mocked(existsSync).mockReturnValue(true)
      const {glob} = await import('glob')
      const dirPath = join(testDir, 'subdir')
      vi.mocked(glob).mockResolvedValue([dirPath])
      vi.mocked(statSync).mockReturnValue({
        isFile: () => false,
      } as unknown as ReturnType<typeof statSync>)

      const files = await scanCodebase(testDir)
      expect(files).not.toContain(dirPath)
    })
  })

  describe('readFileContent', () => {
    it('should read file content successfully', async () => {
      const content = 'public class Test {}'
      vi.mocked(readFile).mockResolvedValueOnce(content)

      const result = await readFileContent(testFile)
      expect(result).toBe(content)
      expect(readFile).toHaveBeenCalledWith(testFile, 'utf8')
    })

    it('should throw error if file read fails', async () => {
      const error = new Error('Permission denied')
      vi.mocked(readFile).mockRejectedValueOnce(error)

      await expect(readFileContent(testFile)).rejects.toThrow('Failed to read file')
    })
  })

  describe('getOutputPath', () => {
    it('should generate correct output path', () => {
      const sourcePath = join('/source', 'src', 'main.java')
      const sourceBase = '/source'
      const outputBase = '/output'
      const targetLanguage = 'typescript'

      const outputPath = getOutputPath(sourcePath, sourceBase, outputBase, targetLanguage)

      expect(outputPath).toContain('main.ts')
      expect(outputPath).toContain('src')
    })

    it('should preserve directory structure', () => {
      const sourcePath = join('/source', 'deep', 'nested', 'file.py')
      const sourceBase = '/source'
      const outputBase = '/output'
      const targetLanguage = 'java'

      const outputPath = getOutputPath(sourcePath, sourceBase, outputBase, targetLanguage)

      expect(outputPath).toContain('deep')
      expect(outputPath).toContain('nested')
      expect(outputPath).toContain('file.java')
    })

    it('should use correct target extension', () => {
      const sourcePath = join('/source', 'test.c')
      const sourceBase = '/source'
      const outputBase = '/output'
      const targetLanguage = 'go'

      const outputPath = getOutputPath(sourcePath, sourceBase, outputBase, targetLanguage)

      expect(outputPath).toContain('test.go')
    })
  })

  describe('ensureOutputDirectory', () => {
    it('should create directory if it does not exist', async () => {
      const outputPath = join(testDir, 'new', 'file.ts')
      await ensureOutputDirectory(outputPath)

      expect(mkdir).toHaveBeenCalledWith(join(testDir, 'new'), {
        recursive: true,
      })
    })

    it('should handle nested directories', async () => {
      const outputPath = join(testDir, 'deep', 'nested', 'file.ts')
      await ensureOutputDirectory(outputPath)

      expect(mkdir).toHaveBeenCalledWith(join(testDir, 'deep', 'nested'), {recursive: true})
    })
  })

  describe('writeConvertedFile', () => {
    it('should write file with converted content', async () => {
      const outputPath = join(testDir, 'converted.ts')
      const content = 'export class Test {}'

      await writeConvertedFile(outputPath, content)

      expect(mkdir).toHaveBeenCalled()
      expect(writeFile).toHaveBeenCalledWith(outputPath, content, 'utf8')
    })

    it('should ensure directory exists before writing', async () => {
      const outputPath = join(testDir, 'new', 'file.ts')
      const content = 'export class Test {}'

      await writeConvertedFile(outputPath, content)

      expect(mkdir).toHaveBeenCalled()
      expect(writeFile).toHaveBeenCalled()
    })
  })

  describe('processFiles', () => {
    it('should process multiple files', async () => {
      vi.clearAllMocks()
      const files = [
        {
          content: 'public class Test {}',
          convertedContent: 'export class Test {}',
          sourcePath: join(testDir, 'file1.java'),
          targetPath: join(testDir, 'file1.ts'),
        },
        {
          content: 'public class Test2 {}',
          convertedContent: 'export class Test2 {}',
          sourcePath: join(testDir, 'file2.java'),
          targetPath: join(testDir, 'file2.ts'),
        },
      ]

      await processFiles(files)

      expect(writeFile).toHaveBeenCalledTimes(2)
    })

    it('should handle empty array', async () => {
      vi.clearAllMocks()
      await processFiles([])
      expect(writeFile).not.toHaveBeenCalled()
    })
  })

  describe('getRelativePath', () => {
    it('should return relative path from base', () => {
      const filePath = join('/base', 'sub', 'file.java')
      const basePath = '/base'

      const relative = getRelativePath(filePath, basePath)
      expect(relative).toBe(join('sub', 'file.java'))
    })

    it('should handle files in base directory', () => {
      const filePath = join('/base', 'file.java')
      const basePath = '/base'

      const relative = getRelativePath(filePath, basePath)
      expect(relative).toBe('file.java')
    })
  })
})
