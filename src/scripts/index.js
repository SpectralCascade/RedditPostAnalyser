#!/usr/bin/env node

const processor = require("./process_json");
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const fs = require('fs');
const path = require('path');

var outputData = [];
var outputDir = "";
var urls = []

function receiveJSON(data) {
    // Process data
    processed = processor.process_raw(data);
    if (processed != null) {
        outputData.push(processed);
    } else {
        console.log("Failed to retrieve JSON data.");
        outputData.push(null);
    }
}

function saveOutputData() {
    // Save output JSON to file(s)
    for (i = 0; i < outputData.length; i++) {
        if (outputData[i] == null) {
            // If outputData is invalid, skip
            continue;
        }
        var out = urls[i].split("/");
        var fpath = path.join(outputDir, (urls[i][urls[i].length - 1] === '/' ? out[out.length - 2] : out[out.length - 1]) + ".json");
        fs.writeFileSync(fpath, outputData[i]);
        
        console.log("Saved processed JSON file '" + fpath + "'.");
    }
}

if (process.argv.length > 2) {
    var nextArgIsDirectory = false;
    
    for (i = 2; i < process.argv.length; i++) {
        if (process.argv[i] == "-d") {
            nextArgIsDirectory = true;
        } else if (nextArgIsDirectory) {
            outputDir = process.argv[i];
            nextArgIsDirectory = false;
        } else {
            // Load JSON from URL
            var originalLength = outputData.length;
            processor.download_raw(process.argv[i], receiveJSON);
            
            // Track successfully processed URLs
            urls.push(process.argv[i]);
            
            console.log("Downloading JSON from URL: " + process.argv[i]);
        }
    }
    
    // If no directory output specified in cmd args, ask for one.
    if (outputDir == "") {
        readline.question("Please specify a directory to export the processed JSON file(s): ", dir => {
            outputDir = dir;
            saveOutputData();
            readline.close();
            process.exit();
        });
    } else {
        saveOutputData();
        process.exit();
    }
}
else {
    console.log("No arguments provided, please specify one or more Reddit post URLs to process.");
    console.log(process.argv);
}
