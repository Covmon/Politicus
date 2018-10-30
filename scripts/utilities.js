var data = {};
var currentOverallData = {};
let availableStates = ["CO", "IA", "MO", "NY", "SC", "TN", "KS", "GA", "UT", "MI", "ID", "MN"];
var currentStates = availableStates;
var currentAllMatchups = [];
var currentDistrictsNoElection = [];


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
        getJSONCandidates(availableStates, true);
    }

    if (state != "All" && !currentURL.includes("index.html")) {
        currentStates = [state];
    } else {
        $("#reset-link").css({"color": "gray"})
    }

    if (state != "All" && currentURL.includes("state")) {
        //Get overall json for this body
        if (currentURL.includes("house")) {
            getJSONOverall(state, "House");
        } else if (currentURL.includes("senate")) {
            getJSONOverall(state, "Senate");
        }
    } else if (!currentURL.includes("state")) {

    }

    jQuery.extend( jQuery.fn.dataTableExt.oSort, {
        "num-html-pre": function ( a ) {
            var x = String(a).replace( /<[\s\S]*?>/g, "" );
            return parseFloat( x );
        },
     
        "num-html-asc": function ( a, b ) {
            return ((a < b) ? -1 : ((a > b) ? 1 : 0));
        },
     
        "num-html-desc": function ( a, b ) {
            return ((a < b) ? 1 : ((a > b) ? -1 : 0));
        }
    } );

});

function getJSONOverall(state, body) {
    $.ajaxSetup({
        async: false
    });

    let url = "/predictions_data/" + state + "_" + body + "_Election_Predictions.json"; 

    var success = false;
    $.getJSON(url, function(json) {
        success = true;
        console.log("Got JSON from local url " + url);
        let jsonP = JSON.parse(json);
        let jsonPData = jsonP.data;
        
        for (party of jsonPData) {
            if (party.Party == "REP") {
                currentOverallData["REP"] = party;
            } else if (party.Party == "DEM") {
                currentOverallData["DEM"] = party;
            } else if (party.Party == "LIB") {
                currentOverallData["LIB"] = party;
            } else if (party.Party == "IND") {
                currentOverallData["IND"] = party;
            }
        }
        currentOverallData["Total Seats"] = jsonPData[0]["Total Seats"];
        currentOverallData["Seats Up for Election"] = jsonPData[0]["Seats Up for Election"];

    });

    if (!success) {
        let urlOnline = "https://50fifty.us" + url;
        $.getJSON(urlOnline, function(json) {
            success = true;
            console.log("Got JSON from online url " + urlOnline);
            let jsonP = JSON.parse(json);
            let jsonPData = jsonP.data;
        
            for (party of jsonPData) {
                if (party.Party == "REP") {
                    currentOverallData["REP"] = party;
                } else if (party.Party == "DEM") {
                    currentOverallData["DEM"] = party;
                } else if (party.Party == "LIB") {
                    currentOverallData["LIB"] = party;
                } else if (party.Party == "IND") {
                    currentOverallData["IND"] = party;
                }
            }
            currentOverallData["Total Seats"] = jsonPData[0]["Total Seats"];
            currentOverallData["Seats Up for Election"] = jsonPData[0]["Seats Up for Election"];
        });
    }
}

