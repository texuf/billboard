


var canvasWidth = window.innerWidth
var canvasHeight = window.innerHeight

var followerImageContainer = document.getElementById('image-container')
console.assert(followerImageContainer, "please create div with id 'image-container' continuing")

console.log("fooooooo!!!!!")

function showImage(imageURL, imageWidth, imageHeight, positionTop, positionLeft, scale) {
    console.log(imageURL, imageWidth, imageHeight, positionTop, positionLeft, scale)
    jQuery(followerImageContainer.id).empty();

    // <img id="lightboxImage" alt="" src="" style="display: inline; width: 3657px; height: 1091px; z-index: 10500;">
    var image = document.createElement('img')
    image.id = 'image-container-img'
    image.src = imageURL
    image.style.zIndex = 10500

    var pct = Math.min(canvasWidth / imageWidth,  canvasHeight / imageHeight ) * scale
    console.log("pct", pct)

    var scaledWidth = imageWidth * pct
    var scaledHeight = imageHeight * pct

    image.style.width = scaledWidth + 'px'
    image.style.height = scaledHeight + 'px'

    followerImageContainer.style.left = 0 - scaledWidth * positionLeft + 'px'
    followerImageContainer.style.top = 0 - scaledHeight * positionTop + 'px'

    followerImageContainer.appendChild(image)

}