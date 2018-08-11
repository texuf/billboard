//////////////////////////////////////////////////////////////////////////////////
//      Init
//////////////////////////////////////////////////////////////////////////////////

console.assert(typeof outbox != 'undefined', "please import pubsub.js before continuing")
console.assert(typeof dragElement != 'undefined', "please import draggable.js before continuing")

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



////////////////////////////////////////////////////////////////////////////////
//          MarkerHelper renders over marker
////////////////////////////////////////////////////////////////////////////////
class MarkerHelper {
    constructor(text) {
        this.object3d = new THREE.Group

        var mesh = new THREE.AxisHelper()
        this.object3d.add(mesh)

        var canvas = document.createElement( 'canvas' );
        canvas.width =  64;
        canvas.height = 64;

        var context = canvas.getContext( '2d' );
        var texture = new THREE.CanvasTexture( canvas );

        // put the text in the sprite
        context.font = '48px monospace';
        context.fillStyle = 'rgba(192,192,255, 0.9)';
        context.fillRect( 0, 0, canvas.width, canvas.height );
        context.fillStyle = 'darkblue';
        context.fillText(text, canvas.width/4, 3*canvas.height/4 )
        texture.needsUpdate = true
        
        // var geometry = new THREE.CubeGeometry(1, 1, 1)
        var geometry = new THREE.PlaneGeometry(1, 1)
        var material = new THREE.MeshBasicMaterial({
            map: texture, 
            color: "pink",
            transparent: true,
            opacity: 0.9 //,
            // wireframe: true
        });
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.rotation.x = -Math.PI/2

        this.object3d.add(this.mesh)
    }
}

////////////////////////////////////////////////////////////////////////////////
//          Create a ArMarkerControls
////////////////////////////////////////////////////////////////////////////////
class MarkerDetector {
    constructor(followerId, markerId, scene) {
        console.log("New MarkerDetector", followerId, markerId, scene)
        this.followerId = followerId
        this.markerId = markerId

        this.object3d = new THREE.Group()
        scene.add(this.object3d)
        this.artoolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, this.object3d, {
            type: 'barcode',
            barcodeValue: markerId
        })
        
        this.markerHelper = new MarkerHelper(markerId)
        this.artoolkitMarker.object3d.add(this.markerHelper.object3d)

        this.div = this.addDiv(markerId + "a")
        this.divb = this.addDiv(markerId + "b")
        this.divc = this.addDiv(markerId + "c")
        
