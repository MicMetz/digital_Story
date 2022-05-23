import * as THREE   from 'three';
import {GLTFLoader} from 'GLTFLoader';



const KEYS = {
	'a': 65,
	's': 83,
	'w': 87,
	'd': 68,
};


function clamp(x, a, b) {
	return Math.min(Math.max(x, a), b);
}



class InputController {
	constructor(target) {
		this.target_ = target || document;
		this.initialize_();
	}


	initialize_() {
		this.current_      = {
			leftButton : false,
			rightButton: false,
			mouseXDelta: 0,
			mouseYDelta: 0,
			mouseX     : 0,
			mouseY     : 0,
		};
		this.previous_     = null;
		this.keys_         = {};
		this.previousKeys_ = {};
		this.target_.addEventListener('mousedown', (e) => this.onMouseDown_(e), false);
		this.target_.addEventListener('mousemove', (e) => this.onMouseMove_(e), false);
		this.target_.addEventListener('mouseup', (e) => this.onMouseUp_(e), false);
		this.target_.addEventListener('keydown', (e) => this.onKeyDown_(e), false);
		this.target_.addEventListener('keyup', (e) => this.onKeyUp_(e), false);
	}


	onMouseMove_(e) {
		this.current_.mouseX = e.pageX - window.innerWidth / 2;
		this.current_.mouseY = e.pageY - window.innerHeight / 2;

		if (this.previous_ === null) {
			this.previous_ = {...this.current_};
		}

		this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
		this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;
	}


	onMouseDown_(e) {
		this.onMouseMove_(e);

		switch (e.button) {
			case 0: {
				this.current_.leftButton = true;
				break;
			}
			case 2: {
				this.current_.rightButton = true;
				break;
			}
		}
	}


	onMouseUp_(e) {
		this.onMouseMove_(e);

		switch (e.button) {
			case 0: {
				this.current_.leftButton = false;
				break;
			}
			case 2: {
				this.current_.rightButton = false;
				break;
			}
		}
	}


	onKeyDown_(e) {
		this.keys_[e.keyCode] = true;
	}


	onKeyUp_(e) {
		this.keys_[e.keyCode] = false;
	}


	key(keyCode) {
		return !!this.keys_[keyCode];
	}


	isReady() {
		return this.previous_ !== null;
	}


	update(_) {
		if (this.previous_ !== null) {
			this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
			this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;

			this.previous_ = {...this.current_};
		}
	}
};



class FirstPersonCamera {
	constructor(camera, objects) {
		this.camera_      = camera;
		this.input_       = new InputController();
		this.rotation_    = new THREE.Quaternion();
		this.translation_ = new THREE.Vector3(0, 2, 0);
		this.phi_         = 0;
		this.phiSpeed_    = 8;
		this.theta_       = 0;
		this.thetaSpeed_  = 5;
		this.objects_     = objects;
	}


	update(timeElapsedS) {
		this.updateRotation_(timeElapsedS);
		this.updateCamera_(timeElapsedS);
		this.updateTranslation_(timeElapsedS);
		this.input_.update(timeElapsedS);
	}


	updateCamera_(_) {
		this.camera_.quaternion.copy(this.rotation_);
		this.camera_.position.copy(this.translation_);
		// this.camera_.position.y += Math.sin(this.headBobTimer_ * 10) * 1.5;

		const forward = new THREE.Vector3(0, 0, -1);
		forward.applyQuaternion(this.rotation_);

		const dir = forward.clone();

		forward.multiplyScalar(100);
		forward.add(this.translation_);

		let closest  = forward;
		const result = new THREE.Vector3();
		const ray    = new THREE.Ray(this.translation_, dir);
		for (let i = 0; i < this.objects_.length; ++i) {
			if (ray.intersectBox(this.objects_[i], result)) {
				if (result.distanceTo(ray.origin) < closest.distanceTo(ray.origin)) {
					closest = result.clone();
				}
			}
		}

		this.camera_.lookAt(closest);
	}


