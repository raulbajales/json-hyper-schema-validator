var engine = require("../engine.js").TesterEngine

engine.configure({
	hyperSchemas: "./hyper-schemas/",
	apiCalls: "./api-calls/"
}).run()
