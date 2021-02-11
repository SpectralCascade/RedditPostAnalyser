/*try {
    process.argv.forEach((val, index) => {
        console.log(`${index}: ${val}`);
    });
}
catch (err) {
    //console.log("Error: " + err.message)
    alert("Error: " + err.message);
}*/

function process_raw(raw_json) {
    data = raw_json;
    return data;
}

if (typeof module !== 'undefined') {
    module.exports = { process_raw };
}
