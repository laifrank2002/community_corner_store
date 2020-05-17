/**
	Checkout counters, which, well, checks out.
 */
function CheckoutCounter()
{
	Furniture.call(this,this.template);
	
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