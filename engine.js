var inspect = require("eyes").inspector()
var filewalker = require("filewalker")
var tv4 = require("tv4")
var _ = require("underscore")
var fs = require("fs")
var path = require("path")

exports.JSONSchemaTestEngine = function() {
 this.schemas = null
 this.instances = null

 var out = function(msg, obj) {
  console.log(msg)
  if (obj) inspect(obj)
 }

 var configure = function(config) {
  this.schemas = config.schemas
  this.instances = config.instances
  out("Test engine configuration:", config)
  return this;
 }

 var addValidationResult = function(instanceFileName, schemaFileName, validationResult, engine, shouldBeValid) {
  var entry = _.find(engine.report.tests, function(entry) {
   return entry.schema == schemaFileName
  })
  var results = null
  if (entry) {
   results = entry.results
  } else {
   engine.report.tests.push({
    schema: schemaFileName,
    results: []
   })
   results = engine.report.tests[0].results
  }
  var newEntry = {
   instance: instanceFileName,
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

 var reportTest = function(root, relPath, schema, schemaFileName, engine, shouldBeValid) {
  var instanceFileName = root + relPath
  var instance = JSON.parse(fs.readFileSync(instanceFileName))
  var validationResult = tv4.validateResult(instance, schema);
  addValidationResult(instanceFileName, schemaFileName, validationResult, engine, shouldBeValid)
 }

 var emptyReport = function() {
  return {
   tests: [],
   allTestsPassed: true
  }
 }

 var run = function() {
  if (!this.schemas || !this.instances) {
   throw "Need to configure the engine before using it!, invoke configure({...}) first."
  }

  this.report = emptyReport();
  var self = this

  filewalker(this.schemas).on("file", function(relPath, stats, absPath) {
   var schemaFileName = self.schemas + relPath
   var schema = JSON.parse(fs.readFileSync(schemaFileName))
   var samplesRoot = self.instances + path.basename(relPath, ".json")
   var validSamples = samplesRoot + "/validSamples/"
   var invalidSamples = samplesRoot + "/invalidSamples/"
   filewalker(validSamples).on("file", function(relPath, stats, absPath) {
    reportTest(validSamples, relPath, schema, schemaFileName, self, true)
   }).on("done", function(relPath, stats, absPath) {
    filewalker(invalidSamples).on("file", function(relPath, stats, absPath) {
     reportTest(invalidSamples, relPath, schema, schemaFileName, self, false)
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
