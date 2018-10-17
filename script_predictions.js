$(document).ready(function() {
    console.log("Starting JS");
    
    var candidates = predictions_iowa.data;
    let stateRep = "State Representative";
    let usRep = "U.S. Representative";

    var iowa_91 = getMatchup(candidates, stateRep, "91");
    createCard(iowa_91);

    var iowa_1 = getMatchup(candidates, usRep, "1");
    createCard(iowa_1);

    var iowa_55 = getMatchup(candidates, stateRep, "55");
    createCard(iowa_55);

    var iowa_32 = getMatchup(candidates, stateRep, "32");
    createCard(iowa_32);

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
        if (candidate.District == district && candidate.Position == position) {
            var party = candidate.Party;
            matchup[party] = candidate;
        }
    }
    return matchup;
}

function evaluatePredictionColor(predictionDem) {
    var color = ""
    if (predictionDem > 0.90) {
        color = "solid-blue";
    } else if (predictionDem > 0.75) {
        color = "likely-blue";
    } else if (predictionDem > 0.60) {
        color = "lean-blue";
    } else if (predictionDem >= 0.40) {
        color = "purple";
    } else if (predictionDem >= 0.25) {
        color = "lean-red";
    } else if (predictionDem >= 0.10) {
        color = "likely-red";
    } else {
        color = "solid-red";
    }

    return color;
}

function evaluatePredictionDescription(predictionDem) {
    var description = ""
    if (predictionDem > 0.90) {
        description = "SOLID D";
    } else if (predictionDem > 0.75) {
        description = "LIKELY D";
    } else if (predictionDem > 0.60) {
        description = "LEAN D";
    } else if (predictionDem >= 0.40) {
        description = "TOSS-UP";
    } else if (predictionDem >= 0.25) {
        description = "LEAN R";
    } else if (predictionDem >= 0.10) {
        description = "LIKELY R";
    } else {
        description = "SOLID R";
    }

    return description;
}

function createCard(matchup) {
    var dem = matchup["DEM"];
    var rep = matchup["REP"];

    //Get meta info about this matchup
    var state = dem.State;
    var position = dem.Position;
    var district = dem.District;
    var predictionDem = dem.Predicted;

    var title = position + ", " + state + " District " + district;
    var titleID = (position + "-" + state + "-" + district).replace(/\s+/g, '-').replace(/\./g,'')

    //Create card
    var color = "";
    color = evaluatePredictionColor(predictionDem);
    var className = "prediction-card " + color;

    let cardCreate = $('<div />', {
        "class": className,
        "id": titleID,
        click: function(e){
            e.preventDefault();
            alert("clicked on a card we created")
    }})

    $(".main-section").append(cardCreate);

    //Add elements to card
    let card = $("#" + titleID);

    let titleH1 = $("<h1 />").text(title);
    card.append(titleH1);

    projectionDescription = evaluatePredictionDescription(predictionDem);
    let projectionP = $("<h2 />").text(projectionDescription);
    card.append(projectionP);

    let candidatesP = $("<p />").text(dem.Candidate + " (D) vs " + rep.Candidate + " (R)");
    card.append(candidatesP);




}




