const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Caesar Cipher implementation
function caesarCipher(text, shift) {
  return text
    .split("")
    .map((char) => {
      if (/[a-z]/.test(char)) {
        return String.fromCharCode(((char.charCodeAt(0) - 97 + shift) % 26) + 97);
      } else if (/[A-Z]/.test(char)) {
        return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65);
      }
      return char;
    })
    .join("");
}

// Caesar Decipher implementation
function caesarDecipher(text, shift) {
  return caesarCipher(text, 26 - (shift % 26));
}

// Brute force Caesar cipher decoder
function bruteForceCaesar(text) {
  const results = [];
  for (let i = 0; i < 26; i++) {
    const decrypted = caesarDecipher(text, i);
    results.push({
      shift: i,
      text: decrypted,
    });
  }
  return results;
}

async function analyzeWithClaude(text) {
  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analyze this text and determine if it appears to be encrypted with a Caesar cipher. If so, suggest the most likely shift value based on English language patterns. Here is the text:\n\n${text}`,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => rl.question(prompt, resolve));

  console.log("\n=== Caesar Cipher Encrypt/Decrypt Tool ===\n");

  let running = true;
  while (running) {
    console.log("Options:");
    console.log("1. Encrypt with Caesar cipher");
    console.log("2. Decrypt with Caesar cipher (known shift)");
    console.log("3. Brute force decrypt");
    console.log("4. Analyze with Claude AI");
    console.log("5. Exit");

    const choice = await question("\nEnter your choice (1-5): ");

    switch (choice) {
      case "1": {
        const plaintext = await question("Enter text to encrypt: ");
        const shiftStr = await question("Enter shift value (0-25): ");
        const shift = parseInt(shiftStr);

        if (isNaN(shift) || shift < 0 || shift > 25) {
          console.log("\nInvalid shift value. Please use 0-25.\n");
          break;
        }

        const encrypted = caesarCipher(plaintext, shift);
        console.log(`\nEncrypted text (shift ${shift}): ${encrypted}\n`);
        break;
      }

      case "2": {
        const ciphertext = await question("Enter text to decrypt: ");
        const shiftStr = await question("Enter shift value used for encryption: ");
        const shift = parseInt(shiftStr);

        if (isNaN(shift) || shift < 0 || shift > 25) {
          console.log("\nInvalid shift value. Please use 0-25.\n");
          break;
        }

        const decrypted = caesarDecipher(ciphertext, shift);
        console.log(`\nDecrypted text: ${decrypted}\n`);
        break;
      }

      case "3": {
        const ciphertext = await question("Enter text to brute force: ");
        console.log("\nTrying all possible Caesar cipher shifts...\n");

        const results = bruteForceCaesar(ciphertext);
        results.forEach((result) => {
          console.log(`Shift ${result.shift}: ${result.text}`);
        });
        console.log("");
        break;
      }

      case "4": {
        const text = await question("Enter text to analyze: ");
        console.log("\nAnalyzing with Claude AI...\n");

        const analysis = await analyzeWithClaude(text);
        console.log(`Analysis: ${analysis}\n`);
        break;
      }

      case "5": {
        running = false;
        console.log("\nGoodbye!");
        break;
      }

      default:
        console.log("\nInvalid choice. Please select 1-5.\n");
    }
  }

  rl.close();
}

// Run the main function
main().catch(console.error);