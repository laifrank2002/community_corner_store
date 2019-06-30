// TO BE DEPRECATED

var Shop = (
	function()
	{
		var x = 0;
		var y = 25;
		
		var gridsize = 32;
		// height in gridtiles
		var SHOP_WIDTH = 10;
		var SHOP_HEIGHT = 14;
		
		var viewport = new Rectangle(0,0,600,550);
		var mousedown = null;
		
		var agents = [];
		
		var hidden = false;
		var parent = null;
		return {
			get x() {return x},
			get y() {return y},
			get width() {return viewport.width},
			get height() {return viewport.height},
			
			get agents() {return agents},
			get gridsize() {return gridsize},
			
			initialize: function()
			{
				shopmap = new ShopMap(SHOP_WIDTH,SHOP_HEIGHT);
				
				// testing 
				shopmap.grid[0].building = true;
				shopmap.grid[1].building = true;
				shopmap.grid[2].building = true;
				shopmap.grid[3].building = true;
				shopmap.grid[4].building = true;
				shopmap.grid[5].building = true;
				shopmap.grid[10].building = true;
				shopmap.grid[11].building = true;
				shopmap.grid[12].building = true;
				shopmap.grid[13].building = true;
				shopmap.grid[14].building = true;
				shopmap.grid[15].building = true;
				shopmap.grid[20].building = true;
				shopmap.grid[21].building = true;
				shopmap.grid[22].building = true;
				shopmap.grid[23].building = true;
				shopmap.grid[24].building = true;
				shopmap.grid[25].building = true;
				shopmap.grid[30].building = true;
				shopmap.grid[31].building = true;
				shopmap.grid[32].building = true;
				shopmap.grid[33].building = true;
				shopmap.grid[40].building = true;
				shopmap.grid[41].building = true;
				shopmap.grid[42].building = true;
				shopmap.grid[50].building = true;
				shopmap.grid[51].building = true;
				shopmap.grid[52].building = true;
				
				shopmap.plopShopObject(new ShopObject("shelf"), 0, 0);
				shopmap.plopShopObject(new ShopObject("shelf"), 0, 2);
				shopmap.plopShopObject(new ShopObject("shelf"), 0, 3);
				shopmap.plopShopObject(new ShopObject("shelf"), 0, 5);
				shopmap.plopShopObject(new ShopObject("cash_register"), 3, 0);
				
				agents.push(new Customer(112,112));
			},
			
			draw: function(context)
			{
				if(hidden) return false;
				shopmap.draw(context, x, y);
				agents.forEach(agent => agent.draw(context, x, y));
			},
			
			tick: function(lapse)
			{
				agents.forEach(agent => agent.tick(lapse));
			},
			
			handle_mousedown: function(mouseX,mouseY)
			{
				if(hidden) return false;
				var relative_mouseX = mouseX - x - viewport.x;
				var relative_mouseY = mouseY - y - viewport.y;
				
				if(viewport.isInBounds(relative_mouseX,relative_mouseY))
				{
					mousedown = new Point(relative_mouseX,relative_mouseY);
					return true;
				}
				else 
				{
					return false;
				}
			},
			
			handle_mouseup: function(mouseX,mouseY)
			{
				var relative_mouseX = mouseX - x - viewport.x;
				var relative_mouseY = mouseY - y - viewport.y;
				
				if(viewport.isInBounds(relative_mouseX, relative_mouseY) && mousedown)
				{
					Engine.log(mousedown);
				}
				mousedown = null;
			},
			
			hide: function()
			{
				hidden = true;
			},
			
			show: function()
			{
				hidden = false;
			},
		}
	}
)();

function ShopMap(width,height)
{	
	this.width = width;
	this.height = height;
	
	this.grid = [];
	// repeat only because index has not been initialized yet, don't use!
	for(var index = 0; index < this.width * this.height; index++)
	{
		var x = index % this.width;
		var y = Math.floor(index / this.width);
		var tile = new ShopTile(x, y);
		
		this.grid.push(tile);
	}
	
	// neighbours!
	this.forEach(tile => 
		{
			// N
			if(tile.y > 0)
			{
				tile.neighbours.n = this.grid[this.getIndexFromCartesian(tile.x,tile.y-1)];
			}
			// S 
			if(tile.y < this.height - 1)
			{
				tile.neighbours.s = this.grid[this.getIndexFromCartesian(tile.x,tile.y+1)];
			}
			// W
			if(tile.x > 0)
			{
				tile.neighbours.w = this.grid[this.getIndexFromCartesian(tile.x-1,tile.y)];
			}
			// E
			if(tile.x < this.width - 1)
			{
				tile.neighbours.e = this.grid[this.getIndexFromCartesian(tile.x+1,tile.y)];
			}
		});
		
	// objects
	this.shopObjects = [];
}

ShopMap.prototype.forEach = function(action)
{
	for(var index = 0; index < this.width * this.height; index++)
	{
		action(this.grid[index]);
	}
}

