/**
	Employees who run the shop.
	Based on roles
		[ ] Stocker
			[ ] Recognize which shelves are empty
			[ ] Get items from backroom
			[ ] Restock shelves!
		[ ] Cashier
			[ ] Wait at checkout line 
			[ ] Process customers 
			
	@author laifrank2002
	@date 2020-04-15
 */
function Employee()
{
	Agent.call(this 
		,Employee.prototype.DEFAULT_WIDTH
		,Employee.prototype.DEFAULT_HEIGHT);
}

Employee.prototype = Object.create(Agent.prototype);
Object.defineProperty(Employee.prototype, 'constructor', {
		value: Employee,
		enumerable: false,
		writable: true
	});
	
Employee.prototype.DEFAULT_WIDTH = 32;
Employee.prototype.DEFAULT_HEIGHT = 128;

Employee.prototype.tick = function(lapse)
{
	
}