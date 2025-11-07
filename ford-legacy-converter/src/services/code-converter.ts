/**
 * Code converter service
 * Uses LangChain.js with Ollama to convert code between languages
 */
import {ChatOllama} from '@langchain/community/chat_models/ollama'
import {ChatPromptTemplate} from '@langchain/core/prompts'

import {DEFAULT_CONFIG} from '../utils/constants.js'

export interface ConverterConfig {
  maxRetries?: number
  model?: string
  ollamaUrl?: string
  retryDelay?: number
}

/**
 * Create conversion prompt template
 */
function createConversionPrompt(): ChatPromptTemplate {
  return ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are an expert code converter specializing in modernizing legacy code. Your task is to convert code from one programming language to another with these requirements:

CRITICAL RULES:
1. Use ONLY native target language features and standard libraries - NO source language libraries or constructs
2. Replace I/O operations with target language equivalents (e.g., C's scanf/printf → TypeScript's readline/console.log)
3. Convert data types appropriately (e.g., C's char* → TypeScript's string, C's int → TypeScript's number)
4. Use target language idioms and best practices
5. Handle memory management appropriately (no manual malloc/free in garbage-collected languages)
6. Convert pointer operations to target language equivalents
7. Use proper error handling patterns for the target language
8. Maintain all business logic and algorithms exactly
9. Preserve all comments and documentation
10. Adapt variable/function names to target language naming conventions (camelCase for TypeScript/JavaScript)

OUTPUT FORMAT:
- Provide ONLY the converted code
- NO markdown code blocks (no \`\`\`)
- NO explanatory text before or after the code
- NO comments about the conversion process
- NO artifacts or placeholders like [ENTITY], [CODE], etc.
- Code must be complete, compilable, and runnable

For TypeScript/JavaScript specifically:
- Use console.log/console.error for output
- Use readline or process.stdin for input (if needed)
- Use proper TypeScript types
- Use modern ES6+ features
- Handle async operations properly if needed`,
    ],
    [
      'human',
      `Convert the following {sourceLanguage} code to {targetLanguage}. 

IMPORTANT: 
- Use ONLY {targetLanguage} native features and standard libraries
- Replace all I/O operations with {targetLanguage} equivalents
- Convert all data types to {targetLanguage} types
- Make the code idiomatic and follow {targetLanguage} best practices
- Output ONLY the converted code, nothing else

Source code:
{code}`,
    ],
  ])
}

/**
 * Initialize Ollama LLM
 */
function createOllamaLLM(config: ConverterConfig): ChatOllama {
  return new ChatOllama({
    baseUrl: config.ollamaUrl || DEFAULT_CONFIG.ollamaUrl,
    model: config.model || DEFAULT_CONFIG.defaultModel,
    temperature: 0.1, // Lower temperature for more deterministic code conversion
  })
}

interface RetryOptions {
  code: string
  llm: ChatOllama
  maxRetries: number
  prompt: ChatPromptTemplate
  retryDelay: number
  sourceLanguage: string
  targetLanguage: string
}

/**
 * Convert code with retry logic
 */
async function convertWithRetry(options: RetryOptions): Promise<string> {
  const {code, llm, maxRetries, prompt, retryDelay, sourceLanguage, targetLanguage} = options
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const formattedPrompt = await prompt.formatMessages({
        code,
        sourceLanguage,
        targetLanguage,
      })

      // eslint-disable-next-line no-await-in-loop
      const response = await llm.invoke(formattedPrompt)
      const convertedCode = response.content as string

      // Clean up response (remove markdown code blocks, explanatory text, artifacts)
      return convertedCode
        .replaceAll(/^```[\w]*\n?/gm, '') // Remove opening code blocks
        .replaceAll(/```$/gm, '') // Remove closing code blocks
        .replaceAll('[ENTITY]', '') // Remove entity artifacts
        .replaceAll('[CODE]', '') // Remove code artifacts
        .replaceAll(/Note that.*?conventions\./gs, '') // Remove explanatory notes
        .replaceAll(/Here is the converted.*?code:/gi, '') // Remove intro text
        .replaceAll(/Target code:/gi, '') // Remove target code labels
        .replaceAll(/^\/\*\*?\s*Converted.*?\*\//gim, '') // Remove conversion comments
        .split('\n')
        .filter((line) => {
          // Remove lines that are clearly explanatory text
          const lowerLine = line.toLowerCase().trim()
          return (
            !lowerLine.startsWith('note:') &&
            !lowerLine.startsWith('important:') &&
            !lowerLine.startsWith('this code') &&
            !lowerLine.includes('has been converted') &&
            !lowerLine.includes('preserves all comments')
          )
        })
        .join('\n')
        .trim()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        // Wait before retrying
        // eslint-disable-next-line no-await-in-loop
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, retryDelay * attempt)
        })
      }
    }
  }

  throw new Error(`Failed to convert code after ${maxRetries} attempts: ${lastError?.message}`)
}

/**
 * Convert code from source language to target language
 */
export async function convertCode(
  sourceLanguage: string,
  targetLanguage: string,
  code: string,
  config: ConverterConfig = {},
): Promise<string> {
  const llm = createOllamaLLM(config)
  const prompt = createConversionPrompt()

  const maxRetries = config.maxRetries || DEFAULT_CONFIG.maxRetries
  const retryDelay = config.retryDelay || DEFAULT_CONFIG.retryDelay

  return convertWithRetry({
    code,
    llm,
    maxRetries,
    prompt,
    retryDelay,
    sourceLanguage,
    targetLanguage,
  })
}

/**
 * Test Ollama connection
 */
export async function testOllamaConnection(config: ConverterConfig = {}): Promise<boolean> {
  try {
    const llm = createOllamaLLM(config)
    const response = await llm.invoke('Hello')
    return response !== undefined
  } catch {
    return false
  }
}
