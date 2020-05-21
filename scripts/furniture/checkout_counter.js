/**
	Checkout counters, which, well, checks out.
 */
function CheckoutCounter()
{
	Furniture.call(this,this.template);
	this.type = "checkout_counter";
	
	this.employee = null;
	
	this.action = null;
	this.progress = 0;
	this.queue = [];
	
	// lifetime stats
	
	this.customersProcessedCount = 0;
	this.totalValueOfTransactions = 0;
	this.totalSalesTaxPaid = 0;
	
	// daily stats 
}

CheckoutCounter.prototype = Object.create(Furniture.prototype);
Object.defineProperty(CheckoutCounter.prototype, 'constructor', {
		value: CheckoutCounter,
		enumerable: false,
		writable: true
	});
	
CheckoutCounter.prototype.template = {
	key: "checkout_counter",
	name: "Checkout Counter",
	occupied: [{x:0,y:0},{x:1,y:0},{x:2,y:0}],
	image: images["checkout_counter"],
};

CheckoutCounter.prototype.actions = {
	"checkout": {
		"duration": 1000,
		"requirement": function()
		{
			if(this.employee)
			{
				return true;
			}
			return false;
		},
		"complete": function()
		{
			var customer = this.queue.shift();
			if(customer)
			{
				var total = customer.checkout();
				if(total)
				{
					// we add the money
					State_manager.add_state("player","money",total);
					// we update stats
					this.customersProcessedCount++;
					this.totalValueOfTransactions += total;
					this.totalSalesTaxPaid += total * World.sales_tax;
				}
			}
		},
	},
};

/**
	Creates a data object with necessary fields.
	Calls everything down the chain.
	
	@date 2020-05-21
	@author laifrank2002
	@return an object without the prototype that can be safely 
		converted to a JSON stringy
 */
CheckoutCounter.prototype.toData = function()
{	
	var data = {customersProcessedCount: this.customersProcessedCount
		,totalValueOfTransactions: this.totalValueOfTransactions
		,totalSalesTaxPaid: this.totalSalesTaxPaid};
	Object.assign(data, Furniture.prototype.toData.call(this));
	return data;
}

/**
	Takes a data object and assigns parameters all the way down.
	
	@date 2020-05-21
	@author laifrank2002
	@return whether or not the operation was successful
 */
CheckoutCounter.prototype.fromData = function(data)
{
	this.customersProcessedCount = data.customersProcessedCount;
	this.totalValueOfTransactions = data.totalValueOfTransactions;
	this.totalSalesTaxPaid = data.totalSalesTaxPaid;
	
	return Furniture.prototype.fromData.call(this,data);
}

CheckoutCounter.prototype.tick = function(lapse)
{	
	if(!this.action)
	{
		// special handlin'
		if(this.queue.length > 0)
		{
			this.setAction(this.actions["checkout"]);
		}
	}
	
	if(!this.action) return;
		
	if(!this.action.requirement.call(this)) return false;
		
	this.progress += lapse/this.action.duration;
	if(this.progress >= 1) 
	{
		this.action.complete.call(this);
		this.action = null;
	}
}

CheckoutCounter.prototype.setAction = function(action)
{
	this.action = action;
	this.progress = 0;
}

CheckoutCounter.prototype.checkout = function(customer)
{
	this.queue.push(customer);
}

CheckoutCounter.prototype.man = function(employee)
{
	this.employee = employee;
}

CheckoutCounter.prototype.unman = function()
{
	this.employee = null;
}

CheckoutCounter.prototype.isEmpty = function()
{
	if(this.queue.length > 0)
	{
		return true;
	}
	return false;
}

CheckoutCounter.prototype.endDay = function()
{
	this.action = null;
	this.queue = [];
	this.progress = null;
	
	this.employee = null;
}