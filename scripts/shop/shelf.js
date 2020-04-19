/**
	We finally get into business logic. Shop stocks!
	
	@author laifrank2002
	@date 2020-04-16
 */
function Shelf()
{
	GridObject.call(this,this.type);
	
	this.item = null;
	this.price = 0;
	this.count = 0;
	this.capacity = this.DEFAULT_CAPACITY;
}

Shelf.prototype = Object.create(GridObject.prototype);
Object.defineProperty(Shelf.prototype, 'constructor', {
		value: Shelf,
		enumerable: false,
		writable: true
	});

Shelf.prototype.type = {
	occupied: [{x:0,y:0},{x:1,y:0}],
	image: images["shelf"],
};
Shelf.prototype.DEFAULT_CAPACITY = 15;


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
	this.count -= this.amount;
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