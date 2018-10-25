//var data = iowa.data;
var numCards = 0;
var hasTableBeenInitialized = false;

$(document).ready(function() {
    console.log("JS Predictions Script Loaded");
});


function getMatchup(data, state, position, district) {
    var matchup = {};
    var matchupFound = false;
    matchup["money"] = 100;
    matchup["competetiveness"] = 1;

    let allCandidates = data[state];
    //console.log(allCandidates.length + " candidates in state " + state);

    for (var i=0; i<allCandidates.length; i++) {
        let candidate = allCandidates[i];
        if (matchupFound && candidate.District != String(district)) {
            //console.log("break after " + i + " loops");
            break;
        }
        if (candidate.State == state && candidate.District == String(district) && candidate.Position == position) {
            matchupFound = true;
            var party = candidate.Party;
            var spaces = candidate.Candidate.split(" ").length - 1;
            if (spaces > 1) {
                var tmp = candidate.Candidate.split(" ");
                candidate.Candidate = tmp[0] + " " + tmp[tmp.length-1];;
            }
            matchup[party] = candidate;
            matchup["money"] += candidate["Total Money"];
        }
    }

    var noElection = false;

    if (Object.keys(matchup).length == 2) { //No election found in our data set (JSON file), only keys are "money" and "competetiveness"
        noElection = true;
    } else if (matchup["DEM"] == null) {
        matchup["DEM"] = {
            "State": state,
            "Position": position,
            "District": district,
            "Candidate": "Uncontested",
            "Party": "DEM",
            "Predicted Vote Share": 0,
            "Predicted Win Probability": "0%"
        }
    } else if (matchup["REP"] == null) {
        matchup["REP"] = {
            "State": state,
            "Position": position,
            "District": district,
            "Candidate": "Uncontested",
            "Party": "REP",
            "Predicted Vote Share": 0,
            "Predicted Win Probability": "0%"
        }
    } else {
        matchup["competetiveness"] = Math.abs(matchup["DEM"]["Predicted Vote Share"] - matchup["REP"]["Predicted Vote Share"]);
    }

    //U.S. House, Georgia District 12
    //U.S. Senate, Georgia
    //Georgia House, District 9
    //Georgia Senate, District 40
    //Georgia Governor
    let stateName = convertStateName(state);
    switch (position) {
        case "U.S. Representative":
            matchup["title"] = "U.S. House, " + stateName + " District " + district;
            break;
        case "U.S. Senator":
            matchup["title"] = "U.S. Senate, " + stateName;
            break;
        case "State Representative":
        let officeName = getLowerBodyName(state);
            matchup["title"] = stateName + " " + officeName + ", District " + district;
            break;
        case "State Senator":
            matchup["title"] = stateName + " Senate" + ", District " + district;
            break;
        case "Secretary Of State":
            matchup["title"] = stateName + " Secretary of State";
            break;
        default:
            matchup["title"] = stateName + " " + position;
            break;
    }

    if (noElection) {
        matchup = {};
    }

    return matchup;
}

function evaluatePredictionColor(predictionDem, predictionRep) {
    var color = ""
    let difference = predictionDem - predictionRep;

    if (difference > 0.80) {
        color = "solid-blue";
    } else if (difference > 0.3) {
        color = "likely-blue";
    } else if (difference > 0.1) {
        color = "lean-blue";
    } else if (difference >= -0.1) {
        color = "purple";
    } else if (difference >= -0.3) {
        color = "lean-red";
    } else if (difference >= -0.8) {
        color = "likely-red";
    } else {
        color = "solid-red";
    }

    return color;
}

function evaluatePredictionDescription(predictionDem, predictionRep) {
    var description = ""
    let difference = predictionDem - predictionRep;

    if (difference > 0.8) {
        description = "SOLID D";
    } else if (difference > 0.3) {
        description = "LIKELY D";
    } else if (difference > 0.1) {
        description = "LEAN D";
    } else if (difference >= -0.1) {
        description = "TOSS-UP";
    } else if (difference >= -0.3) {
        description = "LEAN R";
    } else if (difference >= -0.8) {
        description = "LIKELY R";
    } else {
        description = "SOLID R";
    }

    return description;
}

