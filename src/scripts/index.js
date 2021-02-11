#!/usr/bin/env node

const processor = require("./process_json");

console.log("Running with node: " + processor.process_raw("{ dummy_json_data }"));
