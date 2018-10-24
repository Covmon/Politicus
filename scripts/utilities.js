var data;

$(document).ready(function() {
    console.log("JS Utilites Script Loaded");

    var state = "All";

    if (sessionStorage.length != 0) {
        state = sessionStorage.getItem("state");
        $("#select-state").val(state);
    }
    console.log("Current state: " + state);

    if (state == "All") {
        console.log("Get JSON for all states");
        getJSON("IA_Candidates_Election_Predictions");
    } else {
        let fileName = state + "_Candidates_Election_Predictions";
        getJSON(fileName);
    }
    //data = json.data;
});

function getJSON(path) {

    $.ajaxSetup({
        async: false
    });
    
    let url = "/Politicus/predictions_data/" + path + ".json";
    var success = false;
    $.getJSON(url, function(json) {
        success = true;
        console.log("Got JSON from local url " + url);
        let jsonP = JSON.parse(json);
        console.log(jsonP);
        data = jsonP.data;
    });

    if (!success) {
        console.log("Get JSON failed local url, trying online");
        let urlOnline = "https://www.noahcovey.com" + url;
        $.getJSON(urlOnline, function(json) {
            success = true;
            console.log("Got JSON from online url " + urlOnline);
            let jsonP = JSON.parse(json);
            console.log(jsonP);
            data = jsonP.data;
        });
    }
}

function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}

function matchupsEqual(a, b) {
    if (a["title"] == b["title"]) {
        return true;
    } else {
        return false;
    }
}

function getElections(positions, numTopElections, createTable, alreadyAdded = [], appendLocation = ".main-section") {
    console.log("Getting Elections");
    var availableRaces = [];
    var lastRace = [];

    for (candidate of data) {
        let race = [candidate.State, candidate.Position, candidate.District];
        if (!arraysEqual(race, lastRace)) {
            lastRace = race;
            availableRaces.push(candidate);
        }
    }

    var topRaces = [];

    for (candidate of availableRaces) {
        if (candidate.Position == "State Representative" && positions.includes("State Representative")) {
            let matchup = getMatchup(data, candidate.State, candidate.Position, candidate.District);
            getTopElections(topRaces, matchup, numTopElections, alreadyAdded);
            if (createTable) {
                createTableRow(matchup);
            }
        } else if (candidate.Position == "State Senator" && positions.includes("State Senator")) {
            let matchup = getMatchup(data, candidate.State, candidate.Position, candidate.District);
            getTopElections(topRaces, matchup, numTopElections, alreadyAdded);
            if (createTable) {
                createTableRow(matchup);
            }
        } else if (candidate.Position == "U.S. Representative" && positions.includes("U.S. Representative")) {
            let matchup = getMatchup(data, candidate.State, candidate.Position, candidate.District);
            getTopElections(topRaces, matchup, numTopElections, alreadyAdded);
            if (createTable) {
                createTableRow(matchup);
            }
        } else if (candidate.Position == "U.S. Senator" && positions.includes("U.S. Senator")) {
            let matchup = getMatchup(data, candidate.State, candidate.Position, candidate.District);
            getTopElections(topRaces, matchup, numTopElections, alreadyAdded);
            if (createTable) {
                createTableRow(matchup);
            }
        } else if (candidate.District == "0" && positions.includes("0") && candidate.Position != "U.S. Senator") { //Governor, Lt. Governor, Sec. of State, etc.
            console.log(candidate.Position);
            let matchup = getMatchup(data, candidate.State, candidate.Position, candidate.District);
            getTopElections(topRaces, matchup, numTopElections, alreadyAdded);
            if (createTable) {
                createTableRow(matchup);
            }
        }
    }

    if (topRaces.length == 0) {
        let errorP = $("<p />").text("Sorry, no races for the selected state and election type are available.");
        errorP.attr("id", "error-p");
        $(".main-section").append(errorP);

        $("#all-races-table").DataTable({
            paging: false,
            language: {
                searchPlaceholder: "State, position, or candidate",
                search: "Search:",
                emptyTable:  "No races found",
                infoEmpty: "Showing 0 to 0 of 0 races"
            }
        });
    }

    topRaces.sort(function(a,b) {
        if (a["money"] > b["money"]) {
            return -1;
        }
        if (a["money"] < b["money"]) {
            return 1;
        }
        return 0;
    });

    for (var i=0; i<topRaces.length; i++) {
        race = topRaces[i];
        createCard(race, appendLocation);
    }

    return topRaces;
}


function getTopElections(racesList, matchup, numRaces, alreadyAdded = []) {

    let fundraising = matchup["money"];
    let competetiveness = matchup["competetiveness"];

    racesList.sort(function(a,b) {
        if (a["money"] > b["money"]) {
            return 1;
        }
        if (a["money"] < b["money"]) {
            return -1;
        }
        return 0;
    });

    var alreadyIncluded = false;
    if (alreadyAdded != []) {
        for (race of alreadyAdded) {
            if (matchupsEqual(race, matchup)) {
                console.log("Already added");
                console.log(matchup);
                alreadyIncluded = true;
            }
        }
    }

    if (racesList.length < numRaces) {
        if (competetiveness < 0.4 && !alreadyIncluded) {
            racesList.push(matchup);
        }
    } else {
        for (var i=0; i<racesList.length; i++) {
            let race = racesList[i];
            if (race["money"] < fundraising && competetiveness < 0.4 && !alreadyIncluded) {
                //console.log("Add race " + matchup["title"] + " with fundraiasing " + fundraising + " and competetivness " + competetiveness);
                //console.log("Remove race " + race["title"] + " with fundraiasing " + race["money"] + " and competetivness " + race["competetiveness"]);
                racesList.splice(i, 1);
                racesList.push(matchup);
                break;
            }
        }
    }
}

