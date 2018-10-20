var candidateObjects = predictions_iowa.data;
var numCards = 0;
var hasTableBeenInitialized = false;

$(document).ready(function() {
    console.log("JS Predictions Script Loaded");
});


function getMatchup(allCandidates, state, position, district, officeName) {
    var matchup = {};
    for (candidate of allCandidates) {
        if (candidate.State == state && candidate.District == String(district) && candidate.Position == position) {
            var party = candidate.Party;
            matchup[party] = candidate;
        }
    }

    //U.S. House, Georgia District 12
    //U.S. Senate, Georgia
    //Georgia House, District 9
    //Georgia Senate, District 40
    //Georgia Governor
    switch (position) {
        case "U.S. Representative":
            matchup["title"] = "U.S. House, " + state + " District " + district;
            break;
        case "U.S. Senator":
            matchup["title"] = "U.S. Senate, " + state;
            break;
        case "State Representative":
            matchup["title"] = state + " " + officeName + ", District " + district;
            break;
        case "State Senator":
            matchup["title"] = state + " " + officeName + ", District " + district;
            break;
        case "Governor":
            matchup["title"] = state + " Governor";
            break;
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

function createCard(matchup, cardNumber = -1, appendLocation = ".main-section") {
    var actualCardNumber = cardNumber;

    if (cardNumber == -1) {
        actualCardNumber = numCards + 1;
    }

    var dem = matchup["DEM"];
    var rep = matchup["REP"];

    var predictionDem = dem.Predicted;
    var predictionRep = rep.Predicted;

    var percentDem = Number((predictionDem * 100).toFixed(1));
    var percentRep = Number((predictionRep * 100).toFixed(1));
    
    var title = matchup["title"];
    var cardID = "card" + actualCardNumber;

    //Create card
    var color = "";
    color = evaluatePredictionColor(predictionDem, predictionRep);
    var className = "prediction-card " + color;

    let cardCreate = $('<div />', {
        "class": className,
        "id": "card",
        click: function(e){
            e.preventDefault();
            //$("#card1").toggleClass("hidden");
            //$("#card1").children().toggle();
    }})


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
        $(appendLocation).append(cardCreate);
        $("#card").attr("id", "card" + actualCardNumber);
    }
    numCards++;

    //Add elements to card
    let card = $("#" + cardID);

    let titleH1 = $("<h1 />").text(title);
    card.append(titleH1);

    projectionDescription = evaluatePredictionDescription(predictionDem, predictionRep);
    let projectionDescriptionP = $("<h2 />").text(projectionDescription);
    card.append(projectionDescriptionP);

    let candidatesP = $("<p />").html("<span class='blue'>" + dem.Candidate + " (D)</span> vs <span class='red'>" + rep.Candidate + " (R)</span>");
    candidatesP.addClass("bold");
    card.append(candidatesP);

    let voteShareDescriptionP = $("<p />").text("Projected vote share:");
    card.append(voteShareDescriptionP);

    let chart = createProjectionChart(matchup);
    card.append(chart);

    let probabilityDescriptionP = $("<p />").text("Win probabilities:");
    card.append(probabilityDescriptionP);    

    let probabilitiesP = $("<p />").html("<span class='blue'>" + percentDem + "% (D)</span> vs <span class='red'>" + percentRep + "% (R)</span>");
    probabilitiesP.addClass("number");
    probabilitiesP.attr("id", "vote-share");
    card.append(probabilitiesP);

}

function createProjectionChart(matchup) {
    var dem = matchup["DEM"];
    var rep = matchup["REP"];
    var third = {
        "Predicted": 0
    };
    if (matchup.hasOwnProperty("LIB")) {
        third = matchup["LIB"];
    } else if (matchup.hasOwnProperty("GREEN")) {
        third = matchup["GREEN"];
    }

    var predictionDem = dem.Predicted;
    var predictionRep = rep.Predicted;
    var predictionThird = third.Predicted;

    var percentDem = Number((predictionDem * 100).toFixed(1));
    var percentRep = Number((predictionRep * 100).toFixed(1));
    var percentThird = Number((predictionThird * 100).toFixed(1));

    var lengthDem = predictionDem * 200;
    var lengthRep = predictionRep * 200;
    var lengthThird = predictionThird * 200;

    /*
    if (window.innerWidth < 1100) {
        console.log("small screen");
        let scalar = window.innerWidth/2200;
        lengthDem *= scalar;
        lengthRep *= scalar;
        lengthThird *= scalar;
    }*/

    var pillDem = "<div class='pill-left' style='width:" + lengthDem + "px'> <p class='number'>" + percentDem + "%</p> </div>";
    var pillRep = "<div class='pill-right' style='width:" + lengthRep + "px'> <p class='number'>" + percentRep + "%</p> </div>";
    var pillThird = "";

    if (percentThird > 4) {
        pillThird = "<div title='" + third.Candidate + " (" + third.Party + "): " + percentThird + "%' class='pill-third' style='width:" + lengthThird + "px'> </div>";
        $(document).tooltip({
            track: true
        });
    }

    return pillDem + pillThird + pillRep;

}

function getNearbyElections() {
    // we start the request, to ask the position of the client
    // we will pass geolocationReturnedCoordinates as the success callback
    console.log("get user's location");
    navigator.geolocation.getCurrentPosition(geolocationReturnedCoordinates, error, null);
}

function error(err) {
    console.warn("ERROR: " + err.code + ": " +  err.message);
}

function geolocationReturnedCoordinates(coordinates) {
    let lat = 41.522498;//coordinates.coords.latitude;
    let lng = -93.6464809;//coordinates.coords.longitude;

    let accessToken = "pk.eyJ1Ijoibm9haGNvdmV5IiwiYSI6ImNqbmZkMHJqZzZqZTAzcW4xbTR3djl6aGYifQ.hPSA1Bktf28eHwPcbQ9e4g";

    let url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + lng + "," + lat + ".json?access_token=" + accessToken;
    console.log(url);
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    xmlHttp.send( null );
    var responseText = xmlHttp.responseText;
    var response = JSON.parse(responseText);
    console.log(response);

    let address = response.features[0].place_name;
    let numbers = address.match(/\d+/);
    let firstNumbers = parseInt(numbers[0], 10);
    let index = address.indexOf(firstNumbers);
    let address_normalized = address.substring(index);
    console.log(address_normalized);

    let googleQuery = googleVoterQuery(address_normalized, 6000);
    //let openstatesQuery = openstatesVoterQuery(lat, lng);

    getNearbyMatchupsGoogle(googleQuery);
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
    let contests = civicAPIObject.contests;
    let state = civicAPIObject.normalizedInput.state;

    var nearbyMatchups = [];

    for (contest of contests) {
        let matchup = new MatchupGoogle(contest, state);
        if (matchup.position == "U.S. Representative" || matchup.position == "U.S. Senator" || matchup.position.substring(3) == "Governor" || matchup.position == "State Representative" || matchup.position == "State Senator") {
            nearbyMatchups.push(matchup);
        }
    }

    for (contest of nearbyMatchups) {
        var matchup = getMatchup(candidateObjects, contest.state, contest.position, contest.district, contest.officeName);
        if (!jQuery.isEmptyObject(matchup)) {
            console.log("Create card for local matchup");
            console.log(contest);
            console.log(matchup);
            createCard(matchup, 1);
        }
    }
}

class MatchupGoogle {
    constructor(contest, state) {
        this.state = convertStateName(state);
        this.position = contest.office;
        this.district = (contest.district.id != null) ? contest.district.id : "";
        this.officeName = contest.office;
    }
}

///

function createTableRow(matchup) {
    let dem = matchup["DEM"];
    let rep = matchup["REP"];

    let predictionDem = dem.Predicted;
    let predictionRep = rep.Predicted;

    let percentDem = Number((predictionDem * 100).toFixed(1));
    let percentRep = Number((predictionRep * 100).toFixed(1));

    let stateAbbrev = convertStateName(dem.State);
    
    let state = "<p>" + stateAbbrev + "</p>";
    let race = "<p>" + matchup["title"] + "</p>";
    let candidates = "<p> <span class='blue'>" + dem.Candidate + " (D)</span> vs <span class='red'>" + rep.Candidate + " (R)</span> </p>";
    let projectionChart = createProjectionChart(matchup);
    let probabilities = "<p class='number'> <span class='blue'>" + percentDem + "% (D)</span> vs <span class='red'>" + percentRep + "% (R)</span> </p>";

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
                searchPlaceholder: "State, race, or candidate",
                info: "Showing _START_ to _END_ of _TOTAL_ races",
                infoFiltered: " - filtered from _MAX_ total races"
            }
        });

    } else {
        $("#all-races-table").DataTable().row.add(row);
        $("#all-races-table").DataTable().draw();
    }
}

///

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
        var matchup = getMatchup(candidateObjects, matchupObj.position, matchupObj.district, matchupObj.officeName);
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
 





