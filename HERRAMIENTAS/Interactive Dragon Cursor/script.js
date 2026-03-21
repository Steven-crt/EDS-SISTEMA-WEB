"use strict";

const screen = document.getElementById("screen");
const rays = document.getElementById("dragon-rays");
const xmlns = "http://www.w3.org/2000/svg";
const xlinkns = "http://www.w3.org/1999/xlink";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;

const createBrain = () => {
	const rand = () => Math.random() * 2 - 1;
	const w1 = Array.from({ length: 6 }, () => Array.from({ length: 6 }, rand));
	const b1 = Array.from({ length: 6 }, rand);
	const w2 = Array.from({ length: 4 }, () => Array.from({ length: 6 }, rand));
	const b2 = Array.from({ length: 4 }, rand);

	const forward = (input) => {
		const h = b1.map((bias, i) => {
			let sum = bias;
			for (let j = 0; j < input.length; j++) sum += w1[i][j] * input[j];
			return Math.tanh(sum);
		});
		const o = b2.map((bias, i) => {
			let sum = bias;
			for (let j = 0; j < h.length; j++) sum += w2[i][j] * h[j];
			return sum;
		});
		const max = Math.max(...o);
		const exps = o.map((v) => Math.exp(v - max));
		const denom = exps.reduce((a, b) => a + b, 0) || 1;
		return exps.map((v) => v / denom);
	};

	const adapt = (reward) => {
		const rate = 0.02 * reward;
		for (let i = 0; i < w2.length; i++) {
			for (let j = 0; j < w2[i].length; j++) {
				w2[i][j] += (Math.random() - 0.5) * rate;
			}
			b2[i] += (Math.random() - 0.5) * rate;
		}
	};

	return { forward, adapt };
};

const brain = createBrain();

let width = window.innerWidth;
let height = window.innerHeight;
let radm = Math.min(width, height) * 0.35;

const resize = () => {
	width = window.innerWidth;
	height = window.innerHeight;
	radm = Math.min(width, height) * 0.35;
};

window.addEventListener("resize", () => resize(), false);

let frm = Math.random();
let rad = 0;
let lastTime = performance.now();

const pointer = { x: width / 2, y: height / 2 };
const user = {
	x: width / 2,
	y: height / 2,
	lastMove: performance.now(),
	lastClick: 0,
	lastX: width / 2,
	lastY: height / 2,
	speed: 0
};
const pet = {
	state: "idle",
	stateUntil: 0,
	energy: 0.72,
	curiosity: 0.78,
	fear: 0.06,
	trust: 0.75,
	orbit: Math.random() * Math.PI * 2,
	wanderSeed: Math.random() * 1000
};
const head = { x: width / 2, y: height / 2 };

window.addEventListener(
	"pointermove",
	(e) => {
		const now = performance.now();
		const dx = e.clientX - user.lastX;
		const dy = e.clientY - user.lastY;
		const dt = Math.max(16, now - user.lastMove);
		user.speed = Math.hypot(dx, dy) / dt;
		user.lastX = e.clientX;
		user.lastY = e.clientY;
		user.x = e.clientX;
		user.y = e.clientY;
		user.lastMove = now;
		rad = 0;
		if (user.speed > 1.1) {
			pet.state = "excited";
			pet.stateUntil = now + 350;
		}
	},
	false
);

window.addEventListener(
	"pointerdown",
	(e) => {
		const now = performance.now();
		user.lastClick = now;
		const dx = head.x - e.clientX;
		const dy = head.y - e.clientY;
		const dist = Math.hypot(dx, dy);
		const near = dist < 140;
		const reward = near ? 1 : -0.25;
		brain.adapt(reward);
		if (near) {
			pet.trust = clamp(pet.trust + 0.06, 0, 1);
			pet.curiosity = clamp(pet.curiosity + 0.08, 0, 1);
			pet.state = "curious";
			pet.stateUntil = now + 800;
			rad = Math.min(radm, rad + 24);
		} else {
			pet.fear = clamp(pet.fear + 0.05, 0, 1);
			pet.state = "startled";
			pet.stateUntil = now + 700;
		}
	},
	false
);

const prepend = (use, i) => {
	const elem = document.createElementNS(xmlns, "use");
	elems[i].use = elem;
	elem.setAttributeNS(xlinkns, "xlink:href", "#" + use);
	screen.prepend(elem);
};

const N = 40;

const elems = [];
for (let i = 0; i < N; i++) elems[i] = { use: null, x: width / 2, y: 0 };

for (let i = 1; i < N; i++) {
	if (i === 1) prepend("Cabeza", i);
	else if (i === 8 || i === 14) prepend("Aletas", i);
	else prepend("Espina", i);
}

