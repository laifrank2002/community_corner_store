/**
	A narrow shelf is a shelf with merely one half its composition, 
	and much less its capacity.
	
	@author laifrank2002
	@date 2020-04-16
 */
function NarrowShelf()
{
	Shelf.call(this);
	this.type = "narrow_shelf";
}

NarrowShelf.prototype = Object.create(Shelf.prototype);
Object.defineProperty(NarrowShelf.prototype, 'constructor', {
		value: NarrowShelf,
		enumerable: false,
		writable: true
	});

NarrowShelf.prototype.template = {
	key: "narrow_shelf",
	name: "Narrow Shelf",
	price: 50 * 100,
	description: "A smaller shelf for one's needs. \n \nCapacity: 8",
	occupied: [{x:0,y:0}],
	image: images["narrow_shelf"],
	frames: {
		"empty": images["narrow_shelf"],
		"stocked": images["narrow_shelf_stocked"],
	},
};

NarrowShelf.prototype.DEFAULT_CAPACITY = 8;

/**
	Creates a data object with necessary fields.
	Calls everything down the chain.
	
	@date 2020-05-21
	@author laifrank2002
	@return an object without the prototype that can be safely 
		converted to a JSON stringy
 */
NarrowShelf.prototype.toData = function()
{	
	var data = {};
	Object.assign(data, Shelf.prototype.toData.call(this));
	return data;
}

/**
	Takes a data object and assigns parameters all the way down.
	
	@date 2020-05-21
	@author laifrank2002
	@return whether or not the operation was successful
 */
NarrowShelf.prototype.fromData = function(data)
{
	return Shelf.prototype.fromData.call(this,data);
}