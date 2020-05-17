/**
	A map object which performs the drawing options of the shop.
	Used by the shop.
	
	Performs the following functions 
		- Background
		- Viewport
		- Shop Data itself
		- Map Movement
		- Map Objects (Things to render)
 */
 
function Map(image, width, height, grid_width = Map.prototype.GRID_HORIZONTAL_WIDTH, grid_height = Map.prototype.GRID_VERTICAL_HEIGHT)
{
	this.width = width;
	this.height = height;
	this.backgroundImage = image;
	this.viewport = new Viewport(0,0,ShopElement.width,ShopElement.height);
	
	this.grid = new GridMap(grid_width, grid_height);
	this.objects = [];
	// special...
	this.particles = [];
	
	// SPECIAL OBJECTS 
	// EXITS LEFT
	this.exit_left = new MapObject(50,200);
	this.exit_left.x = -50;
	this.exit_left.y = this.GRID_STARTING_Y - this.exit_left.height;
	this.objects.push(this.exit_left);
}

Map.prototype.KEY_MOVEMENT_SPEED = 10;
Map.prototype.GRID_STARTING_X = 64;
Map.prototype.GRID_STARTING_Y = 880;

Map.prototype.GRID_HORIZONTAL_WIDTH = 21;
Map.prototype.GRID_VERTICAL_HEIGHT = 4;
Map.prototype.GRID_HORIZONTAL_SIZE = 64;
Map.prototype.GRID_VERTICAL_SIZE = 196;

Map.prototype.DEFAULT_SPAWN_X = 0;
Map.prototype.DEFAULT_SPAWN_Y = Map.prototype.GRID_STARTING_Y;

Map.prototype.draw = function(context, x, y)
{
	// deal with engine and keys first 
	var keysPressed = Engine.keysPressed;
	if(keysPressed.up)
	{
		this.viewport.move(0,-this.KEY_MOVEMENT_SPEED);
	}
	if(keysPressed.down)
	{
		this.viewport.move(0,this.KEY_MOVEMENT_SPEED);
	}
	if(keysPressed.left)
	{
		this.viewport.move(-this.KEY_MOVEMENT_SPEED,0);
	}
	if(keysPressed.right)
	{
		this.viewport.move(this.KEY_MOVEMENT_SPEED,0);
	}
	this.restituteViewport();
	
	if(this.backgroundImage)
	{
		context.drawImage(this.backgroundImage
			,this.viewport.x
			,this.viewport.y
			,this.viewport.width
			,this.viewport.height
			,x
			,y
			,this.viewport.width
			,this.viewport.height);
	}
	
	// drawing the building 
	this.grid.draw(context
		,x - this.viewport.x + this.GRID_STARTING_X
		,y - this.viewport.y + this.GRID_STARTING_Y);
	
	// only draw images in frame 
	// order matters! (customers will always be in front of furniture for example!)
	var objectsInFrame = this.objects.filter(object => this.viewport.isInBounds(object));
	objectsInFrame = objectsInFrame.sort((a,b) => a.zIndex - b.zIndex);
	
	objectsInFrame.forEach(object => object.draw(context,x - this.viewport.x,y - this.viewport.y));

}

Map.prototype.setBackgroundImage = function(image)
{
	this.backgroundImage = image;
}

Map.prototype.addObject = function(object)
{
	this.objects.push(object);
}

Map.prototype.removeObject = function(object)
{
	object.active = false;
	this.objects = this.objects.filter(object => object.active);
}

Map.prototype.forEachObject = function(action)
{
	this.objects.forEach(action);
}

Map.prototype.filterObjects = function(filter)
{
	this.objects = this.objects.filter(filter);
}

Map.prototype.setViewportCoordinates = function(x,y)
{
	this.viewport.moveTo(x,y);
}

Map.prototype.getViewportOffset = function()
{
	return {x:this.viewport.x,y:this.viewport.y};
}

Map.prototype.restituteViewport = function()
{
	if(this.viewport.x < 0) this.viewport.x = 0;
	if(this.viewport.y < 0) this.viewport.y = 0;
	if(this.viewport.x + this.viewport.width > 0 + this.width) this.viewport.x = this.width - this.viewport.width;
	if(this.viewport.y + this.viewport.height > 0 + this.height) this.viewport.y = this.height - this.viewport.height;
}

Map.prototype.plopGridObject = function(object,x,y)
{
	if(this.grid.plopGridObject(object,x,y)) 
	{
		this.addObject(object);
		return true;
	}
	return false;
}