	updateTranslation_(timeElapsedS) {
		const forwardVelocity = (this.input_.key(KEYS.w) ? 1 : 0) + (this.input_.key(KEYS.s) ? -1 : 0)
		const strafeVelocity  = (this.input_.key(KEYS.a) ? 1 : 0) + (this.input_.key(KEYS.d) ? -1 : 0)

		const qx = new THREE.Quaternion();
		qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);

		const forward = new THREE.Vector3(0, 0, -1);
		forward.applyQuaternion(qx);
		forward.multiplyScalar(forwardVelocity * timeElapsedS * 10);

		const left = new THREE.Vector3(-1, 0, 0);
		left.applyQuaternion(qx);
		left.multiplyScalar(strafeVelocity * timeElapsedS * 10);

		this.translation_.add(forward);
		this.translation_.add(left);

		if (forwardVelocity !== 0 || strafeVelocity !== 0) {
			// this.headBobActive_ = true;
		}
	}


	updateRotation_(timeElapsedS) {
		const xh = this.input_.current_.mouseXDelta / window.innerWidth;
		const yh = this.input_.current_.mouseYDelta / window.innerHeight;

		this.phi_ += -xh * this.phiSpeed_;
		this.theta_ = clamp(this.theta_ + -yh * this.thetaSpeed_, -Math.PI / 3, Math.PI / 3);

		const qx = new THREE.Quaternion();
		qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
		const qz = new THREE.Quaternion();
		qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta_);

		const q = new THREE.Quaternion();
		q.multiply(qx);
		q.multiply(qz);

		this.rotation_.copy(q);
	}
}



function MouseAudio(element, audio) {
	this.div = element;
	this.audio = audio;
	this.timeout = null;

	this.init();
}

MouseAudio.prototype.init = function() {
	var self = this;

	this.div.addEventListener('mouseover', function(event) {
		console.log('moused over - timeout set');

		if (self.timeout) {
			clearTimeout(self.timeout);
		}

		self.timeout = setTimeout(function() {
			console.log('playing sound');
			self.audio.play();
			self.timeout = null;
		}, 10000);
	});

	this.div.addEventListener('mouseout', function() {
		if (self.timeout) {
			console.log('moused out - timeout cancelled');
			clearTimeout(self.timeout);
			self.timeout = null;
		} else if (!self.audio.paused) {
			console.log('moused out - pausing sound');
			self.audio.pause();
			self.audio.currentTime = 0;
		}
	});

	this.div.addEventListener('click', function() {
		if (self.timeout) {
			console.log('clicked - timeout cancelled');
			clearTimeout(self.timeout);
			self.timeout = null;
		} else if (!self.audio.paused) {
			console.log('clicked - pausing sound');
			self.audio.pause();
			self.audio.currentTime = 0;
		}
	});
};

// this.mouseAudio = new MouseAudio(document.getElementById('canvas'), document.getElementById('audio'));


class Sequence {
	constructor() {
		this.audioLoader_       = new THREE.AudioLoader();
		this.audioListener      = new THREE.AudioListener();
		this.audioMusicTime     = 0;
		this.audioVoiceTime     = 0;
		this.audioPrevMusicTime = 0;

		this.currentSong     = null;
		this.currentVoice    = null;
		this.audioMusicTrack = '';                          /*TODO: WIP*/
		this.audioVoiceTrack = '';                          /*TODO: WIP*/
		/* this.loader = new TwoStepAudioLoader()           /*TODO: WIP*/
		this.previousRAF_ = null;

		this.loadedRender = false;
		this.loadedLights = false;
		this.loadedHell   = false;
		this.loadedPost   = false;
		this.loadedUser   = false;
		this.loadedAudio  = false;
		this.loadedHorror = false;
		this.isReady        = false;

		this.loaderList_ = [
			this.loadedRender,
			this.loadedLights,
			this.loadedHell,
			this.loadedPost,
			this.loadedUser,
			this.loadedAudio,
			this.loadedHorror
		];

		this.toneShiftOne   = false;
		this.toneShiftTwo   = false;
		this.toneShiftThree = false;
		this.toneShiftFour  = false;
		this.toneShiftFive  = false;
		this.encased        = false;

		this.manitou = null;
		this.aHorror = null;

		this.loadingScreen();
		this.initialize_().catch();
	}


