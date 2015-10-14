var esprima = require("esprima");
var options = {
    tokens: true,
    tolerant: true,
    loc: true,
    range: true
};
var faker = require("faker");
var fs = require("fs");
faker.locale = "en";
var mock = require('mock-fs');
var _ = require('underscore');
var Random = require('random-js');

function main() {
    var args = process.argv.slice(2);

    if (args.length == 0) {
        args = ["subject.js"];
    }
    var filePath = args[0];

    constraints(filePath);
    generateTestCases(filePath)
}

var engine = Random.engines.mt19937().autoSeed();

function createConcreteIntegerValue(greaterThan, constraintValue) {
    if (greaterThan)
        return Random.integer(constraintValue, constraintValue + 10)(engine);
    else
        return Random.integer(constraintValue - 10, constraintValue)(engine);
}

function Constraint(properties) {
    this.ident = properties.ident;
    this.expression = properties.expression;
    this.operator = properties.operator;
    this.value = properties.value;
    this.funcName = properties.funcName;
    // Supported kinds: "fileWithContent","fileExists"
    // integer, string, phoneNumber
    this.kind = properties.kind;
}

function fakeDemo() {
    console.log(faker.phone.phoneNumber());
    console.log(faker.phone.phoneNumberFormat());
    console.log(faker.phone.phoneFormats());
}

var functionConstraints = {}

var mockFileLibrary = {
    pathExists: {
        'path/fileExists': {}
    },
    pathExistsWithFiles: {
        'path/fileExists': {
            file1: 'test content',
        }
    },
    fileWithContent: {
        pathContent: {
            file1: 'text content',
        }
    },
    fileWithNoContent: {
        pathContent: {
            file1: '',
        }
    }
};

