/**
	Checkout counters, which, well, checks out.
 */
function CheckoutCounter()
{
	GridObject.call(this,this.type);
	
	this.employee = null;
	
	this.action = null;
	this.progress = 0;
	this.queue = [];
}

CheckoutCounter.prototype = Object.create(GridObject.prototype);
Object.defineProperty(CheckoutCounter.prototype, 'constructor', {
		value: CheckoutCounter,
		enumerable: false,
		writable: true
	});
	
CheckoutCounter.prototype.type = {
	occupied: [{x:0,y:0},{x:1,y:0},{x:2,y:0}],
	image: images["checkout_counter"],
};

CheckoutCounter.prototype.actions = {
	"checkout": {
		"duration": 1000,
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
	
	if(!this.action) return null;
	
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