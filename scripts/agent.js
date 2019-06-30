// TO BE DEPRECATED

// basically any sort of being that moves about in this world 
function Agent(x,y,radius)
{
	this.x = x;
	this.y = y;
	this.radius = radius;
}

Agent.prototype.draw = function(context,x,y)
{
	// draw a circle!
	context.beginPath();
	context.arc(this.x + x, this.y + y, this.radius, 0, Math.PI * 2);
	context.fill();
	context.stroke();
}

Agent.prototype.tick = function(lapse)
{
	
}

// they're our main revenue source!
function Customer(x,y)
{
	Agent.call(this,x,y,Customer.prototype.radius);
}

Customer.prototype = Object.create(Agent.prototype);
Object.defineProperty(Customer.prototype, 'constructor', {
	value: Customer,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
Customer.prototype.radius = 16;

