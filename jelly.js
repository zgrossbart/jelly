var JELLYFISH = JELLYFISH || {};

/*
 * This file handles the actual jellyfish.  It manages everything about the jellyfish, 
 * how they move, and where they are positioned.
 */
JELLYFISH.Jelly = function(idNumber, radius, resolution) {
    this.idNumber = idNumber;
	this.path = new Path();
	this.pathRadius = radius;
	this.pathSides = resolution;
	this.pathPoints = [this.pathSides];
	this.pathPointsNormals = [this.pathSides];
	this.group = new Group();

	this.colours = [{s:"#1C4347", f:"#52b755"},
					{s:"#000000", f:"#00aeef"},
					{s:"#000000", f:"#ee2a33"},
					{s:"#000000", f:"#ee5b32"},
					{s:"#1b3b3a", f:"#d03c3a"},
					{s:"#2d393f", f:"#F00FF0"},
					{s:"#422b3a", f:"#fec01e"},
					{s:"#5b263a", f:"#e0cb61"},
					{s:"#580c23", f:"#f69c9f"},
					{s:"#600B2C", f:"#157d6b"}];

	this.pathStyle = {
		strokeWidth: 3,
		strokeColor: this.colours[idNumber].s,
		fillColor: this.colours[idNumber].f
	};
	
	/* 
	 * We start by randomly determining which side of the screen this jellyfish
	 * will enter from.
	 */
	this.side = Math.floor(Math.random() * 4) + 1;	
	switch (this.side) {
	case 1: //left side
		this.location = new Point(-50, Math.random() * view.size.height);
		break;
	case 2: //right side
		this.location = new Point(view.size.width + 100, Math.random() * view.size.height);
		break;
	case 3: // top side
		this.location = new Point(Math.random() * view.size.width, -50);
		break;
	case 4: //bottom side
		this.location = new Point(Math.random() * view.size.width, view.size.height + 100);
		break;
	}

	//this.location = new Point(-50, Math.random() * view.size.height);
	this.velocity = new Point(0, 0);
	this.acceleration = new Point(0, 0);
	
	this.maxSpeed = Math.random() * 0.1 + 0.15;
	this.maxTravelSpeed = this.maxSpeed * 3.5;
	this.maxForce = 0.2;
	this.wanderTheta = 0;
	this.orientation = 0;
	this.lastOrientation = 0;
	this.numTentacles = 0;

//     console.log("jelly idn: " + idNumber);
//	 console.log("jelly max speed: " + this.maxSpeed);
//	 console.log("jelly path radius: " + this.pathRadius);
//	 console.log("---------------------------------------");
};


JELLYFISH.Jelly.prototype.init = function() {
	var theta = (Math.PI * 2) / this.pathSides;
    for (var i = 0; i < this.pathSides; i++) {
		var angle = theta * i;
		var x = Math.cos(angle) * this.pathRadius * 0.7;
		var y = Math.sin(angle) * this.pathRadius;
		
		if (angle > 0 && angle < Math.PI) {
            if (i % 2 == 0) {
                y -= Math.sin(angle) * (this.pathRadius * 0.9);
            }
            else {
                y -= Math.sin(angle) * (this.pathRadius * 0.8);
                this.numTentacles++;
            }
		}
        
		var point = new Point(x, y);

		this.path.add(point);
		this.pathPoints[i] = point.clone();
		this.pathPointsNormals[i] = point.normalize().clone();
	}

	this.path.closed = true;
	this.path.smooth();
	this.path.style = this.pathStyle;
//    this.path.blendMode = "darken";
	this.path.opacity = 0.8;
	this.group.addChild(this.path);


	// Create tentacles
	this.tentacles = [this.numTentacles];
	var segments = Math.floor(Math.random() * 12) + 6;
	var length = Math.floor(Math.random() * 6) + 3;
	for (var t = 0; t < this.numTentacles; t++) {
		this.tentacles[t] = new JELLYFISH.Tentacle(segments, length);
		this.tentacles[t].init();
		this.tentacles[t].path.strokeColor = this.path.strokeColor;
		this.tentacles[t].path.strokeWidth = this.path.strokeWidth;
	}
};

