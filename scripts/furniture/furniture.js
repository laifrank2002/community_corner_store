/**
	Furniture are objects that are meant to be placed. They're great. 
	Provides util functions for individual pieces of furniture and bridges them to the GridObject
	
	@date 2020-04-25
 */
function Furniture(template)
{
	GridObject.call(this,template);
	this.type = "furniture";
}

Furniture.prototype = Object.create(GridObject.prototype);
Object.defineProperty(Furniture.prototype, 'constructor', {
		value: Furniture,
		enumerable: false,
		writable: true
	});
	
Furniture.prototype.endDay = function(){}