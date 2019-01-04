var data = {};
var currentOverallData = {};
var allOverallData = [];
let availableStates = ["CO", "GA","IA", "ID", "KS", "MA", "MI", "MN", "MO", "NY", "SC", "TN", "UT"];
//missing from house states:  WY
let availableStatesNoStateLegislatures = ["AL", "AK", "AR", "AZ", "CA", "CT", "DE", "FL", "HI", "IL", "IN", "KY", "LA", "MD", "ME", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "OH", "OK", "OR", "PA", "RI", "SD", "TX", "VA", "VT", "WA", "WI", "WV", "WY"];
var currentStates = availableStates;
var currentAllMatchups = [];
var currentDistrictsNoElection = [];
var currentAllCandidates = [];

var numCardsToLoad = 9;

var isTouchDevice = false;

var filePathPrefix = "";

$(document).ready(function() {
    console.log("JS Utilites Script Loaded");
    $('body').on('touchstart', function() {});

    let currentURL = window.location.href;
    var urlParams = new URLSearchParams(window.location.search);
    console.log(currentURL);

    availableStates.sort();

    if (currentURL.includes("predictions")) {
        for (state of availableStates) {
            let name = convertStateName(state);
            let select = "<option value='" + state + "'>" + name + "</option>"
            $("#select-state").append(select);
        }
    }

    if (currentURL.includes("/2018/")) {
        filePathPrefix = "/2018";
    }

    var state = "All";
    if (urlParams.has("state")) {
        let urlState = urlParams.get('state');
        console.log("state in url " + urlState);
        if (availableStates.includes(urlState)) {
            state = urlState;
        }
        sessionStorage.setItem("state", urlState);
        $("#select-state").val(urlState);
    } else if (sessionStorage.getItem("state") !== null) {
        state = sessionStorage.getItem("state");
        console.log("State stored " + state);
        if (state == "UT" && currentURL.includes("predictions_state_senates")) {
            state = "All";
        }
        $("#select-state").val(state);
    } else {
        //sessionStorage.setItem("state", "All");
    }

    let allStatesNeededInJSON = availableStates.concat(availableStatesNoStateLegislatures);
    allStatesNeededInJSON.sort();
    if (sessionStorage.getItem("data_all") !== null) {
        let jsonString = sessionStorage.getItem("data_all")
        data = JSON.parse(jsonString);
    } else {
        getJSONCandidates(allStatesNeededInJSON, true);
    }
   
    if (state != "All" && !(currentURL.includes("index.html") || currentURL == "https://50fifty.us/" || currentURL == "https://50fifty.us/2018/")) {
        currentStates = [state];
    } else {
        $("#reset-link").css({"color": "gray"})
    }

    if ((!(currentURL.includes("predictions_state_senates") || currentURL.includes("predictions_state_houses"))) && state == "All") {
        currentStates = allStatesNeededInJSON;
    } else if (currentURL.includes("index.html") || currentURL == "https://50fifty.us/" || currentURL == "https://50fifty.us/2018/") {
        currentStates = allStatesNeededInJSON;
    }

    if (currentURL.includes("predictions_house") && state == "All") {
        getJSONOverall("US", "House");
    }

    if (state != "All" && currentURL.includes("state")) {
        //Get overall json for this body
        getJSONCurrentCandidates(state);

        if (currentURL.includes("house")) {
            getJSONOverall(state, "House");
        } else if (currentURL.includes("senate")) {
            getJSONOverall(state, "Senate");
        }
    } else if (currentURL.includes("index") || currentURL == "https://50fifty.us/" || currentURL.includes("predictions_state_senates") || currentURL.includes("predictions_state_houses")) {
        getJSONAllOverall(["House", "Senate"]);
    }

    isTouchDevice = is_touch_device();
    if (window.innerWidth < 500) {
        numCardsToLoad = 6;
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

function getJSONCurrentCandidates(state) {
    $.ajaxSetup({
        async: false
    });

    let url = filePathPrefix + "/current_legislators/json/" + state + "_current_legislators.json";

    var success = false;
    $.getJSON(url, function(json) {
        success = true;
        console.log("Got JSON from local url " + url);
        let jsonP = JSON.parse(json);
        let jsonPData = jsonP.data;
        currentAllCandidates = jsonPData;
    });

    if (!success) {
        let urlOnline = "https://50fifty.us" + url;
        $.getJSON(urlOnline, function(json) {
            success = true;
            console.log("Got JSON from online url " + urlOnline);
            let jsonP = JSON.parse(json);
            let jsonPData = jsonP.data;
            currentAllCandidates = jsonPData;
        });
    }
}

function getJSONAllOverall(bodies) {
    $.ajaxSetup({
        async: false
    });

    var statesToIterate = availableStates;
    var statesToIterate = [];

    for (var i=0;i<availableStates.length;i++) {
        statesToIterate.push(availableStates[i]);
    }
    statesToIterate.push("US");

    for (state of statesToIterate) {
        for (body of bodies) {
            if (state == "US" && body == "Senate") {
                continue;
            }
            let url = filePathPrefix + "/predictions_data/" + state + "_" + body + "_Election_Predictions.json"; 

            var success = false;
            $.getJSON(url, function(json) {
                success = true;
                console.log("Got JSON from local url " + url);
                let jsonP = JSON.parse(json);
                let jsonPData = jsonP.data;
                
                allOverallData.push(jsonPData);
            });
        
            if (!success) {
                let urlOnline = "https://50fifty.us" + url;
                $.getJSON(urlOnline, function(json) {
                    success = true;
                    console.log("Got JSON from online url " + urlOnline);
                    let jsonP = JSON.parse(json);
                    let jsonPData = jsonP.data;
                
                    allOverallData.push(jsonPData);
                });
            }

        }

    }

}

function getJSONOverall(state, body) {
    $.ajaxSetup({
        async: false
    });

    let url = filePathPrefix + "/predictions_data/" + state + "_" + body + "_Election_Predictions.json"; 

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
        let url = filePathPrefix + "/predictions_data/" + state + "_Candidates_Election_Predictions.json";
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
            let url = filePathPrefix + "/predictions_data/" + state + "_Candidates_Election_Predictions.json";
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
    console.log("current states:");
    console.log(currentStates);
    for (state of currentStates) {
        allData = allData.concat(data[state]);
    }

    for (candidate of allData) {
        let race = [candidate.State, candidate.Position, candidate.District];
        if (!arraysEqual(race, lastRace)) {
            lastRace = race;
            for (pos of positions){
                if ((candidate.Position == pos || candidate.District == pos) && !(candidate.Position == "U.S. Senator" && pos == "Statewide")) {
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

    var topRacesList = [];
    var rowsList = [];

    for (var i=0;i<availableRaces.length;i++) {
        candidate = availableRaces[i];

        let matchup = getMatchup(data, candidate.State, candidate.Position, candidate.District);
        currentAllMatchups.push(matchup);

        getTopElections(topRacesList, matchup, numTopElections, alreadyAdded);
        
        if (createTable) {
            createTableRow(matchup, rowsList);
        }
    }

    if (availableRaces.length == 0) {
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
        if (competetiveness < 0.2 && !alreadyIncluded) {
            topRaces.push(matchup);
        }
    } else {
        for (var i=0; i<topRaces.length; i++) {
            let race = topRaces[i];
            if (race["money"] < fundraising && competetiveness < 0.2 && !alreadyIncluded) {
                topRaces.splice(i, 1);
                topRaces.push(matchup);
                break;
            }
        }
    }
}

function setupNationalElections(appendLocation = ".tight-elections") {
    var nationalBodies = []

    for (body of allOverallData) {
        if (body.length != 0 && body[0]["State"] == "National" && body[0]["Position"] == "U.S. Representative") {
            nationalBodies.push(body);
        } else if (body.length != 0 && body[0]["State"] == "National" && body[0]["Position"] == "U.S. Senator") {
            nationalBodies.push(body);
        }
    }

    for (var j=0;j<nationalBodies.length;j++) {

        let html = "<a class='election-link national-link-" + (j + 1) + "' href=''><div class='prediction-card election-card purple national-election-" + (j + 1) + "'><h1></h1><h3><span class='blue'></span> - <span class='red'></span></h3><p class='no-margin'>Most likely seats</p><p class='gray'>Click for more details</p></div></a>";
        $(appendLocation).append(html);

        let body = nationalBodies[j];
        console.log(body);

        var rep = {};
        var dem = {};

        for (party of body) {
            if (party.Party == "REP") {
                rep = party;
            } else if (party.Party == "DEM") {
                dem = party;
            }
        }
        
        let demSeats = Math.round(dem["Predicted Seats"]);
        let repSeats = Math.round(rep["Predicted Seats"]);

        let className = ".national-election-" + (j + 1);
        let classNameLink = ".national-link-" + (j + 1);
        let titleEle = $(className + " h1");
        let seatsEle = $(className + " h3");
        let linkEle = $(classNameLink);

        let href = "";
        
        let difference = Number.parseFloat(dem["Predicted Majority Win Probability"]) - Number.parseFloat(rep["Predicted Majority Win Probability"]);
        
        if (difference > 0.95) {
            $(className).removeClass("purple");
            $(className).addClass("solid-blue");
        } else if (difference > 0.7) {
            $(className).removeClass("purple");
            $(className).addClass("likely-blue");
        } else if (difference > 0.3) {
            $(className).removeClass("purple");
            $(className).addClass("lean-blue");
        } else if (difference < -0.95) {
            $(className).removeClass("purple");
            $(className).addClass("solid-red");
        } else if (difference < -0.7) {
            $(className).removeClass("purple");
            $(className).addClass("likely-red");
        } else if (difference < -0.3) {
            $(className).removeClass("purple");
            $(className).addClass("lean-red");
        }

        var title = "";
        console.log(body[0].Position);
        switch(body[0].Position) {
            case "U.S. Senator":
                title = "U.S. Senate";
                href = "predictions_senate.html";
                break;
            case "U.S. Representative":
                title = "U.S. House";
                href = "predictions_house.html";
                break;
        }
        titleEle.text(title);
        linkEle.attr("href", href);

        let seatsHTML = "<span class='blue'>" + demSeats + "</span> - <span class='red'>" + repSeats + "<span>";
        seatsEle.html(seatsHTML);

    }


}

function setupTopElections(numElections, types) {
    var topBodies = [];

    for (body of allOverallData) {

        if (body.length != 0 ) {
            var isCorrectType = false
            for (type of types) {
                if (body[0]["Position"] == type) {
                    isCorrectType = true;
                }
            }
            if (!isCorrectType) {
                continue;
            }
            
            var demPercentage = 100;
            var repPercentage = 0;

            for (party of body) {
                if (party.Party == "REP") {
                    repPercentage = party["Predicted Majority Win Probability"];
                } else if (party.Party == "DEM") {
                    demPercentage = party["Predicted Majority Win Probability"];
                }
            }
            let differenceNoAbs = demPercentage - repPercentage;
            let difference = Math.abs(differenceNoAbs);
            body.push({"difference": differenceNoAbs});

            if (topBodies.length < numElections) {
                topBodies.push(body);
            } else {
                let highestDifference = 0;
                let highestDifferenceIndex = 0;

                for (var i=0;i<topBodies.length;i++) {
                    let topBody = topBodies[i];

                    var topDemPercentage = 100;
                    var topRepPercentage = 0;

                    for (topParty of topBody) {
                        if (topParty.Party == "REP") {
                            topRepPercentage = topParty["Predicted Majority Win Probability"];
                        } else if (topParty.Party == "DEM") {
                            topDemPercentage = topParty["Predicted Majority Win Probability"];

                        }
                    }
                    let topDifference = Math.abs(topDemPercentage - topRepPercentage);

                    if (topDifference > highestDifference) {
                        highestDifference = topDifference;
                        highestDifferenceIndex = i;
                    }
                }

                if (difference < highestDifference) {
                    topBodies.splice(highestDifferenceIndex, 1);
                    topBodies.push(body);
                }
            }

        }
    }
    for (var j=0;j<topBodies.length;j++) {

        let html = "<a class='election-link election-link-" + (j + 1) + "' href=''><div class='prediction-card election-card purple tight-election-" + (j + 1) + "'><h1></h1><h3><span class='blue'></span> - <span class='red'></span></h3><p class='no-margin'>Most likely seats</p><p class='gray'>Click for more details</p></div></a>";
        $(".tight-elections").append(html);

        let body = topBodies[j];

        var rep = {};
        var dem = {};

        for (party of body) {
            if (party.Party == "REP") {
                rep = party;
            } else if (party.Party == "DEM") {
                dem = party;
            }
        }

        let demSeats = Math.round(dem["Predicted Seats"]);
        let repSeats = Math.round(rep["Predicted Seats"]);

        let className = ".tight-election-" + (j + 1);
        let classNameLink = ".election-link-" + (j + 1);
        let titleEle = $(className + " h1");
        let seatsEle = $(className + " h3");
        let linkEle = $(classNameLink);

        let state = body[0].State;

        let href = "";
        
        let difference = body[body.length - 1].difference;
        
        if (difference > 0.95) {
            $(className).removeClass("purple");
            $(className).addClass("solid-blue");
        } else if (difference > 0.7) {
            $(className).removeClass("purple");
            $(className).addClass("likely-blue");
        } else if (difference > 0.4) {
            $(className).removeClass("purple");
            $(className).addClass("lean-blue");
        } else if (difference < -0.95) {
            $(className).removeClass("purple");
            $(className).addClass("solid-red");
        } else if (difference < -0.7) {
            $(className).removeClass("purple");
            $(className).addClass("likely-red");
        } else if (difference < -0.4) {
            $(className).removeClass("purple");
            $(className).addClass("lean-red");
        }

        var title = "";
        let stateName = convertStateName(state);
        switch(body[0].Position) {
            case "State Senator":
                title = stateName + " Senate";
                href = "predictions_state_senates.html?state=" + state;
                break;
            case "State Representative":
                title = stateName + " House";
                href = "predictions_state_houses.html?state=" + state;
                break;
        }
        titleEle.text(title);
        linkEle.attr("href", href);

        let seatsHTML = "<span class='blue'>" + demSeats + "</span> - <span class='red'>" + repSeats + "<span>";
        seatsEle.html(seatsHTML);

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
        overallTitle = "<h2 id='overall-title'>Our Projection for the " + state + " Senate</h2>";
    } else if (type == "State Representative") {
        title = state + " " + lowerBody;
        overallTitle = "<h2 id='overall-title'>Our Projection for the " + state + " " + lowerBody + "</h2>";
    } else if (type == "Governor") {
        title = "Governors Offices";
        overallTitle = "<h2 id='overall-title'>Our Projection for U.S. Governors Races</h2>";
    } else if (type == "U.S. Senator") {
        title = "U.S. Senator";
        overallTitle = "<h2 id='overall-title'>Our Projection for the U.S. Senate</h2>";
    } else {
        title = "U.S. Representative";
        overallTitle = "<h2 id='overall-title'>Our Projection for the U.S. House</h2>";
    }
    overall.append(overallTitle);
    let titleElement = $("#overall-title");

    //Sort all matchups
    currentAllMatchups.sort(function(a,b) {
        let index1 = Number.parseInt(a["district"]);
        let index2 = Number.parseInt(b["district"]);
        return (index1 > index2) ? 1 : -1;
    });

    //Get districts with no election this year
    var currentSeatsRepNumber = 0;
    var currentSeatsDemNumber = 0;

    if (type == "U.S. Representative") {
        currentSeatsRepNumber = 240;
        currentSeatsDemNumber = 195;
    } else {
        var currentSeatsDem = [];
        var currentSeatsRep = [];
        for (district of currentAllCandidates) {
            if (district.Position == type && district["Next Election"] != 2018) {
                currentDistrictsNoElection.push(district);
            }
            if (district.Position == type && district["Party"] == "REP") {
                currentSeatsRep.push(district);
            } else if (district.Position == type && district["Party"] == "DEM") {
                currentSeatsDem.push(district);
            }
        }
        currentSeatsRepNumber = currentSeatsRep.length;
        currentSeatsDemNumber = currentSeatsDem.length;
    }

    let totalPercentagesDiv = createDivWithClass("total-percentages");
    overall.append(totalPercentagesDiv);
    let totalPercentages = $(".total-percentages");

    let demPercentagesDiv = createDivWithClass("dem-percentages");
    totalPercentages.append(demPercentagesDiv);
    let demPercentages = $(".dem-percentages");

    let repPercentagesDiv = createDivWithClass("rep-percentages");
    totalPercentages.append(repPercentagesDiv);
    let repPercentages = $(".rep-percentages");

    var totalSeats;
    let seatsDem = Math.round(currentOverallData["DEM"]["Predicted Seats"]);
    let seatsRep = Math.round(currentOverallData["REP"]["Predicted Seats"]);

    if (type == "U.S. Representative") {
        totalSeats = 435;
    } else if (type == "U.S. Senator") {
        totalSeats = 100;
    } else {
        totalSeats = currentOverallData["Total Seats"];
    }

    if (seatsDem + seatsRep != totalSeats) {
        if (currentOverallData["DEM"]["Predicted Seats"] - seatsDem > currentOverallData["REP"]["Predicted Seats"] - seatsRep) {
            seatsDem += 1;
        } else {
            seatsRep += 1;
        }
    }
    
    let seatGainRep = seatsRep - currentSeatsRepNumber;
    let seatGainDem = seatsDem - currentSeatsDemNumber;

    var seatGainColor = "";
    var seatGainString = "";
    var seatString = "Seats";

    if (seatGainDem > 0) {
        seatGainString = "D+" + seatGainDem;
        seatGainColor = "blue";

        if (Math.abs(seatGainDem) == 1) {
            seatString = "Seat";
        }
    } else if (seatGainRep > 0) {
        seatGainString = "R+" + seatGainRep;
        seatGainColor = "red";

        if (Math.abs(seatGainRep) == 1) {
            seatString = "Seat";
        }
    } else {
        seatGainString = "No Change";
        seatString = "";
        seatGainColor = "gray";
    }

    seatGainP = "<p class='medium-p' id='most-likely-change'>Expected seat gain</p>";
    titleElement.after(seatGainP);

    seatGainH = "<h2 class='medium-h2 " + seatGainColor + "'>" + seatGainString + " " + seatString + "</h2>";
    titleElement.after(seatGainH);

    let majorityChanceDem = (Number.parseFloat(currentOverallData["DEM"]["Predicted Majority Win Probability"]) * 100).toFixed(1);
    let majorityChanceRep = (Number.parseFloat(currentOverallData["REP"]["Predicted Majority Win Probability"]) * 100).toFixed(1);

    var majChanceDemStr = String(majorityChanceDem);
    var majChanceRepStr = String(majorityChanceRep);

    if (majorityChanceDem <= 0.001) {
        majChanceDemStr = "<0.1";
    } else if (majorityChanceDem >= 99.8) {
        majChanceDemStr = ">99.9";
    }
    if (majorityChanceRep <= 0.001) {
        majChanceRepStr = "<0.1";
    } else if (majorityChanceRep >= 99.8) {
        majChanceRepStr = ">99.9";
    }

    majorityChanceDemH = "<h2 class='blue'>" + majChanceDemStr + "%</h2>";
    majorityChanceRepH = "<h2 class='red'>" + majChanceRepStr + "%</h2>";
    demPercentages.append(majorityChanceDemH);
    repPercentages.append(majorityChanceRepH);

    var demWinLanguage = "win";
    var repWinLanguage = "win";
    console.log("current seats");
    console.log(currentSeatsDemNumber);
    console.log(currentSeatsRepNumber);

    if (currentSeatsDemNumber > currentSeatsRepNumber) {
        demWinLanguage = "keep";
    } else if (currentSeatsDemNumber < currentSeatsRepNumber) {
        repWinLanguage = "keep";
    }

    let chanceDemP = "<p>Chance <span class='blue'>Democrats</span> " + demWinLanguage + " control</p>";
    let chanceRepP = "<p>Chance <span class='red'>Republicans</span> " + repWinLanguage + " control</p>";
    demPercentages.append(chanceDemP);
    repPercentages.append(chanceRepP);

    //
    let supermajorityChanceDem = (Number.parseFloat(currentOverallData["DEM"]["Predicted Supermajority Win Probability"]) * 100).toFixed(1);
    let supermajorityChanceRep = (Number.parseFloat(currentOverallData["REP"]["Predicted Supermajority Win Probability"]) * 100).toFixed(1);

    var supermajChanceDemStr = String(supermajorityChanceDem);
    var supermajChanceRepStr = String(supermajorityChanceRep);

    if (supermajorityChanceDem <= 0.1) {
        supermajChanceDemStr = "<0.1";
    } else if (supermajorityChanceDem >= 99.8) {
        supermajChanceDemStr = ">99.9";
    }
    if (supermajorityChanceRep <= 0.1) {
        supermajChanceRepStr = "<0.1";
    } else if (supermajorityChanceRep >= 99.8) {
        supermajChanceRepStr = ">99.9";
    }

    supermajorityChanceDemH = "<h2 class='blue'>" + supermajChanceDemStr + "%</h2>";
    supermajorityChanceRepH = "<h2 class='red'>" + supermajChanceRepStr + "%</h2>";
    demPercentages.append(supermajorityChanceDemH);
    repPercentages.append(supermajorityChanceRepH);

    let superchanceDemP = "<p>Chance of <span class='blue'>supermajority</span></p>";
    let superchanceRepP = "<p>Chance of <span class='red'>supermajority</span></p>";
    demPercentages.append(superchanceDemP);
    repPercentages.append(superchanceRepP);

    let squaresSectionDiv = createDivWithClass("squares-section");
    titleElement.after(squaresSectionDiv);
    let squaresSection = $(".squares-section");

    let seatsUp = currentOverallData["Seats Up for Election"];
    var seatsUpP;
    if (totalSeats == seatsUp) {
        seatsUpP = "<p><b>All " + seatsUp + " seats up for election</b></p>";
    } else {
        seatsUpP = "<p><b>" + seatsUp + " out of " + totalSeats + " seats up for election</b></p>";
    }
    squaresSection.append(seatsUpP);

    let instructionsP = "<p class='gray' id='instructions'>Hover/tap for details</p>";
    squaresSection.append(instructionsP);

    let squaresDiv = createDivWithClass("squares");
    squaresSection.append(squaresDiv);
    let squares = $(".squares");

    seatsP = "<p class='big-p' id='most-likely-change'>Most likely outcome</p>";
    titleElement.after(seatsP);

    seatsH = "<h2 class='big-h2'><span class='blue'>" + seatsDem + "</span> - <span class='red'>" + seatsRep + "</span></h2>";
    titleElement.after(seatsH);
    
    let total = totalSeats;
    var rows = 1;
    console.log(total);
    if (total >= 300) {
        rows = 12;
    } else if (total >= 200) {
        if (total % 6 == 0) {
            rows = 6;
        } else if (total % 8 == 0) {
            rows = 8;
        } else {
            rows = 7;
        }
    } else if (total >= 150) {
        if (total % 5 == 0) {
            rows = 5;
        } else if (total % 7 == 0) {
            rows = 7;
        } else {
            rows = 6;
        }
    } else if (total >= 70) {
        rows = 5;
    } else if (total >= 50) {
        rows = 4;
    } else if (total >= 36) {
        rows = 3;
    } else if (total >= 8) {
        rows = 2;
    }

    if (total % rows == 1 && rows != 1) {
        rows -= 1;
    }

    let columns = Math.ceil(total/rows);
    let minWidth = (columns * 25) + 50;

    if (minWidth > 850) {
        rows += 1;
    }

    if (total % rows == 1 && rows != 1) {
        rows += 1;
    }

    let height = rows * 25;
    let heightStr = height + "px";
    squares.css("height", heightStr);

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

    if (window.innerWidth < minWidth) {
        let horizNumSquares = Math.floor(window.innerWidth/27);
        let verticalNumSqares = Math.ceil(total/horizNumSquares);
        let height = verticalNumSqares * 25;
        squares.css("height", height + "px");
    }

    let triangle = "<img id='even-triangle' src='caret-arrow-up.svg' />";
    squaresSection.append(triangle);

    let even = "<p id='even'>Even</p>"
    squaresSection.append(even);

    /*
    let upperEndDem = Math.round(currentOverallData["DEM"]["Upper-End Predicted Seats"]);
    let upperEndRep = Math.round(currentOverallData["REP"]["Upper-End Predicted Seats"]);

    let lowerEndDem = totalSeats - upperEndRep;// Math.round(currentOverallData["DEM"]["Lower-End Predicted Seats"]);
    let lowerEndRep = totalSeats - upperEndDem;// Math.round(currentOverallData["REP"]["Lower-End Predicted Seats"]);

    let mostLikelyP = "<p><b>Most likely outcome:</b><p>";
    overall.append(mostLikelyP);

    let predictedSeatsP = "<p><span class='blue'>Democrats: " + seatsDem + " seats</span> vs. <span class='red'>Republicans: " + seatsRep + " seats</span></p>";
    overall.append(predictedSeatsP);

    let divUpperLower = createDivWithClass("upper-lower");
    overall.append(divUpperLower);
    let upperLower = $(".upper-lower");

    let divUpperDem =  createDivWithClass("upper-lower-column-left");
    let divUpperRep = createDivWithClass("upper-lower-column-right");

    upperLower.append(divUpperDem);
    upperLower.append(divUpperRep);

    let upperDemP = "<p><b>Upper-end for Democrats</b><p>";
    $(".upper-lower-column-left").append(upperDemP);

    let upperDemPredictedP = "<p><span class='blue'>" + upperEndDem + " seats</span> vs. <span class='red'>" + lowerEndRep + " seats</span></p>";
    $(".upper-lower-column-left").append(upperDemPredictedP);

    let upperRepP = "<p><b>Upper-end for Republicans</b><p>";
    $(".upper-lower-column-right").append(upperRepP);

    let upperRepPredictedP = "<p><span class='blue'>" + lowerEndDem + " seats</span> vs. <span class='red'>" + upperEndRep + " seats</span></p>";
    $(".upper-lower-column-right").append(upperRepPredictedP);
    */
    overall.append("<hr>");

    
    $(".seat-square").hover(function (event) {
        var rect = $(this).get(0).getBoundingClientRect();

        var left = rect.x + 15;
        var right = left - 40 - 300;
        var top = rect.top - 150;

        if (window.innerWidth < 550 && isTouchDevice) {
            top = (window.innerHeight - 275)/2;
            left = (window.innerWidth - (300 + window.innerWidth * 0.05))/2;
            right = (window.innerWidth - (300 + window.innerWidth * 0.05))/2;
        }

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

function is_touch_device() {
    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    var mq = function(query) {
      return window.matchMedia(query).matches;
    }
  
    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
      return true;
    }
  
    // include the 'heartz' as a way to have a non matching MQ to help terminate the join
    // https://git.io/vznFH
    var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
  }