	async initialize_() {
		await this.initializeRenderer_();
		await this.initializeLights_();
		await this.initializeHellScene_();
		await this.initializePostFX_();
		await this.initializeUser_();
		await this.initializeAudio_();

		this.onWindowResize_();
		this.setReady(true);

		console.log("Ready!")
		await this.musicSwitch().next();
		this.raf_();

	}


	setReady(b) {
		this.isReady = b;
	}

	checkReady() {
		return this.isReady;
	}

	*loadingScreen() {
		while (!this.checkReady()) {
			document.body.classList.add('load-cover');
			document.addEventListener("any", function(event) {
				event.preventDefault();
			});
			window.addEventListener("any", function(event) {
				event.preventDefault();
			});
			yield;
		}
		document.body.classList.remove('load-cover');

	}

	async updateSequence(timeElapsed) {
		// console.log(this.currentSong.currentTime);
		// if (timeElapsed >= 17000 && this.encased !== true) {

		//12 seconds
		if (!this.toneShiftOne && !this.encased) {
			// console.log("Initiated dewalling...");

			if (this.currentSong.currentTime <= 45) {

				this.scene_.children.forEach(obj => {
					if (obj.name === 'wall') {
						obj.translateY(0.05);
					}
				});
				this.audioPrevMusicTime = this.currentSong.currentTime;

			}
			else {
				this.toneShiftOne = true;
				console.log("Tone shift #2");
			}
		}

		// 20 seconds
		if (this.toneShiftOne && !this.toneShiftTwo && this.currentSong.currentTime >= 50) {



			if (this.currentSong.currentTime >= 5555) {
				this.toneShiftTwo = true;
				this.encased      = true;


			}

		}

		if (this.toneShiftTwo && !this.toneShiftThree && this.currentSong.currentTime >= 50) {
			console.log("Tone shift #3");
			this.toneShiftThree = true;

			// for (var i = 0; i < 4; i++) {
			// 	var selectedObject = this.scene_.getObjectByName('wall');
			// 	this.scene_.remove(selectedObject);
			// }
		}

		if (this.toneShiftThree && !this.toneShiftFour && this.currentSong.currentTime >= 135) {
			console.log("Tone shift #4");
			this.toneShiftFour = true;
		}

		if (this.toneShiftFour && !this.toneShiftFive && this.currentSong.currentTime >= 50) {
			console.log("Tone shift #5");
			this.toneShiftFive = true;
		}
		// this.currentSong.currentTime >= 135

	}


	loadHorror_() {
		const gltfLoader = new GLTFLoader();

		gltfLoader.load(
			'./resources/entities/demon/scene.gltf',
			(gltf) => {
				const root         = gltf.scene;
				root.lightingColor = '#9B7441';
				root.position.set(10, -20, 0);
				this.scene_.add(root);
				this.aHorror = root;
			},
			// called while loading is progressing
			function (xhr) {

				console.log((xhr.loaded / xhr.total * 100) + '% loaded');
				this.loadedHorror = true;
				console.log("Horror set...");

			},
			// called when loading has errors
			function (error) {

				console.log('An error happened');

			}
		);
	}


	async initializeUser_() {
		this.fpsCamera_ = new FirstPersonCamera(this.camera_, this.objects_);
		return this.loadedUser = true;
	}


