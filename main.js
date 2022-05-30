import * as THREE                 from 'three';
import {GLTFLoader}               from 'GLTFLoader';
import {PointerLockControls}      from "PointerLockControls";
import {OrbitControls}            from "OrbitControls";
import {TWEEN}                    from "TWEEN";
import {OceanScene}               from "./scenes/OceanScene.js";
import {HellScene}                from "./scenes/HellScene.js";
import {Words}                    from "./scenes/Words.js";
import {ThirdPersonCameraFactory} from "./components/Character.js"




const objects = [];
const time    = new THREE.Clock(true);
//
// let raycaster;
//
// let moveForward  = false;
// let moveBackward = false;
// let moveLeft     = false;
// let moveRight    = false;
// let canJump      = false;
//
// var prevTime    = performance.now();
// const velocity  = new THREE.Vector3();
// const direction = new THREE.Vector3();
// const vertex    = new THREE.Vector3();
// const color     = new THREE.Color();
//
//
//
// const onKeyDown = function (event) {
// 	switch (event.code) {
//
// 		case 'ArrowUp':
// 		case 'KeyW':
// 			moveForward = true;
// 			break;
//
// 		case 'ArrowLeft':
// 		case 'KeyA':
// 			moveLeft = true;
// 			break;
//
// 		case 'ArrowDown':
// 		case 'KeyS':
// 			moveBackward = true;
// 			break;
//
// 		case 'ArrowRight':
// 		case 'KeyD':
// 			moveRight = true;
// 			break;
//
// 		case 'Space':
// 			if (canJump === true) {
// 				velocity.y += 350;
// 			}
// 			canJump = false;
// 			break;
//
// 	}
//
// };
//
//
// const onKeyUp = function (event) {
//
// 	switch (event.code) {
//
// 		case 'ArrowUp':
// 		case 'KeyW':
// 			moveForward = false;
// 			break;
//
// 		case 'ArrowLeft':
// 		case 'KeyA':
// 			moveLeft = false;
// 			break;
//
// 		case 'ArrowDown':
// 		case 'KeyS':
// 			moveBackward = false;
// 			break;
//
// 		case 'ArrowRight':
// 		case 'KeyD':
// 			moveRight = false;
// 			break;
//
// 	}
//
// };

// var camera             = null;
var userinterfaceScene = null;
var userinterfaceCamera;
var firstPersonCamera;
var music              = new Audio();
var voiceOver          = new Audio();
var currentVoice       = new Audio();
var controls;

var blocker       = document.getElementById('blocker');
var pausemenu     = document.getElementById('pause-menu');
var startbutton   = document.getElementById('start-button');
const hellCanvas  = document.getElementById('hell-canvas');
const oceanCanvas = document.getElementById('ocean-canvas');
const wordCanvas  = document.getElementById('word-canvas');
const mainCanvas  = document.getElementById("main-canvas");


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
	const words = null;
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

	const renderer  = buildRenderer(document.body);
	const scene     = buildScene();
	const camera    = buildCamera();
	const params    = {
		renderer, camera, scene
	};
	const character = new ThirdPersonCameraFactory(params);
	var currentSong = initializeAudio_();
	init(mainCanvas);


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


	async function init(canvas) {

		controls = new PointerLockControls(camera, document.body);
		/*const promise = characterBuilder(() => {
		 isReady = true;
		 startbutton.classList.add(".ready");
		 return true;
		 });
		 */

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
			if (isPlaying) {
				currentSong.pause();
			}
		});
		scene.add(controls.getObject());

		// document.addEventListener('keydown', onKeyDown);
		// document.addEventListener('keyup', onKeyUp);
		document.body.appendChild(renderer.domElement);

		character._Initialize()
		sceneSwitcher();
		isReady = true;
	}


	// const characterBuilder = async () => {
	// 	return await character._Initialize();
	// }


	async function sceneSwitcher() {
		if (SCENE_INDEX === 0) {
			wordCanvas.style.display = 'block';
			oceanCanvas.style.display = 'none';
			hellCanvas.style.display = 'none';
			SCENE_ = new Words(wordCanvas);
			return SCENE_ACTIVE = true;

		}
		else if (SCENE_INDEX === 1) {
			wordCanvas.style.display = 'none';
			oceanCanvas.style.display = 'none';
			hellCanvas.style.display = 'block';
			SCENE_ = new HellScene(camera, scene, renderer, controls, userinterfaceCamera, userinterfaceScene, hellCanvas);
			return SCENE_ACTIVE = true;

		}
		else if (SCENE_INDEX === 2) {
			wordCanvas.style.display = 'none';
			hellCanvas.style.display = 'none';
			oceanCanvas.style.display = 'block';
			SCENE_ = new OceanScene(camera, scene, renderer, controls, userinterfaceCamera, userinterfaceScene, oceanCanvas);
			return SCENE_ACTIVE = true;

		}
		this.update();
		// SCENE_INDEX++;
	}


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


			if (SCENE_INDEX === 0) {
				SCENE_.update(time.getDelta());
			}
			if (SCENE_INDEX === 1) {
				character._Step(delta);
				SCENE_.update(currentSong.currentTime)
			}
			if (SCENE_INDEX === 2) {
				// character._Step(delta);
				SCENE_.update(currentSong.currentTime)
			}
		}
		else {
			pauseMusicAudio();
			time.stop();
		}

		// console.log(character._controls.Position, character._controls.Rotation);
		renderer.render(scene, camera);
	}
}


const manager = new SequenceManager();


// manager.init(canvas);


function animate() {
	requestAnimationFrame(animate);
	manager.update(time);
}


animate();

