var candidateObjects = predictions_iowa.data;
var numCards = 0;

$(document).ready(function() {
    console.log("Starting JS");
    
    let stateRep = "State Representative";
    let usRep = "U.S. Representative";

    var iowa_91 = getMatchup(candidateObjects, stateRep, "91");
    createCard(iowa_91);

    var iowa_1 = getMatchup(candidateObjects, usRep, "1");
    createCard(iowa_1);

    var iowa_55 = getMatchup(candidateObjects, stateRep, "55");
    createCard(iowa_55, -1, ".top-races");

    var iowa_32 = getMatchup(candidateObjects, stateRep, "32");
    createCard(iowa_32, -1, ".top-races");
    
    var iowa_40 = getMatchup(candidateObjects, stateRep, "40");
    createCard(iowa_40, -1, ".top-races");

    var iowa_80 = getMatchup(candidateObjects, stateRep, "80");
    createCard(iowa_80, -1, ".top-races");

    //timeout simulates time to get location and do voter info query
    window.setTimeout(geolocationReturnedCoordinates, 500, [50]); //getNearbyElections(); <-- change to this once geolocation working


    $(window).scroll(function() {
        if ($(this).scrollTop() > $(".nav").height()) {
            $(".nav").addClass("nav-scrolled");
        } else {
            $(".nav").removeClass("nav-scrolled");
        }
    })


});


function getMatchup(allCandidates, position, district) {
    var matchup = {};
    for (candidate of allCandidates) {
        if (candidate.District == String(district) && candidate.Position == position) {
            var party = candidate.Party;
            matchup[party] = candidate;
        }
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

    //Get meta info about this matchup
    var state = dem.State;
    var position = dem.Position;
    var district = dem.District;

    var predictionDem = dem.Predicted;
    var predictionRep = rep.Predicted;

    var percentDem = Number((predictionDem * 100).toFixed(1));
    var percentRep = Number((predictionRep * 100).toFixed(1));
    
    //GA House, District 9
    //GA Senate, District 40
    //U.S. Senate, GA
    //U.S. House, GA District 12
    //GA Governor
    var title = position + ", " + state + " District " + district;
    var titleID = "card" + actualCardNumber;

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
    let card = $("#" + titleID);

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

    let probabilitiesP = $("<p />").text(percentDem + "% (D) vs " + percentRep + "% (R)");
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
    } else if (matchup.hasOwnProperty("GRN")) {
        third = matchup["GRN"];
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

    var pillDem = "<div class='pill-left' style='width:" + lengthDem + "px'> <p class='number'>" + percentDem + "%</p> </div>";
    var pillRep = "<div class='pill-right' style='width:" + lengthRep + "px'> <p class='number'>" + percentRep + "%</p> </div>";
    var pillThird = "";

    if (percentThird > 3) {
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
    let openstatesQuery = openstatesVoterQuery(lat, lng);

    getNearbyMatchupsGoogle(googleQuery);
    getNearbyMatchupsState(openstatesQuery);
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

function getNearbyMatchupsGoogle(civicAPIObject) {
    let contests = civicAPIObject.contests;

    var localMatchups = [];

    for (contest of contests) {
        let matchup = new MatchupGoogle(contest);
        if (matchup.position == "U.S. Representative" || matchup.position.substring(3) == "Governor") {
            localMatchups.push(matchup);
        }
    }

    for (contest of localMatchups) {
        console.log(contest);
        var matchup = getMatchup(candidateObjects, contest.position, contest.district);
        if (!jQuery.isEmptyObject(matchup)) {
            console.log("Create card for local matchup");
            console.log(matchup);
            createCard(matchup, 1);
        }
    }
}

function getNearbyMatchupsState(openstatesObject) {


    for (contest of openstatesObject) {
        let matchupObj = new MatchupOpenStates(contest);
        var matchup = getMatchup(candidateObjects, matchupObj.position, matchupObj.district);
        if (!jQuery.isEmptyObject(matchup)) {
            console.log("Create card for local matchup");
            console.log(matchup);
            createCard(matchup, 1);
        }
    }

}

class MatchupGoogle {
    constructor(contest) {
        this.position = contest.office;
        this.district = (contest.district.id != null) ? contest.district.id : "-1";
    }
}

class MatchupOpenStates {
    constructor(contest, state) {

        let apiKey = "f38c7a52-293e-4313-aa69-b89b1253fd38";
        let url = "openstates.org/api/v1/metadata/" + state + "&apikey=" + apiKey;

        var xmlReq = new XMLHttpRequest();
        xmlReq.open( "GET", url, false ); // false for synchronous request
        xmlReq.send( null );
        var responseText = xmlReq.responseText;
        var responseObject = JSON.parse(responseText);

        let upperName = responseObject.chambers.upper.name;
        let lowerName = responseObject.chambers.lower.name;

        if (contest.chamber == "upper") {
            this.position = upperName;
        } else if (contest.chamber == "lower") {
            this.position = lowerName;
        }

        this.district = contest.district;
    }
}





