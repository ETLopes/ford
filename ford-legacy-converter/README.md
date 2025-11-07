# Ford Legacy Code Converter

A powerful CLI tool that uses AI (Ollama + LangChain) to modernize legacy codebases by converting code from one programming language to another.

## Features

- 🔍 **Automatic Language Detection**: Detects programming languages from file extensions and content heuristics
- 🤖 **AI-Powered Conversion**: Uses Ollama with LangChain.js for intelligent code conversion
- 📊 **Progress Tracking**: Real-time progress bars and status updates
- 🎯 **Multiple Target Languages**: Convert to TypeScript, JavaScript, Python, Java, C#, Go, Rust, PHP, or Ruby
- 📁 **Directory Preservation**: Maintains original directory structure in converted output
- ⚡ **Fast & Efficient**: Processes files sequentially to optimize performance

## Prerequisites

- **Node.js** >= 18.0.0 (LTS recommended)
- **Ollama** installed and running locally
- An **Ollama model** installed (recommended: `codellama` and `llama3`)

## Installation

### Step 1: Install Node.js

#### macOS

```bash
# Using Homebrew (recommended)
brew install node

# Or download from https://nodejs.org/
```

#### Linux (Ubuntu/Debian)

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

#### Linux (Fedora/RHEL)

```bash
# Using NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Or using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

#### Windows

1. Download the installer from [https://nodejs.org/](https://nodejs.org/)
2. Run the installer and follow the setup wizard
3. Verify installation:

   ```cmd
   node --version
   npm --version
   ```

   **Alternative: Using Chocolatey**

   ```cmd
   choco install nodejs
   ```

### Step 2: Install Ollama

#### macOS

```bash
# Using Homebrew (recommended)
brew install ollama

# Or download from https://ollama.ai/download
# Open the .dmg file and drag Ollama to Applications
```

#### Linux

```bash
# Install using the official script
curl -fsSL https://ollama.ai/install.sh | sh

# Or download from https://ollama.ai/download
# Extract and run: ./ollama serve
```

#### Windows

1. Download the installer from [https://ollama.ai/download](https://ollama.ai/download)
2. Run `OllamaSetup.exe` and follow the installation wizard
3. Ollama will start automatically after installation

**Verify Ollama Installation:**

```bash
ollama --version
```

### Step 3: Start Ollama Service

#### macOS / Linux

```bash
# Start Ollama service (runs in background)
ollama serve

# Or run in foreground to see logs
ollama serve
```

#### Windows

Ollama should start automatically after installation. If not:

1. Open Command Prompt or PowerShell
2. Run: `ollama serve`

**Verify Ollama is Running:**

```bash
# Test the API
curl http://localhost:11434/api/tags

# Or visit in browser
# http://localhost:11434
```

### Step 4: Install Ollama Models

Install the recommended models for code conversion:

```bash
# Install CodeLlama (recommended for code conversion)
ollama pull codellama

# And install Llama 3 (alternative)
ollama pull llama3

# Verify installed models
ollama list
```

**Model Recommendations:**

- **codellama**: Best for code conversion tasks (7B, 13B, or 34B variants available)
- **llama3**: General-purpose model, also good for code (8B or 70B variants)
- **deepseek-coder**: Specialized for code tasks (if available)

**Note**: Larger models (13B, 34B, 70B) provide better quality but require more RAM and are slower. Start with 7B/8B models for testing.

### Step 5: Install the CLI Tool

#### Option A: Install Globally (Recommended)

```bash
npm install -g ford-legacy-converter
```

**What happens during global installation:**

When you run `npm install -g ford-legacy-converter`, npm automatically:

1. **Downloads the package** from the npm registry (or installs from local directory)
2. **Installs all dependencies** listed in `dependencies` (not devDependencies):
   - `@langchain/community`, `@langchain/core`, `langchain` (AI/LLM libraries)
   - `@oclif/core`, `@oclif/plugin-help`, `@oclif/plugin-plugins` (CLI framework)
   - `chalk`, `cli-progress`, `inquirer`, `ora` (UI/UX libraries)
   - `fs-extra`, `glob` (file system utilities)
3. **Links the binary** so `ford-legacy-converter` command is available globally
4. **No build step needed** - the package is pre-built and includes the compiled `dist` folder

**Dependencies are installed in:**

- **macOS/Linux**: `~/.npm-global/node_modules` or `/usr/local/lib/node_modules`
- **Windows**: `%AppData%\npm\node_modules`

**The package is ready to use immediately** - you can run `ford-legacy-converter` right after installation!

#### Option B: Use from Project Directory

```bash
# Clone or navigate to the project
cd ford-legacy-converter

