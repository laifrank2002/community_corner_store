/**
	We finally get into business logic. Shop stocks!
	
	@author laifrank2002
	@date 2020-04-16
 */
function Shelf()
{
	Furniture.call(this,this.template);
	
	this.item = null;
	this.price = 0;
	this.count = 0;
	this.capacity = this.DEFAULT_CAPACITY;
	
	this.itemTakenCount = 0;
	
	// for cases and special cases.
	this.stockable = true;
}

Shelf.prototype = Object.create(Furniture.prototype);
Object.defineProperty(Shelf.prototype, 'constructor', {
		value: Shelf,
		enumerable: false,
		writable: true
	});

Shelf.prototype.template = {
	name: "Shelf",
	occupied: [{x:0,y:0},{x:1,y:0}],
	image: images["shelf"],
	frames: {
		"empty": images["shelf"],
		"stocked": images["shelf_stocked"],
	},
};
Shelf.prototype.DEFAULT_CAPACITY = 15;

Shelf.prototype.draw = function(context,x,y)
{
	if(!this.isDrawSafe()) return;
	
	if(this.count > 0)
	{
		var image = this.template.frames["stocked"];
	}
	else 
	{
		var image = this.template.frames["empty"];
	}
	
	if(image)
	{
		context.drawImage(image, this.x + x, this.y + y, this.width, this.height);
	}
	
	// text of capacity 
	context.fillStyle = "black";
	context.font = "30px Arial";
	context.fillText(`${this.count}/${this.capacity}`,this.x + x + 10, this.y + y + 50);
}

Shelf.prototype.browse = function()
{
	return this.item;
}

Shelf.prototype.getPrice = function()
{
	return this.price;
}

Shelf.prototype.takeItem = function(amount = 1)
{
	if(this.count < amount)
	{
		var units = this.count;
		this.count = 0;
		return units;
	}
	this.count -= amount;
	this.itemTakenCount += amount;
	return amount;
}

/**
	A convenient stocking function
	@return stocked_units the amount of units actually loaded onto the shelf
 */
Shelf.prototype.stock = function(amount = this.capacity)
{
	this.count += amount;
	if(this.count > this.capacity)
	{
		var stocked_units = this.capacity - this.count;
		this.count = this.capacity;
		return stocked_units; 
	}
	return amount;
}

Shelf.prototype.setItem = function(item)
{
	// sanity check first to ensure that we aren't magically converting lead into gold 
	// if only...
	if(this.item)
	{
		Shop.returnStock(this.item.key,this.count);
		this.count = 0;
		// we can't compare apples to oranges
		this.itemTakenCount = 0;
	}
	
	this.item = item;
	// default is 100% markup of DEFAULT, not current price.
	this.setPrice(item.buy_price.start * 2.0);
}

Shelf.prototype.setPrice = function(price)
{
	if(!this.item) return;
	
	this.price = price;
	// sanity check
	if(this.price <= 0) this.price = 1;
	if(!this.price) this.price = 1;
}