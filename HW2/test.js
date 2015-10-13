var subject = require('./subject.js')
var mock = require('mock-fs');
subject.inc(undefined,0);
subject.inc(undefined,undefined);
subject.inc(1,undefined);
subject.inc(-1,undefined);
