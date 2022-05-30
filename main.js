import * as THREE            from 'three';
import {GLTFLoader}          from 'GLTFLoader';
import {PointerLockControls} from "PointerLockControls";
import {OrbitControls}       from "OrbitControls";
import {TWEEN}               from "TWEEN";
import {OceanScene}          from "./scenes/OceanScene.js";
import {HellScene}                                                          from "./scenes/HellScene.js";
import {BasicCharacterController, ThirdPersonCameraDemo, ThirdPersonCamera} from "./components/Character.js"



const objects = [];
const time    = new THREE.Clock(true);

let raycaster;

let moveForward  = false;
let moveBackward = false;
let moveLeft     = false;
let moveRight    = false;
let canJump      = false;

var prevTime    = performance.now();
const velocity  = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex    = new THREE.Vector3();
const color     = new THREE.Color();



const onKeyDown = function (event) {
	switch (event.code) {

		case 'ArrowUp':
		case 'KeyW':
			moveForward = true;
			break;

		case 'ArrowLeft':
		case 'KeyA':
			moveLeft = true;
			break;

		case 'ArrowDown':
		case 'KeyS':
			moveBackward = true;
			break;

		case 'ArrowRight':
		case 'KeyD':
			moveRight = true;
			break;

		case 'Space':
			if (canJump === true) {
				velocity.y += 350;
			}
			canJump = false;
			break;

	}

};


const onKeyUp = function (event) {

	switch (event.code) {

		case 'ArrowUp':
		case 'KeyW':
			moveForward = false;
			break;

		case 'ArrowLeft':
		case 'KeyA':
			moveLeft = false;
			break;

		case 'ArrowDown':
		case 'KeyS':
			moveBackward = false;
			break;

		case 'ArrowRight':
		case 'KeyD':
			moveRight = false;
			break;

	}

};

// var camera             = null;
var userinterfaceScene = null;
var userinterfaceCamera;
var firstPersonCamera;
var music              = new Audio();
var voiceOver          = new Audio();
var currentVoice       = new Audio();
var controls;

var blocker     = document.getElementById('blocker');
var pausemenu   = document.getElementById('pause-menu');
var startbutton = document.getElementById('start-button');

var song1 = 'resources/audio/music/Glass.mp3'.toString();
var song2 = 'resources/audio/music/Clubs_intro.mp3'.toString();
var song3 = 'resources/audio/music/Clubs_Climax.mp3'.toString();

const songs = [new Audio(song1), new Audio(song2), new Audio(song3)];
var voices  = [];

var SCENE_       = null;
var SCENE_INDEX  = 0;
var SCENE_ACTIVE = false;