const updatePetTarget = (now, dt) => {
	const userActive = now - user.lastMove < 900;
	const idleTime = now - Math.max(user.lastMove, user.lastClick);
	const headDist = Math.hypot(head.x - user.x, head.y - user.y);
	const closeHover = headDist < 150 && userActive;

	user.speed = Math.max(0, user.speed - dt * 2.6);
	if (user.speed > 1.1) {
		pet.state = "excited";
		pet.stateUntil = now + 320;
	} else if (closeHover && pet.state !== "startled") {
		pet.state = "curious";
		pet.stateUntil = now + 420;
	}

	if (now > pet.stateUntil) {
		if (userActive) pet.state = "follow";
		else if (idleTime > 2600) pet.state = "wander";
		else pet.state = "idle";
	}

	pet.fear = clamp(pet.fear - dt * 0.09, 0, 1);
	pet.trust = clamp(pet.trust + (userActive ? dt * 0.05 : -dt * 0.012), 0, 1);
	pet.curiosity = clamp(pet.curiosity + (userActive ? dt * 0.03 : dt * 0.05) - pet.fear * dt * 0.03, 0, 1);
	pet.energy = clamp(pet.energy + (userActive ? dt * 0.06 : -dt * 0.035), 0.4, 1);

	const followPos = { x: user.x, y: user.y };
	const orbitAngle = now * 0.0009 + pet.orbit;
	const orbitBoost = pet.state === "excited" ? 45 : pet.state === "curious" ? 18 : 0;
	const orbitRadius = 90 + 95 * pet.curiosity + orbitBoost;
	const orbitPos = {
		x: user.x + Math.cos(orbitAngle) * orbitRadius,
		y: user.y + Math.sin(orbitAngle * 1.4) * orbitRadius * 0.7
	};
	const wanderRadiusX = width * 0.25 + 40 * pet.energy;
	const wanderRadiusY = height * 0.22 + 30 * pet.energy;
	const wanderPos = {
		x: width / 2 + Math.cos(now * 0.00022 + pet.wanderSeed) * wanderRadiusX,
		y: height / 2 + Math.sin(now * 0.00028 + pet.wanderSeed * 1.7) * wanderRadiusY
	};
	const dx = pointer.x - user.x;
	const dy = pointer.y - user.y;
	const dist = Math.hypot(dx, dy) || 1;
	const avoidPos = {
		x: user.x + (dx / dist) * (170 + 100 * pet.fear),
		y: user.y + (dy / dist) * (170 + 100 * pet.fear)
	};
	const distance = Math.hypot(pointer.x - user.x, pointer.y - user.y);
	const inputs = [
		clamp(distance / Math.min(width, height), 0, 1),
		clamp(idleTime / 6000, 0, 1),
		pet.energy,
		pet.curiosity,
		pet.fear,
		pet.trust
	];
	const weights = brain.forward(inputs);

	let wFollow = weights[0];
	let wOrbit = weights[1] + 0.2;
	let wWander = weights[2];
	let wAvoid = weights[3] * 0.75;

		switch (pet.state) {
			case "follow":
				wFollow += 0.7;
				wOrbit += 0.3;
				break;
			case "curious":
				wOrbit += 0.9;
				wFollow += 0.35;
				break;
			case "excited":
				wOrbit += 1.0;
				wFollow += 0.5;
				break;
			case "wander":
				wWander += 0.8;
				wFollow *= 0.4;
				break;
		case "startled":
			wAvoid += 1.1;
			wFollow *= 0.2;
			break;
			default:
				wOrbit += 0.7;
				wWander += 0.15;
				break;
		}

	const sum = wFollow + wOrbit + wWander + wAvoid || 1;
	const target = {
		x: (followPos.x * wFollow + orbitPos.x * wOrbit + wanderPos.x * wWander + avoidPos.x * wAvoid) / sum,
		y: (followPos.y * wFollow + orbitPos.y * wOrbit + wanderPos.y * wWander + avoidPos.y * wAvoid) / sum
	};
	const bob = Math.sin(now * 0.006 + pet.orbit) * (2 + pet.energy * 3);
	target.y += bob;
	target.x = clamp(target.x, 20, width - 20);
	target.y = clamp(target.y, 20, height - 20);
	return target;
};

const run = () => {
	requestAnimationFrame(run);
	const now = performance.now();
	const dt = Math.min(0.05, (now - lastTime) / 1000);
	lastTime = now;

	const target = updatePetTarget(now, dt);
	let followEase = 0.06 + pet.energy * 0.05;
	if (pet.state === "curious") followEase += 0.03;
	if (pet.state === "excited") followEase += 0.045;
	if (pet.state === "idle") followEase -= 0.02;
	followEase = clamp(followEase, 0.04, 0.18);
	pointer.x = lerp(pointer.x, target.x, followEase);
	pointer.y = lerp(pointer.y, target.y, followEase);

	let e = elems[0];
	const ax = (Math.cos(3 * frm) * rad * width) / height;
	const ay = (Math.sin(4 * frm) * rad * height) / width;
	e.x += (ax + pointer.x - e.x) / 10;
	e.y += (ay + pointer.y - e.y) / 10;
	head.x = e.x;
	head.y = e.y;
	if (rays) {
		rays.style.setProperty("--ray-x", `${e.x}px`);
		rays.style.setProperty("--ray-y", `${e.y}px`);
	}
	for (let i = 1; i < N; i++) {
		let e = elems[i];
		let ep = elems[i - 1];
		const a = Math.atan2(e.y - ep.y, e.x - ep.x);
		e.x += (ep.x - e.x + (Math.cos(a) * (100 - i)) / 5) / 4;
		e.y += (ep.y - e.y + (Math.sin(a) * (100 - i)) / 5) / 4;
		const s = (162 + 4 * (1 - i)) / 50;
		e.use.setAttributeNS(
			null,
			"transform",
			`translate(${(ep.x + e.x) / 2},${(ep.y + e.y) / 2}) rotate(${(180 / Math.PI) * a
			}) translate(${0},${0}) scale(${s},${s})`
		);
	}
	if (rad < radm) rad++;
	frm += 0.003 + pet.energy * 0.002 + (pet.state === "excited" ? 0.003 : 0);
};

run();
