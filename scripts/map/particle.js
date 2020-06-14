/**
	A temporary graphics thing that looks pretty.
	
	@date 2020-05-22
	@author laifrank2002
 */
function Particle(width,height,velocity,lifetime = this.DEFAULT_LIFETIME)
{
	this.x;
	this.y;
	this.width = width;
	this.height = height;
	this.velocity = velocity;
	
	this.lifetime = lifetime;
	
	this.zIndex = z;
	
	this.active = true;
}

Particle.prototype.DEFAULT_LIFETIME = 1000;
Particle.prototype.DEFAULT_COLOUR = "#ff0000";

Particle.prototype.tick = function(lapse)
{
	
}

Particle.prototype.draw = function(context, x, y)
{
	if(!this.isDrawSafe()) return;
	context.fillStyle = this.DEFAULT_COLOUR;
	
	context.beginPath();
	context.rect(this.x + x, this.y + y, this.width, this.height);
	context.closePath();
	context.stroke();
	
	context.fill();
}

Particle.prototype.isDrawSafe = function()
{
	if(this.x === null || this.y === null || this.width === null || this.height === null) return false;
	return true;
}