	async initializeRenderer_() {
		this.threejs_                   = new THREE.WebGLRenderer({
			antialias: false,
		});
		this.threejs_.shadowMap.enabled = true;
		this.threejs_.shadowMap.type    = THREE.PCFSoftShadowMap;
		this.threejs_.setPixelRatio(window.devicePixelRatio);
		this.threejs_.setSize(window.innerWidth, window.innerHeight);
		this.threejs_.physicallyCorrectLights = true;
		this.threejs_.outputEncoding          = THREE.sRGBEncoding;
		this.threejs_.gammaFactor             = 1.2;
		this.threejs_.gammaOutput             = 2.2;
		document.body.appendChild(this.threejs_.domElement);

		window.addEventListener('resize', () => {
			this.onWindowResize_();
		}, false);

		const fov    = 60;
		const aspect = 1920 / 1080;
		const near   = 1.0;
		const far    = 500.0;
		this.camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
		this.camera_.position.set(0, 2, 0);

		this.scene_ = new THREE.Scene();

		this.uiCamera_ = new THREE.OrthographicCamera(
			-1, 1, 1 * aspect, -1 * aspect, 1, 1000);
		this.uiScene_  = new THREE.Scene();

		return this.loadedRender = true;
	}


	async initializeHellScene_() {
		const loader  = new THREE.CubeTextureLoader();
		const texture = loader.load([
			'./resources/skybox/sunsetflat_ft.jpg',
			'./resources/skybox/sunsetflat_bk.jpg',
			'./resources/skybox/sunsetflat_up.jpg',
			'./resources/skybox/sunsetflat_dn.jpg',
			'./resources/skybox/sunsetflat_rt.jpg',
			'./resources/skybox/sunsetflat_lf.jpg',
		]);

		texture.encoding                     = THREE.sRGBEncoding;
		this.scene_.background               = texture;
		this.scene_.background.lightingColor = '#9B7441';
		const mapLoader                      = new THREE.TextureLoader();
		const maxAnisotropy                  = this.threejs_.capabilities.getMaxAnisotropy();

		const trak_base      = mapLoader.load('resources/tileKit/trak_base.jpg');
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
		this.scene_.add(plane);

		//#################################### this.manitou ####################################\\

		this.manitou = new THREE.Mesh(
			new THREE.BoxGeometry(4, 4, 4),
			this.loadMaterial_('vintage-tile1_', 0.2));
		this.manitou.position.set(10, 10, 0);
		this.manitou.castShadow    = true;
		this.manitou.receiveShadow = true;
		this.scene_.add(this.manitou);

		const meshes = [plane, this.manitou];

		this.objects_ = [];

		for (let i = this.camera_.position; i < meshes.length; ++i) {
			const b = new THREE.Box3();
			b.setFromObject(meshes[i]);
			this.objects_.push(b);
		}


		const concreteMaterial = await Promise.all([this.loadMaterial_('concrete3-', 4)]);

		const wall1 = new THREE.Mesh(
			new THREE.BoxGeometry(100, 200, 4),
			concreteMaterial);
		wall1.name  = 'wall';
		wall1.position.set(0, -200, -20);
		wall1.castShadow    = true;
		wall1.receiveShadow = true;
		this.scene_.add(wall1);

		const wall2 = new THREE.Mesh(
			new THREE.BoxGeometry(100, 200, 4),
			concreteMaterial);
		wall2.name  = 'wall';
		wall2.position.set(0, -200, 20);
		wall2.castShadow    = true;
		wall2.receiveShadow = true;
		this.scene_.add(wall2);

		const wall3 = new THREE.Mesh(
			new THREE.BoxGeometry(4, 200, 100),
			concreteMaterial);
		wall3.name  = 'wall';
		wall3.position.set(20, -200, 0);
		wall3.castShadow    = true;
		wall3.receiveShadow = true;
		this.scene_.add(wall3);

		const wall4 = new THREE.Mesh(
			new THREE.BoxGeometry(4, 200, 100),
			concreteMaterial);
		wall4.name  = 'wall';
		wall4.position.set(-20, -200, 0);
		wall4.castShadow    = true;
		wall4.receiveShadow = true;
		this.scene_.add(wall4);

		const wall_meshes = [wall1, wall2, wall3, wall4];

		for (let i = 0; i < wall_meshes.length; ++i) {
			const b = new THREE.Box3().setFromObject(wall_meshes[i]);
			b.name  = 'objWall';
			this.objects_.push(b);
		}


		return this.loadedHorror = true;

	}


