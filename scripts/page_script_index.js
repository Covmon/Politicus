var numLoaded = 6;
var alreadyAdded = [];
var allOverallBodies = {};

$(document).ready(function() {
    console.log("Starting JS Index Page");
    
    alreadyAdded = getElections(["State Representative", "State Senator", "0", "U.S. Representative", "U.S. Senator"], 6, false, alreadyAdded);

    $("#load-more-button").on("click", loadMore);

});

function loadMore() {
    if (numLoaded < 24) {
        numLoaded += 3;

        let newlyAdded = getElections(["State Representative", "State Senator", "0", "U.S. Representative", "U.S. Senator"], 3, false, alreadyAdded);
        alreadyAdded = alreadyAdded.concat(newlyAdded);
    }
}