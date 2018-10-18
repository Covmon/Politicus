var topMatchups = [];
var numCards = 0;

$(document).ready(function() {
    console.log("Starting JS");
    
    var candidateObjects = predictions_iowa.data;
    let stateRep = "State Representative";
    let usRep = "U.S. Representative";

    getUserAddress();
    console.log("done w/ address");
    console.log(topMatchups);
    console.log("here");

    for (contest of topMatchups) {
        console.log(contest);
        var matchup = getMatchup(candidateObjects, contest.position, contest.districtID);
        if (!jQuery.isEmptyObject(matchup)) {
            console.log("Create card for local matchup");
            createCard(matchup, 1);
        }
    }

    var iowa_91 = getMatchup(candidateObjects, stateRep, "91");
    createCard(iowa_91);

    var iowa_1 = getMatchup(candidateObjects, usRep, "1");
    createCard(iowa_1);

    var iowa_55 = getMatchup(candidateObjects, stateRep, "55");
    createCard(iowa_55);

    var iowa_32 = getMatchup(candidateObjects, stateRep, "32");
    createCard(iowa_32);
    
    var iowa_40 = getMatchup(candidateObjects, stateRep, "40");
    createCard(iowa_40);

    var iowa_88 = getMatchup(candidateObjects, stateRep, "88");

    $(window).scroll(function() {
        if ($(this).scrollTop() > $(".nav").height()) {
            $(".nav").addClass("nav-scrolled");
        } else {
            $(".nav").removeClass("nav-scrolled");
        }
    })

    $("#click-me").click(function() {
        createCard(iowa_88);
    });

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

function createCard(matchup, cardNumber = -1) {
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
            $("#card1").toggleClass("hidden");
            $("#card1").children().toggle();
    }})


    if (actualCardNumber <= numCards) {
        var previousID = "card" + (actualCardNumber - 1);
        $("#" + previousID).after(cardCreate);

        $(".prediction-card").each(function() {
            let id = $(this).attr("id");
            console.log(id);
            let num = parseInt(id.charAt(4), 10);
            console.log(num);
            if (num >= actualCardNumber) {
                let newID = "card" + (num + 1);
                console.log(newID);
                $(this).attr("id", newID);
            }
        })
        $("#card").attr("id", "card" + actualCardNumber);

    } else {
        $(".main-section").append(cardCreate);
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

    var predictionDem = dem.Predicted;
    var predictionRep = rep.Predicted;

    var percentDem = Number((predictionDem * 100).toFixed(1));
    var percentRep = Number((predictionRep * 100).toFixed(1));

    var lengthDem = predictionDem * 200;
    var lengthRep = predictionRep * 200;

    var pillDem = "<div class='pill-left' style='width:" + lengthDem + "px'> <p class='number'>" + percentDem + "%</p> </div>";
    var pillRep = "<div class='pill-right' style='width:" + lengthRep + "px'> <p class='number'>" + percentRep + "%</p> </div>";


    return pillDem + pillRep;

}

function getUserAddress() {
    // we start the request, to ask the position of the client
    // we will pass geolocationReturnedCoordinates as the success callback
    console.log("get user's location");
    navigator.geolocation.getCurrentPosition(geolocationReturnedCoordinates, error, null);
}

function error(err) {
    console.warn("ERROR: " + err.code + ": " +  err.message);
}

function geolocationReturnedCoordinates(coordinates) {
    let lat = coordinates.coords.latitude;
    let lng = coordinates.coords.longitude;

    console.log(
      'lat: ' + coordinates.coords.latitude +
      '<br>lng: ' + coordinates.coords.longitude +
      '<br>accuracy: ' + coordinates.coords.accuracy);

    let url = 'https://api.geonames.org/findNearestAddressJSON?lat=' + lat + '&lng=' + lng + '&username=noahcovey';
    let url_IA = "https://api.geonames.org/findNearestAddressJSON?lat=41.522498&lng=-93.64646809999999&username=noahcovey";
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url_IA, false ); // false for synchronous request
    xmlHttp.send( null );
    var responseText = xmlHttp.responseText;
    var response = JSON.parse(responseText);
    let addressObj = response.address;
    console.log(addressObj);

    let address = addressObj.streetNumber + "-" + addressObj.street + "-" + addressObj.placename + "-" + addressObj.adminCode1 + "-" + addressObj.postalcode;
    console.log(address);
    let query = voterInfoQuery(address, 6000);
    getNearbyMatchups(query);
}

function voterInfoQuery(address, electionId) {
    var apiKey = "AIzaSyAhC1y0Vc09spgiF1KYdUJwag71TGitZgc";
    //var url = "https://www.googleapis.com/civicinfo/v2/elections?key=AIzaSyAhC1y0Vc09spgiF1KYdUJwag71TGitZgc";
    var url = "https://www.googleapis.com/civicinfo/v2/voterinfo?address=" + address + "&electionId=" + electionId + "&key=" + apiKey;
    var testURLGA = "https://www.googleapis.com/civicinfo/v2/voterinfo?address=4839-Adams-Walk-Dunwoody-GA-30338&electionId=6000&key=AIzaSyAhC1y0Vc09spgiF1KYdUJwag71TGitZgc";
    var testURLNC = "https://www.googleapis.com/civicinfo/v2/voterinfo?address=1133-Metropolitan-Ave-Charlotte-NC-28204&electionId=6000&key=AIzaSyAhC1y0Vc09spgiF1KYdUJwag71TGitZgc";
    var testURLLA = "https://www.googleapis.com/civicinfo/v2/voterinfo?address=6363-St-Charles-Ave-New-Orleans-LA-70118&electionId=6000&key=AIzaSyAhC1y0Vc09spgiF1KYdUJwag71TGitZgc";
    var testURLNM = "https://www.googleapis.com/civicinfo/v2/voterinfo?address=1352-Rufina-Cir-Santa-Fe-NM-87507&electionId=6000&key=AIzaSyAhC1y0Vc09spgiF1KYdUJwag71TGitZgc";

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    xmlHttp.send( null );
    var responseText = xmlHttp.responseText;
    var responseObject = JSON.parse(responseText);

    console.log("Here is the response object from the Google Voter Info Query:");
    console.log(responseObject);

    return responseObject;
}

function getNearbyMatchups(civicAPIObject) {
    let contests = civicAPIObject.contests;

    for (contest of contests) {
        let matchup = new Matchup(contest);
        if (matchup.position == "U.S. Representative" || matchup.position.substring(3) == "Governor") {
            topMatchups.push(matchup);
        }
    }
}

class Matchup {
    constructor(contest) {
        this.position = contest.office;
        this.districtID = (contest.district.id != null) ? contest.district.id : -1;
        this.districtName = contest.district.name;
    }
}