function createCard(matchup, appendLocation = ".main-section") {

    actualCardNumber = numCards + 1;

    var dem = matchup["DEM"];
    var rep = matchup["REP"];
    let third = {
        "Predicted Vote Share":0,
        "Predicted Win Probability": "0%",
        "Candidate":""
    };
    if (matchup.hasOwnProperty("LIB")) {
        third = matchup["LIB"];
    } else if (matchup.hasOwnProperty("IND")) {
        third = matchup["IND"];
    }

    var predictionDem = dem["Predicted Vote Share"];
    var predictionRep = rep["Predicted Vote Share"];
    var predictionThird = third["Predicted Vote Share"];

    var percentDem = Number((predictionDem * 100).toFixed(1));
    var percentRep = Number((predictionRep * 100).toFixed(1));
    var percentThird = Number((predictionThird * 100).toFixed(1));

    var probabilityDem = dem["Predicted Win Probability"] + "%";
    var probabilityRep = rep["Predicted Win Probability"] + "%";
    var probabilityThird = third["Predicted Win Probability"] + "%";
    
    var title = matchup["title"];
    var cardID = "card" + actualCardNumber;

    //Create card
    var color = "";
    color = evaluatePredictionColor(predictionDem, predictionRep);
    var className = "prediction-card " + color;

    let cardCreate = $('<div />', {
        "class": className,
        "id": cardID,
        click: function(e){
            e.preventDefault();
            //$("#card1").toggleClass("hidden");
            //$("#card1").children().toggle();
    }})

    $(appendLocation).append(cardCreate);
    numCards++;

    //Add elements to card
    let card = $("#" + cardID);

    let titleH1 = $("<h1 />").text(title);
    card.append(titleH1);

    projectionDescription = evaluatePredictionDescription(predictionDem, predictionRep);
    let projectionDescriptionP = $("<h2 />").text(projectionDescription);
    card.append(projectionDescriptionP);

    let candidatesP = "<p class='bold'><span class='blue'>" + dem.Candidate + " </span> vs <span class='red'>" + rep.Candidate + "</span></p>";
    let probabilitiesP = "<p class='number' id='vote-share'> <span class='blue'>" + probabilityDem + " (D)</span> vs <span class='red'>" + probabilityRep + " (R)</span>";

    if (percentThird > 4 && percentDem < 0.01) {
        let partyThird = " (" + third.Party + ")";
        candidatesP = "<p> <span class='yellow'>" + third.Candidate + partyThird + "</span> vs <span class='red'>" + rep.Candidate + "</span> </p>";
        probabilitiesP = "<p class='number' id='vote-share'> <span class='yellow'>" + probabilityThird + " " + partyThird + "</span> vs <span class='red'>" + probabilityRep + " (R)</span> </p>";
    } else if (percentThird > 4 && percentRep < 0.01) {
        let partyThird = " (" + third.Party + ")";
        candidatesP = "<p> <span class='blue'>" + dem.Candidate + " </span> vs <span class='yellow'>" + third.Candidate + partyThird + "</span> </p>";
        probabilitiesP = "<p class='number' id='vote-share'> <span class='blue'>" + probabilityDem + " (D)</span> vs <span class='yellow'>" + probabilityThird + " " + partyThird + "</span> </p>";
    
    }

    card.append(candidatesP);

    let voteShareDescriptionP = $("<p />").text("Projected vote share:");
    card.append(voteShareDescriptionP);

    let chart = createProjectionChart(matchup);
    card.append(chart);

    let probabilityDescriptionP = $("<p />").text("Win probabilities:");
    card.append(probabilityDescriptionP);    

    card.append(probabilitiesP);

}

