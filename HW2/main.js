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
var engine = Random.engines.mt19937().autoSeed();

var functionConstraints = {};

// var mockFileLibrary = {
//     pathExists: {
//         'path/fileExists': {}
//     },
//     fileWithContent: {
//         pathContent: {
//             file1: 'text content',
//         }
//     }
// };

function main() {
    var args = process.argv.slice(2);
    if (args.length == 0) {
        args = ["subject.js"];
    }
    var filePath = args[0];

    constraints(filePath);
    generateTestCases()
}

function constraints(filePath) {
    var buf = fs.readFileSync(filePath, "utf8");
    var result = esprima.parse(buf, options).body;

    for (f = 0; f < result.length; ++f) {
        child = result[f];
        if (typeof child === 'object' && child !== null && child['type'] === 'FunctionDeclaration') {
            var funcName = functionName(child);
            var params = child.params.map(function(p) {
                return p.name
            });

            functionConstraints[funcName] = {
                params: params,
                constraints: []
            };

            var rootConstraints = createRootConstraints(params);
            traverse(child.body, funcName, params, true, rootConstraints, blockVisitor);
        }
    }
}

var blockVisitor = function(statement, funcName, params, isFunctionParent, parentConstraints) {
            // functionConstraints[funcName].constraints.push(parentConstraints);
            console.log(statement.type);
            if (statement.type === 'IfStatement') {
                var cs = getConstraintsFromIfStatement(statement.test, params, parentConstraints);

                if (statement.consequent.type === 'BlockStatement') {
                    for (var i = 1; i < cs.length; ++ i) {
                        traverse(statement.consequent, funcName, params, false, cs[i], blockVisitor);
                    }
                } else {
                    functionConstraints[funcName].constraints.push(cs[1]);
                }

                if (statement.alternate != null && statement.alternate.type === 'BlockStatement') {
                    traverse(statement.alternate, funcName, params, false, cs[0], blockVisitor);
                } else {
                    functionConstraints[funcName].constraints.push(cs[0]);
                }
            } else {
                if (!isFunctionParent) {
                    functionConstraints[funcName].constraints.push(parentConstraints);
                }
            }
        };

function getConstraintsFromIfStatement(test, params, constraints) {
    if (test.type === 'BinaryExpression') {
        return getConstraintsFromBinaryExpression(test, params, constraints);
    }
}
function getConstraintsFromBinaryExpression(test, params, constraints) {
    var c1 = JSON.parse(JSON.stringify(constraints));
    var c2 = JSON.parse(JSON.stringify(constraints));

    var isIdentInLeft;
    if (test.left.type == 'Identifier' && params.indexOf(test.left.name) > -1) {
        isIdentInLeft = true;
    } else if (test.right.type == 'Identifier' && params.indexOf(test.right.name) > -1) {
        isIdentInLeft = false;
    } else {
        return [];
    }

    var identKey = isIdentInLeft ? 'left' : 'right';
    var literalKey = isIdentInLeft ? 'right' : 'left';
    var p = test[identKey].name;

    var literal = "undefined";
    if (test[literalKey].type === "Literal") {
        literal = test[literalKey].value;
    }

    if (test.operator == '==') {
        c1[p].value = literal;
        c2[p].value = (literal == "undefined") ? 0: literal + 1;
    } else if ( (test.operator == ">" && identKey == 'left') || (test.operator == "<" && identKey == 'right') ) {
        c1[p].min = literal;
        c1[p].isMinInclusive = false;
        c2[p].max = literal;
        c2[p].isMaxInclusive = true;
    } else {
        c1[p].max = literal;
        c1[p].isMaxInclusive = false;
        c2[p].min = literal;
        c2[p].isMinInclusive = true;
    }

    var cs = [];
    cs.push(c1);
    cs.push(c2);
    return cs;
}

function Constraint(properties) {
    if (properties === null) {
        this.expression = null;
        this.operator = null;
        this.kind = null;
        this.value = null;
        this.exclude = null;
        this.min = null;
        this.max = null;
        this.isMinInclusive = false;
        this.isMaxInclusive = false;
    } else {
        this.expression = properties.expression;
        this.operator = properties.operator;
        // Supported kinds: "fileWithContent","fileExists"
        // integer, string, phoneNumber
        this.kind = properties.kind;
        this.value = properties.value;
        this.exclude = properties.exclude;
        this.min = properties.min;
        this.max = properties.max;
        this.isMinInclusive = false;
        this.isMaxInclusive = false;
    }
}