function SequenceManager() {
	// currentSong     = new Audio();
	var previousRAF_ = null;
	var currentScene = 0;
	var firstStart   = true;
	var loadedRender = false;
	var loadedLights = false;
	var loadedHell   = false;
	var loadedPost   = false;
	var loadedUser   = false;
	var loadedAudio  = false;
	var loadedHorror = false;

	var isFixed    = false;
	var isReady    = false;
	var isPlaying  = false;
	var isPlayable = true;

	var toneShiftOne   = false;
	var toneShiftTwo   = false;
	var toneShiftThree = false;
	var toneShiftFour  = false;
	var toneShiftFive  = false;
	var encased        = false;

	const renderer = buildRenderer(canvas);
	const scene    = buildScene();
	const camera = buildCamera();
	const params = {
		renderer, camera, scene
	};
	const character = new ThirdPersonCameraDemo(params);
	// const firstPersonCamera         = buildPerson();
	// const orbitCon  = setOrbitControls();
	// var manitou     = loadManitou_();
	// const Horror    = loadHorror_();
	var currentSong = initializeAudio_();
	init(canvas);


	function buildScene() {
		const scene = new THREE.Scene();
		return scene;
	}

	function buildRenderer(canvas_) {
		const rend             = new THREE.WebGLRenderer({
			antialias: false,
		});
		rend.shadowMap.enabled = true;
		rend.shadowMap.type    = THREE.PCFSoftShadowMap;
		rend.setPixelRatio(window.devicePixelRatio);
		rend.setSize(window.innerWidth, window.innerHeight);
		rend.physicallyCorrectLights = true;
		rend.outputEncoding          = THREE.sRGBEncoding;
		rend.gammaFactor             = 1.2;
		rend.gammaOutput             = 2.2;
		canvas_.appendChild(rend.domElement);
		// loadedRender = true;
		return rend;

	}

	function setReady(b) {
		isReady = b;
	}


	function checkReady() {
		return isReady;
	}


	async function init(canvas) {

		controls = new PointerLockControls(camera, document.body);
		// controls = new PointerLockControls(camera, renderer.domElement);

		const eventReady = new CustomEvent('ready', {
			isReady: true,
			detail:  {text: () => textarea.value}
		});

		pausemenu.addEventListener('click', function () {
			if (isReady) {
				controls.lock();
			}
		});

		controls.addEventListener('lock', function () {
			pausemenu.style.display = '';
			blocker.style.display   = 'none';
			if (currentSong.isPaused) {
				currentSong.resume();
			}

		});

		controls.addEventListener('unlock', function () {
			blocker.style.display   = 'block';
			pausemenu.style.display = 'block';
			if (currentSong.isPlaying) {
				currentSong.pause();
			}
		});
		scene.add(controls.getObject());

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);
		raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
		document.body.appendChild(renderer.domElement);

		isReady = true;
		startbutton.classList.add(".ready");
		setReady(true);
		await sceneSwitcher();
	}



	async function sceneSwitcher() {
		if (SCENE_INDEX === 0) {
			SCENE_ = new HellScene(camera, scene, renderer, controls, userinterfaceCamera, userinterfaceScene, canvas);
		}

		if (SCENE_INDEX === 1) {
			SCENE_ = new OceanScene(camera, scene, renderer, controls, userinterfaceCamera, userinterfaceScene, canvas);
		}
		SCENE_INDEX++;
		SCENE_ACTIVE = true;
	}

	// init().then(r => {
	// 	// animate();
	// 	pausemenu.add(".ready");
	// 	setReady(true);
	//
	// });

	//
	// function setOrbitControls() {
	// 	const controls         = new OrbitControls(camera, renderer.domElement);
	// 	controls.maxPolarAngle = Math.PI * 0.495;
	// 	controls.target.set(0, 2, 0);
	// 	controls.minDistance = 1.0;
	// 	controls.maxDistance = 2.0;
	// 	controls.update();
	// 	return controls;
	// }

	//
	// function setReady(b) {
	// 	isReady = b;
	// }
	//
	//
	// function checkReady() {
	// 	return isReady;
	// }


	//
	// * loadingScreen() {
	// 	while (!checkReady()) {
	// 		document.body.classList.add('load-cover');
	// 		document.addEventListener("any", function (event) {
	// 			event.preventDefault();
	// 		});
	// 		window.addEventListener("any", function (event) {
	// 			event.preventDefault();
	// 		});
	// 		yield;
	// 	}
	// 	document.body.classList.remove('load-cover');
	//
	// }

	//
	// function updateSequence(timeElapsed) {
	// 	// console.log(currentSong.currentTime);
	// 	if (!SCENE_ACTIVE) {
	// 		return SCENE_SWITCHER();
	// 	}
	// 	if (isPlaying) {
	// 		if (!toneShiftOne) {
	// 			// console.log("Initiated walling...");
	// 			if (!encased) {
	// 				if (currentSong.currentTime <= 45) {
	// 					// console.log("Tone shift #1");
	// 					scene.children.forEach(obj => {
	// 						if (obj.name === 'wall') {
	// 							obj.translateY(0.05);
	// 						}
	// 					});
	// 				}
	// 				else {
	// 					toneShiftOne = true;
	// 					encased      = true;
	// 					Horror.position.set(Horror.positionX, 8, Horror.positionZ);
	// 					// Horror.position.copy(Horror.position);
	// 					// Horror.quaternion.copy(Horror.quaternion);
	// 				}
	// 			}
	// 		}
	//
	// 		// 20 seconds
	// 		if (toneShiftOne && !toneShiftTwo) {
	// 			console.log("Tone shift #2");
	// 			SCENE_ACTIVE = false;
	// 			// manitou.position.set(manitou.positionX, -8, manitou.positionZ);
	// 			//
	// 			// aHorror.position.set(aHorror.positionX, 8, aHorror.positionZ);
	//
	// 			//
	//
	// 			if (!toneShiftTwo) {
	// 				// toneShiftTwo = true;
	// 				// encased      = true;
	// 				// manitou
	// 				// Horror.translateOnAxis(Horror.worldToLocal(new camera.position),1);
	// 				// horrorTrack();
	//
	// 			}
	//
	// 		}
	//
	// 		if (toneShiftTwo && !toneShiftThree && currentSong.currentTime >= 50) {
	// 			console.log("Tone shift #3");
	// 			toneShiftThree = true;
	//
	// 			// for (var i = 0; i < 4; i++) {
	// 			// 	var selectedObject = scene1.getObjectByName('wall');
	// 			// 	scene1.remove(selectedObject);
	// 			// }
	// 		}
	//
	// 		if (toneShiftThree && !toneShiftFour && currentSong.currentTime >= 135) {
	// 			console.log("Tone shift #4");
	// 			toneShiftFour = true;
	// 		}
	//
	// 		if (toneShiftFour && !toneShiftFive && currentSong.currentTime >= 50) {
	// 			// console.log("Tone shift #5");
	// 			toneShiftFive = true;
	// 		}
	// 		// currentSong.currentTime >= 135
	//
	// 	}
	//
	// }
	//
	//
	// async function loadHawks() {
	// 	const loader = new GLTFLoader();
	//
	// 	const parrotData = await loader.loadAsync('/assets/models/Parrot.glb');
	//
	// 	console.log('Squaaawk!', parrotData);
	// }
	//
	//
	// //
	// async function loadManitou_() {
	// 	const man = new THREE.Mesh(
	// 		new THREE.BoxGeometry(10, 10, 10),
	// 		loadMaterial_('vintage-tile1_', 0.2));
	// 	man.position.set(10, 5, 0);
	// 	man.castShadow    = true;
	// 	man.receiveShadow = true;
	// 	scene.add(man);
	// 	return man;
	// }
	//
	//
	// async function loadSpecter_() {
	// 	//. MTL material file loader
	// 	var mtlLoader = new THREE.MTLLoader();
	// 	//. obj geometry file loader
	// 	var objLoader = new THREE.OBJLoader();
	//
	// 	mtlLoader.load('./resources/entities/specter/spectral_demon_by_dommk.mtl', function (materials) {
	// 		objLoader.setMaterials(materials)
	// 		         .load('./resources/entities/specter/spectral_demon_by_dommk.obj', function (obj) {
	// 			         scene.add(obj);
	//
	// 		         });
	// 	});
	// 	return mtlLoader;
	// }
	//
	//
	// async function loadDemon_() {
	// 	//. MTL material file loader
	// 	var mtlLoader = new THREE.MTLLoader();
	// 	//. obj geometry file loader
	// 	var objLoader = new THREE.OBJLoader();
	//
	// 	mtlLoader.load('./resources/entities/demon/Demon_skull.OBJ');
	// 	scene.add(mtlLoader.scene)
	// 	return mtlLoader;
	// }
	//
	//
	// async function loadChair_() {
	// 	//. MTL material file loader
	// 	var mtlLoader = new THREE.MTLLoader();
	// 	//. obj geometry file loader
	// 	var objLoader = new THREE.OBJLoader();
	//
	// 	mtlLoader.load('./chair.mtl', function (materials) {
	// 		objLoader.setMaterials(materials)
	// 		         .load('./chair.obj', function (obj) {
	// 			         scene.add(obj);
	//
	// 		         });
	// 	});
	// 	return mtlLoader;
	// }
	//
	//
	// async function loadHorror_() {
	// 	const gltfLoader = new GLTFLoader();
	// 	let hurl         = './resources/entities/demon/scene.gltf'.toString();
	// 	const horror     = await Promise.all([gltfLoader.load(hurl, function (gltf) {
	// 			const root         = gltf.scene;
	// 			root.lightingColor = '#9B7441';
	// 			// root.position.set(10, -20, 0);
	// 			root.position.set(10, -10, 0);
	//
	// 			// Horror = root;
	// 			scene.add(root);
	// 		},
	// 		function (xhr) {
	//
	// 			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
	// 			// this.loadedHorror = true;
	//
	// 		},
	// 		// called when loading has errors
	// 		function (error) {
	// 			console.log('An error happened');
	// 		})]);
	// 	console.log("Horror set...");
	//
	// 	return horror.scene;
	// }
	//
	//
	// function horrorTrack() {
	// 	console.log('start');
	// 	new TWEEN.Tween(Horror.position)
	// 		.to(camera.position, 700) // destination, duration
	// 		.start() // start now
	// }


	// function buildRenderer(canvas) {
	// 	const renderer             = new THREE.WebGLRenderer({
	// 		antialias: false,
	// 	});
	// 	renderer.shadowMap.enabled = true;
	// 	renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
	// 	renderer.setPixelRatio(window.devicePixelRatio);
	// 	renderer.setSize(window.innerWidth, window.innerHeight);
	// 	renderer.physicallyCorrectLights = true;
	// 	renderer.outputEncoding          = THREE.sRGBEncoding;
	// 	renderer.gammaFactor             = 1.2;
	// 	renderer.gammaOutput             = 2.2;
	// 	canvas.appendChild(renderer.domElement);
	// 	loadedRender = true;
	// 	return renderer;
	//
	// }


	function buildCamera() {
		const fov     = 60;
		const aspect  = 1920 / 1080;
		const near    = 1.0;
		const far     = 1500.0;
		const _camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		_camera.position.set(0, 2, 0);
		// aCamera.lookAt(new THREE.Vector3(-20, -20, -15));
		userinterfaceCamera = new THREE.OrthographicCamera(-1, 1, 1 * aspect, -1 * aspect, 1, 1500);
		userinterfaceScene  = new THREE.Scene();
		return _camera;
	}


	// function buildScene() {
	// 	const aScene  = new THREE.Scene();
	// 	const loader  = new THREE.CubeTextureLoader();
	// 	const texture = loader.load([
	// 		'./resources/skybox/sunsetflat_ft.jpg',
	// 		'./resources/skybox/sunsetflat_bk.jpg',
	// 		'./resources/skybox/sunsetflat_up.jpg',
	// 		'./resources/skybox/sunsetflat_dn.jpg',
	// 		'./resources/skybox/sunsetflat_rt.jpg',
	// 		'./resources/skybox/sunsetflat_lf.jpg',
	// 	]);
	//
	// 	texture.encoding                = THREE.sRGBEncoding;
	// 	aScene.background               = texture;
	// 	aScene.background.lightingColor = '#9B7441';
	// 	// aScene1.background.intensity
	// 	const light                     = new THREE.AmbientLight(0x404040); // soft white light
	// 	light.intensity                 = 3;
	// 	aScene.add(light);
	//
	// 	const mapLoader     = new THREE.TextureLoader();
	// 	const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
	//
	// 	const trak_base      = mapLoader.load('resources/tileKit/trak_base.jpg');
	// 	trak_base.anisotropy = maxAnisotropy;
	// 	trak_base.wrapS      = THREE.RepeatWrapping;
	// 	trak_base.wrapT      = THREE.RepeatWrapping;
	// 	trak_base.repeat.set(32, 32);
	// 	trak_base.encoding = THREE.sRGBEncoding;
	//
	// 	const plane         = new THREE.Mesh(
	// 		new THREE.PlaneGeometry(1000, 1000, 10, 10),
	// 		new THREE.MeshStandardMaterial({map: trak_base}));
	// 	plane.castShadow    = false;
	// 	plane.receiveShadow = true;
	// 	plane.rotation.x    = -Math.PI / 2;
	// 	aScene.add(plane);
	//
	// 	const concreteMaterial = loadMaterial_('concrete3-', 4);
	//
	// 	// Back wall
	// 	const wall1 = new THREE.Mesh(
	// 		new THREE.BoxGeometry(200, 200, 4),
	// 		concreteMaterial);
	// 	wall1.name  = 'wall';
	// 	wall1.position.set(0, -110, -100);
	// 	wall1.castShadow    = true;
	// 	wall1.receiveShadow = true;
	// 	aScene.add(wall1);
	//
	// 	// Forward wall
	// 	const wall2 = new THREE.Mesh(
	// 		new THREE.BoxGeometry(200, 200, 4),
	// 		concreteMaterial);
	// 	wall2.name  = 'wall';
	// 	wall2.position.set(0, -110, 100);
	// 	wall2.castShadow    = true;
	// 	wall2.receiveShadow = true;
	// 	aScene.add(wall2);
	//
	// 	// Right wall
	// 	const wall3 = new THREE.Mesh(
	// 		new THREE.BoxGeometry(4, 200, 200),
	// 		concreteMaterial);
	// 	wall3.name  = 'wall';
	// 	wall3.position.set(-100, -110, 0);
	// 	wall3.castShadow    = true;
	// 	wall3.receiveShadow = true;
	// 	aScene.add(wall3);
	//
	// 	// Left wall
	// 	const wall4 = new THREE.Mesh(
	// 		new THREE.BoxGeometry(4, 200, 200),
	// 		concreteMaterial);
	// 	wall4.name  = 'wall';
	// 	wall4.position.set(100, -110, 0);
	// 	wall4.castShadow    = true;
	// 	wall4.receiveShadow = true;
	// 	aScene.add(wall4);
	//
	//
	// 	const meshes  = [plane, wall1, wall2, wall3, wall4];
	// 	const objects = [];
	// 	for (let i = 0; i < meshes.length; ++i) {
	// 		const b = new THREE.Box3().setFromObject(meshes[i]);
	// 		objects.push(b);
	// 	}
	//
	// 	// for (let i = camera.position; i < meshes.length; ++i) {
	// 	// 	const b = new THREE.Box3();
	// 	// 	b.setFromObject(meshes[i]);
	// 	// 	objects.push(b);
	// 	// }
	//
	// 	return aScene;
	// }

