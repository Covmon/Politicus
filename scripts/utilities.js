var data = {};
let availableStates = ["CO", "IA", "MO", "NY", "SC", "TN", "KS", "GA", "UT", "MI", "ID"];
var currentStates = availableStates;
var currentAllMatchups = [];


$(document).ready(function() {
    console.log("JS Utilites Script Loaded");
    $('body').on('touchstart', function() {});

    let currentURL = window.location.href;
    availableStates.sort();

    if (currentURL.includes("predictions")) {
        for (state of availableStates) {
            let name = convertStateName(state);
            let select = "<option value='" + state + "'>" + name + "</option>"
            $("#select-state").append(select);
        }
    }

    var state = "All";

    if (sessionStorage.length != 0) {
        state = sessionStorage.getItem("state");
        $("#select-state").val(state);
    } else {
        sessionStorage.setItem("state", "All");
    }

    if (sessionStorage.getItem("data_all") !== null) {
        let jsonString = sessionStorage.getItem("data_all")
        data = JSON.parse(jsonString);
    } else {
        getJSON(availableStates, true);
    }

    if (state != "All" && !currentURL.includes("index.html")) {
        currentStates = [state];
    } else {
        $("#reset-link").css({"color": "gray"})
    }

});

function getJSON(states, useAll) {

    $.ajaxSetup({
        async: false
    });
    
    if (!useAll) {
        let state = states[0];
        let url = "/predictions_data/" + state + "_Candidates_Election_Predictions.json";
        var success = false;
        $.getJSON(url, function(json) {
            success = true;
            console.log("Got JSON from local url " + url);
            let jsonP = JSON.parse(json);
            data[state] = jsonP.data;
        });

        if (!success) {
            let urlOnline = "https://50fifty.us" + url;
            $.getJSON(urlOnline, function(json) {
                success = true;
                console.log("Got JSON from online url " + urlOnline);
                let jsonP = JSON.parse(json);
                data[state] = jsonP.data;
            });
        }
    } else {
        for (state of states) {
            let url = "/predictions_data/" + state + "_Candidates_Election_Predictions.json";
            var success = false;
            $.getJSON(url, function(json) {
                success = true;
                console.log("Got JSON from local url " + url);
                let jsonP = JSON.parse(json);
                console.log(jsonP);
                data[state] = jsonP.data;
            });

            if (!success) {
                let urlOnline = "https://50fifty.us" + url;
                $.getJSON(urlOnline, function(json) {
                    success = true;
                    console.log("Got JSON from online url " + urlOnline);
                    let jsonP = JSON.parse(json);
                    console.log(jsonP);
                    data[state] = jsonP.data;
                });
            }
        }
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

    var allData = [];
    for (state of currentStates) {
        allData = allData.concat(data[state]);
    }

    for (candidate of allData) {
        let race = [candidate.State, candidate.Position, candidate.District];
        if (!arraysEqual(race, lastRace)) {
            lastRace = race;
            for (pos of positions){
                if (candidate.Position == pos || candidate.District == pos) {
                    availableRaces.push(candidate);
                    break;
                }
            }
        }
    }

    var elapsedA = 0;
    var elapsedB = 0;
    var elapsedC = 0;

    var topRacesList = [];
    var rowsList = [];

    for (candidate of availableRaces) {
        let timeA1 = new Date().getTime();
        let matchup = getMatchup(data, candidate.State, candidate.Position, candidate.District);
        currentAllMatchups.push(matchup);
        console.log("push to all matchups");
        let timeA2 = new Date().getTime();
        let elapsed1 = timeA2 - timeA1;
        elapsedA += elapsed1;

        let timeB1 = new Date().getTime();
        getTopElections(topRacesList, matchup, numTopElections, alreadyAdded);
        let timeB2 = new Date().getTime();
        let elapsed2 = timeB2 - timeB1;
        elapsedB += elapsed2;
        
        let timeC1 = new Date().getTime();
        if (createTable) {
            createTableRow(matchup, rowsList);
        }
        let timeC2 = new Date().getTime();
        let elapsed3 = timeC2 - timeC1;
        elapsedC += elapsed3;
    }

    console.log("time elapsed for get matchup: " + elapsedA);
    console.log("time elapsed for top races: " + elapsedB);
    console.log("time elapsed for create rows: " + elapsedC);

    if (topRacesList.length == 0) {
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
    } else if (createTable) {
        $("#all-races-table").DataTable().rows.add(rowsList);
        $("#all-races-table").DataTable().draw();
    }
    

    topRacesList.sort(function(a,b) {
        if (a["money"] > b["money"]) {
            return -1;
        }
        if (a["money"] < b["money"]) {
            return 1;
        }
        return 0;
    });

    for (var i=0; i<topRacesList.length; i++) {
        race = topRacesList[i];
        createCard(race, appendLocation);
    }

    $(document).tooltip({
        track: true
    });

    return topRacesList;
}


function getTopElections(topRaces, matchup, numRaces, alreadyAdded = []) {

    let fundraising = matchup["money"];
    let competetiveness = matchup["competetiveness"];

    topRaces.sort(function(a,b) {
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
                alreadyIncluded = true;
            }
        }
    }

    if (topRaces.length < numRaces) {
        if (competetiveness < 0.4 && !alreadyIncluded) {
            topRaces.push(matchup);
        }
    } else {
        for (var i=0; i<topRaces.length; i++) {
            let race = topRaces[i];
            if (race["money"] < fundraising && competetiveness < 0.4 && !alreadyIncluded) {
                topRaces.splice(i, 1);
                topRaces.push(matchup);
                break;
            }
        }
    }
}

