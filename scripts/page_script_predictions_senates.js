$(document).ready(function() {
    console.log("Starting JS Predictions-Legislatures Page");
    
    getElections(["State Senator"], 6, true);

    if (currentStates.length == 1) {
        createSquareChart();
    }

});