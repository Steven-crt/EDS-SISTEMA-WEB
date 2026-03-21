import TubesCursor from "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js";

const canvas = document.getElementById("tubes-canvas");

TubesCursor(canvas, {
	tubes: {
		colors: ["#6bd9ff", "#ff7ad9", "#7bff9a"],
		lights: {
			intensity: 220,
			colors: ["#6be4ff", "#ff9bd6", "#9bffcf", "#ffd27a"]
		}
	}
});
