var paused = false;
var camera, scene;

function getChar(event) {
	if (event.which == null) {
		return String.fromCharCode(event.keyCode) // IE
	} else if (event.which != 0 && event.charCode != 0) {
		return String.fromCharCode(event.which) // the rest
	} else {
		return null // special key
	}
}

function cameraControl(c, ch) {
	var distance = c.position.length();
	var q, q2;

	switch (ch) {
		// camera controls
		case 'w':
			c.translateZ(-1);
			return true;
		case 'a':
			c.translateX(-1);
			return true;
		case 's':
			c.translateZ(1);
			return true;
		case 'd':
			c.translateX(1);
			return true;
		case 'r':
			c.translateY(1);
			return true;
		case 'f':
			c.translateY(-1);
			return true;
		case 'j':
			// extrinsic rotation about world y axis, so multiply camera's quaternion
			q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 5 * Math.PI / 180);
			q2 = new THREE.Quaternion().copy(c.quaternion);
			c.quaternion.copy(q).multiply(q2);
			return true;
		case 'l':
			q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -5 * Math.PI / 180);
			q2 = new THREE.Quaternion().copy(c.quaternion);
			c.quaternion.copy(q).multiply(q2);
			return true;
		case 'i':
			// intrinsic rotation about camera's x-axis
			c.rotateX(5 * Math.PI / 180);
			return true;
		case 'k':
			c.rotateX(-5 * Math.PI / 180);
			return true;
		case 'O':
			c.lookAt(new THREE.Vector3(0, 0, 0));
			return true;
		case 'S':
			c.fov = Math.min(80, c.fov + 5);
			c.updateProjectionMatrix();
			return true;
		case 'W':
			c.fov = Math.max(5, c.fov - 5);
			c.updateProjectionMatrix();
			return true;

			// alternates for arrow keys
		case 'J':
			//this.orbitLeft(5, distance)
			c.translateZ(-distance);
			q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 5 * Math.PI / 180);
			q2 = new THREE.Quaternion().copy(c.quaternion);
			c.quaternion.copy(q).multiply(q2);
			c.translateZ(distance)
			return true;
		case 'L':
			//this.orbitRight(5, distance)  
			c.translateZ(-distance);
			q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -5 * Math.PI / 180);
			q2 = new THREE.Quaternion().copy(c.quaternion);
			c.quaternion.copy(q).multiply(q2);
			c.translateZ(distance)
			return true;
		case 'I':
			//this.orbitUp(5, distance)      
			c.translateZ(-distance);
			c.rotateX(-5 * Math.PI / 180);
			c.translateZ(distance)
			return true;
		case 'K':
			//this.orbitDown(5, distance)  
			c.translateZ(-distance);
			c.rotateX(5 * Math.PI / 180);
			c.translateZ(distance)
			return true;
	}
	return false;
}

function handleKeyPress(event) {
	var ch = getChar(event);
	if (cameraControl(camera, ch)) return;

	switch (ch) {
		case ' ':
			paused = !paused;
			break;
		case 'x':
			axis = 'x';
			break;
		case 'y':
			axis = 'y';
			break;
		case 'z':
			axis = 'z';
			break;
		default:
			return;
	}
}


