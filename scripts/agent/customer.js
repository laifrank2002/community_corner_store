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
function Customer(traits = [])
{
	Agent.call(this 
		,Customer.prototype.DEFAULT_WIDTH
		,Customer.prototype.DEFAULT_HEIGHT);
	
	this.type = "customer";
	
	this.traits = traits;
	
	this.wealth = 1;
	this.repeat_rate = 0.30;
	// temp fields
	this.cart = [];
	this.subtotal = 0;
	this.budget = 0;
		
	this.hasPaid = false;
	this.isAtCheckout = false;
	this.timeSpent = 0;
	
	// a cart that works the other way. unfulfilled needs are BAD! 
	this.needs = [];
	// traits determine if we have a good customer.
	
	this.calculateWealth();
}

Customer.prototype = Object.create(Agent.prototype);
Object.defineProperty(Customer.prototype, 'constructor', {
		value: Customer,
		enumerable: false,
		writable: true
	});
	
Customer.prototype.TRAIT_DEFINITIONS = {
	"student": {
		"needs": [
			{"key": "book", "chance": 0.2,"urgency": {min: 0.25, max: 0.4}},
			{"key": "stationery", "chance": 0.5, "urgency": {min: 0.35, max: 0.55}},
			{"key": "school_supplies", "chance": 0.6, "urgency": {min: 0.35, max: 0.5}},
			{"key": "beer", "chance": 0.2, "urgency": {min: 0.15, max: 0.2}},
		],
		"wealth_modifier": -1,
	},
	"alcoholic": {
		"needs": [
			{"key": "beer", "chance": 0.6,"urgency": {min: 0.35, max: 0.6}},
			{"key": "wine", "chance": 0.4,"urgency": {min: 0.55, max: 0.7}},
			{"key": "hard_liquor", "chance": 0.3,"urgency": {min: 0.65, max: 0.85}},
		],
		"wealth_modifier": -1,
	},
	"smoker": {
		"needs": [
			{"key": "cigarettes", "chance": 0.95,"urgency": {min: 0.6, max: 0.95}},
		],
		"wealth_modifier": -1,
	},
	"stoner": {
		"needs": [
			{"key": "chips", "chance": 0.6,"urgency": {min: 0.85, max: 0.95}},
			{"key": "candy", "chance": 0.4,"urgency": {min: 0.85, max: 0.95}},
			{"key": "soda", "chance":0.6,"urgency": {min: 0.8, max: 0.95}},
		],
		"wealth_modifier": -1,
	},
	"gambler": {
		"needs": [
			{"key": "lottery_ticket", "chance": 1.0,"urgency": {min: 0.95, max: 1.00}},
		],
		"wealth_modifier": -1,
	},
	"business_owner": {
		"needs": [
			{"key": "phone", "chance": 0.08,"urgency": {min: 0.15, max: 0.20}},
			{"key": "phone_accessories", "chance": 0.35,"urgency": {min: 0.15, max: 0.25}},
			{"key": "stationery", "chance": 0.75,"urgency": {min: 0.75, max: 0.85}},
		],
		"wealth_modifier": +3,
	},
	"blue_collar": {
		"needs": [
			{"key": "canned_tuna", "chance": 0.55,"urgency": {min: 0.35, max: 0.40}},
			{"key": "milk", "chance": 0.40,"urgency": {min: 0.55, max: 0.60}},
			{"key": "eggs", "chance": 0.65,"urgency": {min: 0.55, max: 0.75}},
			{"key": "flour", "chance": 0.35,"urgency": {min: 0.15, max: 0.65}},
			{"key": "cooking_oil", "chance": 0.25,"urgency": {min: 0.25, max: 0.65}},
			{"key": "vegetables", "chance": 0.55,"urgency": {min: 0.45, max: 0.65}},
			{"key": "fruits", "chance": 0.50,"urgency": {min: 0.45, max: 0.65}},
			{"key": "soda", "chance": 0.65,"urgency": {min: 0.45, max: 0.65}},
			{"key": "snacks", "chance": 0.85,"urgency": {min: 0.15, max: 0.25}},
			{"key": "candy", "chance": 0.85,"urgency": {min: 0.15, max: 0.35}},
			{"key": "phone", "chance": 0.02,"urgency": {min: 0.15, max: 0.20}},
			{"key": "phone_accessories", "chance": 0.10,"urgency": {min: 0.15, max: 0.25}},
			{"key": "cough_medicine", "chance": 0.07,"urgency": {min: 0.35, max: 0.55}},
			{"key": "beer", "chance": 0.3,"urgency": {min: 0.25, max: 0.3}},
		],
		"wealth_modifier": +1,
	},
	"white_collar": {
		"needs": [
			{"key": "canned_tuna", "chance": 0.25,"urgency": {min: 0.35, max: 0.40}},
			{"key": "milk", "chance": 0.65,"urgency": {min: 0.55, max: 0.60}},
			{"key": "eggs", "chance": 0.75,"urgency": {min: 0.55, max: 0.75}},
			{"key": "flour", "chance": 0.35,"urgency": {min: 0.15, max: 0.65}},
			{"key": "cooking_oil", "chance": 0.25,"urgency": {min: 0.25, max: 0.65}},
			{"key": "vegetables", "chance": 0.65,"urgency": {min: 0.45, max: 0.65}},
			{"key": "fruits", "chance": 0.80,"urgency": {min: 0.45, max: 0.65}},
			{"key": "soda", "chance": 0.65,"urgency": {min: 0.45, max: 0.65}},
			{"key": "snacks", "chance": 0.55,"urgency": {min: 0.15, max: 0.25}},
			{"key": "candy", "chance": 0.55,"urgency": {min: 0.15, max: 0.35}},
			{"key": "phone", "chance": 0.04,"urgency": {min: 0.15, max: 0.20}},
			{"key": "phone_accessories", "chance": 0.25,"urgency": {min: 0.15, max: 0.25}},
			{"key": "cough_medicine", "chance": 0.07,"urgency": {min: 0.35, max: 0.55}},
		],
		"wealth_modifier": +2,
	},
	"sick": {
		"needs": [
			{"key": "cough_medicine", "chance": 0.95,"urgency": {min: 0.75, max: 0.95}},
		],
		"wealth_modifier": +0,
	},
}
	
