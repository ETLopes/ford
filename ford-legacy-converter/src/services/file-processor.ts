import {glob} from 'glob'
import {existsSync, statSync} from 'node:fs'
import {mkdir, readFile, writeFile} from 'node:fs/promises'
/**
 * File processor service
 * Handles file system operations for codebase scanning and conversion
 */
import path from 'node:path'

import {DEFAULT_CONFIG, getAllSupportedExtensions, getTargetExtension, IGNORE_PATTERNS} from '../utils/constants.js'

export interface ProcessedFile {
  content: string
  convertedContent: string
  sourcePath: string
  targetPath: string
}

/**
 * Check if a file should be processed based on size
 */
function isFileProcessable(filePath: string): boolean {
  try {
    const stats = statSync(filePath)
    if (!stats.isFile()) {
      return false
    }

    // Skip files larger than max size
    if (stats.size > DEFAULT_CONFIG.maxFileSize) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Scan directory for code files
 */
export async function scanCodebase(codebasePath: string): Promise<string[]> {
  if (!existsSync(codebasePath)) {
    throw new Error(`Path does not exist: ${codebasePath}`)
  }

  const extensions = getAllSupportedExtensions()
  const patterns = extensions.map((ext) => `**/*${ext}`)

  const allFiles: string[] = []

  for (const pattern of patterns) {
    // eslint-disable-next-line no-await-in-loop
    const files = await glob(pattern, {
      absolute: true,
      cwd: codebasePath,
      ignore: [...IGNORE_PATTERNS],
    })
    allFiles.push(...files)
  }

  // Filter out files that are too large or not processable
  return allFiles.filter((file) => isFileProcessable(file))
}

/**
 * Read file content
 */
export async function readFileContent(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, 'utf8')
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error}`)
  }
}

/**
 * Get output path for converted file
 */
export function getOutputPath(
  sourcePath: string,
  sourceBasePath: string,
  outputBasePath: string,
  targetLanguage: string,
): string {
  const relativePath = path.relative(sourceBasePath, sourcePath)
  const dir = path.dirname(relativePath)
  const name = path.basename(relativePath, path.extname(relativePath))
  const targetExt = getTargetExtension(targetLanguage)

  const outputDir = path.join(outputBasePath, dir)
  const outputFile = path.join(outputDir, `${name}${targetExt}`)

  return outputFile
}

/**
 * Ensure output directory exists
 */
export async function ensureOutputDirectory(outputPath: string): Promise<void> {
  const dir = path.dirname(outputPath)
  await mkdir(dir, {recursive: true})
}

/**
 * Write converted file
 */
export async function writeConvertedFile(outputPath: string, content: string): Promise<void> {
  await ensureOutputDirectory(outputPath)
  await writeFile(outputPath, content, 'utf8')
}

/**
 * Process multiple files and write converted versions
 */
export async function processFiles(files: ProcessedFile[]): Promise<void> {
  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    await writeConvertedFile(file.targetPath, file.convertedContent)
  }
}

/**
 * Get relative path from base
 */
export function getRelativePath(filePath: string, basePath: string): string {
  return path.relative(basePath, filePath)
}
