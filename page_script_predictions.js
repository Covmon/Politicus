$(document).ready(function() {
    console.log("Starting JS Predictions Page");
    
    let stateRep = "State Representative";
    let usRep = "U.S. Representative";

    var iowa_91 = getMatchup(data, "IA", stateRep, "91", "House");
    createCard(iowa_91);

    var iowa_1 = getMatchup(data, "IA", usRep, "1", usRep);
    createCard(iowa_1);

    var iowa_55 = getMatchup(data, "IA", stateRep, "55", "House");
    createCard(iowa_55, -1, ".top-races");

    var iowa_32 = getMatchup(data, "IA", stateRep, "32", "House");
    createCard(iowa_32, -1, ".top-races");
    
    var iowa_40 = getMatchup(data, "IA", stateRep, "40", "House");
    createCard(iowa_40, -1, ".top-races");

    var iowa_80 = getMatchup(data, "IA", stateRep, "80", "House");
    createCard(iowa_80, -1, ".top-races");

    //timeout simulates time to get location and do voter info query
    geolocationReturnedCoordinates(50); //getNearbyElections(); <-- change to this once geolocation working

});