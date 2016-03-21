// Assignment: C Minus-Minus Tokenizer
// Class: COSC 4503
// Professor: Dr. Baas
// Author: Jordan Skomer
// Date: 1/24/2015

//Check that file arg is provided
if(typeof process.argv[2] !== 'undefined') {
    lexicalAnaylsis();
} else {
    console.log("Error! File not specified. Run with node program1_jjs.js file.name");
}
//FUNCTIONS
function lexicalAnaylsis(){
    var lexicon = new HashTable({});
    lexicon.setItem("include", "INCLUDE");
    lexicon.setItem("namespace", "NAMESPACE");
    lexicon.setItem("using", "USING");
    lexicon.setItem("iostream", "ID");
    lexicon.setItem("char", "TYPE");
    lexicon.setItem("int", "TYPE");
    lexicon.setItem("void", "TYPE");
    lexicon.setItem("float", "TYPE");
    lexicon.setItem("std", "ID");
    lexicon.setItem("argc", "ID");
    lexicon.setItem("argv", "ID");
    lexicon.setItem("return", "RETURN")
    lexicon.setItem("<", "L_ANGLE");
    lexicon.setItem(">", "R_ANGLE");
    lexicon.setItem("+", "PLUS");
    lexicon.setItem("-", "MINUS");
    lexicon.setItem("*", "MULTI");
    lexicon.setItem("/", "DIVIDE");
    lexicon.setItem(";", "SEMICOLON");
    lexicon.setItem("=", "ASSIGNMENT");
    lexicon.setItem("==", "EQUALS");
    lexicon.setItem(",", "COMMA");
    lexicon.setItem("(", "L_PAREN");
    lexicon.setItem(")", "R_PAREN");
    lexicon.setItem("{", "L_BRACKET");
    lexicon.setItem("}", "R_BRACKET");
    lexicon.setItem("*", "ASTERISK");
    lexicon.setItem(":", "COLON");
    lexicon.setItem("\"", "D_QUOTE");
    lexicon.setItem("'", "S_QUOTE");
    lexicon.setItem("EOF", "CONSTANT");
    lexicon.setItem("eof", "EOF");
    lexicon.setItem("cout", "OUTPUT");
    lexicon.setItem("cin", "INPUT");
    lexicon.setItem("break", "BREAK");
    lexicon.setItem("switch", "SWITCH");
    lexicon.setItem("default", "DEFAULT");
    lexicon.setItem("while", "LOOP");
    lexicon.setItem("for", "LOOP");
    lexicon.setItem("case", "CASE");
    var symbolTable = new HashTable({});
    var fs = require("fs");
    var writeStream = fs.createWriteStream(process.argv[2].slice(0, process.argv[2].indexOf(".")) + ".tok");
    fs.readFile(process.argv[2], 'utf8', function(err,data){
       if(err){
           return console.log(err);
       }
        var word = "";
        var lineNum = 0;
        var variables = [];
        var constant = 0;
        var f_symbol = false;
        var variable = 1;
        var casevar = 0;
        var quote = 0;
        var check = 0;
        var test = {};
        for(var i = 0; i < data.length; i++){
            //Make sure word isn't a empty space, new line, tab, or carriage return
            if(data[i] !== " " && data[i] !== '\n' && data[i] !== '\r' && data[i] !== '\t') {
                word += data[i];
            }

            if(lexicon.hasItem(word)){
                var lexItem = lexicon.getItem(word);
                switch (lexItem){
                    case "ASSIGNMENT":
                        constant = 1;
                        break;
                    case "TYPE":
                        test.type = word;
                        f_symbol = true;
                        variable = 1;
                        break;
                    case "D_QUOTE":
                        quote = 1;
                        break;
                    case "S_QUOTE":
                        quote = 1;
                        break;
                    case "SEMICOLON":
                        f_symbol = false;
                        break;
                }
                if(lexItem == "ID" && /[a-zA-Z]/.test(data[i+1])){
                    check = 1;
                }
                if(check == 0){
                    if(word !== ""){
                        writeStream.write(lexItem + " " + word + "\n");
                        word = "";
                    }
                } else {
                    check = 0;
                }
                if(f_symbol && lexItem == "ASSIGNMENT"){
                    test.assign = true;
                }
            } else {
                if(word !== ""){
                    //Find Variables
                    if (isNaN(word) && (data[i + 1] == "=" || data[i + 1] == ")" || data[i + 1] == "," || data[i + 1] == "(")) {
                        lexicon.setItem(word, "ID");
                        // variables.push(word);
                        // if(f_symbol){
                        //     test.id = word;
                        // }
                        writeStream.write("ID " + word + "\n");
                        variable = 0;
                        word = "";
                    }
                    //Find Constants
                    if (constant == 1 && data[i + 1] == ";") {
                        // if(f_symbol){
                        //     test.value = word;
                        // }
                        writeStream.write("CONSTANT " + word + "\n");
                        // constant = 0;
                        word = "";
                    }
                    //Case Statements
                    if (casevar == 1 && data[i + 1] == ":") {
                        writeStream.write("CONSTANT " + word + "\n");
                        casevar = 0;
                        word = "";
                    }
                    //Strings
                    if(quote == 1 && (data[i+1] == "\"" || data[i+1] == "'")){
                        writeStream.write("STRING " + word + "\n");
                        quote = 0;
                        word = "";
                    }
                    //Numbers
                    if(word.length >= 1 && !isNaN(word) && isNaN(data[i+1])){
                        writeStream.write("CONSTANT " + word + "\n");

                        word = "";
                    }
                    //Error Check
                    if (word.length >= 1 && data[i] == " ") {
                        console.log("Error! Word %s is not in lexicon", word);
                        word = "";
                    }
                }
            }
            if(data[i] == '\n'){
                writeStream.write("NEWLINE ~\n");
            }
        }
    });
}
function HashTable(obj)
{
    this.length = 0;
    this.items = {};
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            this.items[p] = obj[p];
            this.length++;
        }
    }

    this.setItem = function(key, value)
    {
        var previous = undefined;
        if (this.hasItem(key)) {
            previous = this.items[key];
        }
        else {
            this.length++;
        }
        this.items[key] = value;
        return previous;
    }

    this.getItem = function(key) {
        return this.hasItem(key) ? this.items[key] : undefined;
    }

    this.hasItem = function(key)
    {
        return this.items.hasOwnProperty(key);
    }

    this.removeItem = function(key)
    {
        if (this.hasItem(key)) {
            previous = this.items[key];
            this.length--;
            delete this.items[key];
            return previous;
        }
        else {
            return undefined;
        }
    }
    this.clear = function()
    {
        this.items = {}
        this.length = 0;
    }
}