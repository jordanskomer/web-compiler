//Used for reading in cmm file and writing to file
if(typeof process.argv[2] !== 'undefined'){
    var symbolHash = new HashTable({});
    var symbols = [];
    var fs = require("fs");
    var writeStream = fs.createWriteStream(process.argv[2].slice(0, process.argv[2].indexOf(".")) + ".asm");
    var lineReader = require('readline').createInterface({
        input: fs.createReadStream(process.argv[2])
    });

    lineReader.on('line', function(line){
        var symbol = lexicalAnalysis(line);
        if(symbol){
            symbols.push(symbol);
        }
    });
    lineReader.on('close', function(){
        var count = 0;
        var declare = true;
        for(var i = 0; i < symbols.length; i++){
            switch(symbols[i][0]){
                //comments
                case 0:
                    writeStream.write("# " + symbols[i][1][1] + "\n");
                    // console.log("Comment: " + symbols[i][1][1] + "\n");
                    break;
                //Declaration
                case 1:
                    if(declare){
                        writeStream.write("     .data" + "\n");
                        declare = false;
                    }
                    symbolHash.setItem(symbols[i][1][2], count);
                    count++;
                    writeStream.write("# " + symbols[i][1][0] + "\n");
                    writeStream.write(symbols[i][1][2] + ":    .word " + symbols[i][1][3] + "\n");
                    // console.log("Declaration: " + "type-" + symbols[i][1][1] + " name-" + symbols[i][1][2] + " value-" + symbols[i][1][3]);
                    break;
                //Cout
                case 2:
                    writeStream.write("# " + symbols[i][1][0] + "\n" );
                    writeStream.write("      lw   $a0, 0($t" + symbolHash.getItem(symbols[i][1][1]) + ")\n");
                    writeStream.write("      li   $v0, 1" + "\n");
                    writeStream.write("      syscall" + "\n");
                    // console.log("Cout: " + "name-" + symbols[i][1][1]);
                    break;
                //Return
                case 3:
                    writeStream.write("# " + symbols[i][1][0] + "\n");
                    writeStream.write("      li   $v0, 10" + "\n");
                    writeStream.write("      syscall" + "\n");
                    // console.log("Return: " + "value-" + symbols[i][1][1]);
                    break;
                //Assignment
                case 4:
                    if(!declare){
                        writeStream.write("      .text" + "\n");
                        declare = true;
                    }
                    writeStream.write("# " + symbols[i][1][0] + "\n");
                    writeStream.write("      la   $t" + symbolHash.getItem(symbols[i][1][1]) + ", " + symbols[i][1][1] + "\n");
                    writeStream.write("      li   $t8, " + symbols[i][1][2] + "\n");
                    writeStream.write("      sw   $t8, 0($t" + symbolHash.getItem(symbols[i][1][1]) + ")\n");
                    // console.log("Assignment: " + "name-" + symbols[i][1][1] + " value-" + symbols[i][1][2]);
                    break;
            }
        }
        console.log("Compile complete.");
    });

} else {
    console.log("Missing Command Arguments | node basic.js \"\\path\\to\\file.cmm\"");
}




function lexicalAnalysis(data){
    var aRegex = [/\/\/(.+)/,/(\w{3,6}) (\w+) = (\w+);/,/cout << (.+);/,/return (.+);/,/(\w+) = (\w+);/];
    for(var i = 0; i < aRegex.length; i++){
        if(aRegex[i].test(data)){
            aRegex[i].lastIndex = 0;
            var token = data.match(aRegex[i]);
            return [i,data.match(aRegex[i])];
        }
    }

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