	initializeLights_() {
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
		light.lookAt(0, 0, 0);
		this.scene_.add(light);

		const upColour   = 0xFFFF80;
		const downColour = 0x808080;
		light            = new THREE.HemisphereLight(upColour, downColour, 0.5);
		light.color.setHSL(0.6, 1, 0.6);
		light.groundColor.setHSL(0.095, 1, 0.75);
		light.position.set(0, 4, 0);
		this.scene_.add(light);
	}


	loadMaterial_(name, tiling) {
		const mapLoader     = new THREE.TextureLoader();
		const maxAnisotropy = this.threejs_.capabilities.getMaxAnisotropy();

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
			map         : albedo,
			normalMap   : normalMap,
			roughnessMap: roughnessMap,
		});

	}


	async initializePostFX_() {
		return this.loadedPost = true;
	}


	initializeAudio_() {


		// load a sound and set it as the Audio object's buffer
		this.audioSwitch('resources/audio/Glass.mp3', 1);

	}


	playMusicAudio() {
		return new Promise(response => {
			if (this.currentSong.play()) {
				if (this.currentSong.ended) {
					response = true;
				}
				else {

				}
			}
		});

	}


	audioSwitch(audioUrl, audioType) {
		if (audioType) {
			this.currentSong        = new Audio(audioUrl);
			this.currentSong.volume = 0.5;

			this.playMusicAudio();



	}





	onWindowResize_() {
		this.camera_.aspect = window.innerWidth / window.innerHeight;
		this.camera_.updateProjectionMatrix();

		this.uiCamera_.left  = -this.camera_.aspect;
		this.uiCamera_.right = this.camera_.aspect;
		this.uiCamera_.updateProjectionMatrix();

		this.threejs_.setSize(window.innerWidth, window.innerHeight);
	}


	raf_() {
		requestAnimationFrame((t) => {
			if (this.previousRAF_ === null) {
				this.previousRAF_ = t;
			}

			this.loadingScreen().next();

			this.step_(t - this.previousRAF_);
			this.updateSequence(performance.now() - this.startTime, this.audioMusicTime);
			this.threejs_.autoClear = true;
			this.threejs_.render(this.scene_, this.camera_);
			this.threejs_.autoClear = false;
			this.threejs_.render(this.uiScene_, this.uiCamera_);
			this.previousRAF_ = t;
			this.raf_();
		});
	}


	step_(timeElapsed) {
		// Step speed
		const timeElapsedS = timeElapsed * 0.00050;
		this.fpsCamera_.update(timeElapsedS);
		// console.log(this.camera_.position);

	}

}



/*###################END OF SEQUENCE CLASS###################*/


/*###################START OF WALLING FUNCTION###################*/
/*function WallingSequence(material, sceneRef, objectsRef) {
 const wall1 = new THREE.Mesh(
 new THREE.BoxGeometry(100, 100, 4),
 material);
 wall1.position.set(0, -40, -50);
 wall1.castShadow    = true;
 wall1.receiveShadow = true;
 sceneRef.add(wall1);

 const wall2 = new THREE.Mesh(
 new THREE.BoxGeometry(100, 100, 4),
 material);
 wall2.position.set(0, -40, 50);
 wall2.castShadow    = true;
 wall2.receiveShadow = true;
 sceneRef.add(wall2);

 const wall3 = new THREE.Mesh(
 new THREE.BoxGeometry(4, 100, 100),
 material);
 wall3.position.set(50, -40, 0);
 wall3.castShadow    = true;
 wall3.receiveShadow = true;
 sceneRef.add(wall3);

 const wall4 = new THREE.Mesh(
 new THREE.BoxGeometry(4, 100, 100),
 material);
 wall4.position.set(-50, -40, 0);
 wall4.castShadow    = true;
 wall4.receiveShadow = true;
 sceneRef.add(wall4);

 const wall_meshes = [wall1, wall2, wall3, wall4];

 for (let i = 0; i < wall_meshes.length; ++i) {
 const b = new THREE.Box3();
 b.setFromObject(wall_meshes[i]);
 objectsRef.push(b);
 }

 return true;
 }*/



/*###################END OF WALLING FUNCTION###################*/




let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
	_APP = new Sequence();
});