function start() {
	window.onkeypress = handleKeyPress;

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(30, 1.5, 0.1, 2000);
	camera.position.x = 20;
	camera.position.y = 10;
	camera.position.z = 500;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	var ourCanvas = document.getElementById('theCanvas');
	var renderer = new THREE.WebGLRenderer({
		canvas: ourCanvas,
		antialias: true,
		alpha: true
	});
	// ------------------------------ Add Skybox ------------------------------ /
	// Loads the six images
	var skyboxImages = [
		"../images/space/Skybox_right.png", //px
		"../images/space/Skybox_left.png", //nx
		"../images/space/Skybox_up.png", //py
		"../images/space/Skybox_down.png", //ny
		"../images/space/Skybox_front.png", //pz
		"../images/space/Skybox_back.png" //nz
	];
	var skyboxMap = THREE.ImageUtils.loadTextureCube(skyboxImages);

	// Use a built-in Three.js shader for cube maps
	var skyboxShader = THREE.ShaderLib["cube"];
	skyboxShader.uniforms["tCube"].value = skyboxMap;
	
	var skyboxMaterial = new THREE.ShaderMaterial({
		fragmentShader: skyboxShader.fragmentShader,
		vertexShader: skyboxShader.vertexShader,
		uniforms: skyboxShader.uniforms,
		side: THREE.BackSide // we'll only see the inside of the cube
	});

	// Make a big ole cube for the skybox
	var skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
	var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
	scene.add(skybox);
	
	// ------------------------------ Add Sphere ------------------------------ //
	var texture = THREE.ImageUtils.loadTexture("../images/metal.jpg");
	texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
	texture.needsUpdate = true;
	
	var sphereGeometry = new THREE.SphereGeometry(10,32,32);
	
	var material = new THREE.MeshLambertMaterial({
		color: 0xffffff,
		envMap: skyboxMap,
		refractionRatio: 0.85
	});
	
	var sphere = new THREE.Mesh(sphereGeometry, material);
	var sphereDummy = new THREE.Object3D();
	sphereDummy.add(sphere);
	
	// ------------------------------ Add Boxes ------------------------------ //
	//All boxes are children of the sphere
	var boxGeometry = new THREE.BoxGeometry(4, 4, 4);
	var material = new THREE.MeshBasicMaterial({color : 0xffffff, envMap : skyboxMap});
	
	var boxDummy = new THREE.Object3D();
	
	for (var i = 0; i < 250; i ++) {
		var box = new THREE.Mesh(boxGeometry, material);

		box.position.x = 100 * (2.0 * Math.random() - 1.0);
		box.position.y = 100 * (2.0 * Math.random() - 1.0);
		box.position.z = 100 * (2.0 * Math.random() - 1.0);
		
		box.rotation.x = Math.random() * Math.PI;
		box.rotation.y = Math.random() * Math.PI;
		box.rotation.z = Math.random() * Math.PI;

		box.matrixAutoUpdate = false;
		box.updateMatrix();
		
		boxDummy.add(box);
	}
	sphereDummy.add(boxDummy);
	scene.add(sphereDummy);
	
	// ------------------------------ Add Object ------------------------------ //
	var manager = new THREE.LoadingManager();
	manager.onProgress = function (item, loaded, total) {
		console.log(item, loaded, total);
	};
	
	var texture = new THREE.Texture();

	var loader = new THREE.ImageLoader(manager);
	loader.load( '../images/metal.jpg', function (image) {
		texture.image = image;
		texture.needsUpdate = true;
	} );
	
	var loader = new THREE.OBJLoader(manager);
	loader.load('dark_fighter.obj', function (object) {
		object.traverse( function ( child ) {
			if (child instanceof THREE.Mesh) {
				child.material.map = texture;
			}
		});

		object.rotation.y = -(Math.PI / 2);
		
		object.position.x  = 0;
		object.position.y  = 0;
		object.position.z  = 400;
		
		scene.add(object);
	});
	
	// ------------------------------ Add Lights ------------------------------ //
	var light = new THREE.PointLight(0xffffff, 2, 2000);
	scene.add(light);
	
	var red_light = new THREE.PointLight(0xff0000, 1, 2000);
	red_light.position.set(100, 0, 0);
	scene.add(red_light);
	
	var green_light = new THREE.PointLight(0x00ff00, 1, 2000);
	green_light.position.set(0, 100, 0);
	scene.add(green_light);
	
	var blue_light = new THREE.PointLight(0x0000ff, 1, 2000);
	blue_light.position.set(0, 0, 100);
	scene.add(blue_light);
	
	var ambient = new THREE.AmbientLight(0x101020);
	scene.add(ambient);
	
	// ------------------------------ Animate ------------------------------ //
	// The cubes doen't use quaterions like the camera, and will gimbal lock in there orbit about the sphere
	var rotation = 0;
	var increment = 0.1 * Math.PI / 180.0;
	
	var render = function () {
		requestAnimationFrame( render );
		rotation += increment;

		// start at the root and apply the rotation to each cube
		sphereDummy.traverse( function (object) {
			//object.rotation.x = rotation;
			object.rotation.y = rotation;
			object.rotation.z = rotation;
		});
		renderer.render(scene, camera);
	};
	render();
}