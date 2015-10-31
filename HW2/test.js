var subject = require('./subject.js')
var mock = require('mock-fs');
subject.inc(-1,undefined);
subject.inc(-1,2);
subject.inc(0,undefined);
subject.inc(0,2);
subject.weird(71,-1,41,"strict");
subject.weird(71,-1,41,"strict1");
subject.weird(71,-1,41,"werw");
subject.weird(71,-1,41,"A");
subject.weird(71,-1,42,"strict");
subject.weird(71,-1,42,"strict1");
subject.weird(71,-1,42,"werw");
subject.weird(71,-1,42,"A");
subject.weird(71,0,41,"strict");
subject.weird(71,0,41,"strict1");
subject.weird(71,0,41,"werw");
subject.weird(71,0,41,"A");
subject.weird(71,0,42,"strict");
subject.weird(71,0,42,"strict1");
subject.weird(71,0,42,"werw");
subject.weird(71,0,42,"A");
subject.weird(7,-1,41,"strict");
subject.weird(7,-1,41,"strict1");
subject.weird(7,-1,41,"werw");
subject.weird(7,-1,41,"A");
subject.weird(7,-1,42,"strict");
subject.weird(7,-1,42,"strict1");
subject.weird(7,-1,42,"werw");
subject.weird(7,-1,42,"A");
subject.weird(7,0,41,"strict");
subject.weird(7,0,41,"strict1");
subject.weird(7,0,41,"werw");
subject.weird(7,0,41,"A");
subject.weird(7,0,42,"strict");
subject.weird(7,0,42,"strict1");
subject.weird(7,0,42,"werw");
subject.weird(7,0,42,"A");
mock({"path/fileExists":{"file1":"test content"},"pathContent":{"file1":""}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
mock({"path/fileExists":{"file1":"test content"},"pathContent":{"file1":"text content"}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
mock({"path/fileExists":{"file1":"test content"},"pathContent":{"file1":""}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
mock({"path/fileExists":{"file1":"test content"}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
mock({"path/fileExists":{},"pathContent":{"file1":""}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
mock({"path/fileExists":{},"pathContent":{"file1":"text content"}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
mock({"path/fileExists":{},"pathContent":{"file1":""}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
mock({"path/fileExists":{}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
mock({"path/fileExists":{"file1":"test content"},"pathContent":{"file1":""}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
mock({"path/fileExists":{"file1":"test content"},"pathContent":{"file1":"text content"}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
mock({"path/fileExists":{"file1":"test content"},"pathContent":{"file1":""}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
mock({"path/fileExists":{"file1":"test content"}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
mock({"pathContent":{"file1":""}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
mock({"pathContent":{"file1":"text content"}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
mock({"pathContent":{"file1":""}});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
mock({});
	subject.fileTest('path/fileExists','pathContent/file1');
mock.restore();
subject.normalize("");
subject.format("","",{"normalize":true});
subject.format("","",{"normalize":false});
subject.blackListNumber("212111111");
subject.blackListNumber("213111111");
