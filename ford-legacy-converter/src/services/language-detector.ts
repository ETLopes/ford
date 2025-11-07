import {readFile} from 'node:fs/promises'
/**
 * Language detection service
 * Detects programming languages from file extensions and content heuristics
 */
import path from 'node:path'

import {getLanguageByExtension, type LanguageInfo, SUPPORTED_SOURCE_LANGUAGES} from '../utils/constants.js'

export interface DetectedFile {
  extension: string
  language: LanguageInfo
  path: string
}

/**
 * Detect language from file extension
 */
export function detectLanguageFromExtension(filePath: string): LanguageInfo | undefined {
  const ext = path.extname(filePath).toLowerCase()
  return getLanguageByExtension(ext)
}

/**
 * Detect language from file content (heuristics)
 */
async function detectLanguageFromContent(filePath: string): Promise<LanguageInfo | undefined> {
  try {
    const content = await readFile(filePath, 'utf8')
    const firstLines = content.split('\n').slice(0, 20).join('\n').toLowerCase()

    // COBOL heuristics
    if (
      firstLines.includes('identification division') ||
      firstLines.includes('data division') ||
      firstLines.includes('procedure division')
    ) {
      return SUPPORTED_SOURCE_LANGUAGES.cobol
    }

    // Fortran heuristics
    if (
      firstLines.includes('program ') ||
      firstLines.includes('subroutine ') ||
      firstLines.includes('function ') ||
      /^\s*\d+\s+/.test(firstLines) // Fixed format line numbers
    ) {
      return SUPPORTED_SOURCE_LANGUAGES.fortran
    }

    // VB6 heuristics
    if (
      firstLines.includes('option explicit') ||
      firstLines.includes('private sub ') ||
      firstLines.includes('private function ')
    ) {
      return SUPPORTED_SOURCE_LANGUAGES.vb6
    }

    // Pascal heuristics
    if (firstLines.includes('program ') || firstLines.includes('unit ') || firstLines.includes('uses ')) {
      return SUPPORTED_SOURCE_LANGUAGES.pascal
    }

    // Perl heuristics
    if (firstLines.includes('#!/usr/bin/perl') || firstLines.includes('use strict')) {
      return SUPPORTED_SOURCE_LANGUAGES.perl
    }

    return undefined
  } catch {
    return undefined
  }
}

/**
 * Detect language for a file using extension and content heuristics
 */
export async function detectFileLanguage(filePath: string): Promise<LanguageInfo | undefined> {
  // First try extension-based detection
  const langFromExt = detectLanguageFromExtension(filePath)
  if (langFromExt) {
    return langFromExt
  }

  // Fallback to content-based detection
  return detectLanguageFromContent(filePath)
}

/**
 * Detect languages for multiple files
 */
export async function detectLanguages(filePaths: string[]): Promise<DetectedFile[]> {
  const detectedFiles: DetectedFile[] = []

  for (const filePath of filePaths) {
    // eslint-disable-next-line no-await-in-loop
    const language = await detectFileLanguage(filePath)
    if (language) {
      detectedFiles.push({
        extension: path.extname(filePath),
        language,
        path: filePath,
      })
    }
  }

  return detectedFiles
}

/**
 * Get language statistics from detected files
 */
export function getLanguageStats(detectedFiles: DetectedFile[]): Record<string, number> {
  const stats: Record<string, number> = {}

  for (const file of detectedFiles) {
    const langName = file.language.name
    stats[langName] = (stats[langName] || 0) + 1
  }

  return stats
}