Map.prototype.unplopGridObject = function(object)
{
	if(this.grid.unplopGridObject(object)) 
	{
		this.removeObject(object);
		return true;
	}
	return false;
}

/* spawn 'er into the world! */
Map.prototype.spawnAgent = function(agent)
{
	agent.spawn(this.DEFAULT_SPAWN_X,this.DEFAULT_SPAWN_Y);
	this.addObject(agent);
}

Map.prototype.removeAgent = function(agent)
{
	this.removeObject(agent);
}

Map.prototype.tick = function(lapse)
{
	for(var index = 0; index < this.objects.length; index++)
	{
		this.objects[index].tick(lapse);
	}
}
/**
	Viewport object allows further 
	custom functions in the future made generic
	Cuts down on code overhead.
		Ex: getting objects in frame
 */
function Viewport(x,y,width,height)
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

/**
	Viewport's isInBounds takes the WHOLE object
	instead of just an x,y point into consideration
 */
Viewport.prototype.isInBounds = function(object)
{
	if(object.x + object.width > this.x
		&& object.y + object.height > this.y 
		&& object.x < this.x + this.width 
		&& object.y < this.y + this.height)
	{
		return true;
	}
	return false;
}

Viewport.prototype.move = function(x,y)
{
	this.x += x;
	this.y += y;
}

Viewport.prototype.moveTo = function(x,y)
{
	this.x = x;
	this.y = y;
}
/**
	GridMap, for all of your grid based solutions!
	Seriously, simplifies iterations and other functions.
	A specialized object.
	
	**IMPORTANT** 
	Y is reversed. 
	Goes from bottom to top, in traditional cartesian fashion.
 */
function GridMap(width,height)
{
	this.width = width;
	this.height = height;
	this.map = [];
	// we organize it like this in preparation for 'Floors'
	for(var y = 0; y < this.height; y++)
	{
		var floor = [];
		for(var x = 0; x < this.width; x++)
		{
			floor.push(new GridTile(x,y));
		}
		this.map.push(floor);
	}
	// we must also set neighbours
	this.iterate((x,y) =>
		{
			var tile = this.getTile(x,y);
			// north 
			if(y < this.height - 1) tile.neighbours.north = this.getTile(x,y + 1);
			// south 
			if(y > 0) tile.neighbours.south = this.getTile(x,y - 1);
			// east 
			if(x < this.width - 1) tile.neighbours.east = this.getTile(x + 1,y);
			// west 
			if(x > 0) tile.neighbours.west = this.getTile(x - 1,y);
		}
	);
}

GridMap.prototype.draw = function(context,offset_x,offset_y)
{
	this.iterate((x,y) =>
		{
			var tile = this.getTile(x,y);
			
			if(tile.isInterior)
			{
				// first we fill in the drywall
				// remember, from bottom to top, everything is inverted 
				
				context.beginPath();
				context.rect(offset_x + x * Map.prototype.GRID_HORIZONTAL_SIZE
					,offset_y - (y+1) * Map.prototype.GRID_VERTICAL_SIZE
					,Map.prototype.GRID_HORIZONTAL_SIZE
					,Map.prototype.GRID_VERTICAL_SIZE);
				context.closePath();
				context.fillStyle = "#eeeeee";
				context.fill();
				
				if(tile.isWesternWall())
				{						
					// also have a darker drywall as a shadow
					context.beginPath();
					context.rect(offset_x + x * Map.prototype.GRID_HORIZONTAL_SIZE
						,offset_y - (y+1) * Map.prototype.GRID_VERTICAL_SIZE
						,Map.prototype.GRID_HORIZONTAL_SIZE
						,Map.prototype.GRID_VERTICAL_SIZE);
					context.closePath();
					context.fillStyle = "#ffffff";
					context.fill();
				}
				// now to draw the troublesome border walls.
				context.beginPath();
				// we always need to draw the floor and the ceiling
				context.moveTo(offset_x + x * Map.prototype.GRID_HORIZONTAL_SIZE
					,offset_y - (y) * Map.prototype.GRID_VERTICAL_SIZE);
				context.lineTo(offset_x + (x+1) * Map.prototype.GRID_HORIZONTAL_SIZE
					,offset_y - (y) * Map.prototype.GRID_VERTICAL_SIZE);
				
				context.moveTo(offset_x + x * Map.prototype.GRID_HORIZONTAL_SIZE
					,offset_y - (y+1) * Map.prototype.GRID_VERTICAL_SIZE);
				context.lineTo(offset_x + (x+1) * Map.prototype.GRID_HORIZONTAL_SIZE
					,offset_y - (y+1) * Map.prototype.GRID_VERTICAL_SIZE);
				// otherwise, we'll need to draw the walls, but only for the border ones 
				if(tile.isWesternWall())
				{
					context.moveTo(offset_x + x * Map.prototype.GRID_HORIZONTAL_SIZE
						,offset_y - (y+1) * Map.prototype.GRID_VERTICAL_SIZE);
					context.lineTo(offset_x + x * Map.prototype.GRID_HORIZONTAL_SIZE
						,offset_y - (y) * Map.prototype.GRID_VERTICAL_SIZE);
				}
				
				if(tile.isEasternWall())
				{
					context.moveTo(offset_x + (x+1) * Map.prototype.GRID_HORIZONTAL_SIZE
						,offset_y - (y+1) * Map.prototype.GRID_VERTICAL_SIZE);
					context.lineTo(offset_x + (x+1) * Map.prototype.GRID_HORIZONTAL_SIZE
						,offset_y - (y) * Map.prototype.GRID_VERTICAL_SIZE);
				}
				// then to finish up
				context.strokeStyle = "#777777";
				context.lineWidth = 8;
				context.stroke();
			}
		}
	);
}

