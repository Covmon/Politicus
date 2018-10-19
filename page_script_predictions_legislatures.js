$(document).ready(function() {
    console.log("Starting JS Predictions-Legislatures Page");

    
    let stateRep = "State Representative";
    let usRep = "U.S. Representative";

    var iowa_91 = getMatchup(candidateObjects, stateRep, "91", "House");
    createCard(iowa_91);
    createTableRow(iowa_91);

    var iowa_1 = getMatchup(candidateObjects, usRep, "1", usRep);
    createCard(iowa_1);
    createTableRow(iowa_1);

    //timeout simulates time to get location and do voter info query
    geolocationReturnedCoordinates(50); //getNearbyElections(); <-- change to this once geolocation working

});