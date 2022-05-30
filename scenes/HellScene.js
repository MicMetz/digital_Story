import * as THREE            from 'three';
import {GLTFLoader}          from 'GLTFLoader';
import {PointerLockControls} from "PointerLockControls";
import {TWEEN}               from "TWEEN";
import {OrbitControls}       from 'OrbitControls';




function HellScene(camera_, scene_, renderer_, controls_, userinterfaceCamera, userinterfaceScene, canvas_) {
	const renderer = renderer_;
	const scene    = scene_;
	var camera = camera_;
	// const renderer = renderer_;
	// const scene    = character_._scene;
	// const camera = character_._camera;
	buildScene();

	// var song1 = 'resources/audio/music/Glass.mp3'.toString();
	// var song2 = 'resources/audio/music/Clubs_intro.mp3'.toString();
	// var song3 = 'resources/audio/music/Clubs_Climax.mp3'.toString();
	// const songs = [new Audio(song1), new Audio(song2), new Audio(song3)];
	// var voices  = [];

	var isFixed    = false;
	var isReady    = false;
	var isPlaying  = false;
	var isPlayable = true;
	var isActive   = true;

	var toneShiftOne   = false;
	var toneShiftTwo   = false;
	var toneShiftThree = false;
	var toneShiftFour  = false;
	var toneShiftFive  = false;
	var encased        = false;

	var manitou     = loadManitou_();
	const Horror    = loadHorror_();


	function buildScene() {
		const loader  = new THREE.CubeTextureLoader();
		const texture = loader.load([
			'../resources/skybox/sunsetflat_ft.jpg',
			'../resources/skybox/sunsetflat_bk.jpg',
			'../resources/skybox/sunsetflat_up.jpg',
			'../resources/skybox/sunsetflat_dn.jpg',
			'../resources/skybox/sunsetflat_rt.jpg',
			'../resources/skybox/sunsetflat_lf.jpg',
		]);

		texture.encoding                = THREE.sRGBEncoding;
		scene.background               = texture;
		scene.background.lightingColor = '#9B7441';
		// scene1.background.intensity
		const light                     = new THREE.AmbientLight(0x404040); // soft white light
		light.intensity                 = 3;
		scene.add(light);

		const mapLoader     = new THREE.TextureLoader();
		const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

		const trak_base      = mapLoader.load('../resources/tileKit/trak_base.jpg');
		trak_base.anisotropy = maxAnisotropy;
		trak_base.wrapS      = THREE.RepeatWrapping;
		trak_base.wrapT      = THREE.RepeatWrapping;
		trak_base.repeat.set(32, 32);
		trak_base.encoding = THREE.sRGBEncoding;

		const plane         = new THREE.Mesh(
			new THREE.PlaneGeometry(1000, 1000, 10, 10),
			new THREE.MeshStandardMaterial({map: trak_base}));
		plane.castShadow    = false;
		plane.receiveShadow = true;
		plane.rotation.x    = -Math.PI / 2;
		scene.add(plane);

		const concreteMaterial = loadMaterial_('concrete3-', 4);

		// Back wall
		const wall1 = new THREE.Mesh(
			new THREE.BoxGeometry(200, 200, 4),
			concreteMaterial);
		wall1.name  = 'wall';
		wall1.position.set(0, -110, -100);
		wall1.castShadow    = true;
		wall1.receiveShadow = true;
		scene.add(wall1);

		// Forward wall
		const wall2 = new THREE.Mesh(
			new THREE.BoxGeometry(200, 200, 4),
			concreteMaterial);
		wall2.name  = 'wall';
		wall2.position.set(0, -110, 100);
		wall2.castShadow    = true;
		wall2.receiveShadow = true;
		scene.add(wall2);

		// Right wall
		const wall3 = new THREE.Mesh(
			new THREE.BoxGeometry(4, 200, 200),
			concreteMaterial);
		wall3.name  = 'wall';
		wall3.position.set(-100, -110, 0);
		wall3.castShadow    = true;
		wall3.receiveShadow = true;
		scene.add(wall3);

		// Left wall
		const wall4 = new THREE.Mesh(
			new THREE.BoxGeometry(4, 200, 200),
			concreteMaterial);
		wall4.name  = 'wall';
		wall4.position.set(100, -110, 0);
		wall4.castShadow    = true;
		wall4.receiveShadow = true;
		scene.add(wall4);


		const meshes  = [plane, wall1, wall2, wall3, wall4];
		const objects = [];
		for (let i = 0; i < meshes.length; ++i) {
			const b = new THREE.Box3().setFromObject(meshes[i]);
			objects.push(b);
		}

		// for (let i = camera.position; i < meshes.length; ++i) {
		// 	const b = new THREE.Box3();
		// 	b.setFromObject(meshes[i]);
		// 	objects.push(b);
		// }

		return scene;
	}


	// function buildCamera(camera_) {
	// 	const fov     = 60;
	// 	const aspect  = 1920 / 1080;
	// 	const near    = 1.0;
	// 	const far     = 1500.0;
	// 	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	// 	camera.position.set( 0, 20, 50 );
	// 	// aCamera.lookAt(new THREE.Vector3(-20, -20, -15));
	// 	scene.add(camera);
	// 	userinterfaceCamera = new THREE.OrthographicCamera(-1, 1, 1 * aspect, -1 * aspect, 1, 1500);
	// 	userinterfaceScene  = new THREE.Scene();
	// 	return camera;
	// }



	async function loadHawks() {
		const loader = new GLTFLoader();

		const parrotData = await loader.loadAsync('/assets/models/Parrot.glb');

		console.log('Squaaawk!', parrotData);
	}


	//
	async function loadManitou_() {
		const man = new THREE.Mesh(
			new THREE.BoxGeometry(10, 10, 10),
			loadMaterial_('vintage-tile1_', 0.2));
		man.position.set(10, 5, 0);
		man.castShadow    = true;
		man.receiveShadow = true;
		scene.add(man);
		return man;
	}


	async function loadSpecter_() {
		//. MTL material file loader
		var mtlLoader = new THREE.MTLLoader();
		//. obj geometry file loader
		var objLoader = new THREE.OBJLoader();

		mtlLoader.load('../resources/entities/specter/spectral_demon_by_dommk.mtl', function (materials) {
			objLoader.setMaterials(materials)
			         .load('../resources/entities/specter/spectral_demon_by_dommk.obj', function (obj) {
				         scene.add(obj);

			         });
		});
		return mtlLoader;
	}


	async function loadDemon_() {
		//. MTL material file loader
		var mtlLoader = new THREE.MTLLoader();
		//. obj geometry file loader
		var objLoader = new THREE.OBJLoader();

		mtlLoader.load('../resources/entities/demon/Demon_skull.OBJ');
		scene.add(mtlLoader.scene)
		return mtlLoader;
	}


	async function loadChair_() {
		//. MTL material file loader
		var mtlLoader = new THREE.MTLLoader();
		//. obj geometry file loader
		var objLoader = new THREE.OBJLoader();

		mtlLoader.load('./chair.mtl', function (materials) {
			objLoader.setMaterials(materials)
			         .load('./chair.obj', function (obj) {
				         scene.add(obj);

			         });
		});
		return mtlLoader;
	}


	async function loadHorror_() {
		const gltfLoader = new GLTFLoader();
		let hurl         = '../resources/entities/demon/scene.gltf'.toString();
		const horror     = await Promise.all([gltfLoader.load(hurl, function (gltf) {
				const root         = gltf.scene;
				root.lightingColor = '#9B7441';
				// root.position.set(10, -20, 0);
				root.position.set(10, -10, 0);

				// Horror = root;
				scene.add(root);
			},
			function (xhr) {

				console.log((xhr.loaded / xhr.total * 100) + '% loaded');
				// this.loadedHorror = true;

			},
			// called when loading has errors
			function (error) {
				console.log('An error happened');
			})]);
		console.log("Horror set...");

		return horror.scene;
	}


	function horrorTrack() {
		console.log('start');
		new TWEEN.Tween(Horror.position)
			.to(camera.position, 700) // destination, duration
			.start() // start now
	}


	// function buildRenderer(canvas_) {
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
	// 	canvas_.appendChild(renderer.domElement);
	// 	// loadedRender = true;
	// 	return renderer;
	//
	// }



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



/*
	function initializeAudio_() {
		// load a sound and set it as the Audio object's buffer
		return musicSwitch(songs[0]);

	}*/

/*

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
*/


	// Objects
	// function buildSky() {
	// 	const sky = new Sky();
	// 	sky.scale.setScalar(10000);
	// 	scene.add(sky);
	// 	return sky;
	// }




	this.update = function (time) {
		// console.log(time);

			if (!toneShiftOne) {
				// console.log("Initiated walling...");
				if (!encased) {
					if (time <= 45) {
						// console.log("Tone shift #1");
						scene.children.forEach(obj => {
							if (obj.name === 'wall') {
								obj.translateY(0.05);
							}
						});
					}
					else {
						toneShiftOne = true;
						encased      = true;
						Horror.position.set(Horror.positionX, 8, Horror.positionZ);
						// Horror.position.copy(Horror.position);
						// Horror.quaternion.copy(Horror.quaternion);
					}
				}
			}

			// 20 seconds
			if (toneShiftOne && !toneShiftTwo) {
				console.log("Tone shift #2");
				// SCENE_ACTIVE = false;
				// manitou.position.set(manitou.positionX, -8, manitou.positionZ);
				//
				// aHorror.position.set(aHorror.positionX, 8, aHorror.positionZ);

				//

				if (!toneShiftTwo) {
					// toneShiftTwo = true;
					// encased      = true;
					// manitou
					// Horror.translateOnAxis(Horror.worldToLocal(new camera.position),1);
					// horrorTrack();

				}

			}

			if (toneShiftTwo && !toneShiftThree && time >= 50) {
				console.log("Tone shift #3");
				toneShiftThree = true;

				// for (var i = 0; i < 4; i++) {
				// 	var selectedObject = scene1.getObjectByName('wall');
				// 	scene1.remove(selectedObject);
				// }
			}

			if (toneShiftThree && !toneShiftFour && time >= 135) {
				console.log("Tone shift #4");
				toneShiftFour = true;
			}

			if (toneShiftFour && !toneShiftFive && time >= 50) {
				// console.log("Tone shift #5");
				toneShiftFive = true;
			}
			// time >= 135

		}

}


export {HellScene}