# Install dependencies (both dependencies AND devDependencies)
npm install

# Build the project (compiles TypeScript to JavaScript)
npm run build

# Use the local version
./bin/dev.js convert --path ./legacy-code
```

**Difference from global install:**

- Local install includes `devDependencies` (TypeScript, testing tools, etc.) needed for development
- You must run `npm run build` to compile TypeScript before using
- Global install only includes runtime `dependencies` and is pre-built

#### Option C: Use with npx (No Installation)

```bash
npx ford-legacy-converter convert --path ./legacy-code
```

## Usage

### Basic Usage

Convert a codebase to TypeScript:

```bash
ford-legacy-converter convert --path ./legacy-code --target typescript
```

### Interactive Mode

If you don't specify a target language, you'll be prompted to select one:

```bash
ford-legacy-converter convert --path ./legacy-code
```

### Custom Output Directory

Specify where to save the converted code:

```bash
ford-legacy-converter convert -p ./legacy-code -t python -o ./modern-code
```

### Custom Ollama Configuration

Use a different model or Ollama URL:

```bash
ford-legacy-converter convert -p ./legacy-code -t go --model llama3 --ollama-url http://localhost:11434
```

### Command Options

| Flag           | Short | Description                                                                         | Required |
| -------------- | ----- | ----------------------------------------------------------------------------------- | -------- |
| `--path`       | `-p`  | Path to the codebase to convert                                                     | Yes      |
| `--target`     | `-t`  | Target language (typescript, javascript, python, java, csharp, go, rust, php, ruby) | No       |
| `--output`     | `-o`  | Output directory (defaults to `{path}-converted`)                                   | No       |
| `--model`      |       | Ollama model name (default: `codellama`)                                            | No       |
| `--ollama-url` |       | Ollama API URL (default: `http://localhost:11434`)                                  | No       |

## Supported Languages

### Source Languages (Detected)

- **COBOL** (`.cbl`, `.cob`, `.cpy`)
- **Fortran** (`.f`, `.for`, `.f90`, `.f95`, `.f03`, `.f08`)
- **Visual Basic 6** (`.bas`, `.frm`, `.cls`, `.ctl`)
- **Java** (`.java`)
- **C/C++** (`.c`, `.cpp`, `.h`, `.hpp`)
- **C#** (`.cs`)
- **Python** (`.py`)
- **JavaScript** (`.js`, `.jsx`)
- **TypeScript** (`.ts`, `.tsx`)
- **Go** (`.go`)
- **Rust** (`.rs`)
- **PHP** (`.php`)
- **Ruby** (`.rb`)
- **Pascal** (`.pas`, `.pp`)
- **Perl** (`.pl`, `.pm`)

### Target Languages

- TypeScript
- JavaScript
- Python
- Java
- C#
- Go
- Rust
- PHP
- Ruby

## Examples

### Convert COBOL to TypeScript

```bash
ford-legacy-converter convert -p ./cobol-project -t typescript
```

### Convert Java to Python

```bash
ford-legacy-converter convert -p ./java-app -t python -o ./python-app
```

### Convert Multiple Languages to Go

```bash
ford-legacy-converter convert -p ./mixed-codebase -t go --model codellama
```

### Convert C Code to TypeScript

```bash
ford-legacy-converter convert -p ./legacy-code -t typescript -o ./converted
```

## How It Works

1. **Scanning**: Recursively scans the codebase for supported code files
2. **Detection**: Detects programming languages using file extensions and content heuristics
3. **Analysis**: Shows statistics about detected languages
4. **Selection**: Prompts for target language (if not provided)
5. **Connection**: Tests Ollama connection and model availability
6. **Conversion**: Converts each file using AI, preserving structure and logic
7. **Output**: Saves converted files maintaining directory structure

## Configuration

The tool uses sensible defaults but can be customized:

