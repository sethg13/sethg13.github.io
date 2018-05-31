var camera, scene, renderer, controls;
var mouseX = 0, mouseY = 0;
var cube, sun;

init();
animate();

function init() {
    // Camera
    camRatio = window.innerWidth/window.innerHeight
    camera = new THREE.PerspectiveCamera(50, camRatio, 0.1, 100);
    camera.position.x = 0;
    camera.position.y = 1;
    camera.position.z = 10;
    
    // Scene
    scene = new THREE.Scene();;
    scene.background = new THREE.Color().setHSL(0.5, 0.25, 0.01);

    // Cube
    var cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    var cubeMat = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        specular: 0xffffff,
        shininess: 5
    });
    cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.y = 1;
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);

    // Floor
    var floorMat = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        color: 0xffffff,
        metalness: 0.2,
        bumpScale: 0.0005
    });

    var textureLoader = new THREE.TextureLoader();
    textureLoader.load("textures/hardwood2_diffuse.jpg", function(map) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set(10, 24);
        floorMat.map = map;
        floorMat.needsUpdate = true;
    });
    textureLoader.load("textures/hardwood2_bump.jpg", function(map) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set(10, 24);
        floorMat.bumpMap = map;
        floorMat.needsUpdate = true;
    });
    textureLoader.load("textures/hardwood2_roughness.jpg", function(map) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set(10, 24);
        floorMat.roughnessMap = map;
        floorMat.needsUpdate = true;
    });

    var floorGeo = new THREE.PlaneBufferGeometry(20, 20);
    var floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.receiveShadow = true;
    floorMesh.rotation.x = -Math.PI / 2.0;
    scene.add(floorMesh);

    // Lighting
    var sunGeo = new THREE.SphereBufferGeometry(0.5, 16, 16);
    var sunLight = new THREE.PointLight(0xffffff, 1, 100, 2);
    var sunMat = new THREE.MeshLambertMaterial({
        emissive: 0xffffff,
        emissiveIntensity: 1,
        color: 0x000000
    });
    sunLight.add(new THREE.Mesh(sunGeo, sunMat));
    sunLight.position.set(0, 3, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls( camera );
    
    // Handle resize
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize(event) {
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    render();
}

function render() {
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}