GridMap.prototype.iterate = function(action)
{
	for(var y = 0; y < this.height; y++)
	{
		for(var x = 0; x < this.width; x++)
		{
			action(x,y);
		}
	}
}

GridMap.prototype.getTile = function(x,y)
{
	return this.map[y][x];
}

GridMap.prototype.getFloor = function(y)
{
	return this.map[y];
}


GridMap.prototype.plopGridObject = function(object, x, y)
{
	// validate first to save time and prevent errors
	if(x < 0 || x + object.gridWidth > this.width || y < 0 || y + object.gridHeight > this.height)
	{
		Engine.log(`GridMap: plop out of bounds at (${x},${y}).`);
		return false;
	}
	
	// for special cases
	if(object.plopValidationFunction)
	{
		if(!object.plopValidationFunction(this, x, y))
		{
			Engine.log(`GridMap: Unable to unplop, validation function failed.`);
			return false;
		}
	}
	
	var occupiedCoordinates = this.translateCoordinates(object.template.occupied, x, y);
	var occupiedTiles = occupiedCoordinates.map(coordinate => this.getTile(coordinate.x,coordinate.y));
	
	if(this.isAllValidTile(occupiedTiles,(tile) => object.isValidTile(tile)))
	{
		occupiedTiles.forEach(tile => tile.occupied = object);
		object.occupiedList = occupiedTiles;	
		object.plop(x,y);
		return true;
	}
	else 
	{
		// log it to the player 
		Engine.log(`GridMap: Unable to plop at (${x},${y}), already occupied.`);
		return false;
	}
}

GridMap.prototype.unplopGridObject = function(object)
{
	if(object.unplopValidationFunction)
	{
		if(!object.unplopValidationFunction(this))
		{
			Engine.log(`GridMap: Unable to unplop at (${object.getGridX()},${object.getGridY()}), validation function failed.`);
			return false;
		}
	}
	var occupiedTiles = object.occupiedList;
	object.occupiedList.forEach(tile => tile.occupied = null);
	object.occupiedList = [];
	return true;
}

GridMap.prototype.isAllValidTile = function(tileList,validationFunction)
{
	var allValid = true;
	tileList.forEach(tile => {if(!validationFunction(tile)) allValid = false});
	
	return allValid;
}

/**
	Translates a list of coordinates by an amount x,y
 */
GridMap.prototype.translateCoordinates = function(coordinateList,x,y)
{
	var newCoordinateList = [];
	for(var index = 0; index < coordinateList.length; index++)
	{
		var coordinate = coordinateList[index];
		newCoordinateList.push({x:coordinate.x + x, y:coordinate.y + y});
	}
	return newCoordinateList;
}

GridMap.prototype.getFloor = function(floor)
{
	
	return this.map[floor];
}

/**
	For pathfinding
	floor - int
	Gets first stairwell on floor(though may not be closest);
 */
