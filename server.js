var path = require('path');
var express = require('express');

var server = express();
server.use(express.static(path.join(__dirname, 'dist')));
server.use(require('connect-livereload')({
  port: 35729
}));

server.listen(9000, function() {
  console.log('Server is listening on 9000');
});