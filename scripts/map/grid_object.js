/**
	Grid object, which is an extension of an map object 
	For things that are (mostly) static 
	Responsible for basic logic of furniture and such
	Extend this to make business logic
	
	@date 2020-05-21
	@author laifrank2002
 */
function GridObject(template)
{
	this.template = template;
	// a null template means an empty object for a toData() call.
	if(!template) return;
	
	MapObject.call(this
		,this.getGridWidth() * Map.prototype.GRID_HORIZONTAL_SIZE
		,this.getGridHeight() * Map.prototype.GRID_VERTICAL_SIZE
		,5);
		
	this.type = "grid_generic";
	
	this.gridX = this.getGridX();
	this.gridY = this.getGridY();
	this.gridWidth = this.getGridWidth();
	this.gridHeight = this.getGridHeight();
	
	this.plopped = false;
	this.occupiedList = [];
	// temp, not saved.
	this.image = this.template.image;
}

GridObject.prototype = Object.create(MapObject.prototype);
Object.defineProperty(GridObject.prototype, 'constructor', {
		value: GridObject,
		enumerable: false,
		writable: true
	});

/**
	Creates a data object with necessary fields.
	Calls everything down the chain.
	
	@date 2020-05-21
	@author laifrank2002
	@return an object without the prototype that can be safely 
		converted to a JSON stringy
 */
GridObject.prototype.toData = function()
{	
	var data = {templateKey: this.template.key
		,gridX: this.gridX 
		,gridY: this.gridY
		,gridWidth: this.gridWidth
		,gridHeight: this.gridHeight
		,plopped: this.plopped
		,occupiedList: this.occupiedList};
	Object.assign(data, MapObject.prototype.toData.call(this));
	return data;
}

/**
	Takes a data object and assigns parameters all the way down.
	
	@date 2020-05-21
	@author laifrank2002
	@return whether or not the operation was successful
 */
GridObject.prototype.fromData = function(data)
{
	this.template = FurnitureTemplateList[data.templateKey].prototype.template;
	if(!this.template)
	{
		Engine.log(`Invalid template key: ${data.templateKey}. Possible removal of template or data corruption.`);
		return false;
	}
	this.gridX = data.gridX;
	this.gridY = data.gridY;
	this.gridWidth = data.gridWidth;
	this.gridHeight = data.gridHeight;
	this.plopped = data.plopped;
	this.occupiedList = data.occupiedList;
	
	this.image = this.template.image;
	
	return MapObject.prototype.fromData.call(this,data);
}

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
	if(this.plopped)
	{
		Engine.log(`GridObject: Is already plopped!`);
		return false;
	}
	
	this.x = x * Map.prototype.GRID_HORIZONTAL_SIZE + Map.prototype.GRID_STARTING_X;
	this.y = -y * Map.prototype.GRID_VERTICAL_SIZE + Map.prototype.GRID_STARTING_Y - this.height;
	this.occupiedList = Grid.prototype.translateCoordinates(this.template.occupied);
	this.plopped = true;
}

GridObject.prototype.unplop = function()
{
	if(!this.plopped)
	{
		Engine.log(`GridObject: Isn't already plopped!`);
		return false;
	}
	
	this.x = null;
	this.y = null;
	this.occupiedList = [];
	this.plopped = false;
}

/**
	Used to determine if object is validly placed. 
	If there is no function in GridObject.prototype.templates[this.template]
	Uses default 
 */
GridObject.prototype.isValidTile = function(tile)
{
	if(this.template.isValidTile) return this.template.isValidTile(tile);
	
	if(!tile.isOccupied) return true;
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