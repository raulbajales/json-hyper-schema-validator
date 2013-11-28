var inspect = require("eyes").inspector()
var filewalker = require("filewalker")
var tv4 = require("tv4")
var _ = require("underscore")
var fs = require("fs")
var path = require("path")

exports.TesterEngine = function() {
 this.hyperSchemas = null
 this.apiCalls = null

 var out = function(msg, obj) {
  console.log(msg)
  if (obj) inspect(obj)
 }

 var configure = function(config) {
  this.hyperSchemas = config.hyperSchemas
  this.apiCalls = config.apiCalls
  out("Test engine configuration:", config)
  return this;
 }

 var addValidationResult = function(apiCallDescriptor, hyperSchema, validationResult, engine, shouldBeValid) {
  var entry = _.find(engine.report.tests, function(entry) {
   return entry.schema == hyperSchema
  })
  var results = null
  if (entry) {
   results = entry.results
  } else {
   engine.report.tests.push({
    schema: hyperSchema,
    results: []
   })
   results = engine.report.tests[0].results
  }
  var newEntry = {
   instance: apiCallDescriptor,
   shouldBeValid: shouldBeValid,
   passed: validationResult.valid == shouldBeValid
  }
  if (!newEntry.passed) {
   engine.report.allTestsPassed = false
   if (shouldBeValid) {
    newEntry.validationResult = validationResult
   }
  }
  results.push(newEntry)

 }

 var reportTest = function(root, relPath, hyperSchemaObj, hyperSchema, engine, shouldBeValid) {
  var apiCallDescriptor = root + relPath
  var instance = JSON.parse(fs.readFileSync(apiCallDescriptor))
  var validationResult = tv4.validateResult(instance, hyperSchemaObj);
  addValidationResult(apiCallDescriptor, hyperSchema, validationResult, engine, shouldBeValid)
 }

 var emptyReport = function() {
  return {
   tests: [],
   allTestsPassed: true
  }
 }

 var run = function() {
  if (!this.hyperSchemas || !this.apiCalls) {
   throw "Need to configure the engine before using it!, invoke configure({...}) first."
  }

  this.report = emptyReport();
  var self = this

  filewalker(this.hyperSchemas).on("file", function(relPath, stats, absPath) {
   var hyperSchema = self.hyperSchemas + relPath
   var schema = JSON.parse(fs.readFileSync(hyperSchema))
   var samplesRoot = self.apiCalls + path.basename(relPath, ".json")
   var valid = samplesRoot + "/valid/"
   var invalid = samplesRoot + "/invalid/"
   filewalker(valid).on("file", function(relPath, stats, absPath) {
    reportTest(valid, relPath, schema, hyperSchema, self, true)
   }).on("done", function(relPath, stats, absPath) {
    filewalker(invalidSamples).on("file", function(relPath, stats, absPath) {
     reportTest(invalidSamples, relPath, schema, hyperSchema, self, false)
    }).on("done", function(relPath, stats, absPath) {
     out("\nDone!\n\nReport:", self.report)
    }).walk()
   }).walk()
  }).walk()

 }

 return {
  configure: configure,
  run: run
 }
}();
