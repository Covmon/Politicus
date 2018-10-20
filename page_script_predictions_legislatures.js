$(document).ready(function() {
    console.log("Starting JS Predictions-Legislatures Page");

    var availableRaces = [];
    var lastRace = [];

    for (candidate of candidateObjects) {
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
            let matchup = getMatchup(candidateObjects, candidate.State, candidate.Position, candidate.District, office);
            createTableRow(matchup);
        } else if (candidate.Position == "State Senator") {
            let matchup = getMatchup(candidateObjects, candidate.State, candidate.Position, candidate.District, "Senate");
            createTableRow(matchup);
        }
    }

    var iowa_91 = getMatchup(candidateObjects, "Iowa", "State Representative", "91", "House");
    createCard(iowa_91);

    var iowa_1 = getMatchup(candidateObjects, "Iowa", "U.S. Representative", "1", "U.S. Representative");
    createCard(iowa_1);

    //timeout simulates time to get location and do voter info query
    //geolocationReturnedCoordinates(50); //getNearbyElections(); <-- change to this once geolocation working

});