function createSquareChart() {
    let state = convertStateName(currentStates[0]);

        let darkener = "<div id='darkener'></div>";
        $("body").prepend(darkener);

        let overallDiv = "<div class='overall-section'></div>";
        $(".main-page").prepend(overallDiv);

        let overallTitle = "<h2>Our Projection for the " + state + " Senate</h2>";
        $(".overall-section").append(overallTitle);

        let squaresDiv = createDivWithClass("squares");
        $(".overall-section").append(squaresDiv);
        let squares = $(".squares");

        let total = currentAllMatchups.length;
        
        if (total >= 200) {
            squares.css("height", "175px");
        } else if (total >= 150) {
            squares.css("height", "150px");
        } else if (total >= 70) {
            squares.css("height", "125px");
        } else if (total >= 50) {
            squares.css("height", "100px");
        } else if (total >= 27) {
            squares.css("height", "75px");
        }

        var solidDem = [];
        var likelyDem = [];
        var leanDem = [];
        var tossUp = [];
        var leanRep = [];
        var likelyRep = [];
        var solidRep = [];


        for (matchup of currentAllMatchups) {
            switch (matchup.rating) {
                case "SOLID D":
                    solidDem.push(matchup);
                    break;
                case "LIKELY D":
                    likelyDem.push(matchup);
                    break;
                case "LEAN D":
                    leanDem.push(matchup);
                    break;
                case "TOSS-UP":
                    tossUp.push(matchup);
                    break;
                case "LEAN R":
                    leanRep.push(matchup);
                    break;
                case "LIKELY R":
                    likelyRep.push(matchup);
                    break;
                case "SOLID R":
                    solidRep.push(matchup);
                    break;
            }
        }

        let matchupGroups = [solidDem, likelyDem, leanDem, tossUp, leanRep, likelyRep, solidRep];

        for (group of matchupGroups) {

            for (matchup of group) {
                let square = "<div class='seat-square " + matchup.color + "' state='" + matchup.state + "' district='" + matchup.district + "' position='" + matchup.position + "'>" + "" /*matchup.district*/ + "</div>";
                $(".squares").append(square);
            }
        }
        
        $(".seat-square").hover(function (event) {
            var rect = $(this).get(0).getBoundingClientRect();

            var left = rect.x + 15;
            var right = left - 40 - 300;
            var top = rect.top - 150;

            var css = {"top": top, "left": left};

            if (rect.left > window.innerWidth/2) {
                css = {"top": top, "left": right};
            }

            let state = $(this).attr("state");
            let district = $(this).attr("district");
            let position = $(this).attr("position");

            let matchup = getMatchup(data, state, position, district);
            createCard(matchup, "body", true);
            $("#card-popup").css(css);

            $("#darkener").css("opacity", 0.3);

            }, function () {
                //out
                $("#card-popup").remove();
                $("#darkener").css("opacity", 0);
            }
        );
}

function createDivWithClass(cl) {
    let div = "<div class='" + cl + "'></div>";
    return div;
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