function createProjectionChart(matchup) {
    var dem = matchup["DEM"];
    var rep = matchup["REP"];
    var third = {
        "Predicted Vote Share": 0,
    };
    if (matchup.hasOwnProperty("LIB")) {
        third = matchup["LIB"];
    } else if (matchup.hasOwnProperty("IND")) {
        third = matchup["IND"];
    }

    var predictionDem = dem["Predicted Vote Share"];
    var predictionRep = rep["Predicted Vote Share"];
    var predictionThird = third["Predicted Vote Share"];

    var percentDem = Number((predictionDem * 100).toFixed(1));
    var percentRep = Number((predictionRep * 100).toFixed(1));
    var percentThird = Number((predictionThird * 100).toFixed(1));

    var lengthDem = predictionDem * 200;
    var lengthRep = predictionRep * 200;
    var lengthThird = predictionThird * 200;

    var pillDem = "";
    var pillRep = "";
    
    if (percentDem < 0.01 && percentThird < 0.01) {
        pillDem = "<div class='pill-none' style='width:" + lengthDem + "px'> <p class='number'>" + percentDem + "%</p> </div>";
        pillRep = "<div class='pill-right pill-full' style='width:" + lengthRep + "px'> <p class='number'>" + percentRep + "%</p> </div>";
    } else if (percentRep < 0.01 && percentThird < 0.01) {
        pillDem = "<div class='pill-left pill-full' style='width:" + lengthDem + "px'> <p class='number'>" + percentDem + "%</p> </div>";
        pillRep = "<div class='pill-none' style='width:" + lengthRep + "px'> <p class='number'>" + percentRep + "%</p> </div>";
    } else {
        pillDem = "<div class='pill-left' style='width:" + lengthDem + "px'> <p class='number'>" + percentDem + "%</p> </div>";
        pillRep = "<div class='pill-right' style='width:" + lengthRep + "px'> <p class='number'>" + percentRep + "%</p> </div>";
    }
    var pillThird = "";
    
    if (percentThird > 4 && percentDem < 0.01) {
        pillThird = "<div title='" + third.Candidate + " (" + third.Party + "): " + percentThird + "%' class='pill-third pill-third-left' style='width:" + lengthThird + "px'> </div>";
        pillDem = "<div class='pill-none' style='width:" + lengthDem + "px'> <p class='number'>" + percentDem + "%</p> </div>";
    } else if (percentThird > 4 && percentRep < 0.01) {
        pillThird = "<div title='" + third.Candidate + " (" + third.Party + "): " + percentThird + "%' class='pill-third pill-third-right' style='width:" + lengthThird + "px'> </div>";
        pillRep = "<div class='pill-none' style='width:" + lengthRep + "px'> <p class='number'>" + percentRep + "%</p> </div>";
    } else if (percentThird > 4) {
        pillThird = "<div title='" + third.Candidate + " (" + third.Party + "): " + percentThird + "%' class='pill-third' style='width:" + lengthThird + "px'> </div>";
    }

    return pillDem + pillThird + pillRep;

}

function getNearbyElections() {
    // we start the request, to ask the position of the client
    // we will pass geolocationReturnedCoordinates as the success callback
    console.log("get user's location");
    navigator.geolocation.getCurrentPosition(geolocationReturnedCoordinates, getPositionError, null);
}

function getPositionError(err) {
    //console.warn("ERROR: " + err.code + ": " +  err.message);

    $(".loading-location").remove();

    let errorP = "<p id='error-p'>Error getting your location. Enter your address below to view elections near you.</p>";
    $(".main-section").append(errorP);

    let input = "<input type='text' id='address-input' placeholder='Street, City, State, and Zip'></input>";
    $(".main-section").append(input);

    let submit = "<div id='submit-address-button' class='button'>Submit</div>";
    $(".main-section").append(submit);
    $("#submit-address-button").on("click", submitAddress);

}

function submitAddress() {
    let address = $("#address-input").val();
    console.log("Submit Address " + address);
    geolocationAddress(address);
}

function geolocationAddress(address) {
    let googleQuery = googleVoterQuery(address, 6000);

    if ("error" in googleQuery) {
        $("#error-p").text("Error. Please enter a valid address.")
        $("#error-p").addClass("red");
    } else {
        $("#error-p").remove();
        $("#address-input").remove();
        $("#submit-address-button").remove();
        getNearbyMatchupsGoogle(googleQuery);

    }

}

function geolocationReturnedCoordinates(coordinates) {
    let lat = 41.522498;//coordinates.coords.latitude;
    let lng = -93.6464809;//coordinates.coords.longitude;

    let accessToken = "pk.eyJ1Ijoibm9haGNvdmV5IiwiYSI6ImNqbmZkMHJqZzZqZTAzcW4xbTR3djl6aGYifQ.hPSA1Bktf28eHwPcbQ9e4g";

    let url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + lng + "," + lat + ".json?access_token=" + accessToken;
    //console.log(url);
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    xmlHttp.send( null );
    var responseText = xmlHttp.responseText;
    var response = JSON.parse(responseText);
    //console.log(response);

    let address = response.features[0].place_name;
    let numbers = address.match(/\d+/);
    let firstNumbers = parseInt(numbers[0], 10);
    let index = address.indexOf(firstNumbers);
    let address_normalized = address.substring(index);
    //console.log(address_normalized);

    let googleQuery = googleVoterQuery(address_normalized, 6000);
    //let openstatesQuery = openstatesVoterQuery(lat, lng);

    if ("error" in googleQuery) {
        $(".loading-location").remove();
        getPositionError();
    } else {
        $(".loading-location").remove();
        getNearbyMatchupsGoogle(googleQuery);

    }
    //getNearbyMatchupsState(openstatesQuery);
}

