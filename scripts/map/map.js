/**
	A map object which performs the drawing options of the shop.
	Used by the shop.
	
	Performs the following functions 
		- Background
		- Viewport
		- Shop Data itself
		- Map Movement
		- Map Objects (Things to render)
		
	@date 2020-05-21
	@author laifrank2002
 */
 
function Map(image, width, height, grid_width = Map.prototype.GRID_HORIZONTAL_WIDTH, grid_height = Map.prototype.GRID_VERTICAL_HEIGHT)
{
	this.width = width;
	this.height = height;
	this.backgroundImage = image;
	
	this.grid = new Grid(grid_width, grid_height);
	this.objects = [];
	// special...
	
	// fields and other not saved things 
	this.particles = [];
	
	this.viewport = new Viewport(0,0,ShopElement.width,ShopElement.height);

	
	// SPECIAL OBJECTS (don't need to be init) 
	/*
		These don't go in this.objects because 
		they are created seperately at initialize
		and are static.
	 */
	
	// EXIT LEFT
	this.exit_left = new MapObject(50,200);
	this.exit_left.x = -50;
	this.exit_left.y = this.GRID_STARTING_Y - this.exit_left.height;
	//this.objects.push(this.exit_left);
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

/**
	Creates a data object with necessary fields that can be safely 
	converted into a JSON string.
	
	@date 2020-05-21
	@author laifrank2002
	@return an object without the prototype that can be safely 
		converted to a JSON stringy
 */
Map.prototype.toData = function()
{
	var imageKey = findPropertyInObject(images, this.backgroundImage);
	if(!imageKey)
	{
		Engine.log(`Map.toData(): Image not found in images. Please remember to only use images loaded from images. A placeholder is to be used instead.`);
		imageKey = "";
	}
	
	var data = {
		width: this.width,
		height: this.height,
		imageKey: imageKey,
		grid: this.grid.toData(),
		objects: this.objects.map(object => object.toData()),
	};
}

/**
	Takes a data object and assigns parameters all the way down.
	
	@date 2020-05-21
	@author laifrank2002
	@return whether or not the operation was successful
 */
Map.prototype.fromData = function(data)
{
	this.width = data.width;
	this.height = data.height;
	
	this.backgroundImage = images[data.imageKey];
	if(!this.backgroundImage) Engine.log(`Map.fromData(): Image of key ${imageKey} not found in images.`);	
	
	this.grid = new Grid();
	this.grid.fromData(data.grid);
	
	// this will be slightly trickier to account for objects...
	this.objects = data.objects.map(datum =>
		{
			var object = null;
			switch(datum.type)
			{
				case "generic":
					object = new MapObject();
					break;
				case "grid_generic":
					object = new GridObject();
					break;
				case "agent":
					object = new Agent();
					break;
				case "customer":
					object = new Customer();
					break;
				case "employee":
					object = new Employee();
					break;
				case "furniture":
					object = new Furniture();
					break;
				case "shelf":
					object = new Shelf();
					break;
				case "narrow_shelf":
					object = new NarrowShelf();
					break;
				case "checkout_counter":
					object = new CheckoutCounter();
					break;
				default: 
					Engine.log(`Datum of type ${datum.type} not recognized.`);
					break;
			}
			object.fromData(datum);
			return object;
		});
}

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