- **Max File Size**: 100KB (files larger are skipped)
- **Retry Attempts**: 3 retries for failed conversions
- **Retry Delay**: 1 second between retries
- **Ignored Patterns**: `node_modules`, `.git`, `dist`, `build`, etc.

## Troubleshooting

### Ollama Connection Failed

**Symptoms**: Error message "Cannot connect to Ollama"

**Solutions**:

1. Ensure Ollama is running:

   ```bash
   # Check if Ollama is running
   curl http://localhost:11434/api/tags

   # If not running, start it
   ollama serve
   ```

2. Check if the model is installed:

   ```bash
   ollama list

   # If model is missing, install it
   ollama pull codellama
   ```

3. Verify Ollama URL (if using custom URL):
   ```bash
   ford-legacy-converter convert -p ./code --ollama-url http://your-ollama-url:11434
   ```

### No Files Found

**Symptoms**: "No code files found in the specified path"

**Solutions**:

- Verify the path is correct (use absolute path if needed)
- Check that files have supported extensions
- Ensure files are not in ignored directories (`.git`, `node_modules`, etc.)
- Check file permissions

### Conversion Errors

**Symptoms**: Some files fail to convert

**Solutions**:

- Large files (>100KB) are skipped automatically
- Check Ollama logs for model errors
- Try a different model: `--model llama3`
- Ensure you have enough RAM for the model
- Check network connectivity if using remote Ollama

### Model Out of Memory

**Symptoms**: Ollama crashes or conversion fails with memory errors

**Solutions**:

- Use a smaller model (7B instead of 13B/34B)
- Close other applications to free RAM
- Reduce the number of concurrent conversions
- Use a model with quantization (smaller memory footprint)

### TypeScript/Node.js Errors

**Symptoms**: Build or runtime errors

**Solutions**:

- Ensure Node.js >= 18.0.0 is installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript version compatibility
- Verify all dependencies are installed

## Platform-Specific Notes

### macOS

- Ollama can be installed via Homebrew or direct download
- Node.js via Homebrew or nvm recommended
- May need to allow Ollama through firewall on first run

### Linux

- Ollama service can be run as a systemd service:
  ```bash
  # Create systemd service (optional)
  sudo systemctl enable ollama
  sudo systemctl start ollama
  ```
- Use nvm for Node.js version management
- May need to configure firewall rules for Ollama

### Windows

- Ollama installer handles service setup automatically
- Node.js installer includes npm
- Use PowerShell or Command Prompt (not Git Bash for Ollama)
- Windows Defender may need to allow Ollama

## Development

### Setup Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd ford-legacy-converter

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run in development mode
./bin/dev.js convert --path ./legacy-code
```

### Project Structure

```
ford-legacy-converter/
├── bin/                    # CLI entry points
│   ├── dev.js              # Development mode
│   └── run.js              # Production mode
├── src/
│   ├── commands/           # CLI commands
│   │   └── convert/        # Main convert command
│   ├── services/           # Core business logic
│   │   ├── code-converter.ts      # AI conversion service
│   │   ├── file-processor.ts      # File operations
│   │   └── language-detector.ts   # Language detection
│   └── utils/              # Shared utilities
│       ├── constants.ts     # Configuration
│       └── logger.ts       # Logging
├── legacy-code/            # Example legacy code
└── package.json
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## Performance Tips

1. **Use Appropriate Model Size**: Smaller models (7B) are faster but less accurate. Larger models (13B+) are more accurate but slower.

2. **Process in Batches**: For large codebases, consider converting in smaller batches.

3. **Optimize Ollama**:

   - Use GPU acceleration if available
   - Allocate sufficient RAM
   - Close unnecessary applications

4. **File Size Limits**: Files larger than 100KB are automatically skipped. Consider splitting large files manually.

## Limitations

- Maximum file size: 100KB per file
- Sequential processing (one file at a time) to avoid overwhelming Ollama
- Requires local Ollama instance (no cloud API support yet)
- Conversion quality depends on the model used
- Some complex language features may not convert perfectly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Built with [oclif](https://oclif.io/)
- Powered by [Ollama](https://ollama.ai/)
- Uses [LangChain.js](https://js.langchain.com/) for AI integration