function getJSONCandidates(states, useAll) {

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
    if (currentStates.length == 1) {
        availableRaces.sort(function (a,b) {
            if (Number.parseInt(a["District"]) > Number.parseInt(b["District"])) {
                return 1;
            } else {
                return -1;
            }
        });
    }

    var elapsedA = 0;
    var elapsedB = 0;
    var elapsedC = 0;

    var topRacesList = [];
    var rowsList = [];

    for (var i=0;i<availableRaces.length;i++) {
        candidate = availableRaces[i];

        let timeA1 = new Date().getTime();
        let matchup = getMatchup(data, candidate.State, candidate.Position, candidate.District);
        currentAllMatchups.push(matchup);
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

function createSquareChart(type) {
    let state = convertStateName(currentStates[0]);
    let lowerBody = getLowerBodyName(state);

    let darkener = "<div id='darkener'></div>";
    $("body").prepend(darkener);

    let overallDiv = "<div class='overall-section'></div>";
    $(".main-page").prepend(overallDiv);

    var title;
    let overall = $(".overall-section");
    var overallTitle;
    if (type == "State Senator") {
        title = state + " Senate";
        overallTitle = "<h2>Our Projection for the " + state + " Senate</h2>";
    } else if (type == "State Representative") {
        title = state + " " + lowerBody;
        overallTitle = "<h2>Our Projection for the " + state + " " + lowerBody + "</h2>";
    } else if (type == "Governor") {
        title = "Governors Offices";
        overallTitle = "<h2>Our Projection for U.S. Governors Races</h2>";
    } else if (type == "U.S. Senator") {
        title = "U.S. Senator";
        overallTitle = "<h2>Our Projection for the U.S. Senate</h2>";
    } else {
        title = "U.S. Representative";
        overallTitle = "<h2>Our Projection for the U.S. House</h2>";
    }
    overall.append(overallTitle);

    //Sort all matchups
    currentAllMatchups.sort(function(a,b) {
        let index1 = Number.parseInt(a["district"]);
        let index2 = Number.parseInt(b["district"]);
        return (index1 > index2) ? 1 : -1;
    });

    //Get districts with no election this year
    let stateAbbrev = currentStates[0];
    let currentAllLegislatures = currentLegislators[stateAbbrev];
    for (district of currentAllLegislatures) {
        if (district.Position == type && district["Next Election"] != 2018) {
            currentDistrictsNoElection.push(district);
        }
    }
    console.log(currentDistrictsNoElection);

    let totalPercentagesDiv = createDivWithClass("total-percentages");
    overall.append(totalPercentagesDiv);
    let totalPercentages = $(".total-percentages");

    let demPercentagesDiv = createDivWithClass("dem-percentages");
    totalPercentages.append(demPercentagesDiv);
    let demPercentages = $(".dem-percentages");

    let repPercentagesDiv = createDivWithClass("rep-percentages");
    totalPercentages.append(repPercentagesDiv);
    let repPercentages = $(".rep-percentages");

    console.log(currentOverallData);
    let majorityChanceDem = (Number.parseFloat(currentOverallData["DEM"]["Predicted Majority Win Probability"]) * 100).toFixed(2);
    let majorityChanceRep = (Number.parseFloat(currentOverallData["REP"]["Predicted Majority Win Probability"]) * 100).toFixed(2);

    var majChanceDemStr = String(majorityChanceDem);
    var majChanceRepStr = String(majorityChanceRep);

    if (majorityChanceDem < 0.0001) {
        majChanceDemStr = "<0.01";
    } else if (majorityChanceDem == 100.00) {
        majChanceDemStr = "100";
    }
    if (majorityChanceRep < 0.0001) {
        majChanceRepStr = "<0.01";
    } else if (majorityChanceRep == 100.00) {
        majChanceRepStr = "100";
    }

    majorityChanceDemH = "<h2 class='blue big-h2'>" + majChanceDemStr + "%</h2>";
    majorityChanceRepH = "<h2 class='red big-h2'>" + majChanceRepStr + "%</h2>";
    demPercentages.append(majorityChanceDemH);
    repPercentages.append(majorityChanceRepH);

    let chanceDemP = "<p class='big-p'>Chance <span class='blue'>Democrats</span> win control</p>";
    let chanceRepP = "<p class='big-p'>Chance <span class='red'>Republicans</span> win control</p>";
    demPercentages.append(chanceDemP);
    repPercentages.append(chanceRepP);

    //
    let supermajorityChanceDem = (Number.parseFloat(currentOverallData["DEM"]["Predicted Supermajority Win Probability"]) * 100).toFixed(2);
    let supermajorityChanceRep = (Number.parseFloat(currentOverallData["REP"]["Predicted Supermajority Win Probability"]) * 100).toFixed(2);

    var supermajChanceDemStr = String(majorityChanceDem);
    var supermajChanceRepStr = String(majorityChanceRep);

    if (supermajorityChanceDem < 0.0001) {
        supermajChanceDemStr = "<0.01";
    } else if (supermajorityChanceDem == 100.00) {
        supermajChanceDemStr = "100";
    }
    if (supermajorityChanceRep < 0.0001) {
        supermajChanceRepStr = "<0.01";
    } else if (majorityChanceRep == 100.00) {
        supermajChanceRepStr = "100";
    }

    supermajorityChanceDemH = "<h2 class='blue'>" + supermajChanceDemStr + "%</h2>";
    supermajorityChanceRepH = "<h2 class='red'>" + supermajChanceRepStr + "%</h2>";
    demPercentages.append(supermajorityChanceDemH);
    repPercentages.append(supermajorityChanceRepH);

    let superchanceDemP = "<p>Chance of supermajority</p>";
    let superchanceRepP = "<p>Chance of supermajority</p>";
    demPercentages.append(superchanceDemP);
    repPercentages.append(superchanceRepP);

    let squaresSectionDiv = createDivWithClass("squares-section");
    overall.append(squaresSectionDiv);
    let squaresSection = $(".squares-section");

    let totalSeats = currentOverallData["Total Seats"];
    let seatsUp = currentOverallData["Seats Up for Election"];
    var seatsUpP;
    if (totalSeats == seatsUp) {
        seatsUpP = "<p><b>All " + seatsUp + " seats up for election</b></p>";
    } else {
        seatsUpP = "<p><b>" + seatsUp + " out of " + totalSeats + " seats up for election</b></p>";
    }
    squaresSection.append(seatsUpP);

    let squaresDiv = createDivWithClass("squares");
    squaresSection.append(squaresDiv);
    let squares = $(".squares");

    let total = currentAllMatchups.length;
    
    if (total >= 435) {
        squares.css("height", "375px");
    } if (total >= 200) {
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

    var noElectionDem = []
    var solidDem = [];
    var likelyDem = [];
    var leanDem = [];
    var tossUp = [];
    var leanRep = [];
    var likelyRep = [];
    var solidRep = [];
    var noElectionRep = [];

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

    for (var i=0;i<currentDistrictsNoElection.length;i++) {
        let district = currentDistrictsNoElection[i];
        district["Index"] = i;

        if (district.Party == "REP") {
            district["color"] = "already-red";

            noElectionRep.push(district);
        } else if (district.Party == "DEM") {
            district["color"] = "already-blue";

            noElectionDem.push(district);
        }
    }

    let matchupGroups = [noElectionDem, solidDem, likelyDem, leanDem, tossUp, leanRep, likelyRep, solidRep, noElectionRep];
    var squareNumber = 0;
    for (group of matchupGroups) {

        for (matchup of group) {
            squareNumber += 1;

            if (matchup.hasOwnProperty("Next Election")) {
                let square = "<div id='square-" + squareNumber + "' index='" + matchup.Index +  "' hasElection='no' class='seat-square " + matchup.color + "'></div>";
                squares.append(square);
            } else {
                let square = "<div id='square-" + squareNumber + "' hasElection='yes' class='seat-square " + matchup.color + "' state='" + matchup.state + "' district='" + matchup.district + "' position='" + matchup.position + "'></div>";
                squares.append(square);
            }
            
        }
    }

    if (window.innerWidth < 800) {
        let horizNumSquares = Math.floor(window.innerWidth/27);
        let verticalNumSqares = Math.ceil(total/horizNumSquares);
        let height = verticalNumSqares * 25;
        squares.css("height", height + "px");
    }

    let triangle = "<img id='even-triangle' src='caret-arrow-up.svg' />";
    squaresSection.append(triangle);

    let even = "<p id='even'>Even</p>"
    squaresSection.append(even);

    let mostLikelyP = "<p><b>Most likely outcome:</b><p>";
    overall.append(mostLikelyP);

    let seatsDem = Math.round(currentOverallData["DEM"]["Predicted Seats"]);
    let seatsRep = Math.round(currentOverallData["REP"]["Predicted Seats"]);
    if (seatsDem + seatsRep != totalSeats) {
        if (currentOverallData["DEM"]["Predicted Seats"] - seatsDem > currentOverallData["REP"]["Predicted Seats"] - seatsRep) {
            seatsDem += 1;
        } else {
            seatsRep += 1;
        }
    }
    let predictedSeatsP = "<p><span class='blue'>Democrats: " + seatsDem + " seats</span> vs. <span class='red'>Republicans: " + seatsRep + " seats</span></p>";
    overall.append(predictedSeatsP);
    
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
        let hasElection = $(this).attr("hasElection");

        if (hasElection == "yes") {
            let matchup = getMatchup(data, state, position, district);
            createCard(matchup, "body", true);
        } else {
            let index = $(this).attr("index");
            let district = currentDistrictsNoElection[index];
            createCardNoElection(district);
        }

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