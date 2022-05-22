import * as THREE from 'https://cdn.skypack.dev/three@0.136';

import {FirstPersonControls} from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/FirstPersonControls.js';



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



class Sequence {
	constructor() {
		this.initialize_();
		this.startTime = performance.now();
	}


	initialize_() {
		this.initializeRenderer_();
		this.initializeLights_();
		this.initializeHellScene_();
		this.initializePostFX_();
		this.initializeUser_();
		this.initializeAudio_();

		this.toneShiftOne   = false;
		this.toneShiftTwo   = false;
		this.toneShiftThree = false;
		this.toneShiftFour  = false;
		this.toneShiftFive  = false;
		this.walled         = false;

		this.previousRAF_   = null;
		this.raf_();
		this.onWindowResize_();


	}


	updateSequence(timeElapsed) {

		if (timeElapsed >= 17000 && this.walled !== true) {
			console.log("Initiated walling...");

			const concreteMaterial = this.loadMaterial_('concrete3-', 4);

			const wall1 = new THREE.Mesh(
				new THREE.BoxGeometry(100, 100, 4),
				concreteMaterial);
			wall1.position.set(0, -40, -50);
			wall1.castShadow    = true;
			wall1.receiveShadow = true;
			this.scene_.add(wall1);

			const wall2 = new THREE.Mesh(
				new THREE.BoxGeometry(100, 100, 4),
				concreteMaterial);
			wall2.position.set(0, -40, 50);
			wall2.castShadow    = true;
			wall2.receiveShadow = true;
			this.scene_.add(wall2);

			const wall3 = new THREE.Mesh(
				new THREE.BoxGeometry(4, 100, 100),
				concreteMaterial);
			wall3.position.set(50, -40, 0);
			wall3.castShadow    = true;
			wall3.receiveShadow = true;
			this.scene_.add(wall3);

			const wall4 = new THREE.Mesh(
				new THREE.BoxGeometry(4, 100, 100),
				concreteMaterial);
			wall4.position.set(-50, -40, 0);
			wall4.castShadow    = true;
			wall4.receiveShadow = true;
			this.scene_.add(wall4);

			const wall_meshes = [wall1, wall2, wall3, wall4];

			for (let i = 0; i < wall_meshes.length; ++i) {
				const b = new THREE.Box3();
				b.setFromObject(wall_meshes[i]);
				this.objects_.push(b);
			}

			this.walled = true;

			// const checkerboard      = mapLoader.load('resources/tileKit/checkerboard.png');
			// checkerboard.anisotropy = maxAnisotropy;
			// checkerboard.wrapS      = THREE.RepeatWrapping;
			// checkerboard.wrapT      = THREE.RepeatWrapping;
			// checkerboard.repeat.set(32, 32);
			// checkerboard.encoding = THREE.sRGBEncoding;
		}

		if (timeElapsed >= 90000 && this.toneShiftOne !== true) {
			console.log("Tone shift #1");
			this.toneShiftOne = true;

		}

		if (timeElapsed >= 140000 && this.toneShiftTwo !== true) {
			console.log("Tone shift #2");
			this.toneShiftTwo = true;
		}

		if (timeElapsed >= 152000 && this.toneShiftThree !== true) {
			console.log("Tone shift #3");
			this.toneShiftThree = true;
		}

	}


	initializeUser_() {
		this.fpsCamera_ = new FirstPersonCamera(this.camera_, this.objects_);
	}


	initializeRenderer_() {
		this.threejs_                   = new THREE.WebGLRenderer({
			antialias: false,
		});
		this.threejs_.shadowMap.enabled = true;
		this.threejs_.shadowMap.type    = THREE.PCFSoftShadowMap;
		this.threejs_.setPixelRatio(window.devicePixelRatio);
		this.threejs_.setSize(window.innerWidth, window.innerHeight);
		this.threejs_.physicallyCorrectLights = true;
		this.threejs_.outputEncoding          = THREE.sRGBEncoding;

		document.body.appendChild(this.threejs_.domElement);

		window.addEventListener('resize', () => {
			this.onWindowResize_();
		}, false);

		const fov    = 60;
		const aspect = 1920 / 1080;
		const near   = 1.0;
		const far    = 1000.0;
		this.camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
		this.camera_.position.set(0, 2, 0);

		this.scene_ = new THREE.Scene();

		this.uiCamera_ = new THREE.OrthographicCamera(
			-1, 1, 1 * aspect, -1 * aspect, 1, 1000);
		this.uiScene_  = new THREE.Scene();
	}


	initializeHellScene_() {
		const loader  = new THREE.CubeTextureLoader();
		const texture = loader.load([
			'./resources/skybox/sunsetflat_ft.jpg',
			'./resources/skybox/sunsetflat_bk.jpg',
			'./resources/skybox/sunsetflat_up.jpg',
			'./resources/skybox/sunsetflat_dn.jpg',
			'./resources/skybox/sunsetflat_rt.jpg',
			'./resources/skybox/sunsetflat_lf.jpg',
		]);

		texture.encoding       = THREE.sRGBEncoding;
		this.scene_.background = texture;

		const mapLoader     = new THREE.TextureLoader();
		const maxAnisotropy = this.threejs_.capabilities.getMaxAnisotropy();

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

		// manitou
		const box = new THREE.Mesh(
			new THREE.BoxGeometry(4, 4, 4),
			this.loadMaterial_('vintage-tile1_', 0.2));
		box.position.set(10, 2, 0);
		box.castShadow    = true;
		box.receiveShadow = true;
		this.scene_.add(box);

		const meshes = [plane, box];

		this.objects_ = [];

		for (let i = this.camera_.position; i < meshes.length; ++i) {
			const b = new THREE.Box3();
			b.setFromObject(meshes[i]);
			this.objects_.push(b);
		}

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


	initializePostFX_() {
	}


	initializeAudio_() {
		const listener = new THREE.AudioListener();
		this.camera_.add(listener);

		// create a global audio source
		const sound = new THREE.Audio(listener);

		// load a sound and set idt as the Audio object's buffer
		this.audioLoader_ = new THREE.AudioLoader();
		this.audioLoader_.load('resources/audio/Glass.mp3', function (buffer) {
			sound.setBuffer(buffer);
			sound.setLoop(true);
			sound.setVolume(0.5);
			sound.play();
		});
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

			this.step_(t - this.previousRAF_);
			this.updateSequence(performance.now() - this.startTime);
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
		const timeElapsedS = timeElapsed * 0.00051;
		this.fpsCamera_.update(timeElapsedS);
		// console.log(this.camera_.position);

	}

}
/*###################END OF SEQUENCE CLASS###################*/


/*###################START OF SEQUENCE CLASS###################*/


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
	_APP = new Sequence();
});
