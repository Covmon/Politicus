//var data = iowa.data;
var numCards = 0;
var hasTableBeenInitialized = false;

$(document).ready(function() {
    console.log("JS Predictions Script Loaded");
});


function getMatchup(data, state, position, district) {
    var matchup = {};
    var matchupFound = false;
    matchup["money"] = 0;
    matchup["competetiveness"] = 1;

    let allCandidates = data[state];
    if (allCandidates == null) {
        return {};
    }
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
            //Format middle names and special names
            if (!candidate.Candidate.includes("Jr.") && !candidate.Candidate.includes("Sr.") && !candidate.Candidate.includes("IV") && !candidate.Candidate.includes("III") && !candidate.Candidate.includes("II") && !candidate.Candidate.includes("I") && !candidate.Candidate.includes("V")) {
                var spaces = candidate.Candidate.split(" ").length - 1;
                if (spaces > 1) {
                    var tmp = candidate.Candidate.split(" ");
                    if (tmp[0].length > 2) {
                        candidate.Candidate = tmp[0] + " " + tmp[tmp.length-1];
                    }
                }
            } else {
                var spaces = candidate.Candidate.split(" ").length - 1;
                if (spaces > 2) {
                    var tmp = candidate.Candidate.split(" ");
                    candidate.Candidate = tmp[0] + " " + tmp[tmp.length-2] + " " + tmp[tmp.length-1];
                }
            }
            matchup["state"] = state;
            matchup["position"] = position;
            matchup["district"] = district;
            matchup[party] = candidate;
            matchup["money"] += candidate["Total Money"];
        }
    }

    var noElection = false;

    if (Object.keys(matchup).length == 2) { //No election found in our data set (JSON file), only keys are "money" and "competetiveness"
        noElection = true;
    } else if (matchup["DEM"] == null) {
        if (Object.keys(matchup).length == 6) {
            matchup["REP"]["Predicted Vote Share"] = 1;
        }
        matchup["DEM"] = {
            "State": state,
            "Position": position,
            "District": district,
            "Candidate": "Uncontested",
            "Party": "DEM",
            "Predicted Vote Share": 0,
            "Predicted Win Probability": "0%"
        }
        matchup["rating"] = "SOLID R";
        matchup["color"] = "solid-red";
        
    } else if (matchup["REP"] == null) {
        if (Object.keys(matchup).length == 6) {
            matchup["DEM"]["Predicted Vote Share"] = 1;
        }
        matchup["REP"] = {
            "State": state,
            "Position": position,
            "District": district,
            "Candidate": "Uncontested",
            "Party": "REP",
            "Predicted Vote Share": 0,
            "Predicted Win Probability": "0%"
        }
        matchup["rating"] = "SOLID D";
        matchup["color"] = "solid-blue";
    } else {
        matchup["competetiveness"] = Math.abs(matchup["DEM"]["Predicted Vote Share"] - matchup["REP"]["Predicted Vote Share"]);
        matchup["color"] = evaluatePredictionColor(matchup["DEM"]["Predicted Win Probability"], matchup["REP"]["Predicted Win Probability"])
        matchup["rating"] = evaluatePredictionDescription(matchup["DEM"]["Predicted Win Probability"], matchup["REP"]["Predicted Win Probability"])
    }

    let stateName = convertStateName(state);
    if (state != "MA") {
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
    } else {
        if (district.includes("And")) {
            let split = district.split("And");
            district = split[0] + "and" + split[1];
        }
        
        for (var k = 1; k < 20; k++) {
            let ordinal1Wrong = k + "St";
            let ordinal2Wrong = k + "Nd";
            let ordinal3Wrong = k + "Rd";
            let ordinal4Wrong = k + "Th";

            let ordinal1 = k + "st";
            let ordinal2 = k + "nd";
            let ordinal3 = k + "rd";
            let ordinal4 = k + "th";

            let ordinalsWrong = [ordinal1Wrong, ordinal2Wrong, ordinal3Wrong, ordinal4Wrong];
            let ordinalsRight = [ordinal1, ordinal2, ordinal3, ordinal4];

            for (var j=0;j<ordinalsWrong.length;j++) {
                let ordinal = ordinalsWrong[j];
                if (district.includes(ordinal)) {
                    let split = district.split(ordinal);
                    district = split[0] + ordinalsRight[j] + split[1];
                }
            }
        }

        switch (position) {
            case "U.S. Representative":
                matchup["title"] = "U.S. House, " + stateName + " " + district;
                break;
            case "U.S. Senator":
                matchup["title"] = "U.S. Senate, " + stateName;
                break;
            case "State Representative":
            let officeName = getLowerBodyName(state);
                matchup["title"] = stateName + " " + officeName + ", " + district;
                break;
            case "State Senator":
                matchup["title"] = stateName + " Senate" + ", " + district;
                break;
            case "Secretary Of State":
                matchup["title"] = stateName + " Secretary of State";
                break;
            default:
                matchup["title"] = stateName + " " + position;
                break;
        }
    }

    if (noElection) {
        matchup = {};
    }

    return matchup;
}

