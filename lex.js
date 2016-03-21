// Assignment: C Minus-Minus Tokenizer
// Class: COSC 4503
// Professor: Dr. Baas
// Author: Jordan Skomer
// Date: 1/24/2015
exports.analyze = function(filename){
    //Check that file arg is provided
    if(filename !== 'undefined') {
        var lexicon = new HashTable({});

        lexicon.setItem("include", "INCLUDE");
        lexicon.setItem("namespace", "NAMESPACE");
        lexicon.setItem("using", "USING");
        lexicon.setItem("iostream", "ID");
        lexicon.setItem("char", "TYPE");
        lexicon.setItem("int", "TYPE");
        lexicon.setItem("double", "TYPE");
        lexicon.setItem("string", "TYPE");
        lexicon.setItem("std", "ID");
        lexicon.setItem("argc", "ID");
        lexicon.setItem("argv", "ID");
        lexicon.setItem("return", "RETURN")
        lexicon.setItem("<", "L_ANGLE");
        lexicon.setItem(">", "R_ANGLE");
        lexicon.setItem("#", "POUND");
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
        lexicon.setItem("/", "F_SLASH");
        lexicon.setItem("/", "B_SLASH");
        lexicon.setItem("\"", "D_QUOTE");
        lexicon.setItem("'", "S_QUOTE");
        lexicon.setItem("EOF", "EOF");
        lexicon.setItem("eof", "EOF");
        lexicon.setItem("void", "FUNC_TYPE");
        lexicon.setItem("cout", "OUTPUT");
        lexicon.setItem("cin", "INPUT");
        lexicon.setItem("break", "BREAK");
        lexicon.setItem("switch", "SWITCH");
        lexicon.setItem("default", "DEFAULT");
        lexicon.setItem("while", "WHILE");
        lexicon.setItem("case", "CASE");
        var fs = require("fs");
        var writeStream = fs.createWriteStream(filename.slice(0, filename.indexOf(".")) + ".tok");
        fs.readFile(filename, 'utf8', function(err,data){
                if(err){
               return console.log(err);
           }
            var word = "";
            var variables = [];
            var assignment = 0;
            var type = 0;
            var l_paren = 0;
            var quote = 0;
            var check = 0;
            var f_slash = 0;
            var comment = 0;
            for(var i = 0; i < data.length; i++){
                //Make sure word isn't a empty space, new line, tab, or carriage return
                if(data[i] !== " " && data[i] !== '\n' && data[i] !== '\r' && data[i] !== '\t') {
                    word += data[i];
                }
                //console.log(word);
                //console.log("Word " + word + " | is in lex " + lexicon.hasItem(word) + " next data = " + (data[i+1] == " "));
                if(lexicon.hasItem(word)){
                    var lexItem = lexicon.getItem(word);
                    switch (lexItem){
                        case "ASSIGNMENT":
                            assignment = 1;
                            break;
                        case "TYPE":
                            type = 1;
                            break;
                        case "D_QUOTE":
                            quote = 1;
                            break;
                        case "S_QUOTE":
                            quote = 1;
                            break;
                        case "L_PAREN":
                            l_paren = 1;
                            break;
                    }
                    if(lexItem == "ID" && /[a-zA-Z]/.test(data[i+1])){
                        check = 1;
                    }
                    if(check == 0){
                        //writeOut(lexItem + " " + word);
                        writeStream.write(lexItem + " " + word + "\n");
                        word = "";
                    } else {
                        check = 0;
                    }
                } else {
                    //Find Functions
                    if (data[i + 1] == "(") {
                        //writeOut("FUNCTION " + word);
                        writeStream.write("FUNCTION " + word + "\n");
                        word = "";
                    }
                    //Find Variables
                    if (type == 1 && (data[i + 1] == "=" || data[i+1] == ";")) {
                        lexicon.setItem(word, "ID");
                        variables.push(word);
                        //writeOut("ID " + word);
                        writeStream.write("ID " + word + "\n");
                        type = 0;
                        word = "";
                    }
                    //Find Constants
                    if (type == 0 && /^[a-zA-z0-9]+$/.test(word) && (data[i + 1] == ";" || data[i+1] == ":" || data[i+1] == ")")) {
                        writeStream.write("CONSTANT " + word + "\n");
                        assignment = 0;
                        l_paren = 0;
                        word = "";
                    }
                    //Find Strings
                    if(quote == 1 && (data[i+1] == "\"" || data[i+1] == "'")){
                        writeStream.write("STRING " + word + "\n");
                        quote = 0;
                        word = "";
                    }
                    //Find Constant (numbers)
                    if(word.length >= 1 && !isNaN(word) && isNaN(data[i+1])){
                        writeStream.write("CONSTANT " + word + "\n");
                        word = "";
                    }
                    //Error Check (ignore comments)
                    if (word.length >= 1 && data[i] == " ") {
                            //console.log("Error! Word %s is not in lexicon", word);
                            word = "";
                    }
                }

         }
        });
        return "works";
    } else {
        return "dead";
        console.log("Error! File not specified. Run with node program1_jjs.js file.cmm");
    }
};
//FUNCTIONS
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