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
	
	this.salary = 0;
	
	this.manned_station = null;
}

Employee.prototype = Object.create(Agent.prototype);
Object.defineProperty(Employee.prototype, 'constructor', {
		value: Employee,
		enumerable: false,
		writable: true
	});
	
Employee.prototype.DEFAULT_WIDTH = 32;
Employee.prototype.DEFAULT_HEIGHT = 128;

Employee.prototype.DEBUG_COLOUR = "#5101fe";

Employee.prototype.think = function(lapse)
{
	if(this.manned_station)
	{
		if(this.manned_station.queue.length <= 0)
		{
			this.manned_station.unman(this);
			this.manned_station = null;
			this.currentAction = null;
			this.target = null;
		}
	}
	
	if(!this.currentAction && this.actionQueue.length < 1)
	{
		// we first see if there are any customers that need tending 
		this.queueAction("manCheckout");
		
		// secondary behaviour then is to stock
		if(!this.target) this.queueAction("stock");
	}
}

Employee.prototype.doCurrentAction = function(lapse)
{
	switch(this.currentAction)
	{
		case "moveToTarget": 
			if(this.target)
			{
				this.moveToTarget(lapse);
				// thus, we are arrived and we're done
				if(this.getDistanceToObject(this.target) < this.DISTANCE_TOLERANCE)
				{
					this.currentAction = null;
				}
			}
			else 
			{
				// we're done, since without a target we're already there; no destination port no winds favourable and everything
				this.currentAction = null;
			}
			break;
		case "wait": 
			this.cooldown -= lapse;
			if(this.cooldown < 0) 
			{
				this.cooldown = 0;
				this.currentAction = null;
			}
			
			break;
		case "stock": 
			if(!(this.target instanceof Shelf) || !this.target)
			{
				Engine.log(`Attempted to stock something that is not a shelf! Uh oh!`);
				this.target = null;
				this.currentAction = null;
				return;
			}
			if(this.getDistanceToObject(this.target) < this.DISTANCE_TOLERANCE)
			{
				this.stockShelf(this.target);
				this.currentAction = null;
			}
			else 
			{
				this.shoveAction("moveToTarget");
			}
			break;
		case "manCheckout":
			if(!(this.target instanceof CheckoutCounter) || !this.target)
			{
				Engine.log(`Not a valid target for checkout.`);
				this.target = null;
				this.currentAction = null;
				return;
			}
			if(this.manned_station) return;
			
			if(this.getDistanceToObject(this.target) < this.DISTANCE_TOLERANCE)
			{
				this.manned_station = this.target;
				this.target.man(this);
			}
			break;
		default:
			// default do nothing, in fact this shouldn't be here! 
			Engine.log(`Attempted to do unrecognized ${this.currentAction}.`);
			this.currentAction = null;
	}
}

Employee.prototype.stockShelf = function(shelf)
{
	if(!shelf.item)
	{
		return null;
	}
	
	if(shelf.count < shelf.capacity)
	{
		var amount = Shop.removeStock(shelf.item.key, shelf.capacity - shelf.count);
		shelf.stock(amount);
	}
}

// adds actions with sideeffects
Employee.prototype.queueAction = function(actionName)
{
	switch(actionName)
	{
		case "moveToTarget": 
			this.addAction("moveToTarget");
			return true;
			break;
		case "stock": 
			// we'll be smart about it. first, the empty ones. THEN, the stockable ones.
			this.target = Shop.getStockableEmptyShelf();
			// otherwise, we look for anything that needs brushing up
			if(!this.target) this.target = Shop.getStockableShelf();
			// if STILL no shelf, we give up 
			if(!this.target) return false;
			
			this.addAction("moveToTarget");
			this.addAction("stock");
			this.addAction("wait");
			this.cooldown = 1000;
			return true;
			break;
		case "manCheckout": 
			this.target = Shop.getClosestCheckout(this.x,this.y);
			
			if(!this.target) return false;
			
			// if it's ALREADY manned
			if(this.target.employee)
			{
				this.target = null;
				return false;
			}
			
			// if it's empty 
			// REMOVE clause when adding roles
			if(this.target.queue.length <= 0)
			{
				this.target = null;
				return false;
			}
			
			this.addAction("moveToTarget");
			this.addAction("manCheckout");
			return true;
			break;
		default: 
			Engine.log(`Attempted to add unrecognized action ${actionName}.`);
	}
}

Employee.prototype.spawn = function(x,y)
{
	Agent.prototype.spawn.call(this, x, y);
	this.manned_station = null;
}

Employee.prototype.despawn = function()
{
	this.currentAction = null;
	this.target = null;
	this.actionQueue = [];
	this.cooldown = 0;
}