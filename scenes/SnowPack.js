import * as THREE from "three";


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

const _canvas = document.getElementById("canvas");

const renderer = new THREE.WebGLRenderer({
	antialias: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

function resize(e) {
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
}

// window.onresize = debounce(resize, 200);

renderer.render(scene, camera);

const geometry = new THREE.ConeGeometry(10, 30);
const material = new THREE.MeshStandardMaterial({
	color: 0xffebee,
	wireframe: false,
});
const materialRed = new THREE.MeshStandardMaterial({
	color: 0xff0000,
	wireframe: false,
});
const cone = new THREE.Mesh(geometry, material);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(0, 0, 20);

scene.add(pointLight);
scene.add(cone);
scene.position.z = -50;

const mouse = new THREE.Vector2();
let hold = false;

document.addEventListener(
	"mousedown",
	(event) => {
		hold = true;
	},
	false
);

document.addEventListener(
	"mouseup",
	(event) => {
		hold = false;
	},
	false
);

document.addEventListener(
	"mousemove",
	(event) => {
		//console.log(event.clientX);
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	},
	false
);

let mouseLast = null;
let rotationAcce = 0;
let mouseDir = 1;

function animate() {
	requestAnimationFrame(animate);
	cone.rotation.y += (0.01 - rotationAcce * mouseDir) * (hold ? 0 : 1);
	rotationAcce -= 0.01;
	rotationAcce = Math.max(0, rotationAcce);
	scene.position.z -= 1e-3;
	scene.position.z = Math.max(scene.position.z, -100);
	if (hold) {
		if (mouseLast !== null) {
			cone.rotation.y -= (mouseLast.x - mouse.x) * 10;
			rotationAcce = Math.max(rotationAcce, Math.abs(mouseLast.x - mouse.x));
			const thisDir = mouseLast.x - mouse.x < 0 ? -1 : 1;
			if (thisDir !== mouseDir) rotationAcce = 0;
			mouseDir = thisDir;
		}
		mouseLast = new THREE.Vector2(mouse.x, mouse.y);
	} else {
		mouseLast = null;
	}
	renderer.render(scene, camera);
}

animate();