        //this.add3d(markerId)
        this.pointOfIntersectionA = new THREE.Vector3();
        this.pointOfIntersectionB = new THREE.Vector3();
        this.pointOfIntersectionC = new THREE.Vector3();
    }

    addDiv(markerId) {
        var div = document.createElement('div')
        div.style.width = "0px";
        div.style.height = "0px";
        div.style.background = "pink";
        div.style.opacity = "0.5";
        div.style.position = "absolute";
        div.style.left = "0px";
        div.style.top = "0px";
        div.style.overflow = "hidden";
        div.style.zIndex = "999"
        div.style.textAlign = "center"
        div.id = "marker-" + markerId
        div.textContent = markerId
        document.body.appendChild(div)
        return div
    }

    add3d(markerId) {
        var arWorldRoot = this.artoolkitMarker.object3d

        var geometry = new THREE.CubeGeometry(1, 1, 1);
        var material = new THREE.MeshNormalMaterial({
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = geometry.parameters.height / 2
        arWorldRoot.add(mesh);

        function geometryFor(markerId) {
            var markerId = markerId % 3
            if (markerId == 0) {
                return new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16);
            } else if (markerId == 1) {
                return new THREE.CylinderGeometry(0.3, 0.1, 1, 3.5);
            } else {
                return new THREE.PolyhedronGeometry(0.3, 0.1, 64, 16);
            }
        }
        var geometry = geometryFor(markerId)
        var material = new THREE.MeshNormalMaterial();
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.y = 0.5
        arWorldRoot.add(this.mesh);
    }

    update(rotation, mathPlane) {
        // console.info("update marker detector", this.markerId)
        if (this.object3d.visible) {

            // copy rotation over
            //var saveRotation = new THREE.Vector3()
            //saveRotation.copy(this.object3d.rotation)
            //this.object3d.rotation.x = Math.PI/2;//rotation.x
            //this.object3d.rotation.z = 0;//rotation.z
            //this.object3d.updateMatrix()


            var fullWidth = 300
            var fullHeight = 200
            var thisWidth = 20 // todo dynamic height
            var thisHeight = 20
            var rotationY = 0
            this.div.style.width = thisWidth + 'px';
            this.div.style.height = thisHeight + 'px';

            this.divb.style.width = thisWidth + 'px';
            this.divb.style.height = thisHeight + 'px';

            this.divc.style.width = thisWidth + 'px';
            this.divc.style.height = thisHeight + 'px';
            //this.div.style.left = "200px"; //(fullWidth/2 + this.object3d.position.x * fullWidth/2) +'px';
            //this.div.style.top = "100px"; //(fullHeight/2 - this.object3d.position.y * fullHeight/2 ) +'px';
            this.div.style.transform = 'translate3d(-50%, -50%, 0) rotateZ('+this.object3d.rotation.y*-1+'rad)'
            this.divb.style.transform = 'translate3d(-50%, -50%, 0) rotateZ('+this.object3d.rotation.y*-1+'rad)'
            this.divc.style.transform = 'translate3d(-50%, -50%, 0) rotateZ('+this.object3d.rotation.y*-1+'rad)'
            //var vector = projector.projectVector( this.object3d.position.clone(), camera );
            //vector.x *= canvas.width;
            //vector.y *= canvas.height;

            // create really tall 'in'visible lines from top left, top right and bottom right (vector)
            var markerPlane = this.markerHelper.mesh
            var geomA = new THREE.Vector3(),
                geomB = new THREE.Vector3(),
                geomC = new THREE.Vector3();
            var planePointA = new THREE.Vector3(),
                planePointB = new THREE.Vector3(),
                planePointC = new THREE.Vector3();
            var a = new THREE.Vector3(),
                b = new THREE.Vector3(),
                c = new THREE.Vector3();
            // copy the verts
            this.pointOfIntersectionA.copy(markerPlane.geometry.vertices[markerPlane.geometry.faces[0].a])
            geomB.copy(markerPlane.geometry.vertices[markerPlane.geometry.faces[0].b])
            geomC.copy(markerPlane.geometry.vertices[markerPlane.geometry.faces[0].c])
            
            //geomA.y -= 10000000
            //geomB.y -= 10000000
            //geomC.y -= 10000000

            // create points
            markerPlane.localToWorld(planePointA.copy(geomA));
            markerPlane.localToWorld(planePointB.copy(geomB));
            markerPlane.localToWorld(planePointC.copy(geomC));
            
            // translate the verts
            geomA.y += 10000000
            geomB.y += 10000000
            geomC.y += 10000000

            // make second set of points
            markerPlane.localToWorld(a.copy(geomA));
            markerPlane.localToWorld(b.copy(geomB));
            markerPlane.localToWorld(c.copy(geomC));
            
            // create lines
            var lineA = new THREE.Line3(planePointA, a);
            var lineB = new THREE.Line3(planePointB, b);
            var lineC = new THREE.Line3(planePointC, c);
            
            // intersect
            
            //this.pointOfIntersectionA = mathPlane.projectPoint(planePointA);
            //this.pointOfIntersectionB = mathPlane.projectPoint(planePointB);
            //this.pointOfIntersectionC = mathPlane.projectPoint(planePointC);
            markerPlane.localToWorld(this.pointOfIntersectionA.copy(markerPlane.geometry.vertices[markerPlane.geometry.faces[0].a]))
            markerPlane.localToWorld(this.pointOfIntersectionB.copy(markerPlane.geometry.vertices[markerPlane.geometry.faces[0].b]))
            markerPlane.localToWorld(this.pointOfIntersectionC.copy(markerPlane.geometry.vertices[markerPlane.geometry.faces[0].c]))
            

            this.pointOfIntersectionA.project(camera)
            this.pointOfIntersectionB.project(camera)
            this.pointOfIntersectionC.project(camera)

            this.div.style.left = Math.round(this.pointOfIntersectionA.x * fullWidth + fullWidth) + 'px';
            this.div.style.top = Math.round(fullHeight - this.pointOfIntersectionA.y * fullHeight ) + 'px';

            this.divb.style.left = Math.round(this.pointOfIntersectionB.x * fullWidth + fullWidth) + 'px';
            this.divb.style.top = Math.round(fullHeight - this.pointOfIntersectionB.y * fullHeight ) + 'px';

            this.divc.style.left = Math.round(this.pointOfIntersectionC.x * fullWidth + fullWidth) + 'px';
            this.divc.style.top = Math.round(fullHeight - this.pointOfIntersectionC.y * fullHeight ) + 'px';

            //this.object3d.rotation.copy(saveRotation.copy)
            //this.object3d.updateMatrix()


            // take the first found marker, create a math plane
            // get all intersections of lines with plane from last known mesh position https://jsfiddle.net/8uxw667m/77/
            // map points to a 2d plane
            // translate all points to positive upper left coord space (flip y, add 0-minx and 0-miny to all)
            // subtract og z rotation OR rotate all but og back to normal
            // normalize positions
            // insert renderer in div to test (div rotates one way to follow phone, renderer rotates image back to match)
            // sent opposite rotation and positions to phones
            
        }
    }
}


