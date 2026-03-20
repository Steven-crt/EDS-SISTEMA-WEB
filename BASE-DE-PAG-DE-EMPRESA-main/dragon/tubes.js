import TubesCursor from "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js";

const canvas = document.getElementById("tubes-canvas");

TubesCursor(canvas, {
	tubes: {
		colors: ["#6bd9ff", "#f0b429", "#7bff9a"],
		lights: {
			intensity: 150,
			colors: ["#7bdfff", "#f3c466", "#9bffcf", "#ffe1a6"]
		}
	}
});
