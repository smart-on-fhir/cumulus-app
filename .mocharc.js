/**
 * @see https://github.com/mochajs/mocha/blob/master/example/config/.mocharc.js
 */
module.exports = {

    "allow-uncaught": true,

    color: true,

    "inline-diffs": true,

    "full-trace": false,

    exit: false, // could be expressed as "'no-exit': true"
    
    require: [ "dotenv/config" ],

    spec: [
        "./test/unit/**/*.test.ts",
        "./test/integration/**/*.test.ts"
    ],

    // ignore: ["tests/import.test.js"],

    // parallel: true,

    timeout: 30000, // defaults to 2000ms; increase if needed

    checkLeaks: true,

    watchFiles: [
        "./backend/**/*.ts",
        "./test/**/*.test.ts",
        "./backend/**/*.json"
    ]
}