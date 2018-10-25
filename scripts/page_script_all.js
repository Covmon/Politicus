$(document).ready(function() {
    console.log("Starting JS All");

    let state = sessionStorage.getItem("state");
    if (state == "All" && sessionStorage.getItem("data_all") === null) {
        console.log("Stringify our data");
        let jsonString = JSON.stringify(data);
        sessionStorage.setItem("data_all", jsonString);
    }
    

    console.log(data);
    var length = 0;
    for( var key in data ) {
        if( data.hasOwnProperty(key) ) {
            ++length;
        }
    }
    console.log(length);

    $(".loading").remove();

    $("#select-state").change(function() {
        sessionStorage.setItem("state", $(this).val());
        location.reload();
    });

    $("#reset-link").click(function() {
        sessionStorage.setItem("state", "All");
        location.reload();
    });

    let gitURL = "https://api.github.com/repos/Covmon/Politicus/commits"
    $.getJSON(gitURL, function(json) {
        let commit = json[0];
        let dateData = commit.commit.author.date;

        let dateObj = new Date(Date.parse(dateData));

        let month = dateObj.getMonth() + 1;
        let date = dateObj.getDate();
        let year = dateObj.getFullYear();
        let time = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        let dateString = "Last updated " + month + "/" + date + "/" + year + " at " + time; 
    
        let html = '<p id="updated" class="number">' + dateString + '</p>';
        $(".header").after(html);

    })



    // When the user scrolls the page, execute myFunction
    window.onscroll = function() {scroll()};

    // Get the nav
    var nav = document.getElementById("predictions-nav");
    var page = document.getElementById("main-page");
    var hr = document.getElementById("predictions-nav-hr");

    // Get the offset position of the navbar
    var sticky = nav.offsetTop;

    // Add the sticky class to the nav when you reach its scroll position. Remove "sticky" when you leave the scroll position
    function scroll() {

        if(nav != null) {
            if (window.pageYOffset > sticky) {
                nav.classList.add("predictions-nav-scrolled");
                page.classList.add("main-page-scrolled");
                hr.classList.add("hr-invisible");
            } else {
                nav.classList.remove("predictions-nav-scrolled");
                page.classList.remove("main-page-scrolled");
                hr.classList.remove("hr-invisible");
            }
        }

        if (window.pageYOffset > 2000) {
            
        }


    }

});