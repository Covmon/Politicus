var numLoaded = 9;
var alreadyAdded = [];

$(document).ready(function() {
    console.log("Starting JS Predictions Page");
    
    alreadyAdded = getElections(["State Representative", "State Senator", "Statewide", "U.S. Representative", "U.S. Senator"], 9, false, alreadyAdded, ".top-races");

    getNearbyElections();
    //getPositionError();

    $("#load-more-button").on("click", loadMore);

});

function loadMore() {
    if (numLoaded < 30) {
        numLoaded += 6;

        let newlyAdded = getElections(["State Representative", "State Senator", "Statewide", "U.S. Representative", "U.S. Senator"], 6, false, alreadyAdded, ".top-races");
        alreadyAdded = alreadyAdded.concat(newlyAdded);
    }
}