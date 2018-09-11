//////////////////////////////////////////////////////////////////////////////////
//      Init
//////////////////////////////////////////////////////////////////////////////////

console.assert(typeof outbox != 'undefined', "please import pubsub.js before continuing")
console.assert(typeof dragElement != 'undefined', "please import draggable.js before continuing")
console.assert(typeof throttled != 'undefined', "please import throttled.js before continuing")
console.assert(typeof MarkerDetector != 'undefined', "please import leader-markerdetector.js")

// prevent scrolling from within input field
window.addEventListener('touchmove', function(e) {
    
    e.preventDefault();
}, {passive : false});

// constants
var canvasWidth = window.innerWidth
var canvasHeight = window.innerHeight
// init renderer
var renderer = new THREE.WebGLRenderer({
    // antialias    : true,
    alpha: true
});
renderer.setClearColor(new THREE.Color('lightgrey'), 0)
// renderer.setPixelRatio( 1/2 );
renderer.setSize(canvasWidth, canvasHeight);
renderer.domElement.style.position = 'absolute'
renderer.domElement.style.top = '0px'
renderer.domElement.style.left = '0px'
document.body.appendChild(renderer.domElement);

// array of functions for the rendering loop
var onRenderFuncs = [];

// init scene and camera
var scene = new THREE.Scene();


//////////////////////////////////////////////////////////////////////////////////
//      Initialize a basic camera
//////////////////////////////////////////////////////////////////////////////////

// Create a camera
var camera = new THREE.Camera();
scene.add(camera);

////////////////////////////////////////////////////////////////////////////////
//          handle arToolkitSource
////////////////////////////////////////////////////////////////////////////////

var arToolkitSource = new THREEx.ArToolkitSource({
    // to read from the webcam 
    sourceType: 'webcam',
})

arToolkitSource.init(function onReady() {
    onResize()
    parseQRCodes()
})

// handle resize
window.addEventListener('resize', function() {
    onResize()
})

function onResize() {
    arToolkitSource.onResize()
    arToolkitSource.copySizeTo(renderer.domElement)
    if (arToolkitContext.arController !== null) {
        arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
    }
}

////////////////////////////////////////////////////////////////////////////////
//          initialize arToolkitContext
////////////////////////////////////////////////////////////////////////////////


// create atToolkitContext
var arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '../data/data/camera_para.dat',
    // detectionMode: 'mono',
    detectionMode: 'mono_and_matrix',
    matrixCodeTypes: '3x3',
    maxDetectionRate: 30,
    debugUIEnabled: true,
    canvasWidth: 80 * 3,
    canvasHeight: 60 * 3,
})
// initialize it
arToolkitContext.init(function onCompleted() {
    // copy projection matrix to camera
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
})

// update artoolkit on every frame
onRenderFuncs.push(function() {

    if (arToolkitSource.ready === false) return
    // console.info("onrender facts 1 " + arToolkitSource.domElement)
    arToolkitContext.update(arToolkitSource.domElement)
})


var detectors = [];

onRenderFuncs.push(function(delta) {
    var visibleMarkerControls = detectors.filter(function(detector) {
        return detector.object3d.visible === true
    })
    if (visibleMarkerControls.length > 0) {
        var rotation = visibleMarkerControls[0].object3d.rotation
        
        visibleMarkerControls.forEach(function(detector) {
            detector.update(rotation)
        })
    }
    
})

//////////////////////////////////////////////////////////////////////////////////
//      render the whole thing on the page
//////////////////////////////////////////////////////////////////////////////////
var stats = new Stats();
document.body.appendChild(stats.dom);
// render the scene
onRenderFuncs.push(function() {
    //console.info("onrender facts 3")
    renderer.render(scene, camera);
    stats.update();
})

// run the rendering loop
var lastTimeMsec = null
requestAnimationFrame(function animate(nowMsec) {
    // keep looping
    requestAnimationFrame(animate);
    // measure time
    lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec = nowMsec
    // call each update function
    onRenderFuncs.forEach(function(onRenderFct) {
        //console.info("onrender facts 5")
        onRenderFct(deltaMsec / 1000, nowMsec / 1000)
    })
})

//////////////////////////////////////////////////////////////////////////////
// VIDEO PARSING
//////////////////////////////////////////////////////////////////////////////
function scanVideoNow(canvasEl, videoEl) {
    // dont scan if videoEl isnt yet initialized
    if (videoEl.videoWidth === 0) return
    var scale = 0.5
    // console.time('capture');
    var canvasEl = document.querySelector('#qr-canvas')
    var context = canvasEl.getContext('2d');
    // resize canvasEl
    canvasEl.width = videoEl.videoWidth * scale;
    canvasEl.height = videoEl.videoHeight * scale;
    // draw videoEl on canvasEl
    context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
    // decode the canvas content
    try {
        qrcode.decode();
    } catch (error) {
        // console.log('jsqrcode:', error);
    }
}


