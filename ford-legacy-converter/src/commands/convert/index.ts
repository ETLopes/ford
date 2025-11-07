/**
 * Convert command
 * Main command for converting legacy codebases to modern languages
 */
import {Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import cliProgress from 'cli-progress'
import {createPromptModule} from 'inquirer'
const prompt = createPromptModule()
import {existsSync} from 'node:fs'
import path from 'node:path'
import ora from 'ora'

import {convertCode, testOllamaConnection} from '../../services/code-converter.js'
import {scanCodebase} from '../../services/file-processor.js'
import {getOutputPath, type ProcessedFile, processFiles, readFileContent} from '../../services/file-processor.js'
import {type DetectedFile, detectLanguages, getLanguageStats} from '../../services/language-detector.js'
import {DEFAULT_CONFIG, SUPPORTED_TARGET_LANGUAGES} from '../../utils/constants.js'
import {logger} from '../../utils/logger.js'

export default class Convert extends Command {
  static description = 'Convert legacy codebase to a modern programming language using AI'
  static examples = [
    `<%= config.bin %> convert --path ./legacy-code --target typescript`,
    `<%= config.bin %> convert -p ./old-project -t python -o ./converted`,
    `<%= config.bin %> convert -p ./codebase --model codellama`,
  ]
  static flags = {
    model: Flags.string({
      default: DEFAULT_CONFIG.defaultModel,
      description: 'Ollama model to use',
    }),
    'ollama-url': Flags.string({
      default: DEFAULT_CONFIG.ollamaUrl,
      description: 'Ollama API URL',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output directory for converted code',
    }),
    path: Flags.string({
      char: 'p',
      description: 'Path to the codebase to convert',
      required: true,
    }),
    target: Flags.string({
      char: 't',
      description: 'Target language for conversion',
      options: SUPPORTED_TARGET_LANGUAGES.map((lang) => lang.value),
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Convert)

    try {
      // Validate input path
      const codebasePath = path.resolve(flags.path)
      if (!existsSync(codebasePath)) {
        logger.error(`Path does not exist: ${codebasePath}`)
        this.exit(1)
      }

      // Determine output path
      const outputPath = flags.output ? path.resolve(flags.output) : path.resolve(`${codebasePath}-converted`)

      logger.info(`Scanning codebase: ${codebasePath}`)

      // Scan for code files
      const spinner = ora('Scanning codebase for code files...').start()
      const codeFiles = await scanCodebase(codebasePath)
      spinner.succeed(`Found ${codeFiles.length} code files`)

      if (codeFiles.length === 0) {
        logger.warning('No code files found in the specified path')
        this.exit(0)
      }

      // Detect languages
      spinner.text = 'Detecting programming languages...'
      spinner.start()
      const detectedFiles = await detectLanguages(codeFiles)
      spinner.succeed(`Detected languages in ${detectedFiles.length} files`)

      if (detectedFiles.length === 0) {
        logger.warning('No supported languages detected')
        this.exit(0)
      }

      // Show language statistics
      const stats = getLanguageStats(detectedFiles)
      logger.info('Detected languages:')
      for (const [lang, count] of Object.entries(stats)) {
        logger.log(`  ${chalk.cyan(lang)}: ${count} files`)
      }

      // Get target language
      let targetLanguage: string = flags.target || ''
      if (!targetLanguage) {
        const answer = await prompt<{target: string}>([
          {
            choices: SUPPORTED_TARGET_LANGUAGES.map((lang) => ({
              name: lang.name,
              value: lang.value,
            })),
            message: 'Select target language:',
            name: 'target',
            type: 'list',
          },
        ])
        targetLanguage = answer.target
      }

      // Test Ollama connection
      spinner.text = 'Testing Ollama connection...'
      spinner.start()
      const isConnected = await testOllamaConnection({
        model: flags.model,
        ollamaUrl: flags['ollama-url'],
      })

      if (!isConnected) {
        spinner.fail('Failed to connect to Ollama')
        logger.error(
          `Cannot connect to Ollama at ${flags['ollama-url']}. Please ensure Ollama is running and the model "${flags.model}" is installed.`,
        )
        logger.info('To install a model, run: ollama pull codellama')
        this.exit(1)
      }

      spinner.succeed('Connected to Ollama')

      // Show summary
      logger.info('\nConversion Summary:')
      logger.log(`  Source: ${codebasePath}`)
      logger.log(`  Target: ${outputPath}`)
      logger.log(`  Files to convert: ${detectedFiles.length}`)
      logger.log(`  Target language: ${chalk.cyan(targetLanguage)}`)
      logger.log(`  Model: ${chalk.cyan(flags.model)}`)

      // Confirm conversion
      const confirm = await prompt([
        {
          default: true,
          message: 'Proceed with conversion?',
          name: 'proceed',
          type: 'confirm',
        },
      ])

      if (!confirm.proceed) {
        logger.info('Conversion cancelled')
        this.exit(0)
      }

      // Process files
      await this.processFilesWithProgress({
        detectedFiles,
        model: flags.model,
        ollamaUrl: flags['ollama-url'],
        outputBasePath: outputPath,
        sourceBasePath: codebasePath,
        targetLanguage,
      })

      logger.success(`\nConversion complete! Output: ${outputPath}`)
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'An unexpected error occurred')
      this.exit(1)
    }
  }

  private async processFilesWithProgress(options: {
    detectedFiles: DetectedFile[]
    model: string
    ollamaUrl: string
    outputBasePath: string
    sourceBasePath: string
    targetLanguage: string
  }): Promise<void> {
    const {detectedFiles, model, ollamaUrl, outputBasePath, sourceBasePath, targetLanguage} = options
    const progressBar = new cliProgress.SingleBar(
      {
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        format: 'Converting |{bar}| {percentage}% | {value}/{total} files | ETA: {eta}s | {filename}',
        hideCursor: true,
      },
      cliProgress.Presets.shades_classic,
    )

    progressBar.start(detectedFiles.length, 0, {filename: ''})

    const processedFiles: ProcessedFile[] = []
    const errors: Array<{error: string; file: string}> = []

    // Process files sequentially to show progress and avoid overwhelming Ollama

    for (const [i, file] of detectedFiles.entries()) {
      const relativePath = path.relative(sourceBasePath, file.path)
      progressBar.update(i, {filename: relativePath})

      try {
        // Read source file
        // eslint-disable-next-line no-await-in-loop
        const sourceContent = await readFileContent(file.path)

        // Convert code
        // eslint-disable-next-line no-await-in-loop
        const convertedContent = await convertCode(file.language.displayName, targetLanguage, sourceContent, {
          model,
          ollamaUrl,
        })

        // Determine output path
        const outputPath = getOutputPath(file.path, sourceBasePath, outputBasePath, targetLanguage)

        processedFiles.push({
          content: sourceContent,
          convertedContent,
          sourcePath: file.path,
          targetPath: outputPath,
        })
      } catch (error) {
        errors.push({
          error: error instanceof Error ? error.message : String(error),
          file: file.path,
        })
      }
    }

    progressBar.stop()

    // Write converted files
    if (processedFiles.length > 0) {
      const writeSpinner = ora('Writing converted files...').start()
      await processFiles(processedFiles)
      writeSpinner.succeed(`Wrote ${processedFiles.length} converted files`)
    }

    // Report errors
    if (errors.length > 0) {
      logger.warning(`\n${errors.length} files failed to convert:`)
      for (const {error, file} of errors) {
        logger.error(`  ${path.relative(sourceBasePath, file)}: ${error}`)
      }
    }
  }
}
