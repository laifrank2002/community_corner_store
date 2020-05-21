/**
	Grid, for all of your grid based solutions!
	Seriously, simplifies iterations and other functions.
	A specialized object.
	
	**IMPORTANT** 
	Y is reversed. 
	Goes from bottom to top, in traditional cartesian fashion.
	
	@date 2020-05-21
	@author laifrank2002
 */
function Grid(width,height)
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
}

/**
	Creates a data object with necessary fields.
	This is the primal object, and thus it does not need to call on anything else.
	
	@date 2020-05-21
	@author laifrank2002
	@return an object without the prototype that can be safely 
		converted to a JSON stringy
 */
Grid.prototype.toData = function()
{
	var map = [];
	this.map.forEach(floor => map.push(floor.map(tile => tile.toData())));
	
	var data = {width: this.width
		,height: this.height 
		,map: map}
		
	return data;
}

/**
	Takes a data object and assigns parameters all the way down.
	
	@date 2020-05-21
	@author laifrank2002
	@return whether or not the operation was successful
 */
Grid.prototype.fromData = function(data)
{
	this.width = data.width;
	this.height = data.height;
	
	var map = [];
	data.map.forEach(floor => map.push(floor.map(datum => 
			{
				var tile = new GridTile(null,null);
				tile.fromData(datum);
				return tile;
			})));
	this.map = map;
	
	return true;
}

Grid.prototype.draw = function(context,offset_x,offset_y)
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
				
				if(this.isTileWesternWall(tile))
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
				if(this.isTileWesternWall(tile))
				{
					context.moveTo(offset_x + x * Map.prototype.GRID_HORIZONTAL_SIZE
						,offset_y - (y+1) * Map.prototype.GRID_VERTICAL_SIZE);
					context.lineTo(offset_x + x * Map.prototype.GRID_HORIZONTAL_SIZE
						,offset_y - (y) * Map.prototype.GRID_VERTICAL_SIZE);
				}
				
				if(this.isTileEasternWall(tile))
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

Grid.prototype.iterate = function(action)
{
	for(var y = 0; y < this.height; y++)
	{
		for(var x = 0; x < this.width; x++)
		{
			action(x,y);
		}
	}
}

Grid.prototype.getTile = function(x,y)
{
	return this.map[y][x];
}

Grid.prototype.getFloor = function(y)
{
	return this.map[y];
}


Grid.prototype.plopGridObject = function(object, x, y)
{
	// validate first to save time and prevent errors
	if(x < 0 || x + object.gridWidth > this.width || y < 0 || y + object.gridHeight > this.height)
	{
		Engine.log(`Grid: plop out of bounds at (${x},${y}).`);
		return false;
	}
	
	// for special cases
	if(object.plopValidationFunction)
	{
		if(!object.plopValidationFunction(this, x, y))
		{
			Engine.log(`Grid: Unable to unplop, validation function failed.`);
			return false;
		}
	}
	
	var occupiedCoordinates = this.translateCoordinates(object.template.occupied, x, y);
	var occupiedTiles = occupiedCoordinates.map(coordinate => this.getTile(coordinate.x,coordinate.y));
	
	if(this.isAllValidTile(occupiedTiles,(tile) => object.isValidTile(tile)))
	{
		occupiedTiles.forEach(tile => tile.isOccupied = true);
		object.plop(x,y);
		return true;
	}
	else 
	{
		// log it to the dev 
		Engine.log(`Grid: Unable to plop at (${x},${y}), already occupied.`);
		return false;
	}
}

Grid.prototype.unplopGridObject = function(object)
{
	if(object.unplopValidationFunction)
	{
		if(!object.unplopValidationFunction(this))
		{
			Engine.log(`Grid: Unable to unplop at (${object.getGridX()},${object.getGridY()}), validation function failed.`);
			return false;
		}
	}
	var occupiedTiles = object.occupiedList.map(coordinate => this.getTile(coordinate.x, coordinate.y));
	occupiedTiles.forEach(tile => tile.isOccupied = false);
	object.unplop();
	return true;
}

Grid.prototype.isAllValidTile = function(tileList,validationFunction)
{
	var allValid = true;
	tileList.forEach(tile => {if(!validationFunction(tile)) allValid = false});
	
	return allValid;
}

/**
	Translates a list of coordinates by an amount x,y
 */
Grid.prototype.translateCoordinates = function(coordinateList,x,y)
{
	var newCoordinateList = [];
	for(var index = 0; index < coordinateList.length; index++)
	{
		var coordinate = coordinateList[index];
		newCoordinateList.push({x:coordinate.x + x, y:coordinate.y + y});
	}
	return newCoordinateList;
}

Grid.prototype.getFloor = function(floor)
{	
	return this.map[floor];
}


Grid.prototype.isTileRoof = function(tile)
{
	var neighbours = this.getTileNeighbours(tile);
	
	if(neighbours.north)
	{
		if(!neighbours.north.isInterior)
		{
			return true;
		}
		return false;
	}
	return true;
}

Grid.prototype.isTileEasternWall = function(tile)
{
	var neighbours = this.getTileNeighbours(tile);
	
	if(neighbours.east)
	{
		if(!neighbours.east.isInterior)
		{
			return true;
		}
		return false;
	}
	return true;
}

Grid.prototype.isTileWesternWall = function(tile)
{
	var neighbours = this.getTileNeighbours(tile);
	
	if(neighbours.west)
	{
		if(!neighbours.west.isInterior)
		{
			return true;
		}
		return false;
	}
	return true;;
}

Grid.prototype.tileFacesOutside = function(tile)
{
	var neighbours = this.getTileNeighbours(tile);
	
	if(neighbours.east && neighbours.west)
	{
		if(!neighbours.east.isInterior && !neighbours.west.isInterior)
		{
			return true;
		}
		return false;
	}
	return true;
}

Grid.prototype.getTileNeighbours = function(tile)
{
	var neighbours = {};
	var x = tile.x;
	var y = tile.y;
	
	// north 
	if(y < this.height - 1) neighbours.north = this.getTile(x,y + 1);
	// south 
	if(y > 0) neighbours.south = this.getTile(x,y - 1);
	// east 
	if(x < this.width - 1) neighbours.east = this.getTile(x + 1,y);
	// west 
	if(x > 0) neighbours.west = this.getTile(x - 1,y);
	
	return neighbours;
}

/**
	A tile for the Grid.
 */
function GridTile(x,y)
{
	this.x = x;
	this.y = y;
	
	this.isInterior = true;
	this.isOccupied = false;
}

/**
	Creates a data object with necessary fields.
	This is the primal object, and thus it does not need to call on anything else.
	
	@date 2020-05-21
	@author laifrank2002
	@return an object without the prototype that can be safely 
		converted to a JSON stringy
 */
GridTile.prototype.toData = function()
{
	var data = {x: this.x 
		,y: this.y
		,isInterior: this.isInterior
		,isOccupied: this.isOccupied};
	return data;
}

/**
	Takes a data object and assigns parameters all the way down.
	
	@date 2020-05-21
	@author laifrank2002
	@return whether or not the operation was successful
 */
GridTile.prototype.fromData = function(data)
{
	this.x = data.x;
	this.y = data.y;
	this.isInterior = data.isInterior;
	this.isOccupied = data.isOccupied;
	return true;
}