function evaluatePredictionColor(predictionDem, predictionRep) {
    var stringDem = predictionDem;
    var stringRep = predictionRep;

    if (predictionDem.includes(">") || predictionDem.includes("<")) {
        stringDem = predictionDem.substring(2);
    }
    if (predictionRep.includes(">") || predictionRep.includes("<")) {
        stringRep = predictionRep.substring(2);
    }

    let dem = parseFloat(stringDem)/100;
    let rep = parseFloat(stringRep)/100;

    var color = ""
    let difference = dem - rep;

    if (difference > 0.9) {
        color = "solid-blue";
    } else if (difference > 0.5) {
        color = "likely-blue";
    } else if (difference > 0.2) {
        color = "lean-blue";
    } else if (difference >= -0.2) {
        color = "purple";
    } else if (difference >= -0.5) {
        color = "lean-red";
    } else if (difference >= -0.9) {
        color = "likely-red";
    } else {
        color = "solid-red";
    }

    return color;
}

function evaluatePredictionDescription(predictionDem, predictionRep) {

    var stringDem = predictionDem;
    var stringRep = predictionRep;

    if (predictionDem.includes(">") || predictionDem.includes("<")) {
        stringDem = predictionDem.substring(2);
    }
    if (predictionRep.includes(">") || predictionRep.includes("<")) {
        stringRep = predictionRep.substring(2);
    }

    let dem = parseFloat(stringDem)/100;
    let rep = parseFloat(stringRep)/100;

    var description = ""
    let difference = dem - rep;

    if (difference > 0.9) {
        description = "SOLID D";
    } else if (difference > 0.5) {
        description = "LIKELY D";
    } else if (difference > 0.2) {
        description = "LEAN D";
    } else if (difference >= -0.2) {
        description = "TOSS-UP";
    } else if (difference >= -0.5) {
        description = "LEAN R";
    } else if (difference >= -0.9) {
        description = "LIKELY R";
    } else {
        description = "SOLID R";
    }

    return description;
}

function createCardNoElection(districtObj) {

    let stateName = districtObj.State;
    let position = districtObj.Position;
    let district = districtObj.District;

    var title = "";
    switch (position) {
        case "U.S. Representative":
            title = "U.S. House, " + stateName + " District " + district;
            break;
        case "U.S. Senator":
            title = "U.S. Senate, " + stateName;
            break;
        case "State Representative":
        let officeName = getLowerBodyName(state);
            title = stateName + " " + officeName + ", District " + district;
            break;
        case "State Senator":
            title = stateName + " Senate" + ", District " + district;
            break;
        case "Secretary Of State":
            title = stateName + " Secretary of State";
            break;
        default:
            title = stateName + " " + position;
            break;
    }

    let cardID = "card-popup";

    //Create card
    var color = districtObj.color;
    var className = "prediction-card " + color;

    let cardCreate = $('<div />', {
        "class": className,
        "id": cardID,
        click: function(e){
            e.preventDefault();
    }})

    $("body").prepend(cardCreate);

    //Add elements to card
    let card = $("#" + cardID);

    let titleH1 = $("<h1 />").text(title);
    card.append(titleH1);

    projectionDescription = "NO ELECTION";
    let projectionDescriptionP = $("<h2 />").text(projectionDescription);
    card.append(projectionDescriptionP);


    var party = "";
    var candidateColor = "";
    if (districtObj.Party == "DEM") {
        party = "Democrat";
        candidateColor = "blue";
    } else if (districtObj.Party == "REP") {
        party = "Republican";
        candidateColor = "red";
    }

    let candidatesP = "<p style='font-size: 17px' class='bold'><span class='" + candidateColor + "'>" + districtObj.Candidate + "</span></p>";
    card.append(candidatesP);

    let partyP = "<p>" + party + "</p>";
    card.append(partyP);

    let nextElectionsP = "<p class='white'>Next up for election: <span class='number'>" + districtObj["Next Election"] + "</span></p>";
    let termsInOfficeP = "<p class='white'>Terms in office: <span class='number'>" + districtObj["Number of Terms in Position"] + "</span></p>";

    card.append(nextElectionsP);
    card.append(termsInOfficeP);

}

