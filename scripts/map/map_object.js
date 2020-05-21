/**
	Standard map object reduces boilerplate
	Responsible for basic rendering functions and to ensure integrity during rendering 
		nulls in x, y, width or height leads to automatic disqualification.
	Extend this for basic logic 
	x and y MUST BE TRUE TO DRAWING! Otherwise it'll break the viewport.
	AS IN: NOT REVERSED_Y
	
	@date 2020-05-21
	@author laifrank2002
 */
function MapObject(width,height,z=0)
{
	this.x;
	this.y;
	this.width = width;
	this.height = height;
	
	this.type = "generic";
	
	this.zIndex = z;
	
	this.active = true;
}

MapObject.prototype.DEFAULT_SPEED = 1;

MapObject.prototype.tick = function(lapse)
{
	
}

/**
	Creates a data object with necessary fields.
	This is the base of all objects in the MapObject chain. 
	That is why we don't need to call on anything else.
	
	@date 2020-05-21
	@author laifrank2002
	@return an object without the prototype that can be safely 
		converted to a JSON stringy
 */
MapObject.prototype.toData = function()
{
	var data = {x: this.x
		,y: this.y
		,width: this.width 
		,height: this.height 
		,type: this.type 
		,zIndex: this.zIndex 
		,active: this.active};
	return data;
}

/**
	Takes a data object and assigns parameters to itself.
	
	The reason we don't just do object.keys 
	is that some parameters are best left not converted.
	For example: references to another object.
	That's why we can't just blindly copy 
	and have to do all of this manually.
	
	This is my excuse for not having a copy constructor.
	
	@date 2020-05-21
	@author laifrank2002
	@return whether or not the operation was successful
 */
MapObject.prototype.fromData = function(data)
{
	this.x = data.x;
	this.y = data.y;
	this.width = data.width;
	this.height = data.height;
	this.type = data.type;
	this.zIndex = data.zIndex;
	this.active = data.active;
	
	return true;
}

/**
	Basic debug drawing function 
 */
MapObject.prototype.draw = function(context, x, y)
{
	if(!this.isDrawSafe()) return;
	context.beginPath();
	context.rect(this.x + x, this.y + y, this.width, this.height);
	context.closePath();
	context.stroke();
		
	context.fill();
}

MapObject.prototype.isDrawSafe = function()
{
	if(this.x === null || this.y === null || this.width === null || this.height === null) return false;
	return true;
}

MapObject.prototype.drawGhost = function(context,x,y)
{
	context.globalAlpha = 0.5;
	this.draw(context,x,y);
	context.globalAlpha = 1.0;
}

MapObject.prototype.setPosition = function(x,y)
{
	this.x = x;
	this.y = y;
}

MapObject.prototype.move = function(x,y)
{
	if(isNaN(x) || isNaN(y))
	{
		Engine.warn(`MapObject: invalid move coordinates (${x},${y}).`);
	}
	else 
	{
		this.x += x;
		this.y += y;
	}
}

MapObject.prototype.moveTowards = function(target, lapse)
{
	// REVERSED COORDINATES FLAG
	// cause *SIGH*, we're working with wonky coordinates
	// whenever you see target.y, replace with reversed_y
	// and one day, vice versa 
	var reversed_y = target.y + target.height - this.height;
	
	var angle = Math.atan2(reversed_y - this.y,target.x - this.x);
	var vector_x = Math.cos(angle) * this.DEFAULT_SPEED * lapse;
	var vector_y = Math.sin(angle) * this.DEFAULT_SPEED * lapse;
	
	if(vector_x > Math.abs(target.x - this.x))
	{
		this.x = target.x;
	}
	else 
	{
		this.x += vector_x;
	}
	
	if(vector_x > Math.abs(reversed_y - this.y)) 
	{
		this.y = reversed_y;
	}
	else 
	{
		this.y += vector_y;
	}
}

MapObject.prototype.isInBounds = function(object)
{
	if(this.x < object.x + object.width 
		&& this.x + this.width > object.x 
		&& this.y < object.y + object.height
		&& this.y + this.height > object.y)
	{
		return true;
	}
	return false;
}

MapObject.prototype.isCoordinateInBounds = function(x,y)
{
	if(x > this.x 
		&& x < this.x + this.width 
		&& y > this.y 
		&& y < this.y + this.height)
	{
		return true;
	}
	return false;
}

MapObject.prototype.getObjectsInBounds = function(map)
{
	return map.objects.filter(object => this.isInBounds(object));
}

MapObject.prototype.getDistanceTo = function(x,y)
{
	return Math.hypot(x - this.x,y - this.y);
}

MapObject.prototype.getDistanceToObject = function(object)
{
	// REVERSED COORDINATES FLAG
	var reversed_y = object.y + object.height - this.height;
	return this.getDistanceTo(object.x,reversed_y);
}