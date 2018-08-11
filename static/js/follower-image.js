


var followerImageContainer = document.getElementById('image-container')
console.assert(followerImageContainer, "please create div with id 'image-container' continuing")
console.assert(typeof qrcodeSize != 'undefined', "please include follower-armarker.js before continuing")

var canvasWidth = window.innerWidth
var canvasHeight = window.innerHeight

var imageWidth = 1
var imageHeight = 1

function hideImage() {
    console.log("emptying", followerImageContainer.id)
    jQuery('#' + followerImageContainer.id).empty();
}

function showImage(imageURL, imageWidth, imageHeight) {
    console.log("image", imageURL, imageWidth, imageHeight)
    hideImage()

    self.imageWidth = imageWidth
    self.imageHeight = imageHeight
    // <img id="lightboxImage" alt="" src="" style="display: inline; width: 3657px; height: 1091px; z-index: 10500;">
    var image = document.createElement('img')
    image.id = 'image-container-img'
    image.src = imageURL
    image.style.zIndex = 10500

    followerImageContainer.appendChild(image)
    positionImage(0, 0, 1)
}

function positionImage(positionTop, positionLeft, scale) {
    console.log("position", positionTop, positionLeft, scale)
    var image = document.getElementById('image-container-img')
    var pct = scale // Math.min(qrcodeSize / imageWidth,  qrcodeSize / imageHeight ) * scale
    var startX = 0 // canvasWidth / 2 - qrcodeSize / 2
    var startY = 0 // canvasHeight / 2 - qrcodeSize / 2
    console.log("pct", pct)

    var scaledWidth = imageWidth * pct
    var scaledHeight = imageHeight * pct

    image.style.width = scaledWidth + 'px'
    image.style.height = scaledHeight + 'px'

    followerImageContainer.style.position = 'absolute'
    followerImageContainer.style.top = positionTop + 'px' // startY - scaledHeight * positionTop + 'px'
    followerImageContainer.style.left = positionLeft + 'px' //startX - scaledWidth * positionLeft + 'px'

}