function parseQRCodes() {
    var canvasEl = document.createElement('canvas')
    canvasEl.id = 'qr-canvas' // KLUDGE by jsqrcode.js - forced to have this domID
    canvasEl.style.display = 'none'
    document.body.appendChild(canvasEl)
    var videoEl = document.getElementsByTagName("video")[0];
    //      init qrcode callback to received scanned result
    qrcode.callback = function read(qrCodeValue) {
        onQrCodeFound(qrCodeValue)

    };

    setInterval(function() {
        scanVideoNow(canvasEl, videoEl)
    }, 100);
}

//////////////////////////////////////////////////////////////////////////////
// The Good Stuff
//////////////////////////////////////////////////////////////////////////////

var currentMarkerId = 0
var foundMarkers = new Set();

function onQrCodeFound(qrCodeValue) {
    console.log("onQrCodeFound", foundMarkers.has(qrCodeValue), qrCodeValue, foundMarkers)
    if (foundMarkers.has(qrCodeValue) === false) {
        foundMarkers.add(qrCodeValue)
        var followerId = qrCodeValue;
        var markerId = currentMarkerId;
        currentMarkerId += 1
        // create a detector
        detectors.push(new MarkerDetector(followerId, markerId, scene));
    }
    // update the client
    var markerId = markerIdFor(qrCodeValue)
    sendMarkerMessage(qrCodeValue, markerId);
}

function markerIdFor(qrCodeValue) {
    for (var i = 0; i < detectors.length; i++) {
        if (detectors[i].followerId == qrCodeValue) {
            return detectors[i].markerId
        }
    }
    return ""
}

function toggle(x) {
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}


var onDrag = throttled(250, function(top, left) {
    console.log("onDrag", "left", left, "top", top);

    var activeDetectors = detectors.filter(function(detector) {
        return detector.isActive === true
    })

    // furtherest left point - min of A.x's
    // furtherest right point - max of A.x's
    // map to widt
    var minX = 9999999999999999
    var maxX = -9999999999999999
    var minY = 9999999999999999
    var maxY = -9999999999999999
    activeDetectors.forEach(function(detector) {
        minX = Math.min(minX, detector.pointOfIntersectionA.x)
        maxX = Math.max(maxX, detector.pointOfIntersectionC.x)
        minY = Math.min(minY, detector.pointOfIntersectionB.y)
        maxY = Math.max(maxY, detector.pointOfIntersectionA.y)
    });

    var fieldWith = maxX - minX
    var fieldHeight = maxY - minY
    var fieldSize = Math.max(fieldWith, fieldHeight)

    var image = document.getElementById("draggable-image");
    var imageWidth = image.width;
    var imageHeight = image.height;

    //console.log("minX", minX, "maxX", maxX, "minY", minY, "maxY", maxY, "fieldWith", fieldWith, "fieldHeight", fieldHeight)

    //var imageHeight = image.height;
    var topPct = top / imageHeight * -1
    var leftPct = left / imageWidth * -1
    console.log("topPct", topPct, "leftPct", leftPct)
    activeDetectors.forEach(function(detector) {

        var scalarX = fieldWith == 0 ? 0 : (detector.pointOfIntersectionA.x - minX) / fieldSize
        var scalarY = fieldHeight == 0 ? 0 : (maxY - detector.pointOfIntersectionA.y) / fieldSize
        var pctOfWhole = (detector.pointOfIntersectionC.x - detector.pointOfIntersectionA.x) / fieldSize
        if (imageWidth > imageHeight) {
            scalarX *= imageHeight / imageWidth
        } else {
            scalarY *= imageWidth / imageHeight
        }
        detector.div.textContent = "x " + scalarX + " y " + scalarY + " pct " + pctOfWhole
        sendPositionMessage(
            detector.followerId, 
            topPct + scalarY, 
            leftPct + scalarX,
            pctOfWhole
        );
    });
});

function activateDetectors() {
    detectors.forEach(function(detector) {
        detector.isActive = (detector.object3d.visible === true)
    });
}

function switchViews() {
    // switch back and forth between video and mural views
    
    toggle(draggable);
    toggle(document.getElementById("chat-container"));
    toggle(document.getElementsByTagName("video")[0]);
    
    if (draggable.style.display == "none") {
        detectors.forEach(function(detector) {
            console.log("show detector", detector.followerId, detector.markerId)
            sendMarkerMessage(detector.followerId, detector.markerId)
        });
    } else {
        var image = document.getElementById("draggable-image");
        var imageURL = '/static/images/PanamericanUnity.jpg';
        var imageWidth = image.width;
        var imageHeight = image.height;
        activateDetectors()
        detectors.filter(function(detector) {
            return detector.isActive === true
        }).forEach(function(detector) {
            console.log("sending to marker", detector.followerId, imageURL, imageWidth, imageHeight)
            sendImageMessage(detector.followerId, imageURL, imageWidth, imageHeight);
        });
        onDrag(0,0)
    }
    
}

$("#input-form-take-snapshot").on("submit", function(event) {
    event.preventDefault();
    console.log("Oh YEahh!!!", foundMarkers);
    switchViews()
});



var draggable = document.getElementById("draggable");
dragElement(draggable, onDrag);

// debug
// onQrCodeFound("q7TYVpC")
// onQrCodeFound("jHgU68m")





// revisit isActive (turn on is active if ever we found something)
// figure out why left hand edge is so far off... this is a regression
// fix printouts to something useful (x & y pct would be good)
// 