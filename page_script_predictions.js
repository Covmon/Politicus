$(document).ready(function() {
    console.log("Starting JS Predictions Page");
    
    let stateRep = "State Representative";
    let usRep = "U.S. Representative";

    $.getJSON("Politicus/junky1.json", function(json) {
        console.log(json);
    });

    var iowa_91 = getMatchup(candidateObjects, "Iowa", stateRep, "91", "House");
    createCard(iowa_91);

    var iowa_1 = getMatchup(candidateObjects, "Iowa", usRep, "1", usRep);
    createCard(iowa_1);

    var iowa_55 = getMatchup(candidateObjects, "Iowa", stateRep, "55", "House");
    createCard(iowa_55, -1, ".top-races");

    var iowa_32 = getMatchup(candidateObjects, "Iowa", stateRep, "32", "House");
    createCard(iowa_32, -1, ".top-races");
    
    var iowa_40 = getMatchup(candidateObjects, "Iowa", stateRep, "40", "House");
    createCard(iowa_40, -1, ".top-races");

    var iowa_80 = getMatchup(candidateObjects, "Iowa", stateRep, "80", "House");
    createCard(iowa_80, -1, ".top-races");

    //timeout simulates time to get location and do voter info query
    geolocationReturnedCoordinates(50); //getNearbyElections(); <-- change to this once geolocation working

});