Customer.prototype.DEFAULT_WIDTH = 32;
Customer.prototype.DEFAULT_HEIGHT = 128;

Customer.prototype.BUDGET_TOLERANCE = 500;
Customer.prototype.DEFAULT_WEALTH = 1;
Customer.prototype.DEFAULT_MINIMUM_BUDGET = 2000;
Customer.prototype.DEFAULT_MAXIMUM_BUDGET = 10000;

Customer.prototype.DEBUG_COLOUR = "#fefe01";

/**
	Creates a data object with necessary fields.
	Calls everything down the chain.
	
	@date 2020-05-21
	@author laifrank2002
	@return an object without the prototype that can be safely 
		converted to a JSON stringy
 */
Customer.prototype.toData = function()
{	
	var data = {traits: this.traits
		,wealth: this.wealth
		,repeat_rate: this.repeat_rate};
	Object.assign(data, Agent.prototype.toData.call(this));
	return data;
}

/**
	Takes a data object and assigns parameters all the way down.
	
	@date 2020-05-21
	@author laifrank2002
	@return whether or not the operation was successful
 */
Customer.prototype.fromData = function(data)
{
	this.traits = data.traits;
	this.wealth = data.wealth;
	this.repeat_rate = data.repeat_rate;
	
	this.calculateWealth();
	return Agent.prototype.fromData.call(this,data);
}

