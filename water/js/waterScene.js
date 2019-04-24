var camera, scene, renderer, controls;
var mouseX = 0, mouseY = 0;
var cube;
var light, ambientLight;

init();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.CubeTextureLoader()
        .setPath('textures/skybox/')
        .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);

    var textureCube = new THREE.CubeTextureLoader()
        .setPath('textures/cube/Park3Med/' )
        .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
    textureCube.mapping = THREE.CubeRefractionMapping;

    var material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        envMap: textureCube,
        refractionRatio: 0.75,
        opacity: 0.95,
        premultipliedAlpha: true,
        transparent: true
    });


    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 1000);
    camera.position.set(2, 5, -10);
    camera.lookAt( scene.position );

    // Renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.gammaOutput = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x20252f);
    //renderer.shadowMap.enabled = true;
    //renderer.shadowMap.type = THREE.BasicShadowMap;
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Handle resize
    window.addEventListener('resize', onWindowResize, false);

    // Lighting
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(-1.1, 0.5, 1);
    scene.add(light);

    ambientLight = new THREE.AmbientLight(0x080808);
    scene.add(ambientLight);



    // Cube
    var cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    cube = new THREE.Mesh(cubeGeo, material);
    cube.position.y = 1;
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);


    // Marching Cubes
    resolution = 28;
    effect = new THREE.MarchingCubes(resolution, material, true, true );
    effect.position.set(0, 0, 0);
    effect.scale.set(700, 700, 700);
    effect.enableUvs = false;
    effect.enableColors = false;
    scene.add(effect);

    // Floor
    var floorMat = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        color: 0xffffff,
        metalness: 0.2,
        bumpScale: 0.0005
    });

    var textureLoader = new THREE.TextureLoader();
    textureLoader.load("textures/hardwood/hardwood2_diffuse.jpg", function(map) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set(10, 24);
        floorMat.map = map;
        floorMat.needsUpdate = true;
    });
    textureLoader.load("textures/hardwood/hardwood2_bump.jpg", function(map) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set(10, 24);
        floorMat.bumpMap = map;
        floorMat.needsUpdate = true;
    });
    textureLoader.load("textures/hardwood/hardwood2_roughness.jpg", function(map) {
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
    floorMesh.position.y = -2;
    scene.add(floorMesh);
}


function onWindowResize(event) {
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
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
