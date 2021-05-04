const processor = require("./process_json");

test_num = [];
counter = 0;
finish_test = 0;
tests_complete = false;
test_check = false;
var completed = 0;


function run_test(test){
    var d = new Date();
    test_num.push(d.getTime());
    try {
        test(counter);
    }   catch (err) {
        console.log("Test " + counter + " failed (exception occurred)!");
        console.log(err);
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
    if (finish_test >= counter && tests_complete){
        console.log("Completed: " + test_num + "miliseconds");
        test_check = true;
    }
}

function run_stress_tests() {
    processor.setAsync(false);
    url_list = ["https://www.reddit.com/r/AskReddit/comments/mr0s0d/what_did_you_see_that_you_definitely_werent/", "https://www.reddit.com/r/wallstreetbets/comments/mrcp5k/gme_megathread_for_april_15_2021/", "https://www.reddit.com/r/Damnthatsinteresting/comments/mrcato/they_finished_the_job/",
    "https://www.reddit.com/r/facepalm/comments/mrbbsr/buzzfeed_asking_to_be_left_in_the_dirt/", "https://www.reddit.com/r/worldnews/comments/mr1ctx/please_drink_treated_fukushima_water_china_on/", "https://www.reddit.com/r/space/comments/mr1ah1/blue_origin_new_shepard_booster_landing_after/",
"https://www.reddit.com/r/funny/comments/mrbpn6/kpop_shadow_is_coming_for_you/", "https://www.reddit.com/r/IdiotsInCars/comments/mr4gku/driver_takes_exit_ramp_way_too_fast/", "https://www.reddit.com/r/worldnews/comments/mrbh71/worlds_8_richest_people_now_have_a_combined_net/",
"https://www.reddit.com/r/nba/comments/mr724l/highlight_luka_throws_it_in_to_win_the_game/"];

    for (i = 0; i<url_list.length;i++) {
        run_test(function(test_index) {
                processor.download_raw(url_list[i], function(data) {
                    if (data != null) {
                        var processed = {};
                        processor.process_meta(JSON.parse(data), processed);
                    }
                    completed++;
                    if (completed >= 10) {
                        on_finish(test_index, true);
                    }
        });
    });

    posts = [];
    for (i = 0; i<url_list.length;i++) {
        processor.download_raw(url_list[i], function(data){
            if (data != null) {
                posts.push(JSON.parse(data));
            }
        });
    }
    for (post in posts){
        run_test(function(test_index) {
            var output = {}
            var expected_output = {postLinks: []}
            var success = false;
            processor.process_links(posts[post], output, function() {
                console.log()
                success = true;
            });
            return success;
        });
    }
/*for (post in posts){
    run_test(function(test_index) {
    processor.process_reposts(posts[post], {}, function(stage, processed){
        on_finish(test_index, true);
    });
});
}*/

for (post in posts){
    run_test(function(test_index) {
        processor.recurseComments(
            {},
            posts[post][1].data.children,
            null,
            function() {
            on_finish(test_index, true);
        });
    });
};
}
    tests_complete = true;
    if (test_check){
        console.log("Completed: "+ test_num);
    }
}


if (typeof module !== 'undefined') {
    module.exports = { run_stress_tests };
}
