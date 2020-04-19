/**
	Array utilities
 */
 
// removes an element from an array and returns it 
function removeElementInArray(array, element)
{
	for(var index = 0; index < array.length; index++)
	{
		if(array[index] === element) 
		{
			var item = array[index];
			array.splice(index, 1);
			return item;
		}
	}
}