GridMap.prototype.getStairwellOnFloor = function(floor)
{
	this.getFloor(floor).forEach(tile => 
	{
		if(tile.occupied)
		{
			if(tile.occupied.type === "stairwell") return tile.occupied;
		}
	});
	return false;
}
/**
	A tile for the GridMap.
 */
function GridTile(x,y)
{
	this.x = x;
	this.y = y;
	
	this.isInterior = true;
	this.occupied = null;
	
	this.neighbours = {
		north:null,
		south:null,
		east:null,
		west:null
	};
}

GridTile.prototype.isRoof = function()
{
	if(this.neighbours.north)
	{
		if(!this.neighbours.north.isInterior)
		{
			return true;
		}
		return false;
	}
	return true;
}

GridTile.prototype.isEasternWall = function()
{
	if(this.neighbours.east)
	{
		if(!this.neighbours.east.isInterior)
		{
			return true;
		}
		return false;
	}
	return true;
}

GridTile.prototype.isWesternWall = function()
{
	if(this.neighbours.west)
	{
		if(!this.neighbours.west.isInterior)
		{
			return true;
		}
		return false;
	}
	return true;;
}

GridTile.prototype.facesOutside = function()
{
	if(this.neighbours.east && this.neighbours.west)
	{
		if(!this.neighbours.east.isInterior && !this.neighbours.west.isInterior)
		{
			return true;
		}
		return false;
	}
	return true;
}

/**
	Standard map object reduces boilerplate
	Responsible for basic rendering functions and to ensure integrity during rendering 
		nulls in x, y, width or height leads to automatic disqualification.
	Extend this for basic logic 
	x and y MUST BE TRUE TO DRAWING! Otherwise it'll break the viewport.
	AS IN: NOT REVERSED_Y
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
/**
	Grid object, which is an extension of an map object 
	For things that are (mostly) static 
	Responsible for basic logic of furniture and such
	Extend this to make business logic
 */
function GridObject(template)
{
	this.template = template;
	MapObject.call(this
		,this.getGridWidth() * Map.prototype.GRID_HORIZONTAL_SIZE
		,this.getGridHeight() * Map.prototype.GRID_VERTICAL_SIZE
		,5);
		
	this.type = "grid_generic";
	
	this.gridX = this.getGridX();
	this.gridY = this.getGridY();
	this.gridWidth = this.getGridWidth();
	this.gridHeight = this.getGridHeight();
	this.occupiedList = [];
	this.image = this.template.image;
}

GridObject.prototype = Object.create(MapObject.prototype);
Object.defineProperty(GridObject.prototype, 'constructor', {
		value: GridObject,
		enumerable: false,
		writable: true
	});

/**
	@overrides MapObject.prototype.draw(context,x,y)
 */
GridObject.prototype.draw = function(context,x,y)
{
	if(!this.isDrawSafe()) return;
	
	if(this.image)
	{
		context.drawImage(this.image, this.x + x, this.y + y, this.width, this.height);
	}
}

GridObject.prototype.plop = function(x,y)
{
	this.x = x * Map.prototype.GRID_HORIZONTAL_SIZE + Map.prototype.GRID_STARTING_X;
	this.y = -y * Map.prototype.GRID_VERTICAL_SIZE + Map.prototype.GRID_STARTING_Y - this.height;
}

/**
	Used to determine if object is validly placed. 
	If there is no function in GridObject.prototype.templates[this.template]
	Uses default 
 */
GridObject.prototype.isValidTile = function(tile)
{
	if(this.template.isValidTile) return this.template.isValidTile(tile);
	
	if(!tile.occupied) return true;
	return false;
}

/**
	Gets Grid stats 
	X and Y are always placed as the very first of each 
 */
GridObject.prototype.getGridX = function()
{
	if(this.occupiedList) return this.occupiedList[0].x;
}

GridObject.prototype.getGridY = function()
{
	if(this.occupiedList) return this.occupiedList[0].y;
}

GridObject.prototype.getGridWidth = function()
{
	var minimum = Math.min.apply(null, this.template.occupied.map((coordinate) => {return coordinate.x}));
	var maximum = Math.max.apply(null, this.template.occupied.map((coordinate) => {return coordinate.x}));
	return (maximum - minimum + 1);
}

GridObject.prototype.getGridHeight = function()
{
	var minimum = Math.min.apply(null, this.template.occupied.map((coordinate) => {return coordinate.y}));
	var maximum = Math.max.apply(null, this.template.occupied.map((coordinate) => {return coordinate.y}));
	return (maximum - minimum + 1);
}
