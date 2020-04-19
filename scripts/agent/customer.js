/**
	Finally some bloody customers!
	Responsible for 
		[ ] Shopping
			[ ] Wallets
			[ ] Preferences
			[x] Buying stuff
			[ ] Finding the cash register and pay
			
	@author laifrank2002
	@date 2020-04-15
 */
function Customer()
{
	Agent.call(this 
		,Customer.prototype.DEFAULT_WIDTH
		,Customer.prototype.DEFAULT_HEIGHT);
		
	this.cart = [];
	this.subtotal = 0;
	this.budget = randomInteger(this.minimumBudget, this.maximumBudget);
	
	this.hasPaid = false;
}

Customer.prototype = Object.create(Agent.prototype);
Object.defineProperty(Customer.prototype, 'constructor', {
		value: Customer,
		enumerable: false,
		writable: true
	});
	
Customer.prototype.DEFAULT_WIDTH = 32;
Customer.prototype.DEFAULT_HEIGHT = 128;

Customer.prototype.budgetTolerance = 5;
Customer.prototype.minimumBudget = 50;
Customer.prototype.maximumBudget = 100;

Customer.prototype.CUSTOMERS = {
	
};

Customer.prototype.think = function(lapse)
{
	if(!this.currentAction && this.actionQueue.length < 1)
	{
		if(this.subtotal + this.budgetTolerance > this.budget)
		{
			if(Math.random() > 0.5)
			{
				this.queueAction("checkout");
			}
			else 
			{
				this.queueAction("browse");
			}
		}
		else 
		{
			if(Math.random() > 0.9)
			{
				this.queueAction("checkout");
			}
			else 
			{
				this.queueAction("browse");
			}
		}
	}
}

Customer.prototype.doCurrentAction = function(lapse)
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
		case "browse": 
			if(!(this.target instanceof Shelf) || !this.target)
			{
				Engine.log(`Attempted to browse something that is not a shelf! Uh oh!`);
				this.target = null;
				this.currentAction = null;
				return;
			}
			if(this.getDistanceToObject(this.target) < this.DISTANCE_TOLERANCE)
			{
				this.browseShelf(this.target);
				this.currentAction = null;
			}
			else 
			{
				this.shoveAction("moveToTarget");
			}
			break;
		case "checkout":
			if(!(this.target instanceof CheckoutCounter) || !this.target)
			{
				Engine.log(`Attempted to checkout at somewhere other than the checkout counter!`);
				this.target = null;
				this.currentAction = null;
				return;
			}
			if(this.getDistanceToObject(this.target) < this.DISTANCE_TOLERANCE)
			{
				this.target.checkout(this);
				// we wait until the counter has processed this customer, then we leave
				if(this.hasPaid)
				{
					this.currentAction = null;
					this.queueAction("leave");
				}
			}
			else 
			{
				this.shoveAction("moveToTarget");
			}
			break;
		case "leave":
			if(!this.target)
			{
				this.target = Shop.getExit();
			}
			if(this.getDistanceToObject(this.target) < this.DISTANCE_TOLERANCE)
			{
				this.currentAction = null;
				// Now we DISAPPEAR!
				Shop.leaveCustomer(this);
			}
			else 
			{
				this.shoveAction("moveToTarget");
			}
			break;
		default:
			// default do nothing, in fact this shouldn't be here! 
			Engine.log(`Attempted to do unrecognized ${this.currentAction}.`);
			this.currentAction = null;
	}
}

Customer.prototype.addToCart = function(item, price)
{
	if(item)
	{
		this.cart.push(item);
		this.subtotal += price;
		if(this.subtotal > this.budget)
		{
			Engine.log(`Customer has attempted to buy $${this.subtotal} worth of goods while having only $${this.budget} amount of money. God will conjure up the difference in the mean time, but he sure is pissed.`);
		}
	}
	else 
	{
		Engine.log(`Attempted to push empty item into cart.`);
	}
}

Customer.prototype.buyFromShelf = function(shelf)
{
	var item = shelf.browse();
	var price = shelf.getPrice() * (1.13);
	
	if(price + this.subTotal < this.budget)
	{
		var amount = shelf.takeItem(1);
		// now apply HST 
		this.addToCart(item, price);
	}
}

Customer.prototype.browseShelf = function(shelf)
{
	var item = shelf.browse();
	// buying logic, for now it's random.
	if(Math.random() > 0.2)
	{
		this.buyFromShelf(shelf);
	}
}

/**
	Invoked by the cashier. Get all of the monies!
 */
Customer.prototype.checkout = function()
{
	if(!this.hasPaid)
	{
		var total = 0;
		for(var item = 0; item < this.cart.length; item++)
		{
			total += this.cart[item].price;
		}
		this.hasPaid = true;
		return total;
	}
	return false;
}

// adds actions with sideeffects
Customer.prototype.queueAction = function(actionName)
{
	switch(actionName)
	{
		case "moveToTarget": 
			this.addAction("moveToTarget");
			return true;
			break;
		case "browse": 
			// when browsing... well, we pick SOMETHING to do!
			this.target = Shop.getRandomShelf();
			// if STILL no shelf, we give up 
			if(!this.target) return false;
			
			this.addAction("moveToTarget");
			this.addAction("browse");
			this.addAction("wait");
			this.cooldown = 100;
			return true;
			break;
		case "checkout":
			this.target = Shop.getClosestCheckout(this.x,this.y);
			if(!this.target) return false;
			
			this.addAction("moveToTarget");
			this.addAction("checkout");
			break;
		case "leave":
			this.target = Shop.getExit();
			
			this.addAction("moveToTarget");
			this.addAction("leave");
			break;
		default: 
			Engine.log(`Attempted to add unrecognized action ${actionName}.`);
	}
}