module.exports = {
    
    require: [ "dotenv/config" ],

    spec: [
        "./test/unit/**/*.test.ts",
        "./test/integration/**/*.test.ts"
    ],


    // ignore: ["tests/import.test.js"],
    // parallel: true,
    timeout: 5000, // defaults to 2000ms; increase if needed
    checkLeaks: true
}