const fs = require("node:fs");
const path = require("node:path");
const Mocha = require("mocha");

require("dotenv/config");
require("ts-node/register");

const TEST_ROOT = path.resolve(__dirname);
const TEST_PATTERNS = [
  path.join(TEST_ROOT, "unit"),
  path.join(TEST_ROOT, "integration")
];

function collectTestFiles(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collectTestFiles(fullPath, out);
      continue;
    }

    if (entry.isFile() && fullPath.endsWith(".test.ts")) {
      out.push(fullPath);
    }
  }

  return out;
}

const testFiles = TEST_PATTERNS
  .filter((dir) => fs.existsSync(dir))
  .flatMap((dir) => collectTestFiles(dir))
  .sort();

const mocha = new Mocha({
  allowUncaught: true,
  color: true,
  inlineDiffs: true,
  fullTrace: false,
  timeout: 30000,
  checkLeaks: true,
  exit: false
});

for (const file of testFiles) {
  mocha.addFile(file);
}

mocha.loadFiles();

mocha.run((failures) => {
  process.exitCode = failures ? 1 : 0;
});
