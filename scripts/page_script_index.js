var numLoaded = 6;
var alreadyAdded = [];

$(document).ready(function() {
    console.log("Starting JS Index Page");
    
    alreadyAdded = getElections(["State Representative", "State Senator", "Statewide", "U.S. Representative", "U.S. Senator"], 6, false, alreadyAdded);
    
    let title = "<h2>Tightest Midterm Races</h2>"
    $(".tight-elections").append(title);

    setupNationalElections();
    
    setupTopElections(3, ["State Representative", "State Senator"]);

    let buttons = '<br /><a class="normal-link button-move-up" href="predictions_state_senates.html"><div class="button button-bold">Find your state senate</div></a><a class="normal-link button-move-up" href="predictions_state_houses.html"><div class="button button-bold">Find your state house</div></a>'
    $(".tight-elections").append(buttons);

    $("#load-more-button").on("click", loadMore);

});

function loadMore() {
    if (numLoaded < 24) {
        numLoaded += 3;

        let newlyAdded = getElections(["State Representative", "State Senator", "Statewide", "U.S. Representative", "U.S. Senator"], 3, false, alreadyAdded);
        alreadyAdded = alreadyAdded.concat(newlyAdded);
    }
}