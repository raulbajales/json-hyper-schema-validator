var engine = require("./engine.js").JSONSchemaTestEngine

console.log("")
console.log("Running al the tests!")
console.log("---------------------")
console.log("")

engine.configure({
	schemas: "../SinglesignOn/",
	instances: "./samples/SinglesignOn/"
}).run()
