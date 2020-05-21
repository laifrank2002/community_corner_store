// NOTE!!! WHEN ADDING NEW FURNITURE, YOU MUST ADD IT TO THE UNIVERSAL OBJECT CONVERTER!!!
// AS WELL AS TO furniture_template_list.js
// THAT IS CURRENTLY FOUND IN Map.fromData(data)
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
	
/**
	Creates a data object with necessary fields.
	Calls everything down the chain.
	
	@date 2020-05-21
	@author laifrank2002
	@return an object without the prototype that can be safely 
		converted to a JSON stringy
 */
Furniture.prototype.toData = function()
{	
	var data = {};
	Object.assign(data, GridObject.prototype.toData.call(this));
	return data;
}

/**
	Takes a data object and assigns parameters all the way down.
	
	@date 2020-05-21
	@author laifrank2002
	@return whether or not the operation was successful
 */
Furniture.prototype.fromData = function(data)
{
	return GridObject.prototype.fromData.call(this,data);
}

Furniture.prototype.endDay = function(){}