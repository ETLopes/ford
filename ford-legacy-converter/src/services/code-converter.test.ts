import {describe, expect, it} from 'vitest'

import {DEFAULT_CONFIG} from '../utils/constants.js'

// Note: These are integration-style tests
// Full testing requires a running Ollama instance
// The actual implementation is tested through the convert command

describe('code-converter', () => {
  describe('Module structure', () => {
    it('should export convertCode function', async () => {
      const module = await import('./code-converter.js')
      expect(module).toHaveProperty('convertCode')
      expect(typeof module.convertCode).toBe('function')
    })

    it('should export testOllamaConnection function', async () => {
      const module = await import('./code-converter.js')
      expect(module).toHaveProperty('testOllamaConnection')
      expect(typeof module.testOllamaConnection).toBe('function')
    })
  })

  describe('Configuration', () => {
    it('should use default config values', () => {
      expect(DEFAULT_CONFIG.ollamaUrl).toBe('http://localhost:11434')
      expect(DEFAULT_CONFIG.defaultModel).toBe('codellama')
      expect(DEFAULT_CONFIG.maxRetries).toBe(3)
      expect(DEFAULT_CONFIG.retryDelay).toBe(1000)
    })
  })

  // Integration tests would require Ollama to be running
  // These are skipped by default but can be run with: vitest --testNamePattern="Integration"
  // eslint-disable-next-line mocha/no-skipped-tests
  describe.skip('Integration tests (requires Ollama)', () => {
    it('should test Ollama connection', async () => {
      const {testOllamaConnection} = await import('./code-converter.js')
      const result = await testOllamaConnection()
      expect(typeof result).toBe('boolean')
    })

    it('should convert code', async () => {
      const {convertCode} = await import('./code-converter.js')
      const result = await convertCode('Java', 'TypeScript', 'public class Test {}')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })
})