function createRootConstraints(params) {
    var initialConstraints = {};
    for (var i = 0; i < params.length; ++i) {
        var p = params[i];
        console.log(p);
        initialConstraints[params[i]] = new Constraint(null);
    }

    return initialConstraints;
}

function createConcreteIntegerValue(greaterThan, constraintValue) {
    if (greaterThan)
        return Random.integer(constraintValue, constraintValue + 10)(engine);
    else
        return Random.integer(constraintValue - 10, constraintValue)(engine);
}

function createIntegerBetween(min, max) {
    if (min == null && max == null) {
        return "undefined";
    } else if (min == null) {
        return max - 1;
    } else if (max == null) {
        return min + 1;
    } else {
        return Random.integer(min, max)(engine);
    }
}

function fakeDemo() {
    console.log(faker.phone.phoneNumber());
    console.log(faker.phone.phoneNumberFormat());
    console.log(faker.phone.phoneFormats());
}

function generateTestCases() {
    var content = "var subject = require('./subject.js')\nvar mock = require('mock-fs');\n";
    for (var funcName in functionConstraints) {
        var funcConstraints = functionConstraints[funcName];
        var params = funcConstraints['params'];
        var constraints = funcConstraints.constraints;
        for (var i = 0; i < constraints.length; ++i) {
            var args = [];
            for (var j = 0; j < params.length; ++j) {
                var param = params[j];
                // console.log('\n');
                // console.log(constraints[i][j]);
                // console.log('\n');
                var paramConstraint = constraints[i][param];
                var val = "undefined";
                if (paramConstraint.value != null) {
                    val = paramConstraint.value;
                } else {
                    val = createIntegerBetween(paramConstraint.min, paramConstraint.max);
                }
                
                args.push(val);
            }
            console.log(args);
            content += "subject.{0}({1});\n".format(funcName, args.join(","));
        }

        // // initialize params
        // for (var i = 0; i < functionConstraints[funcName].params.length; i++) {
        //     var paramName = functionConstraints[funcName].params[i];
        //     //params[paramName] = '\'' + faker.phone.phoneNumber()+'\'';
        //     params[paramName] = '\'\'';
        // }

        //console.log( params );

        // update parameter values based on known constraints.
        // Handle global constraints...
        // var fileWithContent = _.some(constraints, {
        //     kind: 'fileWithContent'
        // });
        // var pathExists = _.some(constraints, {
        //     kind: 'fileExists'
        // });

        // plug-in values for parameters
        // for (var c = 0; c < constraints.length; c++) {
        //     var constraint = constraints[c];
        //     if (params.hasOwnProperty(constraint.ident)) {
        //         params[constraint.ident] = constraint.value;
        //     }
        // }

        // Prepare function arguments.
        // var args = Object.keys(params).map(function(k) {
        //     return params[k];
        // }).join(",");

        // if (pathExists || fileWithContent) {
        //     content += generateMockFsTestCases(pathExists, fileWithContent, funcName, args);
        //     // Bonus...generate constraint variations test cases....
        //     content += generateMockFsTestCases(!pathExists, fileWithContent, funcName, args);
        //     content += generateMockFsTestCases(pathExists, !fileWithContent, funcName, args);
        //     content += generateMockFsTestCases(!pathExists, !fileWithContent, funcName, args);
        // } else {
            // Emit simple test case.
        // }

    }
    fs.writeFileSync('test.js', content, "utf8");
}

function generateMockFsTestCases(pathExists, fileWithContent, funcName, args) {
    var testCase = "";
    // Build mock file system based on constraints.
    var mergedFS = {};
    if (pathExists) {
        for (var attrname in mockFileLibrary.pathExists) {
            mergedFS[attrname] = mockFileLibrary.pathExists[attrname];
        }
    }
    if (fileWithContent) {
        for (var attrname in mockFileLibrary.fileWithContent) {
            mergedFS[attrname] = mockFileLibrary.fileWithContent[attrname];
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

function traverse(blockStatementObj, funcName, params, isFunctionParent, rootConstraints, visitor) {
    var blockStatementObjBody = blockStatementObj.body;
    for (var i = 0; i < blockStatementObjBody.length; ++i) {
        visitor.call(null, blockStatementObjBody[i], funcName, params, isFunctionParent, rootConstraints);
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