function generateTestCases(filePath) {

    var content = "var subject = require('./" + filePath + "')\nvar mock = require('mock-fs');\n";
    for (var funcName in functionConstraints) {
        var params = {};

        // initialize params
        for (var i = 0; i < functionConstraints[funcName].params.length; i++) {
            var paramName = functionConstraints[funcName].params[i];
            //params[paramName] = '\'' + faker.phone.phoneNumber()+'\'';
            params[paramName] = new Array();
        }

        // update parameter values based on known constraints.
        var constraints = functionConstraints[funcName].constraints;
        // Handle global constraints...
        var fileWithContent = _.some(constraints, {
            kind: 'fileWithContent'
        });
        var fileWithNoContent = _.some(constraints, {
            kind: 'fileWithNoContent'
        })
        var pathExists = _.some(constraints, {
            kind: 'fileExists'
        });
        var pathExistsWithFiles = _.some(constraints, {
            kind: 'pathExistsWithFiles'
        });


        // plug-in values for parameters
        for (var i = 0; i < constraints.length; i++) {
            var constraint = constraints[i];
            if (params.hasOwnProperty(constraint.ident)) {
                params[constraint.ident].push(constraint.value);
            }
        }

        for (var key in params) {
            if (params[key].length == 0) {
                params[key].push('""');
            }
        }

        // Prepare function arguments.
        if (funcName != 'fileTest') {
            var argsInArr = Object.keys(params).map(function(key) {
                return params[key];
            });

            var args = dotProduct.apply(this, argsInArr);
            for (var i = 0; i < args.length; ++i) {
                content += "subject.{0}({1});\n".format(funcName, args[i]);
            }
        } else {
            if (pathExists || pathExistsWithFiles || fileWithContent || fileWithNoContent) {
                for (var i = 0; i < constraints.length; i++) {
                    var constraint = constraints[i];
                    if (params.hasOwnProperty(constraint.ident)) {
                        params[constraint.ident] = constraint.value;
                    }
                }
                var argsInArr = Object.keys(params).map(function(key) {
                    return params[key];
                });

                content += generateMockFsTestCases(pathExists, pathExistsWithFiles, fileWithContent, fileWithNoContent, funcName, argsInArr);
                content += generateMockFsTestCases(pathExists, pathExistsWithFiles, fileWithContent, !fileWithNoContent, funcName, argsInArr);
                content += generateMockFsTestCases(pathExists, pathExistsWithFiles, !fileWithContent, fileWithNoContent, funcName, argsInArr);
                content += generateMockFsTestCases(pathExists, pathExistsWithFiles, !fileWithContent, !fileWithNoContent, funcName, argsInArr);
                content += generateMockFsTestCases(pathExists, !pathExistsWithFiles, fileWithContent, fileWithNoContent, funcName, argsInArr);
                content += generateMockFsTestCases(pathExists, !pathExistsWithFiles, fileWithContent, !fileWithNoContent, funcName, argsInArr);
                content += generateMockFsTestCases(pathExists, !pathExistsWithFiles, !fileWithContent, fileWithNoContent, funcName, argsInArr);
                content += generateMockFsTestCases(pathExists, !pathExistsWithFiles, !fileWithContent, !fileWithNoContent, funcName, argsInArr);
                content += generateMockFsTestCases(!pathExists, pathExistsWithFiles, fileWithContent, fileWithNoContent, funcName, argsInArr);
                content += generateMockFsTestCases(!pathExists, pathExistsWithFiles, fileWithContent, !fileWithNoContent, funcName, argsInArr);
                content += generateMockFsTestCases(!pathExists, pathExistsWithFiles, !fileWithContent, fileWithNoContent, funcName, argsInArr);
                content += generateMockFsTestCases(!pathExists, pathExistsWithFiles, !fileWithContent, !fileWithNoContent, funcName, argsInArr);
                content += generateMockFsTestCases(!pathExists, !pathExistsWithFiles, fileWithContent, fileWithNoContent, funcName, argsInArr);
                content += generateMockFsTestCases(!pathExists, !pathExistsWithFiles, fileWithContent, !fileWithNoContent, funcName, argsInArr);
                content += generateMockFsTestCases(!pathExists, !pathExistsWithFiles, !fileWithContent, fileWithNoContent, funcName, argsInArr);
                content += generateMockFsTestCases(!pathExists, !pathExistsWithFiles, !fileWithContent, !fileWithNoContent, funcName, argsInArr);
            }
        }
    }

    fs.writeFileSync('test.js', content, "utf8");
}

function dotProduct() {
    return _.reduce(arguments, function(a, b) {
        return _.flatten(_.map(a, function(x) {
            return _.map(b, function(y) {
                return x.concat([y]);
            });
        }), true);
    }, [
        []
    ]);
};

function generateMockFsTestCases(pathExists, pathExistsWithFiles, fileWithContent, fileWitNoContent, funcName, args) {
    var testCase = "";
    // Build mock file system based on constraints.
    var mergedFS = {};
    if (pathExists) {
        for (var attrname in mockFileLibrary.pathExists) {
            mergedFS[attrname] = mockFileLibrary.pathExists[attrname];
        }
    }
    if (pathExistsWithFiles) {
        for (var attrname in mockFileLibrary.pathExistsWithFiles) {
            mergedFS[attrname] = mockFileLibrary.pathExistsWithFiles[attrname];
        }
    }
    if (fileWithContent) {
        for (var attrname in mockFileLibrary.fileWithContent) {
            mergedFS[attrname] = mockFileLibrary.fileWithContent[attrname];
        }
    }
    if (fileWitNoContent) {
        for (var attrname in mockFileLibrary.fileWithNoContent) {
            mergedFS[attrname] = mockFileLibrary.fileWithNoContent[attrname];
        }
    }

    testCase +=
        "mock(" +
        JSON.stringify(mergedFS) +
        ");\n";

    testCase += "\tsubject.{0}({1});\n".format(funcName, args);
    testCase += "mock.restore();\n";
    return testCase;
}

