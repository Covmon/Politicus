$(document).ready(function () {
    setTimeout(removeLiveBlogBranding, 7500);
});

function removeLiveBlogBranding() {
    console.log("REMOVE LIVE BLOG BRANDING NOW");
    $(".lb24-liveblog-white-label").remove();
}