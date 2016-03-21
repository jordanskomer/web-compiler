// Assignment: C Minus-Minus Syntax Analysis
// Class: COSC 4503
// Professor: Dr. Baas
// Author: Jordan Skomer
// Date: 2/17/2016
exports.analyze = function(filename){
    if(filename !== 'undefined') {
        var fs = require("fs");
        var stack = [];
        var pointer = 0;
        var lineNum = 1;
        var returnString = "";
        var syntaxTable = setupSyntaxTable();
        var symbolTable = new HashTable({});
        var variableArray = ['int', 'float', 'char', 'double', 'string'];
        var errors = [];
        //Write Results to File
        var writeStream = fs.createWriteStream(filename.slice(0, filename.indexOf(".")) + ".result");
        fs.readFile(filename, 'utf8', function(err,data){
       if(err){
           return console.log(err);
       }
       var lexume = readTokFile(data);
    for(var key = 0; key < lexume.keys.length; key++){
        stack.push(lexume.keys[key]);
        pointer++;
        var next = "";
        // console.log(stack + " Pointer: " + pointer);
        //Check if EOF
        if(typeof lexume.keys[key+1] === 'undefined'){
            //End and print off errors
            writeStream.write("Compiling Complete with " + errors.length + " errors\n\nTotal Lines Compiled: "
                + lineNum +"\n-------------------------------\n");
            for(var i = 0; i < errors.length; i++){
                writeStream.write("!!! Error on line " + errors[i].line + " on symbol " + errors[i].symbol);
                for(var j = 0; j < errors[i].expected.length; j++){
                    next += errors[i].expected[j] + " ";
                }

                writeStream.write(" !!! Expected " + next + "\n   Instead found a " + errors[i].found + "\n");
                next = "";
            }
            check = true;
        }
        if(syntaxTable.hasItem(lexume.keys[key])){
            var nextArray = syntaxTable.getItem(lexume.keys[key]);
            var check = false;
            var init = false;
            //Adding Id's to Symbol Table
            if(lexume.keys[key] == "ID"){
                //Check if symbol already exists
                if(!symbolTable.hasItem(lexume.vals[key])){
                    //Add new symbol
                    if(lexume.keys[key+1] == "ASSIGNMENT"){
                        init = true;
                    }
                    //Check if symbol is a function or not
                    if(isInArray(variableArray, lexume.vals[key-1])){
                        symbolTable.setItem(lexume.vals[key], {
                            type: lexume.vals[key-1],
                            token: lexume.keys[key],
                            init: init
                        });
                    } else {
                        symbolTable.setItem(lexume.vals[key], {
                            type: "function",
                            token: lexume.keys[key],
                            init: init
                        });
                    }
                }
            }
            //Checking for new line then pop stack and record line number
            if(lexume.keys[key] == "NEWLINE"){
                for(var j = 0; j < pointer; j++){
                    stack.pop();
                }
                pointer = 0;
                lineNum++;
                // console.log("LineNum: " + lineNum);
                check = true;
            } else {
                if(isInArray(nextArray, lexume.keys[key+1])){
                    check = true;
                }
                //If next lexume does not match anything in next array ERROR
                if(!check){
                    errors.push({
                        symbol: lexume.keys[key],
                        expected: nextArray,
                        found: lexume.keys[key+1],
                        line: lineNum
                    });
                }
            }
        } else {
            console.log("SYMBOL TABLE ERROR! " + lexume.keys[key] + " not found in table");
        }

    }
}

function isInArray(array, value){
    var bool = false;
    for(var i = 0; i < array.length; i++){
        if(array[i] == value){
            bool = true;
        }
    }
    return bool;
}
//Pops Stack X amount of times
function popXStack(stack, x){
    for(var i = 0; i < x; x++){
        stack.pop();
    }
    return stack;
}
//Loads syntax table with predefine rules
function setupSyntaxTable(){
    var syntaxTable = new HashTable({});
    syntaxTable.setItem("FUNCTION", ["L_PAREN"]);
    syntaxTable.setItem("TYPE", ["ID", "ASTERISK", "FUNCTION"]);
    syntaxTable.setItem("LOOP", ["L_PAREN"]);
    syntaxTable.setItem("SWITCH", ["L_PAREN"]);
    syntaxTable.setItem("CASE", ["S_QUOTE", "D_QUOTE", "CONSTANT"]);
    syntaxTable.setItem("DEFAULT", ["COLON"]);
    syntaxTable.setItem("ID", ["L_PAREN", "ASSIGNMENT", "SEMICOLON", "R_PAREN", "COMMA", "R_ANGLE", "ASTERISK"]);
    syntaxTable.setItem("L_PAREN", ["FUNCTION", "R_PAREN", "TYPE", "CONSTANT", "ID"]);
    syntaxTable.setItem("R_PAREN", ["SEMICOLON", "L_BRACKET", "R_PAREN"]);
    syntaxTable.setItem("L_BRACKET", ["TYPE", "NEWLINE"]);
    syntaxTable.setItem("R_BRACKET", ["EOF", "NEWLINE"]);
    syntaxTable.setItem("L_ANGLE", ["ID", "L_ANGLE"]);
    syntaxTable.setItem("R_ANGLE", ["NEWLINE"]);
    syntaxTable.setItem("ASTERISK", ["ASTERISK", "ID", "ASSIGNMENT", "SEMICOLON"]);
    syntaxTable.setItem("ASSIGNMENT", ["CONSTANT"]);
    syntaxTable.setItem("CONSTANT", ["SEMICOLON", "COLON", "R_PAREN", "PLUS", "MINUS","MULTI", "DIVIDE"]);
    syntaxTable.setItem("PLUS", ["CONSTANT"]);
    syntaxTable.setItem("MINUS", ["CONSTANT"]);
    syntaxTable.setItem("MULTI", ["CONSTANT"]);
    syntaxTable.setItem("DIVIDE", ["CONSTANT"]);
    syntaxTable.setItem("OUTPUT", ["L_ANGLE"]);
    syntaxTable.setItem("INPUT", ["R_ANGLE"]);
    syntaxTable.setItem("STRING", ["D_QUOTE", "S_QUOTE"]);
    syntaxTable.setItem("D_QUOTE", ["STRING", "COLON", "SEMICOLON"]);
    syntaxTable.setItem("S_QUOTE", ["STRING", "COLON", "SEMICOLON"]);
    syntaxTable.setItem("SEMICOLON", ["TYPE", "ID", "FUNCTION", "LOOP", "NEWLINE"]);
    syntaxTable.setItem("COLON", ["ID", "FUNCTION", "NEWLINE"]);
    syntaxTable.setItem("COMMA", ["TYPE"]);
    syntaxTable.setItem("POUND", ["INCLUDE"]);
    syntaxTable.setItem("INCLUDE", ["L_ANGLE", "ID"]);
    syntaxTable.setItem("USING", ["NAMESPACE"]);
    syntaxTable.setItem("NAMESPACE", ["ID"]);
    syntaxTable.setItem("RETURN", ["CONSTANT", "ID", "SEMICOLON"]);
    syntaxTable.setItem("BREAK", ["SEMICOLON"]);
    syntaxTable.setItem("NEWLINE", [""]);
    return syntaxTable;
}
//Reads Values and Keys out from .tok file created by lexical analysis
function readTokFile(data){
    var aKeys = [];
    var aVals = [];
    var first = true;
    var word = "";
    //Load all KEYS & VALUES into Arrays
    for(var i = 0; i< data.length; i++){
        if(data[i] !== " " && data[i] !== '\n' && data[i] !== '\r' && data[i] !== '\t') {
            word += data[i];
        }
        if(data[i+1] == " " || data[i+1] == '\n'){
            if(first){
                aKeys.push(word);
                first = false;
            } else {
                aVals.push(word);
                first = true;
            }
            word = "";
        }
    }
    return {keys: aKeys, vals: aVals};
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