//--------------- ANIMATION ---------------
JELLYFISH.Jelly.prototype.update = function(event) {
	this.lastLocation = this.location.clone();
	this.lastOrientation = this.orientation;

	this.velocity.x += this.acceleration.x;
	this.velocity.y += this.acceleration.y;
	this.velocity.length = Math.min(this.maxTravelSpeed, this.velocity.length);

	this.location.x += this.velocity.x;
	this.location.y += this.velocity.y;

	this.acceleration.length = 0;

	// this.path.position = this.location.clone();
	this.group.position = this.location.clone();
	

	// Rotation alignment
	var locVector = new Point(this.location.x - this.lastLocation.x,
							  this.location.y - this.lastLocation.y);
	this.orientation = locVector.angle + 90;
	// this.path.rotate(this.orientation - this.lastOrientation);
	this.group.rotate(this.orientation - this.lastOrientation);
	
	// Expansion Contraction
	for (var i = 0; i < this.pathSides; i++) {
		var segmentPoint = this.path.segments[i].point;
		// var sineSeed = -(event.time * 3 + this.path.segments[i].point.y * 0.5);
		var sineSeed = -((event.count * this.maxSpeed) + (this.pathPoints[i].y * 0.0375));
		var normalRotatedPoint = this.pathPointsNormals[i].rotate(this.orientation);
		
		segmentPoint.x += normalRotatedPoint.x * Math.sin(sineSeed);
		segmentPoint.y += normalRotatedPoint.y * Math.sin(sineSeed);
	}

	for (var t = 0; t < this.numTentacles; t++) {
		this.tentacles[t].anchor.point = this.path.segments[t+((t%this.numTentacles)+1)].point;
		this.tentacles[t].update(this.orientation);
	}

	this.path.smooth();
	this.wander();
	this.checkBounds();
};


JELLYFISH.Jelly.prototype.steer = function(target, slowdown) {
	var steer;
	var desired	= new Point(target.x - this.location.x, target.y - this.location.y);
	var dist = desired.length;
	
	if (dist > 0) {
		if (slowdown && dist < 100) {
			desired.length = (this.maxTravelSpeed) * (dist / 100);
		}
		else {
			desired.length = this.maxTravelSpeed;
		}
		
		steer = new Point(desired.x - this.velocity.x, desired.y - this.velocity.y);
		steer.length = Math.min(this.maxForce, steer.length);
	}
	else {
		steer = new Point(0, 0);
	}
	return steer;
};


JELLYFISH.Jelly.prototype.seek = function(target) {
	var steer = this.steer(target, false);
	this.acceleration.x += steer.x;
	this.acceleration.y += steer.y;
};


JELLYFISH.Jelly.prototype.wander = function() {
	var wanderR = 5;
	var wanderD	= 100;
	var change = 0.05;
	
	this.wanderTheta += Math.random() * (change * 2) - change;
	
	var circleLocation = this.velocity.clone();
	circleLocation = circleLocation.normalize();
	circleLocation.x *= wanderD;
	circleLocation.y *= wanderD;
	circleLocation.x += this.location.x;
	circleLocation.y += this.location.y;
	
	var circleOffset = new Point(wanderR * Math.cos(this.wanderTheta), wanderR * Math.sin(this.wanderTheta));
	
	var target = new Point(circleLocation.x + circleOffset.x, circleLocation.y + circleOffset.y);
	
	if (this.side === 2 || this.side === 4) {
		/*
		 * If the jellyfish start on the right side or bottom side then we 
		 * want to make them swim toward the center from that side.
		 */
		target = new Point(circleLocation.x - circleOffset.x, circleLocation.y - circleOffset.y);
	}
	
	this.seek(target);
};


JELLYFISH.Jelly.prototype.checkBounds = function() {
	var offset = 60;
	var t = 0;
	if (this.location.x < -offset) {
		this.location.x = view.size.width + offset;
		for (t = 0; t < this.numTentacles; t++) {
			this.tentacles[t].path.position = this.location.clone();
		}
	}
	if (this.location.x > view.size.width + offset) {
		this.location.x = -offset;
		for (t = 0; t < this.numTentacles; t++) {
			this.tentacles[t].path.position = this.location.clone();
		}
	}
	if (this.location.y < -offset) {
		this.location.y = view.size.height + offset;
		for (t = 0; t < this.numTentacles; t++) {
			this.tentacles[t].path.position = this.location.clone();
		}
	}
	if (this.location.y > view.size.height + offset) {
		this.location.y = -offset;
		for (t = 0; t < this.numTentacles; t++) {
			this.tentacles[t].path.position = this.location.clone();
		}
	}
};
