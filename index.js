var express = require('express');
var bodyParser = require('body-parser');
var Lex = require('./lex.js');
var Syntax = require('./syntaxanalysis.js');
var app = express();

//Setup Jade
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bodyParser());

app.get('/', function (req, res) {
  // var test = Lex.analyze("program1.cmm");
  res.render('index', {title: 'Syntax Analyzer'});
});

app.post('/upload', function(req, res){
    var fs = require('fs');
    var filename = req.body.fileName;
    // res.render('index', {title: filename});
    Lex.analyze(filename, function(){
      Syntax.analyze(filename.slice(0, filename.indexOf(".")) + ".tok", function(err, ret){
        res.render('index', {title: "File Analysis of File \"" + filename + "\" Complete ", error: "nonee"});
      });
    });


})

app.listen(50005, function () {
  console.log('Server listening on port 50005');
});