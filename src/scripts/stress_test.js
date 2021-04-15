const processor = require("./process_json");

test_num = [];
counter = 0;
finish_test = 0;
tests_complete = false;
test_check = false;


function run_test(test){
    var d = new Date();
    test_num.push(d.getTime());
    try {
        test(test_index);
    }   catch (err) {
        console.log("Test " + counter + " failed (exception occurred)!");
        console.log("");
    }
    counter++;
}

function on_finish(test_index, success){
    finish_test++;
    test_num[test_index] = (new Date()).getTime()-test_num[test_index];
    if (success) {
        console.log("Test " + test_index + " passed!");
        console.log("");
    } else {
        console.log("Test " + test_index + " failed!");
        console.log("");
    }
    if (finish_test >= counter && !tests_complete){
        console.log("Completed: " + test_num);
        test_check = true;
    }
}

function run_stress_tests() {
    tests_complete = true;
    if (test_check){
        console.log("Completed: "+ test_num);
    }
}
