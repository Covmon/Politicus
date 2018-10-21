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

    //console.log(availableRaces);

    for (candidate of availableRaces) {
        console.log(candidate.Position);
        if (candidate.Position == "State Representative") {
            let office = getLowerBodyName(candidate.State);
            let matchup = getMatchup(data, candidate.State, candidate.Position, candidate.District, office);
            createTableRow(matchup);
        } else if (candidate.Position == "State Senator") {
            let matchup = getMatchup(data, candidate.State, candidate.Position, candidate.District, "Senate");
            createTableRow(matchup);
        }
    }

    let stateRep = "State Representative";
    let usRep = "U.S. Representative";

    var iowa_91 = getMatchup(data, "IA", stateRep, "91", "House");
    createCard(iowa_91);

    var iowa_40 = getMatchup(data, "IA", stateRep, "40", "House");
    createCard(iowa_40);

    var iowa_55 = getMatchup(data, "IA", stateRep, "55", "House");
    createCard(iowa_55);


    //timeout simulates time to get location and do voter info query
    //geolocationReturnedCoordinates(50); //getNearbyElections(); <-- change to this once geolocation working
});