function constraints(filePath) {
    var buf = fs.readFileSync(filePath, "utf8");
    var result = esprima.parse(buf, options);
    traverse(result, function(node) {
        if (node.type === 'FunctionDeclaration') {
            var funcName = functionName(node);

            var params = node.params.map(function(p) {
                return p.name
            });

            functionConstraints[funcName] = {
                constraints: [],
                params: params
            };

            // Check for expressions using argument.
            traverse(node, function(child) {
               if (child.type === 'BinaryExpression') {
                if (child.operator == '==' || child.operator == '<' || child.operator == '>') {
                    if (child.left.type == 'Identifier' && params.indexOf(child.left.name) > -1) {
                                // get expression from original source code:
                                var expression = buf.substring(child.range[0], child.range[1]);
                                var rightHand = buf.substring(child.right.range[0], child.right.range[1])

                                var b1 = 'undefined';
                                var b2 = 'undefined';
                                if (typeof child.right.value == 'number') {
                                    if (child.operator == '==') {
                                        b1 = rightHand;
                                        b2 = rightHand - 1;
                                    } else if (child.operator == '<') {
                                        b1 = rightHand - 1;
                                        b2 = rightHand;
                                    } else {
                                        b1 = rightHand + 1;
                                        b2 = rightHand;
                                    }
                                } else if (typeof child.right.value == 'undefined') {
                                    b1 = rightHand;
                                    b2 = 2;
                                } else if (typeof child.right.value == 'string') {
                                    if (child.operator == '==') {
                                        b1 = rightHand;
                                        b2 = '"' + child.right.value + 1 + '"';
                                    } else if (child.operator == '<') {
                                        b1 = '"' + 'a' + child.right.value + '"';
                                        b2 = rightHand;
                                    } else {
                                        b1 = '"' + child.right.value + 'z' + '"';
                                        b2 = rightHand;
                                    }
                                }
                                functionConstraints[funcName].constraints.push(
                                    new Constraint({
                                        ident: child.left.name,
                                        value: b1,
                                        funcName: funcName,
                                        kind: "integer",
                                        operator: child.operator,
                                        expression: expression
                                    }));

                                functionConstraints[funcName].constraints.push(
                                    new Constraint({
                                        ident: child.left.name,
                                        value: b2,
                                        funcName: funcName,
                                        kind: "integer",
                                        operator: child.operator,
                                        expression: expression
                                    }));
                            }
                        }

                        if (funcName == 'blackListNumber') {
                            var areaCode = parseInt(child.right.value);
                            var b1 = '"' + areaCode + '111111' + '"';
                            var b2 = '"' + (areaCode + 1) + '111111' + '"';
                            functionConstraints[funcName].constraints.push(
                                new Constraint({
                                    ident: params[0],
                                    value: b1,
                                    funcName: funcName,
                                    kind: "integer",
                                    operator: child.operator,
                                    expression: expression
                                }));

                            functionConstraints[funcName].constraints.push(
                                new Constraint({
                                    ident: params[0],
                                    value: b2,
                                    funcName: funcName,
                                    kind: "integer",
                                    operator: child.operator,
                                    expression: expression
                                }));
                        }

                        if (child.left &&
                            child.left.type == "CallExpression" &&
                            child.left.callee &&
                            child.left.callee.property &&
                            child.left.callee.property.name == "indexOf" &&
                            params.indexOf(child.left.callee.object.name) > -1)

                        {
                            var comparedWithStr = child.left.arguments[0].value;
                            var indexPos = child.right.value;
                            var randStr = "some_random_test"; //TODO handle string expansion
                            var prefix = (indexPos == 0) ? '' : randStr.substring(0, indexPos);

                            var b1 = '"' + prefix + comparedWithStr + '"';
                            var b2 = '"' + randStr + '"';
                            functionConstraints[funcName].constraints.push(
                                new Constraint({
                                    ident: child.left.callee.object.name,
                                    value: b1,
                                    funcName: funcName,
                                    kind: "integer",
                                    operator: child.operator,
                                    expression: expression
                                }));

                            functionConstraints[funcName].constraints.push(
                                new Constraint({
                                    ident: child.left.callee.object.name,
                                    value: b2,
                                    funcName: funcName,
                                    kind: "integer",
                                    operator: child.operator,
                                    expression: expression
                                }));
                        }
                    }
                    if (child.type == 'UnaryExpression' && child.argument && child.argument.type == 'MemberExpression' && child.argument.property && params.indexOf(child.argument.object.name) > -1) {
                        var expression = buf.substring(child.range[0], child.range[1]);

                        var b1 = {};
                        b1[child.argument.property.name] = true;
                        var b2 = {};
                        b2[child.argument.property.name] = false;
                        functionConstraints[funcName].constraints.push(
                            new Constraint({
                                ident: child.argument.object.name,
                                value: JSON.stringify(b1),
                                funcName: funcName,
                                kind: "integer",
                                operator: child.operator,
                                expression: expression
                            }));

                        functionConstraints[funcName].constraints.push(
                            new Constraint({
                                ident: child.argument.object.name,
                                value: JSON.stringify(b2),
                                funcName: funcName,
                                kind: "integer",
                                operator: child.operator,
                                expression: expression
                            }));
                    }

                    if (child.type == "CallExpression" &&
                        child.callee.property &&
                        child.callee.property.name == "readFileSync") {
                        for (var p = 0; p < params.length; p++) {
                            if (child.arguments[0].name == params[p]) {
                                functionConstraints[funcName].constraints.push(
                                    new Constraint({
                                        ident: params[p],
                                        value: "'pathContent/file1'",
                                        funcName: funcName,
                                        kind: "fileWithContent",
                                        operator: child.operator,
                                        expression: expression
                                    }));

                                functionConstraints[funcName].constraints.push(
                                    new Constraint({
                                        ident: params[p],
                                        value: "'pathContent/file1'",
                                        funcName: funcName,
                                        kind: "fileWithNoContent",
                                        operator: child.operator,
                                        expression: expression
                                    }));
                            }
                        }
                    }

                    if (child.type == "CallExpression" &&
                        child.callee.property &&
                        child.callee.property.name == "readdirSync") {
                        for (var p = 0; p < params.length; p++) {
                            if (child.arguments[0].name == params[p]) {
                                functionConstraints[funcName].constraints.push(
                                    new Constraint({
                                        ident: params[p],
                                        value: "'path/fileExists'",
                                        funcName: funcName,
                                        kind: "pathExistsWithFiles",
                                        operator: child.operator,
                                        expression: expression
                                    }));
                            }
                        }
                    }

                    if (child.type == "CallExpression" &&
                        child.callee.property &&
                        child.callee.property.name == "existsSync") {
                        for (var p = 0; p < params.length; p++) {
                            if (child.arguments[0].name == params[p]) {
                                functionConstraints[funcName].constraints.push(
                                    new Constraint({
                                        ident: params[p],
                                            // A fake path to a file
                                            value: "'path/fileExists'",
                                            funcName: funcName,
                                            kind: "fileExists",
                                            operator: child.operator,
                                            expression: expression
                                        }));
                            }
                        }
                    }
                    }); //end traverse
}
});
}

function traverse(object, visitor) {
    var key, child;

    visitor.call(null, object);
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

function traverseWithCancel(object, visitor) {
    var key, child;

    if (visitor.call(null, object)) {
        for (key in object) {
            if (object.hasOwnProperty(key)) {
                child = object[key];
                if (typeof child === 'object' && child !== null) {
                    traverseWithCancel(child, visitor);
                }
            }
        }
    }
}

function functionName(node) {
    if (node.id) {
        return node.id.name;
    }
    return "";
}


if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

main();