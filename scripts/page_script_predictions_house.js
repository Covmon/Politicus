$(document).ready(function() {
    console.log("Starting JS Predictions-House Page");

    getElections(["U.S. Representative"], 6, true);
    createSquareChart("U.S. Representative");

});