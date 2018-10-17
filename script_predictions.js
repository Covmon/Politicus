$(document).ready(function() {
    console.log("Starting JS");
    
    var candidates = predictions_iowa.data;
    let stateRep = "State Representative";
    let usRep = "U.S. Representative";

    var iowa_91 = getMatchup(candidates, stateRep, "91");
    createCard(iowa_91, 1);

    var iowa_1 = getMatchup(candidates, usRep, "1");
    createCard(iowa_1, 2);

    var iowa_55 = getMatchup(candidates, stateRep, "55");
    createCard(iowa_55, 3);

    var iowa_32 = getMatchup(candidates, stateRep, "32");
    createCard(iowa_32, 4);

    var iowa_88 = getMatchup(candidates, stateRep, "88");

    $(window).scroll(function() {
        if ($(this).scrollTop() > $(".nav").height()) {
            $(".nav").addClass("nav-scrolled");
        } else {
            $(".nav").removeClass("nav-scrolled");
        }
    })

    $("#click-me").click(function() {
        createCard(iowa_88, 2);
    });

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

var numCards = 0;

function createCard(matchup, cardNumber) {
    var dem = matchup["DEM"];
    var rep = matchup["REP"];

    //Get meta info about this matchup
    var state = dem.State;
    var position = dem.Position;
    var district = dem.District;
    var predictionDem = dem.Predicted;

    
    var title = position + ", " + state + " District " + district;
    var titleID = "card" + cardNumber;

    //Create card
    var color = "";
    color = evaluatePredictionColor(predictionDem);
    var className = "prediction-card " + color;

    let cardCreate = $('<div />', {
        "class": className,
        "id": "card",
        click: function(e){
            e.preventDefault();
            $("#card1").toggleClass("hidden");
            $("#card1").children().toggle();
    }})


    if (cardNumber <= numCards) {
        var previousID = "card" + (cardNumber - 1);
        $("#" + previousID).after(cardCreate);

        $(".prediction-card").each(function() {
            let id = $(this).attr("id");
            console.log(id);
            let num = parseInt(id.charAt(4), 10);
            console.log(num);
            if (num >= cardNumber) {
                let newID = "card" + (num + 1);
                console.log(newID);
                $(this).attr("id", newID);
            }
        })
        $("#card").attr("id", "card" + cardNumber);

    } else {
        $(".main-section").append(cardCreate);
        $("#card").attr("id", "card" + cardNumber);
    }
    numCards++;

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




