$(document).ready(function() {
    console.log("Starting JS All");

    $(".loading").remove();

    $("#select-state").change(function() {
        sessionStorage.setItem("state", $(this).val());
        location.reload();
    });

    $("#reset-link").click(function() {
        sessionStorage.setItem("state", "All");
        location.reload();
    });

    

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


    }

});