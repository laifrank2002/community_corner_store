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
 
function Map(image, width, height)
{
	this.width = width;
	this.height = height;
	this.backgroundImage = image;
	this.viewport = new Viewport(0,0,ShopHandler.width,ShopHandler.height);
	
	this.grid = new GridMap(this.GRID_HORIZONTAL_LENGTH,this.GRID_VERTICAL_LENGTH);
	this.objects = [];
}

Map.prototype.KEY_MOVEMENT_SPEED = 10;
Map.prototype.GRID_STARTING_X = 128;
Map.prototype.GRID_STARTING_Y = 880;

Map.prototype.GRID_HORIZONTAL_LENGTH = 21;
Map.prototype.GRID_VERTICAL_LENGTH = 4;
Map.prototype.GRID_HORIZONTAL_SIZE = 64;
Map.prototype.GRID_VERTICAL_SIZE = 196;

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
	
	/*
	// impose a grid! 
	this.drawGrid(context
		,x - this.viewport.x + this.GRID_STARTING_X
		,y - this.viewport.y + this.GRID_STARTING_Y);
	*/
	// only draw images in frame 
	this.objects.forEach(object =>
		{
			if(this.viewport.isInBounds(object))
			{
				object.draw(context,x - this.viewport.x,y - this.viewport.y);
			}
		});
}

Map.prototype.drawGrid = function(context,x,y)
{
	if(!this.grid) return false;
	// draws an everlooming grid onto this world 
	for(var x_index = 0; x_index < this.grid.width; x_index++)
	{
		for(var y_index = 0; y_index < this.grid.height; y_index++)
		{
			context.strokeStyle = "white"; 
			context.lineWidth = 2;
			context.beginPath();
			context.rect(x + x_index * this.GRID_HORIZONTAL_SIZE
				, y + y_index * this.GRID_VERTICAL_SIZE - this.grid.height * this.GRID_VERTICAL_SIZE
				,this.GRID_HORIZONTAL_SIZE
				,this.GRID_VERTICAL_SIZE);
			context.closePath();
			context.stroke();
		}
	}
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
	if(this.grid.plopGridObject(object,x,y)) this.addObject(object);
}

Map.prototype.unplopGridObject = function(object)
{
	this.grid.unplopGridObject(object);
	
	this.removeObject(object);
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
				context.fillStyle = "#ffffff";
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
					context.fillStyle = "#dddddd";
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
				context.strokeStyle = "grey";
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
	// validate first to prevent excessive errors
	if(x < 0 || x + object.gridWidth > this.width - 1 || y < 0 || y + object.gridHeight > this.height - 1)
	{
		Engine.warn(`GridMap: plop out of bounds at (${x},${y}).`);
		return false;
	}
	
	var occupiedCoordinates = this.translateCoordinates(object.type.occupied, x, y);
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
	var occupiedTiles = object.occupiedList;
	object.occupiedList.forEach(tile => tile.occupied = null);
	object.occupiedList = null;
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
 */
function MapObject(map,width,height)
{
	this.map = map;
	this.x;
	this.y;
	this.width = width;
	this.height = height;
	
	this.active = true;
}

MapObject.prototype.tick = function()
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
// Completely REDO!
/**
	Grid object, which is an extension of an map object 
	For things that are (mostly) static 
	Responsible for basic logic of furniture and such
	Extend this to make business logic
 */
function GridObject(map,type)
{
	this.type = type;
	MapObject.call(this
		,map
		,this.getGridWidth() * map.GRID_HORIZONTAL_SIZE
		,this.getGridHeight() * map.GRID_VERTICAL_SIZE);
		
	this.gridX = this.getGridX();
	this.gridY = this.getGridY();
	this.gridWidth = this.getGridWidth();
	this.gridHeight = this.getGridHeight();
	this.occupiedList = [];
	this.image = this.type.image;
}

GridObject.prototype = Object.create(MapObject.prototype);
Object.defineProperty(GridObject.prototype, 'constructor', {
		value: GridObject,
		enumerable: false,
		writable: true
	});
	
GridObject.prototype.types = {
	"shelf": {
		occupied: [{x:0,y:0},{x:1,y:0}],
		image: create_image("assets/shelf.png"),
	}
};

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
	this.x = x * this.map.GRID_HORIZONTAL_SIZE + this.map.GRID_STARTING_X;
	this.y = -y * this.map.GRID_VERTICAL_SIZE + this.map.GRID_STARTING_Y - this.height;
}

/**
	Used to determine if object is validly placed. 
	If there is no function in GridObject.prototype.types[type]
	Uses default 
 */
GridObject.prototype.isValidTile = function(tile)
{
	if(this.type.isValidTile) return this.type.isValidTile(tile);
	
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
	var minimum = Math.min.apply(null, this.type.occupied.map((coordinate) => {return coordinate.x}));
	var maximum = Math.max.apply(null, this.type.occupied.map((coordinate) => {return coordinate.x}));
	return (maximum - minimum + 1);
}

GridObject.prototype.getGridHeight = function()
{
	var minimum = Math.min.apply(null, this.type.occupied.map((coordinate) => {return coordinate.y}));
	var maximum = Math.max.apply(null, this.type.occupied.map((coordinate) => {return coordinate.y}));
	return (maximum - minimum + 1);
}

/**
	Now this is fun: moving AGENTS!
	They actually handle most of the business logic.
	But not this one in particular.
	Responsible for 
		[ ] Path finding
 */
function Agent(map,width,height)
{
	MapObject.call(this
		,map
		,width
		,height);
	
}

Agent.prototype = Object.create(MapObject.prototype);
Object.defineProperty(Agent.prototype, 'constructor', {
		value: Agent,
		enumerable: false,
		writable: true
	});
	
Agent.prototype.tick = function()
{
	/* reduce pathfinding by doing it only occasionally */
}

/**
	Finally some bloody customers!
	Responsible for 
		[ ] Shopping
			[ ] Wallets
			[ ] Preferences
			[ ] Finding the cash register and pay
			[ ] Shoplifting!
			
 */
function Customer(map)
{
	Agent.call(this
		,map 
		,Customer.prototype.DEFAULT_WIDTH
		,Customer.prototype.DEFAULT_HEIGHT);
		
	this.basket = [];
}

Customer.prototype = Object.create(Agent.prototype);
Object.defineProperty(Customer.prototype, 'constructor', {
		value: Customer,
		enumerable: false,
		writable: true
	});
	
Customer.prototype.DEFAULT_WIDTH = 32;
Customer.prototype.DEFAULT_HEIGHT = 128;

Customer.prototype.buyFromShelf = function(shelf)
{
	var item = shelf.browse();
	if(shelf.sell()) this.basket.push(item);
}