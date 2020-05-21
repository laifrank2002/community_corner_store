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
	Checks if two objects are equals deeply
	That means we check each property recursively. Yum!
 */
function compareObjectDeepEquals(left, right)
{
	
}