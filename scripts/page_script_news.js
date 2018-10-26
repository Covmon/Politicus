$(document).ready(function() {
    console.log("JS News Script Loaded");

    getNewsArticle("test");

});

function getNewsArticle(title) {

    $.ajaxSetup({
        async: false
    });
    
    let url = "/Politicus/news_articles/" + title + ".txt";
    var success = false;
    $.ajax({
        url: url,
        success: function(result) {
            success = true;
            console.log("Got News Article from local url " + url);
            response = result.responseText;
            console.log(response);
            return response;
        }
    })

    if (!success) {
        let urlOnline = "https://www.noahcovey.com" + url;
        $.ajax({
            url: urlOnline,
            success: function(result) {
                success = true;
                console.log("Got News Article from local url " + urlOnline);
                response = result.responseText;
                console.log(response);
                return response;
            }
        })
    }
}