function getLowerBodyName(state) {
    var abbrev = state;
    if (state.length > 2) {
        abbrev = convertStateName(state);
    }
    var lowerName = "";
    
    switch (abbrev) {
        case "CA":
            lowerName = "Assembly";//state assembly
            break;
        case "MD":
            lowerName = "House";// of Delegates";
            break;
        case "NV":
            lowerName = "Assembly";//state assembly
            break;
        case "NJ":
            lowerName = "Assembly";//general assembly
            break;
        case "NY":
            lowerName = "Assembly";//state assembly
            break;
        case "VA":
            lowerName = "House";// of Delegates";
            break;
        case "WV":
            lowerName = "House";// of Delegates";
            break;
        case "WI":
            lowerName = "Assembly";//state assembly
            break;
        default:
            lowerName = "House";
            break;

    }

    return lowerName;
}

function convertStateName(state) {

    let states = [
        {
            "name": "Alabama",
            "abbreviation": "AL"
        },
        {
            "name": "Alaska",
            "abbreviation": "AK"
        },
        {
            "name": "American Samoa",
            "abbreviation": "AS"
        },
        {
            "name": "Arizona",
            "abbreviation": "AZ"
        },
        {
            "name": "Arkansas",
            "abbreviation": "AR"
        },
        {
            "name": "California",
            "abbreviation": "CA"
        },
        {
            "name": "Colorado",
            "abbreviation": "CO"
        },
        {
            "name": "Connecticut",
            "abbreviation": "CT"
        },
        {
            "name": "Delaware",
            "abbreviation": "DE"
        },
        {
            "name": "District Of Columbia",
            "abbreviation": "DC"
        },
        {
            "name": "Federated States Of Micronesia",
            "abbreviation": "FM"
        },
        {
            "name": "Florida",
            "abbreviation": "FL"
        },
        {
            "name": "Georgia",
            "abbreviation": "GA"
        },
        {
            "name": "Guam Gu",
            "abbreviation": "GU"
        },
        {
            "name": "Hawaii",
            "abbreviation": "HI"
        },
        {
            "name": "Idaho",
            "abbreviation": "ID"
        },
        {
            "name": "Illinois",
            "abbreviation": "IL"
        },
        {
            "name": "Indiana",
            "abbreviation": "IN"
        },
        {
            "name": "Iowa",
            "abbreviation": "IA"
        },
        {
            "name": "Kansas",
            "abbreviation": "KS"
        },
        {
            "name": "Kentucky",
            "abbreviation": "KY"
        },
        {
            "name": "Louisiana",
            "abbreviation": "LA"
        },
        {
            "name": "Maine",
            "abbreviation": "ME"
        },
        {
            "name": "Marshall Islands",
            "abbreviation": "MH"
        },
        {
            "name": "Maryland",
            "abbreviation": "MD"
        },
        {
            "name": "Massachusetts",
            "abbreviation": "MA"
        },
        {
            "name": "Michigan",
            "abbreviation": "MI"
        },
        {
            "name": "Minnesota",
            "abbreviation": "MN"
        },
        {
            "name": "Mississippi",
            "abbreviation": "MS"
        },
        {
            "name": "Missouri",
            "abbreviation": "MO"
        },
        {
            "name": "Montana",
            "abbreviation": "MT"
        },
        {
            "name": "Nebraska",
            "abbreviation": "NE"
        },
        {
            "name": "Nevada",
            "abbreviation": "NV"
        },
        {
            "name": "New Hampshire",
            "abbreviation": "NH"
        },
        {
            "name": "New Jersey",
            "abbreviation": "NJ"
        },
        {
            "name": "New Mexico",
            "abbreviation": "NM"
        },
        {
            "name": "New York",
            "abbreviation": "NY"
        },
        {
            "name": "North Carolina",
            "abbreviation": "NC"
        },
        {
            "name": "North Dakota",
            "abbreviation": "ND"
        },
        {
            "name": "Northern Mariana Islands",
            "abbreviation": "MP"
        },
        {
            "name": "Ohio",
            "abbreviation": "OH"
        },
        {
            "name": "Oklahoma",
            "abbreviation": "OK"
        },
        {
            "name": "Oregon",
            "abbreviation": "OR"
        },
        {
            "name": "Palau",
            "abbreviation": "PW"
        },
        {
            "name": "Pennsylvania",
            "abbreviation": "PA"
        },
        {
            "name": "Puerto Rico",
            "abbreviation": "PR"
        },
        {
            "name": "Rhode Island",
            "abbreviation": "RI"
        },
        {
            "name": "South Carolina",
            "abbreviation": "SC"
        },
        {
            "name": "South Dakota",
            "abbreviation": "SD"
        },
        {
            "name": "Tennessee",
            "abbreviation": "TN"
        },
        {
            "name": "Texas",
            "abbreviation": "TX"
        },
        {
            "name": "Utah",
            "abbreviation": "UT"
        },
        {
            "name": "Vermont",
            "abbreviation": "VT"
        },
        {
            "name": "Virgin Islands",
            "abbreviation": "VI"
        },
        {
            "name": "Virginia",
            "abbreviation": "VA"
        },
        {
            "name": "Washington",
            "abbreviation": "WA"
        },
        {
            "name": "West Virginia",
            "abbreviation": "WV"
        },
        {
            "name": "Wisconsin",
            "abbreviation": "WI"
        },
        {
            "name": "Wyoming",
            "abbreviation": "WY"
        }
    ]

    if (state.length <= 2) { //Abbreviation inputted

        for (s of states) {
            if (s.abbreviation == state) {
                return s.name;
            }
        }

    } else { //State name inputted
        for (s of states) {
            if (s.name == state) {
                return s.abbreviation;
            }
        }
    }
}