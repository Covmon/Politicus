var numLoaded = 6;
var alreadyAdded = [];
var topBodies = [];

$(document).ready(function() {
    console.log("Starting JS Index Page");
    
    alreadyAdded = getElections(["State Representative", "State Senator", "Statewide", "U.S. Representative", "U.S. Senator"], 6, false, alreadyAdded);
    setupTopElections(3);
    console.log(topBodies);
    $("#load-more-button").on("click", loadMore);

});

function loadMore() {
    if (numLoaded < 24) {
        numLoaded += 3;

        let newlyAdded = getElections(["State Representative", "State Senator", "Statewide", "U.S. Representative", "U.S. Senator"], 3, false, alreadyAdded);
        alreadyAdded = alreadyAdded.concat(newlyAdded);
    }
}

function setupTopElections(numElections) {
    for (body of allOverallData) {
        if (body.length != 0 ) {
            
            var demPercentage = 100;
            var repPercentage = 0;

            for (party of body) {
                if (party.Party == "REP") {
                    repPercentage = party["Predicted Majority Win Probability"];
                } else if (party.Party == "DEM") {
                    demPercentage = party["Predicted Majority Win Probability"];
                }
            }
            let difference = Math.abs(demPercentage - repPercentage);

            if (topBodies.length < numElections) {
                topBodies.push(body);
            } else {
                let highestDifference = 0;
                let highestDifferenceIndex = 0;

                for (var i=0;i<topBodies.length;i++) {
                    let topBody = topBodies[i];

                    var topDemPercentage = 100;
                    var topRepPercentage = 0;

                    for (topParty of topBody) {
                        if (topParty.Party == "REP") {
                            topRepPercentage = topParty["Predicted Majority Win Probability"];
                        } else if (topParty.Party == "DEM") {
                            topDemPercentage = topParty["Predicted Majority Win Probability"];

                        }
                    }
                    let topDifference = Math.abs(topDemPercentage - topRepPercentage);

                    if (topDifference > highestDifference) {
                        highestDifference = topDifference;
                        highestDifferenceIndex = i;
                    }
                }

                if (difference < highestDifference) {
                    topBodies.splice(highestDifferenceIndex, 1);
                    topBodies.push(body);
                }
            }

        }
    }
    console.log(topBodies);
    for (var j=0;j<topBodies.length;j++) {

        let body = topBodies[j];
        console.log(body);

        var rep = {};
        var dem = {};

        for (party of body) {
            if (party.Party == "REP") {
                rep = party;
            } else if (party.Party == "DEM") {
                dem = party;
            }
        }
        
        //<span class='blue'></span> - <span class='red'></span>
        console.log(rep);
        console.log(dem);

        let demSeats = Math.round(dem["Predicted Seats"]);
        let repSeats = Math.round(rep["Predicted Seats"]);

        let className = ".tight-election-" + (j + 1);
        let classNameLink = ".election-link-" + (j + 1);
        let titleEle = $(className + " h1");
        let seatsEle = $(className + " h3");
        let linkEle = $(classNameLink);

        let state = body[0].State;

        let href = "";
        

        var title = "";
        let stateName = convertStateName(state);
        switch(body[0].Position) {
            case "State Senator":
                title = stateName + " State Senate";
                href = "predictions_state_senates.html?state=" + state;
                break;
            case "State Representative":
                title = stateName + " State House";
                href = "predictions_state_houses.html?state=" + state;
                break;
        }
        titleEle.text(title);
        linkEle.attr("href", href);

        let seatsHTML = "<span class='blue'>" + demSeats + "</span> - <span class='red'>" + repSeats + "<span>";
        seatsEle.html(seatsHTML);

    }

}