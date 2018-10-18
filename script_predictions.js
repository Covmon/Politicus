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
    
    var iowa_40 = getMatchup(candidates, stateRep, "40");
    createCard(iowa_40, 5);

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

var numCards = 0;

function createCard(matchup, cardNumber) {
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
    var titleID = "card" + cardNumber;

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

    projectionDescription = evaluatePredictionDescription(predictionDem, predictionRep);
    let projectionDescriptionP = $("<h2 />").text(projectionDescription);
    card.append(projectionDescriptionP);

    let candidatesP = $("<p />").html("<span class='blue'>" + dem.Candidate + " (D)</span> vs <span class='red'>" + rep.Candidate + " (R)</span>");
    candidatesP.addClass("bold");
    card.append(candidatesP);

    let probabilityP = $("<p />").text("Probabilities:");
    card.append(probabilityP);

    let chart = createProjectionChart(matchup);
    card.append(chart);

    let voteShareDescriptionP = $("<p />").text("Projected vote share:");
    card.append(voteShareDescriptionP);    

    let voteShareP = $("<p />").text(percentDem + "% (D) vs " + percentRep + "% (R)");
    voteShareP.addClass("number");
    voteShareP.attr("id", "vote-share");
    card.append(voteShareP);

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





