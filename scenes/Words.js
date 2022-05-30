function Words(canvas) {
	const container = canvas;
	var tl          = gsap.timeline({repeat: -1, repeatDelay: 0, delay: 1});

	var oldtime = 0;

	var gridNum  = 25;
	var gridSize = [gridNum, gridNum]; // number of cells in cols and rows
	var gutter   = 1; // in px
	// container


	function createGrid() {
		var grid     = document.createElement("div"),
		    cols     = gridSize[0],
		    rows     = gridSize[1],
		    width    = (100 - (cols - 1) * gutter) / cols,
		    height   = width,
		    numCells = cols * rows,
		    box;

		grid.style.cssText = `grid-template-columns: repeat(${cols}, 1fr); grid-template-rows: repeat(${rows}, 1fr); grid-gap: ${gutter}px;`;
		grid.setAttribute("class", "grid");

		for (var i = 0; i < numCells; i++) {
			box = document.createElement("div");
			box.setAttribute("class", "cell");
			grid.appendChild(box);
		}
		container.appendChild(grid);

	}




	function animateBoxes() {
		tl.to(".cell", {
			duration:      2,
			scale:         "random(0.1, 2)",
			opacity:       "random(0.3, 1)",
			x:             "random(-300,300)",
			y:             "random(-300,300)",
			z:             "random(-400,400)",
			rotateX:       "random(-360, 360, 180)",
			rotateY:       "random(-360, 360, 180)",
			repeat:        -1,
			repeatDelay:   2,
			repeatRefresh: true,
			ease:          "power2.inOut",
			stagger:       {
				amount: 1,
				grid:   gridSize,
				ease:   "sine.inOut",
				from:   "center"
			}
		});
		gsap.to('.grid', {duration: 36, rotateX: 2160, rotateY: 720, ease: "none", repeat: -1});
	}


	//
	this.update = function (time) {
		if (oldtime === 0) {
			oldtime = time;
			createGrid();
			animateBoxes();
		}
		if (time - oldtime >= 36) {
			container.removeChild();
			createGrid();
			animateBoxes();
		}
	}
}


export {Words}