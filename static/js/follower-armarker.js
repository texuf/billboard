

console.assert(document.getElementById('qrcodeCanvasWrapper'), 'a div with id "qrcodeCanvasWrapper" is required to continue')
console.assert(document.getElementById('arcode-container'), 'a div with id "arcode-container" is required to continue')

console.log('screen size', document.getElementById('qrcodeCanvasWrapper').offsetWidth, document.getElementById('qrcodeCanvasWrapper').offsetHeight)
var qrcodeSize = Math.min(document.getElementById('qrcodeCanvasWrapper').offsetWidth, document.getElementById('qrcodeCanvasWrapper').offsetHeight) - 120
var canvas = document.createElement('canvas');
canvas.width = qrcodeSize * 2;
canvas.height = qrcodeSize * 2;
canvas.style.width = (qrcodeSize) + 'px';
canvas.style.height = (qrcodeSize) + 'px';

var arMarkerImage = new Image;
var baseURL = ''

arMarkerImage.onload = function() {
    console.log('ar marker image loaded')
    updateARCode()
}


function updateARCode() {
    document.querySelector('#arcode-container').appendChild(canvas)

    var context = canvas.getContext('2d')

    context.drawImage(arMarkerImage, 0, 0, canvas.width, canvas.height);
}

function setARMarkerBaseURL(url) {
    baseURL = url
}

function setARMarkerImage(url) {
    arMarkerImage.src = url
}
