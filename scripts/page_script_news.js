$(document).ready(function() {
    console.log("JS News Script Loaded");

    getNewsArticle("methedology");
    getNewsArticle("test");

});

function getNewsArticle(title) {

    $.ajaxSetup({
        async: false
    });
    
    let url = "/Politicus/news_articles/" + title + ".txt";
    var success = false;

    $.get(url, function( response ) {
        success = true;
        console.log("Got News Article from local url " + url);
        console.log(response);
        setupNewsArticle(response);
    }, 'text');

    if (!success) {
        let urlOnline = "https://www.noahcovey.com" + url;
        $.get(urlOnline, function( response ) {
            success = true;
            console.log("Got News Article from online url " + urlOnline);
            console.log(response);
            setupNewsArticle(response);
        }, 'text');
    }

}

function setupNewsArticle(articleText) {
    let lines = articleText.split('\n');
    console.log(lines);
    let title = lines[0];
    let author = lines[1];
    let date = lines[2];


    let titleLower = title.replace(/\s+/g, '-').toLowerCase();
    let id = "#" + titleLower;

    console.log("Title: " + title + ", author: " + author + ", date: " + date);

    let articleDiv = "<div class='article' id='" + titleLower + "'></div>"
    $(".main-section").append(articleDiv);

    let titleH = "<h1 class='article-title'>" + title + "</h1>";
    $(id).append(titleH);

    let authorP = "<p class='article-author'>By <span class='author'>" + author + "</span> <span class='dot'></span> " + date + "</p>"
    $(id).append(authorP);

    var article = "";
    let articleLines = lines.slice(4);
    for (line of articleLines) {
        let articleP = "<p class='article-text'>" + line + "</p>";
        $(id).append(articleP);
    }
    

}