function googleVoterQuery(address, electionId) {
    var apiKey = "AIzaSyAhC1y0Vc09spgiF1KYdUJwag71TGitZgc";
    var url = "https://www.googleapis.com/civicinfo/v2/voterinfo?address=" + address + "&electionId=" + electionId + "&key=" + apiKey;

    var xmlReq = new XMLHttpRequest();
    xmlReq.open( "GET", url, false ); // false for synchronous request
    xmlReq.send( null );
    var responseText = xmlReq.responseText;
    var responseObject = JSON.parse(responseText);

    console.log("Here is the response object from the Google Voter Info Query:");
    console.log(responseObject);

    return responseObject;
}

function getNearbyMatchupsGoogle(civicAPIObject) {
    let applicablePositions = ["U.S. Representative", "U.S. Senator", "Governor", "Secretary Of State", "Attorney General", "Lieutenant Governor", "State Representative", "State Senator"];

    let contests = civicAPIObject.contests;
    let state = civicAPIObject.normalizedInput.state;

    var nearbyMatchups = [];

    for (contest of contests) {
        var matchup;
        if (contest.type != "Referendum") {
            matchup = new MatchupGoogle(contest, state);
        }
        if (applicablePositions.includes(matchup.position)) {
            nearbyMatchups.push(matchup);
        }
    }

    for (contest of nearbyMatchups) {
        if (contest.Position == "Lieutenant Governor") {
            console.log("lg");
            console.log(contest);
        }
        var matchup = getMatchup(data, contest.state, contest.position, contest.district);
        if (!jQuery.isEmptyObject(matchup)) {
            console.log("Create card for local matchup");
            console.log(contest);
            console.log(matchup);
            createCard(matchup);
        }
    }
}

//Configure the matchup from Google Civic API Voter Query
class MatchupGoogle {
    constructor(contest, state) {
        if (state.length > 2) {
            this.state = convertStateName(state);
        } else {
            this.state = state;
        }

        if ((contest.office.includes("Governor") || contest.office.includes("Attorney General") || contest.office.includes("Lieutenant Governor")) && contest.office.length > 8) {
            this.position = contest.office.substring(3);
        } else if (contest.office.includes("Secretary of State")) {
            this.position = "Secretary Of State";
        } else {
            this.position = contest.office;
        }
        this.district = (contest.district.id != null) ? contest.district.id : "0";
    }
}

//Create a row in the table of all races
function createTableRow(matchup, rowsList) {
    
    let dem = matchup["DEM"];
    let rep = matchup["REP"];
    let third = {
        "Predicted Vote Share":0,
        "Predicted Win Probability": "0",
        "Candidate":""
    };
    if (matchup.hasOwnProperty("LIB")) {
        third = matchup["LIB"];
    } else if (matchup.hasOwnProperty("IND")) {
        third = matchup["IND"];
    }

    var predictionDem = dem["Predicted Vote Share"];
    var predictionRep = rep["Predicted Vote Share"];
    var predictionThird = third["Predicted Vote Share"];

    var probabilityDem = dem["Predicted Win Probability"] + "%";
    var probabilityRep = rep["Predicted Win Probability"] + "%";
    var probabilityThird = third["Predicted Win Probability"] + "%";

    var s = dem.State;
    var candidateDem = dem.Candidate;
    var candidateRep = rep.Candidate;
    var candidateThird = third.Candidate;

    let percentDem = Number((predictionDem * 100).toFixed(1));
    let percentRep = Number((predictionRep * 100).toFixed(1));
    let percentThird = Number((predictionThird * 100).toFixed(1));
    
    let state = "<p>" + s + "</p>";
    let race = "<p>" + matchup["title"] + "</p>";
    var candidates = "<p> <span class='blue'>" + candidateDem + " (D)</span> vs <span class='red'>" + candidateRep + " (R)</span> </p>";
    let projectionChart = createProjectionChart(matchup);
    var probabilities = "<p class='number'> <span class='blue'>" + probabilityDem + " (D)</span> vs <span class='red'>" + probabilityRep + " (R)</span> </p>";

    if (percentThird > 4 && percentDem < 0.01) {
        let partyThird = " (" + third.Party + ")";
        candiates = "<p> <span class='yellow'>" + candidateThird + partyThird + "</span> vs <span class='red'>" + candidateRep + " (R)</span> </p>";
        probabilities = "<p class='number'> <span class='yellow'>" + probabilityThird + " " + partyThird + "</span> vs <span class='red'>" + probabilityRep + " (R)</span> </p>";

    } else if (percentThird > 4 && percentRep < 0.01) {
        let partyThird = " (" + third.Party + ")";
        candidates = "<p> <span class='blue'>" + candidateDem + " (D)</span> vs <span class='yellow'>" + candidateThird + partyThird + "</span> </p>";
        probabilities = "<p class='number'> <span class='blue'>" + probabilityDem + " (D)</span> vs <span class='yellow'>" + probabilityThird + " " + partyThird + "</span> </p>";
    
    }

    let td = "<td>";
    let tdc = "</td>";

    var row = document.createElement("tr");
    let innerHTML = td + state + tdc + td + race + tdc + td + candidates + tdc + td + projectionChart + tdc + td + probabilities + tdc;
    row.innerHTML = innerHTML;
    let html = "<tr>" + innerHTML + "</tr>";

    if (!hasTableBeenInitialized) {
        $("#all-races-table").append(html);
        hasTableBeenInitialized = true;
        $("#all-races-table").DataTable({
            paging: false,
            ordering: true,
            language: {
                searchPlaceholder: "State, position, or candidate",
                info: "Showing _START_ to _END_ of _TOTAL_ races",
                infoFiltered: " - filtered from _MAX_ total races",
                search: "Search:",
                emptyTable:  "No races found"
            },
            columns: [
                null,
                null,
                null,
                {"searchable": false},
                {"searchable": false}
            ]
        });
        

    } else {
        //$("#all-races-table").DataTable().row.add(row);
        rowsList.push(row);
    }


}

