/**
	For when we need to really screw around with JS.
 */
 
/**
	Reverses how dictionaries normally work.
	Returns the first key that contains the property of an object.
	Remember that since order is not guaranteed, this isn't either 
	And it's only when you're SURE IT'S UNIQUE or DON'T CARE WHICH KEY.
	
	@date 2020-05-21
	@author laifrank2002
	
	@return the first key that is equal to some property, or undefined if it doesn't exist.
 */
function findPropertyInObject(object, property)
{
	for(var key in object)
	{
		if(object[key] === property)
		{
			return key;
		}
	}
	
	return undefined;
}

/**
	Double reverses dictionaries.
	Returns the first key of the first key that contains an object of a property 
	that equals some value.
	
	ie,
	
	{
		'key': {
			'property': value
		}
	}
	
	searches WITHIN each object until object[key][property] === value 
	
	@date 2020-05-26
	@author laifrank2002
	
	@return the first key of which this defined property contains some such value, or undefined if it doesn't exist.
 */
function findValueInPropertyInObject(object,property,value)
{
	for(var key in object)
	{
		if(object[key][property] === value)
		{
			return key;
		}
	}
	
	return undefined;
}