Customer.prototype.think = function(lapse)
{
	if(!this.currentAction && this.actionQueue.length < 1)
	{
		if(this.timeSpent > 20 * 1000)
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
			if(this.hasNeed())
			{
				if(this.subtotal + this.BUDGET_TOLERANCE > this.budget)
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
					this.queueAction("browse");
				}
			}
			else 
			{
				if(Math.random() > 0.4)
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
	
	if(this.currentAction != "checkout")
	{
		this.isAtCheckout = false;
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
				if(!this.isAtCheckout)
				{
					this.target.checkout(this);
					this.isAtCheckout = true;
				}
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
				Shop.despawnCustomer(this);
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
	
	this.timeSpent += lapse;
}

Customer.prototype.addToCart = function(item, price)
{
	if(item)
	{
		this.cart.push({key: item.key, item: item, price: price});
		this.subtotal += price;
		if(this.subtotal * (1 + World.sales_tax) > this.budget)
		{
			Engine.log(`Customer has attempted to buy ${this.subtotal} worth of goods with ${this.subtotal * World.sales_tax} while having only $${this.budget} amount of money. God will conjure up the difference in the mean time, but he sure is pissed.`);
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
	var price = shelf.getPrice();
	
	if(item)
	{
		if((price + this.subtotal) * (1 + World.sales_tax) < this.budget)
		{
			var amount = shelf.takeItem(1);
			if(amount > 0)
			{
				// now apply HST and basically finalize transaction.
				this.addToCart(item, price);
				this.fulfillNeed(item);
			}
		}
	}
}

Customer.prototype.browseShelf = function(shelf)
{
	var item = shelf.browse();
	var price = shelf.price;
	// if there is no item, we can't buy it, simple enuff
	if(!item) return;
	// also if the shelf's empty that's a problem too
	if(shelf.isEmpty()) return;
	
	// buying logic, for now it's random.
	if(Math.random() < this.determineBuyChance(item, price))
	{
		this.buyFromShelf(shelf);
	}
}

Customer.prototype.determineBuyChance = function(item, price)
{
	var chance = 0.05;
	// first, if we need the item, that's going to be a check. 
	// impulse items are going to be a *need* for lower class customers.
	if(this.hasNeedFor(item))
	{
		chance = 1.0;
	}
	
	// now, if the price is too high, the customer will be angry
	// then there are two factors at play 
	// is it more than the world price?
	// how rich are they that the money doesn't matter to them?
	var worldPrice = World.prices[item.key].retail;
	
	if(price > worldPrice)
	{
		// if thou price it too much, do not expect people to pay for it.
		var priceModifier = Math.min(Math.max(Math.abs((price-worldPrice))/worldPrice,0),1);
				
		// on the other hand, if the price is too low
		// people don't care about $1.5 vs $2.0 bubblegum as opposed to $7.5 and $10 steaks.
		var lowPriceModifier = gompertz(price,1,-1,-0.00015/(1+this.wealth));
		
		chance = chance * (1 - ((priceModifier) * (lowPriceModifier)));
	}
	// Engine.log("BC: " + chance);
	return chance;
}

Customer.prototype.hasNeedFor = function(item)
{
	for(var i = 0; i < this.needs.length; i++)
	{
		if(this.needs[i].key === item.key && !this.needs[i].fulfilled)
		{
			return true;
		}
	}
	return false;
}

Customer.prototype.hasNeed = function()
{
	for(var i = 0; i < this.needs.length; i++)
	{
		if(!this.needs[i].fulfilled)
		{
			return true;
		}
	}
	return false;
}

Customer.prototype.fulfillNeed = function(item)
{
	this.needs.forEach( (need) => { if(need.key === item.key){need.fulfilled = true} } );
}

Customer.prototype.calculateWealth = function()
{
	this.wealth = this.DEFAULT_WEALTH;
	
	// sum up traits 
	this.wealth += this.traits.reduce( (modifier, trait) => modifier + this.TRAIT_DEFINITIONS[trait].wealth_modifier, 0);
	
	// sanity check 
	if(this.wealth < 0) this.wealth = 0;
}

Customer.prototype.generateNeeds = function()
{
	var needs = [];
	this.traits.forEach( trait => 
	{
		this.TRAIT_DEFINITIONS[trait].needs.forEach ( need =>
		{
			if(Math.random() < need.chance)
			{
				needs.push( {key:need.key, urgency: randomNumber(need.urgency.min, need.urgency.max), fulfilled: false} );
			}
		});
	});
	return needs;
}

/**
	Invoked by the cashier. Get all of the monies!
 */
Customer.prototype.checkout = function()
{
	if(!this.hasPaid)
	{
		this.hasPaid = true;
		return this.subtotal;
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
			if(this.subtotal <= 0)
			{
				// why waste time?
				return this.queueAction("leave");
			}
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

Customer.prototype.spawn = function(x,y)
{
	Agent.prototype.spawn.call(this,x,y);
	
	this.needs = this.generateNeeds();
	// sort by urgency
	this.needs.sort( (a,b) => b.urgency - a.urgency );
	
	this.budget = randomInteger(this.DEFAULT_MINIMUM_BUDGET * (this.wealth * 0.1 + 1)
		,this.DEFAULT_MAXIMUM_BUDGET * (this.wealth + 1));
	/*
		we need to add to the budget when it comes to fulfilling basic needs.
		when a consumer buys a $500 phone and complains 
		that they don't have enough money, then that's THEIR own darn fault.
	 */
	this.budget += this.needs.reduce( (sum, need) => sum + World.prices[need.key].retail, 0 );
	
	this.cart = [];
	this.subtotal = 0;
	
	this.hasPaid = false;
	this.isAtCheckout = false;
	this.timeSpent = 0;
}

Customer.prototype.despawn = function()
{
	if(!this.hasPaid)
	{
		while(this.cart.length > 0)
		{
			Shop.returnStock(this.cart.shift().key,1);
		}
	}
	
	// we determine our satisfaction and how much it met our needs.
	var satisfaction = 1;
	var dissatisfaction = this.needs.reduce( (dissatisfaction, need) => need.fulfilled ? dissatisfaction : dissatisfaction + need.urgency, 0);
	satisfaction -= dissatisfaction;
	satisfaction = Math.max(satisfaction, 0);
	
	Engine.log(dissatisfaction);
	
	this.repeat_rate += (satisfaction - 0.5)/10;
	this.repeat_rate = Math.min(Math.max(this.repeat_rate,0),1);
}