var mathPlane = new THREE.Plane();
var mathPlanePointA = new THREE.Vector3(),
    mathPlanePointB = new THREE.Vector3(),
    mathPlanePointC = new THREE.Vector3();
var detectors = [];
// preload some markers for debugging
// detectors.push(new MarkerDetector(11, 1, scene));
// detectors.push(new MarkerDetector(10, 2, scene));

onRenderFuncs.push(function(delta) {

    // very silly algo
    
    // create really tall 'in'visible lines from top left, top right and bottom right (vector)
    // take the first found marker, create a math plane
    // get all intersections of lines with plane from last known mesh position https://jsfiddle.net/8uxw667m/77/
    // map points to a 2d plane
    // translate all points to positive upper left coord space (flip y, add 0-minx and 0-miny to all)
    // subtract og z rotation OR rotate all but og back to normal
    // normalize positions
    // insert renderer in div to test (div rotates one way to follow phone, renderer rotates image back to match)
    // sent opposite rotation and positions to phones
    var visibleMarkerControls = detectors.filter(function(detector) {
        return detector.object3d.visible === true
    })
    if (visibleMarkerControls.length > 0) {
        var rotation = visibleMarkerControls[0].object3d.rotation
        var plane = visibleMarkerControls[0].markerHelper.mesh
        plane.localToWorld(mathPlanePointA.copy(plane.geometry.vertices[plane.geometry.faces[0].a]));
        plane.localToWorld(mathPlanePointB.copy(plane.geometry.vertices[plane.geometry.faces[0].b]));
        plane.localToWorld(mathPlanePointC.copy(plane.geometry.vertices[plane.geometry.faces[0].c]));
        mathPlane = mathPlane.setFromCoplanarPoints(mathPlanePointA, mathPlanePointB, mathPlanePointC);
        
        visibleMarkerControls.forEach(function(detector) {
            detector.update(rotation, mathPlane)
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
    /*
    setInterval(function() {
        
        var visibleMarkerControls = detectors.filter(function(detector) {
            return detector.object3d.visible === true
        }).map(function(detector) {
            // return JSON.stringify(detector.object3d.scale, null, ' ')
            // return detector.object3d
            // return screenSpaceFor(detector.object3d)
            // return JSON.stringify(detector.object3d.rotation, null, ' ')
            return detector.artoolkitMarker
        });
        console.log("foo", visibleMarkerControls)
    }, 3000); */
}

function screenSpaceFor(object) {
    let pos = new THREE.Vector3();
    pos = pos.setFromMatrixPosition(object.matrixWorld);
    pos.project(camera);

    let widthHalf = canvasWidth / 2;
    let heightHalf = canvasHeight / 2;
    return pos
    //pos.x = (pos.x * widthHalf) + widthHalf;
    //pos.y = - (pos.y * heightHalf) + heightHalf;
    //pos.z = 0;
    //return pos
}

//////////////////////////////////////////////////////////////////////////////
// The Good Stuff
//////////////////////////////////////////////////////////////////////////////

var currentMarkerId = 0
var foundMarkers = new Set();

function onQrCodeFound(qrCodeValue) {
    if (foundMarkers.has(qrCodeValue)) {
        return;
    }
    console.log("onQrCodeFound", foundMarkers)
    foundMarkers.add(qrCodeValue)
    var followerId = qrCodeValue;
    var markerId = currentMarkerId;
    currentMarkerId += 1
    // create a detector
    detectors.push(new MarkerDetector(followerId, markerId, scene));
    // update the client
    sendMarkerMessage(followerId, markerId);
}

function toggle(x) {
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function onDrag(top, left) {
    //console.log("ondrag", top, left)
}

function switchViews() {
    // switch back and forth between video and mural views
    var image = document.getElementById("draggable-image");
    toggle(draggable);
    toggle(document.getElementById("chat-container"));
    toggle(document.getElementsByTagName("video")[0]);
    
    if (draggable.style.display == "none") {
        detectors.forEach(function(detector) {
            console.log("show detector", detector.followerId, detector.markerId)
            sendMarkerMessage(detector.followerId, detector.markerId)
        });
    } else {
        var imageURL = '/static/images/PanamericanUnity.jpg';
        var imageWidth = image.width;
        var imageHeight = image.height;
        foundMarkers.forEach(function(follower) {
            console.log("sending to marker", follower, imageURL, imageWidth, imageHeight)
            sendImageMessage(follower, imageURL, imageWidth, imageHeight);
        });
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
// onQrCodeFound("BYc8Dco")
// onQrCodeFound("jHgU68m")
