$(document).ready(function() {
    console.log("Starting JS Predictions-House Page");

    getElections(["U.S. Representative"], 6, true);
    if (currentStates.length > 1) {
        createSquareChart("U.S. Representative");
    }

});