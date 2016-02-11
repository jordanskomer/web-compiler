var express = require('express');
var Lex = require('./lex.js');
var app = express();

app.get('/', function (req, res) {
  var test = Lex.analyze("program1.cmm");
  res.send(test);
});

app.listen(50005, function () {
  console.log('Server listening on port 50005');
});