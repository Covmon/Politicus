var numLoaded = 9;
var alreadyAdded = [];

$(document).ready(function() {
    console.log("Starting JS Predictions Page");
    
    alreadyAdded = getElections(["State Representative", "State Senator", "0", "U.S. Representative", "U.S. Senator"], 9, false, alreadyAdded, ".top-races");

    getNearbyElections();

    $("#load-more-button").on("click", loadMore);

    //geolocationReturnedCoordinates(50);

});

function loadMore() {
    console.log("LOAD MORE");
    if (numLoaded < 30) {
        numLoaded += 6;

        //$(".top-races .prediction-card").remove();

        getElections(["State Representative", "State Senator", "0", "U.S. Representative", "U.S. Senator"], 6, false, alreadyAdded, ".top-races");
    }
}