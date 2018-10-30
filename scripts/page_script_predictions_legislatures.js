$(document).ready(function() {
    console.log("Starting JS Predictions-Legislatures Page");
    
    getElections(["State Representative"], 6, true);

    if (currentStates.length == 1) {
        createSquareChart("State Representative");
    } else {
        let instructions = '<p style="font-family: Roboto" class="gray">Select a state using the dropdown above to see predictions for a state\'s entire house. Or, scroll down to view all state house races.</p>';
        $(".main-page").prepend(instructions);
    }

});