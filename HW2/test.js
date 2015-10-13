var subject = require('./subject.js')
var mock = require('mock-fs');
subject.inc(undefined,undefined);
subject.inc(undefined,0);
subject.inc(-1,undefined);
subject.inc(1,undefined);
subject.inc(3,9);
subject.inc(1,undefined);
subject.inc(3,11);
subject.weird(8,-1,undefined,undefined);
subject.weird(6,undefined,41,"strict");
subject.weird(6,undefined,41,"notInExcluded");
subject.weird(6,undefined,43,"notInExcluded");
subject.weird(6,undefined,43,"strict");
subject.weird(8,1,41,"strict");
subject.weird(8,1,41,"notInExcluded");
subject.weird(8,1,43,"notInExcluded");
subject.weird(8,1,43,"strict");
