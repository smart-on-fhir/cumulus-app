const bcrypt = require("bcryptjs")
const { randomBytes } = require("crypto")

const pass = randomBytes(16).toString("base64url")
const hash = bcrypt.hashSync(pass, bcrypt.genSaltSync(10))

console.log("pass: %o hash: %o", pass, hash)