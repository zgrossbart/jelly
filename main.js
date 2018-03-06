var JELLYFISH = JELLYFISH || {};

/*
 * This is out main object for the project.  It handles setting up Paper JS and
 * adding the jellyfish to the page.  You can use this file to add more jellyfish,
 * but be careful not to crassh your browser.
 */
JELLYFISH.Main = (function() {
	
	paper.install(window);
	paper.setup("canvas");

	var timer = new Date();
	var addJellyTimer = 0;
	var jellyCounter = 0;
	var numJellies = 10;
	var jellies = [numJellies];
	var jellyResolution = 16;

	/* 
	 * This connects our drawing routine to the PaperJS onFrame event.  That means
	 * we'll get called every time the canvas redraws.
	 */
	window.onload = function() {
		view.onFrame = draw;
	};

	/* 
	 * Our draw function handles the actual ading the drawing of the jellyfish.
	 */
	this.draw = function(event) {
		if (event.time > addJellyTimer + 3 && jellyCounter < numJellies) {
			// We use some randomness to determine the jellyfish size so they all look different
			jellySize = Math.random() * 5 + 60;
			jellies[jellyCounter] = new JELLYFISH.Jelly(jellyCounter, jellySize, jellyResolution);
			jellies[jellyCounter].init();
            
/*            jellies[jellyCounter].path.onMouseDown = function(event) {
                console.log("jelly hit test: " + event.target.style);
                if (!event.target.selected) {
                    event.target.selected = true;
                    event.target.style = null;
                }
                else {
                    event.target.selected = false;
                    event.target.style = event.target.pathStyle;
                }
            };
*/
	
			jellyCounter++;
			addJellyTimer = event.time;
		}

		if (jellyCounter > 0) {
			for (var j = 0; j < jellyCounter; j++) {
				jellies[j].update(event);
			}
		}
	};

})();