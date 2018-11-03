$(document).ready(function () {
    setTimeout(removeLiveBlogBranding, 15000);
});

function removeLiveBlogBranding() {
    console.log("REMOVE LIVE BLOG BRANDING NOW");
    $(".lb24-liveblog-white-label").remove();
}