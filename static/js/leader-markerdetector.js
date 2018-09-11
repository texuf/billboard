
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

        this.div = this.addDiv(markerId + "a", 0)
        this.divb = this.addDiv(markerId + "b", 1)
        this.divc = this.addDiv(markerId + "c", 2)
        
        this.pointOfIntersectionA = new THREE.Vector3();
        this.pointOfIntersectionB = new THREE.Vector3();
        this.pointOfIntersectionC = new THREE.Vector3();

        this.isActive = false
    }

    addDiv(markerId, index) {
        var div = document.createElement('div')
        div.style.width = "0px";
        div.style.height = "0px";
        div.style.background = "pink";
        div.style.opacity = "0.5";
        div.style.position = "absolute";
        div.style.left = 10 + "px"
        div.style.top = (50 + this.markerId * 20 * 3 + index * 20) + "px"
        console.log("add div", this.markerId, index, div.style.left, div.style.top)
            
        div.style.overflow = "hidden";
        div.style.zIndex = "999"
        div.style.textAlign = "left"
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

    update(rotation) {
        // console.info("update marker detector", this.markerId)
        if (this.object3d.visible) {

            // copy rotation over
            //var saveRotation = new THREE.Vector3()
            //saveRotation.copy(this.object3d.rotation)
            //this.object3d.rotation.x = Math.PI/2;//rotation.x
            //this.object3d.rotation.z = 0;//rotation.z
            //this.object3d.updateMatrix()


            var fullWidth = 400
            var fullHeight = 350
            var thisWidth = 300 // todo dynamic height
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
            //this.div.style.transform = 'translate3d(-50%, -50%, 0) rotateZ('+this.object3d.rotation.y*-1+'rad)'
            //this.divb.style.transform = 'translate3d(-50%, -50%, 0) rotateZ('+this.object3d.rotation.y*-1+'rad)'
            //this.divc.style.transform = 'translate3d(-50%, -50%, 0) rotateZ('+this.object3d.rotation.y*-1+'rad)'
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
            
            markerPlane.localToWorld(this.pointOfIntersectionA.copy(markerPlane.geometry.vertices[markerPlane.geometry.faces[0].a]))
            markerPlane.localToWorld(this.pointOfIntersectionB.copy(markerPlane.geometry.vertices[markerPlane.geometry.faces[0].b]))
            markerPlane.localToWorld(this.pointOfIntersectionC.copy(markerPlane.geometry.vertices[markerPlane.geometry.faces[0].c]))
            

            this.pointOfIntersectionA.project(camera)
            this.pointOfIntersectionB.project(camera)
            this.pointOfIntersectionC.project(camera)

            
            this.div.textContent = "a " + this.pointOfIntersectionA.x + ", " + this.pointOfIntersectionA.y
            this.divb.textContent = "b " + this.pointOfIntersectionB.x + ", " + this.pointOfIntersectionB.y
            this.divc.textContent = "c " + this.pointOfIntersectionC.x + ", " + this.pointOfIntersectionC.y

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