/*

	function initializeLights_() {
		const distance = 50.0;
		const angle    = Math.PI / 4.0;
		const penumbra = 0.5;
		const decay    = 1.0;

		let light                   = new THREE.SpotLight(
			0xFFFFFF, 100.0, distance, angle, penumbra, decay);
		light.castShadow            = true;
		light.shadow.bias           = -0.00001;
		light.shadow.mapSize.width  = 4096;
		light.shadow.mapSize.height = 4096;
		light.shadow.camera.near    = 1;
		light.shadow.camera.far     = 100;

		light.position.set(25, 25, 0);
		light.lookAt(10, 5, 0);
		scene.add(light);

		const upColour   = 0xFFFF80;
		const downColour = 0x808080;
		light            = new THREE.HemisphereLight(upColour, downColour, 0.5);
		light.color.setHSL(0.6, 1, 0.6);
		light.groundColor.setHSL(0.095, 1, 0.75);
		light.position.set(0, 4, 0);
		scene.add(light);
	}


	function loadMaterial_(name, tiling) {
		const mapLoader     = new THREE.TextureLoader();
		const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

		const metalMap      = mapLoader.load('resources/tileKit/' + name + 'metallic.png');
		metalMap.anisotropy = maxAnisotropy;
		metalMap.wrapS      = THREE.RepeatWrapping;
		metalMap.wrapT      = THREE.RepeatWrapping;
		metalMap.repeat.set(tiling, tiling);

		const albedo      = mapLoader.load('resources/tileKit/' + name + 'albedo.png');
		albedo.anisotropy = maxAnisotropy;
		albedo.wrapS      = THREE.RepeatWrapping;
		albedo.wrapT      = THREE.RepeatWrapping;
		albedo.repeat.set(tiling, tiling);
		albedo.encoding = THREE.sRGBEncoding;

		const normalMap      = mapLoader.load('resources/tileKit/' + name + 'normal.png');
		normalMap.anisotropy = maxAnisotropy;
		normalMap.wrapS      = THREE.RepeatWrapping;
		normalMap.wrapT      = THREE.RepeatWrapping;
		normalMap.repeat.set(tiling, tiling);

		const roughnessMap      = mapLoader.load('resources/tileKit/' + name + 'roughness.png');
		roughnessMap.anisotropy = maxAnisotropy;
		roughnessMap.wrapS      = THREE.RepeatWrapping;
		roughnessMap.wrapT      = THREE.RepeatWrapping;
		roughnessMap.repeat.set(tiling, tiling);

		return new THREE.MeshStandardMaterial({
			metalnessMap: metalMap,
			map:          albedo,
			normalMap:    normalMap,
			roughnessMap: roughnessMap,
		});

	}
*/




	function initializeAudio_() {
		// load a sound and set it as the Audio object's buffer
		return musicSwitch(songs[0]);

	}


	function playMusicAudio() {

		if (isPlaying === true) {
			// console.log("play called returned");
			return;

		}
		// console.log("play called in");

		// TODO:
		isPlayable    = false;
		isPlaying     = true;
		const promise = currentSong.play();
		if (promise !== undefined) {
			promise.catch((e) => {
				// console.log("Failure Playing");
				isPlayable = true;
				isPlaying  = false;
				return;
			})
		}

	}


	function pauseMusicAudio() {

		if (isPlaying === true) {
			// console.log("play called returned");
			isPlayable = true;
			isPlaying  = false;

		}
		// console.log("play called in");

		const promise = currentSong.pause();
		if (promise !== undefined) {
			promise.catch((e) => {
				// console.log("Failure Playing");
				isPlayable = false;
				isPlaying  = true;
			})
		}
	}


	function musicSwitch(audio) {
		currentSong        = audio;
		currentSong.volume = 0.5;
		return currentSong;
	}



	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}


	window.addEventListener('resize', onWindowResize);




	this.update = function (time) {
		if (controls.isLocked === true) {
			// console.log(camera.)
			if (firstStart) {
				time.start();
				firstStart = false;
			}
			if (isPlayable === true && isPlaying !== true) {
				playMusicAudio();
			}
			const delta = time.getDelta() / 2;
			character._Step(delta);
			SCENE_.update(currentSong.currentTime)

/*
			velocity.x -= velocity.x * 10.0 * delta;
			velocity.z -= velocity.z * 10.0 * delta;

			velocity.y -= 9.8 * 400.0 * delta; // 1000.0 = mass

			direction.z = Number(moveForward) - Number(moveBackward);
			direction.x = Number(moveRight) - Number(moveLeft);
			direction.normalize(); // this ensures consistent movements in all directions

			if (moveForward || moveBackward) {
				velocity.z -= direction.z * 50.0 * delta;
			}
			if (moveLeft || moveRight) {
				velocity.x -= direction.x * 50.0 * delta;
			}

			let dz = controls.getObject().position.z + (-velocity.z * delta);
			let dx = controls.getObject().position.x + (-velocity.x * delta);
			if (currentScene === 0) {
				if (dx > -95 && dx < 95) {
					controls.moveRight(-velocity.x * delta);
				}
				else {
					if (dx >= 95 && moveLeft) {
						controls.moveRight(-velocity.x * delta);
					}
					if (dx <= -95 && moveRight) {
						controls.moveRight(-velocity.x * delta);
					}
				}


				if (dz > -95 && dz < 95) {
					controls.moveForward(-velocity.z * delta);
				}
				else {
					if (dz >= 95 && velocity.z < 0) {
						controls.moveForward(-velocity.z * delta);
					}
					if (dz <= -95 && velocity.z > 0) {
						controls.moveForward(-velocity.z * delta);
					}
				}
			}


			controls.getObject().position.y += (velocity.y * delta); // new behavior

			if (controls.getObject().position.y < 2) {

				velocity.y                      = 0;
				controls.getObject().position.y = 2;

				canJump = true;
			}*/
		}
		else {
			// SCENE_.pauseMusicAudio();
			time.stop();
		}

		console.log(character._controls.Position, character._controls.Rotation);
		renderer.render(scene, camera);
	}
}


const canvas     = document.getElementById("canvas");
const manager = new SequenceManager();
// manager.init(canvas);


function animate() {
	requestAnimationFrame(animate);
	manager.update(time);
}
animate();

