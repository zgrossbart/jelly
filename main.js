var JELLYFISH = JELLYFISH || {};

JELLYFISH.Main = (function() {
	
	paper.install(window);
	paper.setup("canvas");

	var timer = new Date();
	var addJellyTimer = 0;
	var jellyCounter = 0;
	var numJellies = 9;
	var jellies = [numJellies];
	var jellyResolution = 16;


	window.onload = function() {
		view.onFrame = draw;
	};


	this.draw = function(event) {
		if (event.time > addJellyTimer + 3 && jellyCounter < numJellies) {
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