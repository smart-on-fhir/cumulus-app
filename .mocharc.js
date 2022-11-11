module.exports = {
    
    // Specify "require" for CommonJS
    // require: "ts-node/register",

    // Specify "loader" for native ESM
    // loader: "ts-node/esm",

    // extensions: ["ts"],

    // watch: true,

    "watch-files": [
        "backend/**/*.js",
        "test/**/*.js",
        // "src/isomorphic"
    ],

    "watch-ignore": [
        "node_modules",
        ".git",
        "build",
        "public",
        "src",
        ".vscode",
        "backend/postgres-data"
    ],

    spec: [
        "./test/unit/**/*.test.js",
        "./test/integration/**/*.test.js"
    ],


    // ignore: ["tests/import.test.js"],
    // parallel: true,
    timeout: 5000, // defaults to 2000ms; increase if needed
    checkLeaks: true
}