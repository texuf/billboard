
    //////////////////////////////////////////////////////////////////////////////////
    //      Init
    //////////////////////////////////////////////////////////////////////////////////

    // init renderer
    var renderer = new THREE.WebGLRenderer({
        // antialias    : true,
        alpha: true
    });
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    // renderer.setPixelRatio( 1/2 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    document.body.appendChild( renderer.domElement );

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
        sourceType : 'webcam',   
    })

    arToolkitSource.init(function onReady(){
        onResize()
        parseQRCodes()
    })
    
    // handle resize
    window.addEventListener('resize', function(){
        onResize()
    })

    function onResize(){
        arToolkitSource.onResize()  
        arToolkitSource.copySizeTo(renderer.domElement) 
        if( arToolkitContext.arController !== null ){
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
        canvasWidth: 80*3,
        canvasHeight: 60*3,
    })
    // initialize it
    arToolkitContext.init(function onCompleted(){
        // copy projection matrix to camera
        camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
    })

    // update artoolkit on every frame
    onRenderFuncs.push(function(){
        
        if( arToolkitSource.ready === false )   return
        // console.info("onrender facts 1 " + arToolkitSource.domElement)
        arToolkitContext.update( arToolkitSource.domElement )
    })
    
    
    ////////////////////////////////////////////////////////////////////////////////
    //          Create a ArMarkerControls
    ////////////////////////////////////////////////////////////////////////////////
    class MarkerDetector {
        constructor(markerId, scene) {
            this.markerId = markerId

            this.markerRoot = new THREE.Group()
            scene.add(this.markerRoot)
            this.artoolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, this.markerRoot, {
                type: 'barcode',
                barcodeValue: markerId
            })

            // build a smoothedControls
            this.smoothedRoot = new THREE.Group()
            scene.add(this.smoothedRoot)
            this.smoothedControls = new THREEx.ArSmoothedControls(this.smoothedRoot, {
                lerpPosition: 0.4,
                lerpQuaternion: 0.3,
                lerpScale: 1,
            })

            var arWorldRoot = this.smoothedRoot

            // add a torus knot 
            var geometry    = new THREE.CubeGeometry(1,1,1);
            var material    = new THREE.MeshNormalMaterial({
                transparent : true,
                opacity: 0.5,
                side: THREE.DoubleSide
            }); 
            var mesh    = new THREE.Mesh( geometry, material );
            mesh.position.y = geometry.parameters.height/2
            arWorldRoot.add( mesh );
            
            function geometryFor(markerId) {
                var markerId = markerId % 3
                if (markerId == 0) {
                    return new THREE.TorusKnotGeometry(0.3,0.1,64,16);
                } else if (markerId == 1) {
                    return new THREE.CylinderGeometry(0.3,0.1,1,3.5); 
                } else {
                    return new THREE.PolyhedronGeometry(0.3,0.1,64,16); 
                }
            }
            var geometry    = geometryFor(markerId)
            var material    = new THREE.MeshNormalMaterial(); 
            this.mesh    = new THREE.Mesh( geometry, material );
            this.mesh.position.y = 0.5
            arWorldRoot.add( this.mesh );
            
        }

        update() {
            // console.info("update marker detector", this.markerId)
            this.smoothedControls.update(this.markerRoot)
            this.mesh.rotation.x += 0.1
        }
    }

    var detectors = [
        new MarkerDetector(0, scene),
        new MarkerDetector(1, scene)
    ]

    onRenderFuncs.push(function(delta){
        detectors.forEach(function(detector){
            detector.update()
        })
    })
    
    //////////////////////////////////////////////////////////////////////////////////
    //      render the whole thing on the page
    //////////////////////////////////////////////////////////////////////////////////
    var stats = new Stats();
    document.body.appendChild( stats.dom );
    // render the scene
    onRenderFuncs.push(function(){
        //console.info("onrender facts 3")
        renderer.render( scene, camera );
        stats.update();
    })

    // run the rendering loop
    var lastTimeMsec= null
    requestAnimationFrame(function animate(nowMsec){
        // keep looping
        requestAnimationFrame( animate );
        // measure time
        lastTimeMsec    = lastTimeMsec || nowMsec-1000/60
        var deltaMsec   = Math.min(200, nowMsec - lastTimeMsec)
        lastTimeMsec    = nowMsec
        // call each update function
        onRenderFuncs.forEach(function(onRenderFct){
            //console.info("onrender facts 5")
            onRenderFct(deltaMsec/1000, nowMsec/1000)
        })
    })

//////////////////////////////////////////////////////////////////////////////
// VIDEO PARSING
//////////////////////////////////////////////////////////////////////////////
function scanVideoNow(canvasEl, videoEl){
    // dont scan if videoEl isnt yet initialized
    if( videoEl.videoWidth === 0 )  return
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
        var foundResult = true
    } catch(error) {
        // console.log('jsqrcode:', error);
        var foundResult = false
    }   
    return foundResult
}


function parseQRCodes() {
  var canvasEl = document.createElement('canvas')
  canvasEl.id = 'qr-canvas'   // KLUDGE by jsqrcode.js - forced to have this domID
  canvasEl.style.display = 'none'
  document.body.appendChild(canvasEl)
  var videoEl = document.getElementsByTagName("video")[0];
  //      init qrcode callback to received scanned result
  qrcode.callback = function read(qrCodeValue){
    console.log('read value', qrCodeValue)
    
  };

  scanVideoNow(canvasEl, videoEl)
  setInterval(function() {
      scanVideoNow(canvasEl, videoEl)
  }, 100);
}



$("#input-form-marker").on("submit", function(event) {
  event.preventDefault();
  var follower = $("#input-follower")[0].value;
  var marker   = $("#input-marker")[0].value;
  outbox.send(JSON.stringify({ channel: follower, type:"marker", marker: marker }));
  // $("#input-marker")[0].value = "";
});


$("#input-form-image").on("submit", function(event) {
  event.preventDefault();
  var follower = $("#input-follower")[0].value;
  var image   = $("#input-image")[0].value;
  outbox.send(JSON.stringify({ channel: follower, type:"image", image: image }));
});


$("#input-form-position").on("submit", function(event) {
  event.preventDefault();
  var follower = $("#input-follower")[0].value;
  var x   = $("#input-x")[0].value;
  var y   = $("#input-y")[0].value;
  var width   = $("#input-width")[0].value;
  var height   = $("#input-height")[0].value;
  outbox.send(JSON.stringify({ channel: follower, type:"position", x: x, y: y, width: width, height: height }));
});


$("#input-form-chat").on("submit", function(event) {
  event.preventDefault();
  var handle = $("#input-handle")[0].value;
  var text   = $("#input-text")[0].value;
  outbox.send(JSON.stringify({ handle: handle, text: text }));
  $("#input-text")[0].value = "";
});