/*

function openstatesVoterQuery(latitude, longitude) {
    let apiKey = "f38c7a52-293e-4313-aa69-b89b1253fd38";
    let url = "https://openstates.org/api/v1/legislators/geo/?lat="+ latitude + "&long=" + longitude + "&apikey=" + apiKey;

    var xmlReq = new XMLHttpRequest();
    xmlReq.open( "GET", url, false ); // false for synchronous request
    xmlReq.send( null );
    var responseText = xmlReq.responseText;
    var responseObject = JSON.parse(responseText);

    console.log("Here is the response object from the Google Voter Info Query:");
    console.log(responseObject);

    return responseObject;
}


function getNearbyMatchupsState(openstatesObject) {


    for (contest of openstatesObject) {
        let matchupObj = new MatchupOpenStates(contest);
        var matchup = getMatchup(data, matchupObj.position, matchupObj.district, matchupObj.officeName);
        if (!jQuery.isEmptyObject(matchup)) {
            console.log("Create card for local matchup");
            console.log(matchup);
            createCard(matchup, 1);
        }
    }

}

class MatchupOpenStates {
    constructor(contest, state) {

        let apiKey = "f38c7a52-293e-4313-aa69-b89b1253fd38";
        let url = "openstates.org/api/v1/metadata/" + state + "?apikey=" + apiKey;

        var xmlReq = new XMLHttpRequest();
        xmlReq.open( "GET", url, false ); // false for synchronous request
        xmlReq.send( null );
        var responseText = xmlReq.responseText;
        var responseObject = JSON.parse(responseText);

        let upperName = responseObject.chambers.upper.name;
        let lowerName = responseObject.chambers.lower.name;

        if (contest.chamber == "upper") {
            this.position = "State Senator";
            this.office = upperName;
        } else if (contest.chamber == "lower") {
            this.position = "State Representative";
            this.office = lowerName;
        }

        this.district = contest.district;
    }
}

Deleted: reordering cards
    /*
    if (actualCardNumber <= numCards) {
        console.log("Card being inserted before");
        var previousID = "card" + (actualCardNumber - 1);
        var thisID = "card" + actualCardNumber;
        if (previousID == "card0") {
            $("#" + thisID).before(cardCreate);
        } else {
            $("#" + previousID).after(cardCreate);
        }

        $(".prediction-card").each(function() {
            let id = $(this).attr("id");
            let num = parseInt(id.charAt(4), 10);
            if (num >= actualCardNumber) {
                let newID = "card" + (num + 1);
                $(this).attr("id", newID);
            }
        })
        $("#card").attr("id", "card" + actualCardNumber);

    } else {
        //$("#card").attr("id", "card" + actualCardNumber);
    //}


*/
 





