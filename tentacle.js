var JELLYFISH = JELLYFISH || {};

/*
 * This file handles drawing the tentacles for each jellyfish.  It also knows
 * how to animate them and make they sway like the jellyfish is swimming.
 */
JELLYFISH.Tentacle = function(segments, length) {
	this.anchor = new Segment();
	this.path = new Path();
	this.numSegments = segments;
	this.segmentLength = Math.random() * 1 + length - 1;
};

/* 
 * When we initialize our tenticle we add the path points for each 
 * segment on the jellyfish and create all of the points on that path.
 * We don't need to position those points yet.  That is handled in the
 * update function.
 */
JELLYFISH.Tentacle.prototype.init = function() {
	for (var i = 0; i < this.numSegments; i++) {
		this.path.add(new Point(0, i * this.segmentLength));
	}
	this.path.strokeCap = 'round';
	this.anchor = this.path.segments[0];
};

/* 
 * This function gets call every time the canvas redraws so we need to be
 * very careful about performance here.  We got through all of the segments
 * that make up the tentacles of the jellyfish and position the points on 
 * each of them.
 */
JELLYFISH.Tentacle.prototype.update = function(orientation) {
	this.path.segments[1].point = this.anchor.point;

	var dx = this.anchor.point.x - this.path.segments[1].point.x;
	var dy = this.anchor.point.y - this.path.segments[1].point.y;
	var angle = Math.atan2(dy, dx) + ((orientation + 90) * (Math.PI / 180));
	
	this.path.segments[1].point.x += Math.cos(angle);
	this.path.segments[1].point.y += Math.sin(angle);
	
	for (var i = 2; i < this.numSegments; i++) {
		var px = this.path.segments[i].point.x - this.path.segments[i-2].point.x;
		var py = this.path.segments[i].point.y - this.path.segments[i-2].point.y;
		var pt = new Point(px, py);
		var len = pt.length;
		
		if (len > 0.0) {
			this.path.segments[i].point.x = this.path.segments[i-1].point.x + (pt.x * this.segmentLength) / len;
			this.path.segments[i].point.y = this.path.segments[i-1].point.y + (pt.y * this.segmentLength) / len;
		}
	}
};