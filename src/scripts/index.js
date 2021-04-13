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
var stages_complete = 0;

function receiveJSON(data) {
    if (data == null) {
        console.log("Fatal error receiving post data!");
        process.exit();
    }
    
    // Process data
    processor.process_raw(data, function(stage, processed) {
        console.log("Processor completed stage: " + stage);
        if (stage === "ERROR") {
            console.log("Failed to retrieve JSON data.");
            outputData.push(null);
            posts_completed++;
        } else {
            processed.stages[stage] = 1;
            if ("meta" in processed.stages &&
                "comments" in processed.stages &&
                "links" in processed.stages &&
                "reposts" in processed.stages
            ) {
                // Finished!
                outputData.push(JSON.stringify(processed));
                posts_completed++;
                console.log("\nFinished processing " + posts_completed + "/" + post_requests.length + " post(s).\n");

                // Save when all posts are finished.
                if (posts_completed >= post_requests.length) {
                    saveOutputData();
                }
            }
        }
    });
}

// Save processed JSON to file(s)
function saveOutputData() {
    for (i = 0, counti = outputData.length; i < counti; i++) {
        if (outputData[i] == null) {
            // If outputData is invalid, skip
            continue;
        }
        var out = urls[i].split("/");
        var fpath = path.join(
            outputDir,
            String(i).padStart(String(counti).length, '0') + "_" +
                (urls[i][urls[i].length - 1] === '/' ? out[out.length - 2] : out[out.length - 1]) + ".json"
        );
        fs.writeFileSync(fpath, outputData[i]);
        
        console.log("Saved processed JSON file '" + fpath + "'.");
    }
}

function start_processing() {
    // Start downloading and processing posts
    for (i = 0; i < urls.length; i++) {
        console.log("Downloading JSON from URL: " + urls[i]);
        post_requests[i] = processor.download_raw(urls[i], receiveJSON);
    }
    console.log("Awaiting processing results...");
}

if (process.argv.length > 2) {
    var nextArgIsDirectory = false;
    var runTests = false;
    
    for (i = 2; i < process.argv.length; i++) {
        if (process.argv[i] == "-d") {
            nextArgIsDirectory = true;
        } else if (nextArgIsDirectory) {
            outputDir = process.argv[i];
            nextArgIsDirectory = false;
        } else if (process.argv[i] == "-t" || process.argv[i] == "--test") {
            runTests = true;
        } else {
            urls.push(process.argv[i]);
            post_requests.push(null);
        }
    }
    
    // If no directory output specified in cmd args, ask for one.
    if (runTests) {
        processor.run_unit_tests();
    } else if (outputDir == "") {
        readline.question("Please specify a directory to export the processed JSON file(s): ", dir => {
            outputDir = dir;
            readline.close();
            start_processing();
        });
    } else {
        start_processing();
    }
}
else {
    console.log("No arguments provided, please specify one or more Reddit post URLs to process.");
    console.log(process.argv);
}
