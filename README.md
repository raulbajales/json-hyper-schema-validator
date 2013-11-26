# Test runner

This tool validates that a given JSON instance should be VALID (or INVALID) when validated against a JSON Schema (v4 spec, using [tv4](https://github.com/geraintluff/tv4)).

### To add tests to the suite:

You should check the folders organization:

```javascript
{moduleName}
    /{schemaForResourceOrAPIMethod1.json}
    /{schemaForResourceOrAPIMethod2.json}
    /{schemaForResourceOrAPIMethodN.json}
samples/{moduleName}
    /{resourceOrAPIMethod1}
        /validSamples
            /{validSample1.json}
            /{validSampleN.json}
        /invalidSamples
            /{invalidSample1.json}
            /{invalidSampleN.json}
    /{resourceOrAPIMethod2}
        /validSamples
            /{validSample1.json}
            /{validSampleN.json}
        /invalidSamples
            /{invalidSample1.json}
            /{invalidSampleN.json}
    /{resourceOrAPIMethodN}
        /validSamples
            /{validSample1.json}
            /{validSampleN.json}
        /invalidSamples
            /{invalidSample1.json}
            /{invalidSampleN.json}
```
Where:


*  {moduleName}: Is the name of our API module (like 'SingleSignOn')
*  {resourceOrAPIMethodX}: Is the name for the resource or API method (like 'session' or 'registeruserid')
*  {schemaForResourceOrAPIMethodX.json}: This is the actual JSON Schema (or JSON Hyper Schema), we will have one or mode by {moduleName}, like 'session.json' or 'registeruserid.json'.
*  {validSampleX.json}: This is a sample JSON instance expected to be VALID. There is no restrictions on the file name for this JSON.
*  {invalidSampleX.json}: This is a sample JSON instance expected to be INVALID. There is no restrictions on the file name for this JSON.

So you basically have (for each {moduleName}) a set of instances that should validate against a schema, and another set of instances that should NOT validate against the same schema.

### To run the suite:

```javascript
cd tests
npm install
node suite.js
```

Here is a sample output:

```javascript
$ node suite.js 

Running al the tests!
---------------------

Test engine configuration:
{ schemas: '../SinglesignOn/', instances: './samples/SinglesignOn/' }

Done!

Report:
{
    tests: [
        {
            schema: '../SinglesignOn/session.json',
            results: [
                {
                    instance: './samples/SinglesignOn/session/validSamples/sample1.json',
                    shouldBeValid: true,
                    passed: true
                },
                {
                    instance: './samples/SinglesignOn/session/invalidSamples/sample1.json',
                    shouldBeValid: false,
                    passed: false
                }
            ]
        }
    ],
    allTestsPassed: false
}
```
