$(document).ready(function() {
    console.log("Starting JS Predictions-Legislatures Page");
    
    getElections(["State Senator"], 6, true);
    

    if (currentStates.length == 1) {
        createSquareChart("State Senator");
    } else {
        let instructions = '<p style="font-family: Roboto" class="gray">Select a state using the dropdown above to see predictions for a state\'s entire senate. Or, scroll down to view all state senate races.</p>';
        $(".main-page").prepend(instructions);

        let title = "<h2>State Senate Projections</h2>"
        $(".tight-elections").append(title);

        setupTopElections(numCardsToLoad, ["State Senator"]);

    }


});