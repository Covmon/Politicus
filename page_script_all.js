$(document).ready(function() {
    console.log("Starting JS All");

    $(window).scroll(function() {
        if ($(this).scrollTop() > $(".nav").height()/2) {
            $(".nav").addClass("nav-scrolled");
        } else {
            $(".nav").removeClass("nav-scrolled");
        }
    })


});