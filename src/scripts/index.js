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
var urls = [];
var posts_completed = 0;
var post_requests = [];

function receiveJSON(data) {
    if (data == null) {
        console.log("Fatal error receiving post data!");
        process.exit();
    }
    // Process data
    processor.process_raw(data, function(stage, processed) {
        console.log("Processor completed stage: " + stage);
        if (stage === "FINISHED") {
            outputData.push(processed);
            console.log("Finished processing.");
            posts_completed++;
        } else if (stage === "ERROR") {
            console.log("Failed to retrieve JSON data.");
            outputData.push(null);
            posts_completed++;
        }
        
        // When all requests are complete
        if (posts_completed >= post_requests.length) { 
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
    });
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
            post_requests.push(processor.download_raw(process.argv[i], receiveJSON));
            
            // Track successfully processed URLs
            urls.push(process.argv[i]);
            
            console.log("Downloading JSON from URL: " + process.argv[i]);
        }
    }
}
else {
    console.log("No arguments provided, please specify one or more Reddit post URLs to process.");
    console.log(process.argv);
}
