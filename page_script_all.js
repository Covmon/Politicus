$(document).ready(function() {
    console.log("Starting JS All");

    // When the user scrolls the page, execute myFunction
    window.onscroll = function() {scroll()};

    // Get the nav
    var nav = document.getElementById("predictions-nav");
    var page = document.getElementById("main-page");

    // Get the offset position of the navbar
    var sticky = nav.offsetTop;

    // Add the sticky class to the nav when you reach its scroll position. Remove "sticky" when you leave the scroll position
    function scroll() {

        if(nav != null) {
            if (window.pageYOffset > sticky) {
                nav.classList.add("predictions-nav-scrolled");
                page.classList.add("main-page-scrolled");
            } else {
                nav.classList.remove("predictions-nav-scrolled");
                page.classList.remove("main-page-scrolled");
            }
        }


    }

});