ShopMap.prototype.draw = function(context,x,y)
{
	context.strokeStyle = "black";
	var gridsize = Shop.gridsize;
	// mostly the grid;
	this.forEach(tile => 
		{
			context.lineWidth = 1;
			context.beginPath();
			context.rect(x + gridsize * tile.x
				,y + gridsize * tile.y
				,gridsize
				,gridsize);
			context.stroke();
			// walls 
			if(tile.building)
			{
				context.fillStyle = "#e5dcb5";
				context.fill();
				context.lineWidth = 4;
				context.beginPath();
				
				// only draw if no neighbours hold it.
				if(!tile.neighbours.n || !tile.neighbours.n.building)
				{
					context.moveTo(x + gridsize * tile.x
						,y + gridsize * tile.y);
					context.lineTo(x + gridsize * tile.x + gridsize
						,y + gridsize * tile.y);
				}
				if(!tile.neighbours.s || !tile.neighbours.s.building)
				{
					context.moveTo(x + gridsize * tile.x
						,y + gridsize * tile.y + gridsize);
					context.lineTo(x + gridsize * tile.x + gridsize
						,y + gridsize * tile.y + gridsize);
				}
				if(!tile.neighbours.e || !tile.neighbours.e.building)
				{
					context.moveTo(x + gridsize * tile.x + gridsize
						,y + gridsize * tile.y);
					context.lineTo(x + gridsize * tile.x + gridsize
						,y + gridsize * tile.y + gridsize);
				}
				if(!tile.neighbours.w || !tile.neighbours.w.building)
				{
					context.moveTo(x + gridsize * tile.x
						,y + gridsize * tile.y);
					context.lineTo(x + gridsize * tile.x
						,y + gridsize * tile.y + gridsize);
				}
				context.stroke();
			}
		});
	// und on top, draw the shop objects 
	this.shopObjects.forEach(object => object.draw(context,x,y));
}

ShopMap.prototype.getIndexFromCartesian = function(x,y)
{
	return (x + y * this.width);
}

ShopMap.prototype.getCartesianFromIndex = function(index)
{
	return {x:index%this.width,y:Math.floor(index/this.width)};
}

ShopMap.prototype.isOccupied = function(coordinateList)
{
	var occupied = false;
	coordinateList.forEach(coordinate => {if(this.grid[this.getIndexFromCartesian(coordinate.x,coordinate.y)].occupied)occupied = true});
	return occupied;
}

ShopMap.prototype.isInBuilding = function(coordinateList)
{
	var inBuilding = true;
	coordinateList.forEach(coordinate => {if(!this.grid[this.getIndexFromCartesian(coordinate.x,coordinate.y)].building) inBuilding = false});
	return inBuilding;
}

ShopMap.prototype.plopShopObject = function(shopObject, x, y, orientation = 1)
{
	var occupiedList = shopObject.type.occupied.map(coordinate => {return {x: coordinate.x + x, y: coordinate.y + y}});
	if(!this.isOccupied(occupiedList) && this.isInBuilding(occupiedList))
	{
		// orientation disabled for now 
		shopObject.occupied = occupiedList;
		shopObject.occupied.forEach(coordinate => this.grid[this.getIndexFromCartesian(coordinate.x, coordinate.y)].occupied = shopObject);
	
		this.shopObjects.push(shopObject);
		return true;
	}
	Engine.notify("Unable to place.");
	return false;
}

ShopMap.prototype.unplopShopObject = function(shopObject)
{
	shopObject.occupied.forEach(coordinate => this.grid[this.getIndexFromCartesian(coordinate.x, coordinate.y)].occupied = null);
	shopObject.active = false;
	
	this.shopObkects.filter (object => object.active);
}

function ShopTile(x,y)
{
	this.x = x;
	this.y = y;
	this.neighbours = {n: null, s: null, e: null, w: null};
	
	this.occupied = null;
	// walls and interiors 
	this.building = false;
}
// TODO
// [x] OCCUPIED TILES
// [ ] ACCESS OCCUPIED TILES 
function ShopObject(type)
{
	// coordinates for what tiles are occupied 
	this.occupied = [];
	this.type = ShopObject.prototype.type[type];
	// 4 different rotations: 1,2,3,4
	// clockwise
	this.rotation = 1;
	
	this.active = true;
}

ShopObject.prototype.draw = function(context,x,y)
{
	this.occupied.forEach(coordinate =>
		{
			context.strokeStyle = "blue";
			context.fillStyle = "blue";
			context.beginPath();
			context.rect(x + coordinate.x*Shop.gridsize
				,y + coordinate.y*Shop.gridsize
				,Shop.gridsize
				,Shop.gridsize);
			context.stroke();
			context.fill();
		});
}

ShopObject.prototype.type = {
	"shelf":{
		occupied: [{x:0,y:0},{x:1,y:0}],
		access: [{x:0,y:1},{x:1,y:1}],
	},
	"cash_register":{
		occupied: [{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:2,y:1}],
		access: [{x:1,y:1}],
	},
}

function Shelf(type)
{
	ShopObject.call(this, arguments);
	this.type = ShopObject.prototype.type["shelf"];
	this.shelf_type = Shelf.prototype.type[type];
	
	this.count = 0;
	this.capacity = this.shelf_type.capacity;
	 
}

// classical inheritance
Shelf.prototype = Object.create(ShopObject.prototype);
Object.defineProperty(Shelf.prototype, 'constructor', {
	value: Shelf,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

Shelf.prototype.type = {
	"regular": {
		"capacity": 15,
	}
}

// items 
function Item()
{
	
}

Item.prototype.type = {
	"cigar": {
		"cost": {min: 5, max: 7},
		"effect": {"health":-1},
	},
};