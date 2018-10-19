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

    var iowa_3 = getMatchup(candidateObjects, usRep, "3", usRep);
    createTableRow(iowa_3);

    var iowa_32 =  getMatchup(candidateObjects, stateRep, "32", "House");
    createTableRow(iowa_32);

    //timeout simulates time to get location and do voter info query
    //geolocationReturnedCoordinates(50); //getNearbyElections(); <-- change to this once geolocation working

});