function createCard(matchup, appendLocation = ".main-section", isPopupCard = false) {

    actualCardNumber = numCards + 1;

    var dem = matchup["DEM"];
    var rep = matchup["REP"];
    let third = {
        "Predicted Vote Share":0,
        "Predicted Win Probability": "0%",
        "Candidate":"",
        "Incumbent": "No"
    };
    if (matchup.hasOwnProperty("LIB")) {
        third = matchup["LIB"];
    } else if (matchup.hasOwnProperty("IND")) {
        third = matchup["IND"];
    }

    var incumbentDem = "";
    var incumbentRep = "";
    var incumbentThird = "";

    if (dem.Incumbent == "Yes") {
        incumbentDem = "<span title='Incumbent' class='incumbent'> i</span>";
    } else if (rep.Incumbent == "Yes") {
        incumbentRep = "<span title='Incumbent' class='incumbent'> i</span>";
    } else if (third.Incumbent == "Yes") {
        incumbentThird = "<span title='Incumbent' class='incumbent'> i</span>";
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
    if (isPopupCard) {
        cardID = "card-popup";
    }

    //Create card
    var color = "";
    color = evaluatePredictionColor(dem["Predicted Win Probability"], rep["Predicted Win Probability"]);
    var className = "prediction-card " + color;

    let cardCreate = $('<div />', {
        "class": className,
        "id": cardID,
        click: function(e){
            e.preventDefault();
            //$("#card1").toggleClass("hidden");
            //$("#card1").children().toggle();
    }})
    if (!isPopupCard) {
        $(appendLocation).append(cardCreate);
        numCards++;
    } else {
        $(appendLocation).prepend(cardCreate);
    }

    //Add elements to card
    let card = $("#" + cardID);

    let titleH1 = $("<h1 />").text(title);
    card.append(titleH1);

    projectionDescription = evaluatePredictionDescription(dem["Predicted Win Probability"], rep["Predicted Win Probability"]);
    let projectionDescriptionP = $("<h2 />").text(projectionDescription);
    card.append(projectionDescriptionP);

    let candidatesP = "<p class='bold'><span class='blue'>" + dem.Candidate + incumbentDem + "</span> vs <span class='red'>" + rep.Candidate + incumbentRep + "</span></p>";
    let probabilitiesP = "<p class='number' id='vote-share'> <span class='blue'>" + probabilityDem + " (D)</span> vs <span class='red'>" + probabilityRep + " (R)</span>";

    if (percentThird > 2 && percentDem < 0.01) {
        let partyThird = " (" + third.Party + ")";
        candidatesP = "<p> <span class='yellow'>" + third.Candidate + partyThird + incumbentThird + "</span> vs <span class='red'>" + rep.Candidate + incumbentRep + "</span> </p>";
        probabilitiesP = "<p class='number' id='vote-share'> <span class='yellow'>" + probabilityThird + " " + partyThird + "</span> vs <span class='red'>" + probabilityRep + " (R)</span> </p>";
    } else if (percentThird > 2 && percentRep < 0.01) {
        let partyThird = " (" + third.Party + ")";
        candidatesP = "<p> <span class='blue'>" + dem.Candidate + incumbentDem + " </span> vs <span class='yellow'>" + third.Candidate + partyThird + incumbentThird + "</span> </p>";
        probabilitiesP = "<p class='number' id='vote-share'> <span class='blue'>" + probabilityDem + " (D)</span> vs <span class='yellow'>" + probabilityThird + " " + partyThird + "</span> </p>";
    
    }

    card.append(candidatesP);

    let voteShareDescriptionP = $("<p />").text("Projected vote share:");
    card.append(voteShareDescriptionP);

    let chart = createProjectionChart(matchup);
    card.append(chart);

    let probabilityDescriptionP = $("<p />").text("Chances of Winning:");
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
    
    if (percentDem < 0.01 && percentThird < 2) {
        pillDem = "<div class='pill-none' style='width:" + lengthDem + "px'> <p class='number'>" + percentDem + "%</p> </div>";
        pillRep = "<div class='pill-right pill-full' style='width:" + lengthRep + "px'> <p class='number'>" + percentRep + "%</p> </div>";
    } else if (percentRep < 0.01 && percentThird < 2) {
        pillDem = "<div class='pill-left pill-full' style='width:" + lengthDem + "px'> <p class='number'>" + percentDem + "%</p> </div>";
        pillRep = "<div class='pill-none' style='width:" + lengthRep + "px'> <p class='number'>" + percentRep + "%</p> </div>";
    } else if (percentDem < 25 && percentThird < 2) {
        pillDem = "<div title='" + dem.Candidate + " (" + dem.Party + "): " + percentDem + "%'class='pill-left' style='width:" + lengthDem + "px'><p class='number'>%</p></div>";
        pillRep = "<div class='pill-right' style='width:" + lengthRep + "px'> <p class='number'>" + percentRep + "%</p> </div>";
    } else if (percentRep < 25 && percentThird < 2) {
        pillDem = "<div class='pill-left' style='width:" + lengthDem + "px'> <p class='number'>" + percentDem + "%</p> </div>";
        pillRep = "<div title='" + rep.Candidate + " (" + rep.Party + "): " + percentRep + "%' class='pill-right' style='width:" + lengthRep + "px'><p class='number'>%</p> </div>";
    }
    else {
        pillDem = "<div class='pill-left' style='width:" + lengthDem + "px'> <p class='number'>" + percentDem + "%</p> </div>";
        pillRep = "<div class='pill-right' style='width:" + lengthRep + "px'> <p class='number'>" + percentRep + "%</p> </div>";
    }
    var pillThird = "";
    
    if (percentThird > 2 && percentDem < 0.01) {
        pillThird = "<div title='" + third.Candidate + " (" + third.Party + "): " + percentThird + "%' class='pill-third pill-third-left' style='width:" + lengthThird + "px'> </div>";
        pillDem = "<div class='pill-none' style='width:" + lengthDem + "px'> <p class='number'>" + percentDem + "%</p> </div>";
    } else if (percentThird > 2 && percentRep < 0.01) {
        pillThird = "<div title='" + third.Candidate + " (" + third.Party + "): " + percentThird + "%' class='pill-third pill-third-right' style='width:" + lengthThird + "px'> </div>";
        pillRep = "<div class='pill-none' style='width:" + lengthRep + "px'> <p class='number'>" + percentRep + "%</p> </div>";
    } else if (percentThird > 2 && percentDem < 25) {
        pillThird = "<div title='" + third.Candidate + " (" + third.Party + "): " + percentThird + "%' class='pill-third' style='width:" + lengthThird + "px'> </div>";
        pillDem = "<div title='" + dem.Candidate + " (" + dem.Party + "): " + percentDem + "%'class='pill-left' style='width:" + lengthDem + "px'> <p class='number'>%</p> </div>";
    } else if (percentThird > 2 && percentRep < 25) {
        pillThird = "<div title='" + third.Candidate + " (" + third.Party + "): " + percentThird + "%' class='pill-third' style='width:" + lengthThird + "px'> </div>";
        pillRep = "<div title='" + rep.Candidate + " (" + rep.Party + "): " + percentRep + "%' class='pill-right' style='width:" + lengthRep + "px'><p class='number'>%</p> </div>";
    } else if (percentThird > 2) {
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
    let lat = coordinates.coords.latitude;//41.983498;
    let lng = coordinates.coords.longitude;//-91.650698;
    let radius = 250;

    let url = "https://reverse.geocoder.api.here.com/6.2/reversegeocode.json?prox=" + lat + "%2C" + lng + "%2C" + radius + "&mode=retrieveAddresses&maxresults=1&gen=9&app_id=t9xNHwJk3lAlszEeRxrV&app_code=y1rqFlvOIJyNJ5MJctm04A";
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    xmlHttp.send( null );
    var responseText = xmlHttp.responseText;
    var response = JSON.parse(responseText);
    console.log(response);

    let location = response.Response.View[0].Result[0].Location.Address.Label;
    
    console.log(location);

    let googleQuery = googleVoterQuery(location, 6000);

    if ("error" in googleQuery) {
        $(".loading-location").remove();
        getPositionError();
    } else {
        $(".loading-location").remove();
        getNearbyMatchupsGoogle(googleQuery);

    }
}

function googleVoterQuery(address, electionId) {
    var apiKey = "AIzaSyAhC1y0Vc09spgiF1KYdUJwag71TGitZgc";
    var url = "https://www.googleapis.com/civicinfo/v2/voterinfo?address=" + address + "&electionId=" + electionId + "&key=" + apiKey;
    console.log(url);
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
    let applicablePositions = ["STATE REPRESENTATIVE", "STATE SENATOR", "U.S. Representative", "U.S. Senator", "Governor", "Secretary Of State", "Attorney General", "Lieutenant Governor", "State Representative", "State Senator"];

    let contests = civicAPIObject.contests;
    let state = civicAPIObject.normalizedInput.state;

    var nearbyMatchups = [];

    for (contest of contests) {
        var matchup;
        if (contest.type != "Referendum") {
            matchup = new MatchupGoogle(contest, state);
            if (applicablePositions.includes(matchup.position)) {
                console.log("nearby contest found");
                nearbyMatchups.push(matchup);
            }
        }
        
    }
    var noPredictions = false;
    for (contest of nearbyMatchups) {
        var matchup = getMatchup(data, contest.state, contest.position, contest.district);
        if (!jQuery.isEmptyObject(matchup)) {
            createCard(matchup);
        } else {
            noPredictions = true;
        }
    }
    if (noPredictions) {
        let errorP = "<p id='error-p'>Sorry, predictions for your location are not yet available. Check back later.</p>";
        $(".main-section").append(errorP);
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
        } else if (contest.office.includes("State Senator") || contest.office.includes("STATE SENATOR")) {
            this.position = "State Senator";
        } else if (contest.office.includes("State Representative") || contest.office.includes("STATE REPRESENTATIVE")) {
            this.position = "State Representative";
        } else if (contest.office.includes("Secretary of State")) {
            this.position = "Secretary Of State";
        } else {
            this.position = contest.office;
        }
        this.district = (contest.district.id != null) ? contest.district.id : "Statewide";
    }
}

//Create a row in the table of all races
function createTableRow(matchup, rowsList) {
    
    let dem = matchup["DEM"];
    let rep = matchup["REP"];
    let third = {
        "Predicted Vote Share":0,
        "Predicted Win Probability": "0",
        "Candidate":"",
        "Incumbent": "No"
    };
    if (matchup.hasOwnProperty("LIB")) {
        third = matchup["LIB"];
    } else if (matchup.hasOwnProperty("IND")) {
        third = matchup["IND"];
    }

    var incumbentDem = "";
    var incumbentRep = "";
    var incumbentThird = "";

    if (dem.Incumbent == "Yes") {
        incumbentDem = "<span title='Incumbent' class='incumbent'> i</span>";
    } else if (rep.Incumbent == "Yes") {
        incumbentRep = "<span title='Incumbent' class='incumbent'> i</span>";
    } else if (third.Incumbent == "Yes") {
        incumbentThird = "<span title='Incumbent' class='incumbent'> i</span>";
    }

    var predictionDem = dem["Predicted Vote Share"];
    var predictionRep = rep["Predicted Vote Share"];
    var predictionThird = third["Predicted Vote Share"];

    var probabilityDem = (!dem["Predicted Win Probability"].includes("%"))? dem["Predicted Win Probability"] + "%" : dem["Predicted Win Probability"];
    var probabilityRep = (!rep["Predicted Win Probability"].includes("%"))? rep["Predicted Win Probability"] + "%" : rep["Predicted Win Probability"];
    var probabilityThird = third["Predicted Win Probability"] + "%";

    if (probabilityDem == "> 99.99%") {
        probabilityDem = ">99.9%";
    } else if (probabilityDem == "< 0.01%") {
        probabilityDem = "<0.01%";
    } else if (probabilityDem == "99.99%") {
        probabilityDem = "99.9%";
    } else if (probabilityDem == "100.00%") {
        probabilityDem = "100%";
    }

    if (probabilityRep == "> 99.99%") {
        probabilityRep = ">99.9%";
    } else if (probabilityRep == "< 0.01%") {
        probabilityRep = "<0.01%";
    } else if (probabilityRep == "99.99%") {
        probabilityRep = "99.9%";
    } else if (probabilityRep == "100.00%") {
        probabilityRep = "100%";
    }

    if (probabilityThird == "< 0.01%") {
        probabilityThird = "<0.01%";
    }

    let rating = matchup.rating;
    let color = matchup.color;

    var s = dem.State;
    var candidateDem = dem.Candidate;
    var candidateRep = rep.Candidate;
    var candidateThird = third.Candidate;

    let percentDem = Number((predictionDem * 100).toFixed(1));
    let percentRep = Number((predictionRep * 100).toFixed(1));
    let percentThird = Number((predictionThird * 100).toFixed(1));
    
    let state = "<p>" + s + "</p>";
    let race = "<p>" + matchup["title"] + "</p>";
    var candidates = "<p> <span class='blue'>" + candidateDem + incumbentDem + "</span> vs <span class='red'>" + candidateRep + incumbentRep + "</span> </p>";
    let projectionChart = createProjectionChart(matchup);
    var probabilities = "<p class='number'> <span class='blue'>" + probabilityDem + "</span> vs <span class='red'>" + probabilityRep + "</span> </p>";
    var ratings = "<h2 class='" + color + "'>" + rating + "</h2>";

    if (percentThird > 2 && percentDem < 0.01) {
        let partyThird = " (" + third.Party + ")";
        candidates = "<p> <span class='yellow'>" + candidateThird + partyThird + incumbentThird + "</span> vs <span class='red'>" + candidateRep + incumbentRep + "</span> </p>";
        probabilities = "<p class='number'> <span class='yellow'>" + probabilityThird + "</span> vs <span class='red'>" + probabilityRep + "</span> </p>";

    } else if (percentThird > 2 && percentRep < 0.01) {
        let partyThird = " (" + third.Party + ")";
        candidates = "<p> <span class='blue'>" + candidateDem + incumbentDem + "</span> vs <span class='yellow'>" + candidateThird + partyThird + incumbentThird + "</span> </p>";
        probabilities = "<p class='number'> <span class='blue'>" + probabilityDem + "</span> vs <span class='yellow'>" + probabilityThird + "</span> </p>";
    
    }

    let td = "<td>";
    let tdc = "</td>";

    var row = document.createElement("tr");
    let innerHTML = td + race + tdc + td + candidates + tdc + td + projectionChart + tdc + td + ratings + tdc + td + probabilities + tdc;
    row.innerHTML = innerHTML;
    let html = "<tr>" + innerHTML + "</tr>";

    if (!hasTableBeenInitialized) {

        let width = document.documentElement.clientWidth;
        var scroll;
        if (width < 600) {
            scroll = true;
        } else {
            scroll = false;
        }

        var column1Sorting = {"type": "num-html", "orderable": false};
        if (currentStates.length != 1) {
            column1Sorting = {"type": "html-num", "orderable": false};
        }

        $("#all-races-table").append(html);
        hasTableBeenInitialized = true;
        $("#all-races-table").DataTable({
            scrollX: scroll,
            paging: false,
            ordering: true,
            language: {
                searchPlaceholder: "State, race, candidate, or rating",
                info: "Showing _START_ to _END_ of _TOTAL_ races",
                infoFiltered: " - filtered from _MAX_ total races",
                search: "Search:",
                emptyTable:  "No races found"
            },
            columns: [
                column1Sorting,
                {"orderable": false},
                {"searchable": false, "width": "250px", "orderable": false},
                {"searchable": true, "width": "75px", "orderable": false},
                {"searchable": false, "width": "125px", "orderable": false}
            ]
        });
        

    } else {
        rowsList.push(row);
    }


}