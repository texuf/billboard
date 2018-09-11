

console.assert(typeof TweenLite != 'undefined', 'import TweenLite before continuing https://greensock.com/tweenlite')

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
    console.log("show image", imageURL, imageWidth, imageHeight)
    hideImage()

    self.imageWidth = imageWidth
    self.imageHeight = imageHeight
    // <img id="lightboxImage" alt="" src="" style="display: inline; width: 3657px; height: 1091px; z-index: 10500;">
    var image = document.createElement('img')
    image.id = 'image-container-img'
    image.src = imageURL
    image.style.zIndex = 10500

    followerImageContainer.appendChild(image)
    //positionImage(0, 0, 1)
}

function positionImage(positionTop, positionLeft, scale) {
    console.log("position", "left", positionLeft, "top", positionTop, scale, qrcodeSize, canvasWidth, canvasHeight)
    var image = document.getElementById('image-container-img')
    var scaledHeight = qrcodeSize / scale // Math.min(qrcodeSize / imageWidth,  qrcodeSize / imageHeight ) * scale
    
    var scaledHeightFactor = scaledHeight / imageHeight
    var scaledWidth = imageWidth * scaledHeightFactor

    var top = -1 * scaledHeight * positionTop + (canvasHeight - qrcodeSize) / 2
    var left = -1 *  scaledWidth * positionLeft + (canvasWidth - qrcodeSize) / 2
    console.log("scaledW", scaledWidth, "scaledH", scaledHeight, top, left)
    TweenLite.to(image, 0.3, {width: scaledWidth + 'px', height: scaledHeight + 'px'});

    followerImageContainer.style.position = 'absolute'
    TweenLite.to(followerImageContainer, 0.3, {top: top + 'px', left: left + 'px'});

}