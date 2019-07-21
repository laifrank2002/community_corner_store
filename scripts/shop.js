/**
	Where all of the business logic will be. 
	The second pseudoengine in terms of the game.
 */
var Shop = (
	function()
	{
		// constants
		var MAX_LAPSE = 100;
		var STARTING_Y = 880;
		var STARTING_X = 128;
		
		// fields
		var current_map;
		
		var shopBoundingBox;
		
		// ui related
		var palette_selected = null;
		
		return {
			get current_map() {return current_map},
			
			initialize: function()
			{
				current_map = new Map(create_image("assets/background1.png"),1600,1200);
				current_map.setViewportCoordinates(STARTING_X, STARTING_Y);
				
				current_map.plopGridObject(new GridObject(current_map,GridObject.prototype.types["shelf"]),10,0);
				current_map.plopGridObject(new GridObject(current_map,GridObject.prototype.types["shelf"]),12,0);
				current_map.plopGridObject(new GridObject(current_map,GridObject.prototype.types["shelf"]),14,0);
				current_map.plopGridObject(new GridObject(current_map,GridObject.prototype.types["shelf"]),16,0);
				current_map.plopGridObject(new GridObject(current_map,GridObject.prototype.types["shelf"]),18,0);
				current_map.plopGridObject(new GridObject(current_map,GridObject.prototype.types["shelf"]),20,0);
			},
			
			draw: function(context,x,y)
			{
				current_map.draw(context,x,y);
			},
			
			tick: function(lapse)
			{
				var time_elapsed = lapse;
				if(lapse > MAX_LAPSE) time_elapsed = MAX_LAPSE;
			},
		}
	}
)();

/**
	Defines
	This is not the final item used in game. 
	This is used as a template (think DNA) 
	To the actual game which has the business logic (think mRNA)
 */
var items = {
	"canned tuna": {
		buy_price: {min: 1.00, max: 3.00},
		sell_price: {min: 1.00, max: 4.00},
		elasticity: 1.00,
		consumption_per_year: 7,
	}
}
/**
	We finally get into business logic. Shop stocks!
 */
function Shelf(map)
{
	GridObject.apply(this,map,GridObject.prototype.types["shelf"])
	
	this.item = null;
	this.count = 0;
	this.capacity = this.DEFAULT_CAPACITY;
}

Shelf.prototype = Object.create(GridObject.prototype);
Object.defineProperty(Shelf.prototype, 'constructor', {
		value: Shelf,
		enumerable: false,
		writable: true
	});

Shelf.prototype.DEFAULT_CAPACITY = 15;

Shelf.prototype.sell = function()
{
	if(this.count > 0) 
	{
		this.count--;
		return this.item;
	}
}

Shelf.prototype.browse = function()
{
	return this.item;
}