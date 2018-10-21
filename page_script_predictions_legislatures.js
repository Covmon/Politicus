$(document).ready(function() {

    console.log("Starting JS Predictions-Legislatures Page");

    var availableRaces = [];
    var lastRace = [];

    for (candidate of data) {
        let race = [candidate.State, candidate.Position, candidate.District];
        if (!arraysEqual(race, lastRace)) {
            console.log(race);
            console.log(lastRace);
            lastRace = race;
            availableRaces.push(candidate);
        }
    }

    console.log(availableRaces);

    for (candidate of availableRaces) {
        if (candidate.Position == "State Representative") {
            console.log("State Rep");
            let office = getLowerBodyName(candidate.State);
            let matchup = getMatchup(data, candidate.State, candidate.Position, candidate.District, office);
            createTableRow(matchup);
        } else if (candidate.Position == "State Senator") {
            let matchup = getMatchup(data, candidate.State, candidate.Position, candidate.District, "Senate");
            createTableRow(matchup);
        }
    }

    var iowa_91 = getMatchup(data, "IA", "State Representative", "91", "House");
    createCard(iowa_91);

    var iowa_1 = getMatchup(data, "IA", "U.S. Representative", "1", "U.S. Representative");
    createCard(iowa_1);

    //timeout simulates time to get location and do voter info query
    //geolocationReturnedCoordinates(50); //getNearbyElections(); <-- change to this once geolocation working

});