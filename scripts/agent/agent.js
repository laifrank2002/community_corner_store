/**
	Now this is fun: moving AGENTS!
	They actually handle most of the business logic.
	But not this one in particular.
	Responsible for 
		[ ] Path finding
			[ ] Obeying the law of gravity (IMPORTANT)
			[ ] Moving towards a target coordinate
			
	@author laifrank2002
	@date 2020-04-15
 */
function Agent(width,height)
{
	MapObject.call(this
		,width
		,height
		,10);
	
	this.type = "agent";
	this.name = randomName() + " " + randomName();

	this.floor = 0;
	this.path = [];
	this.target = null;
		
	this.actionQueue = [];
	this.currentAction = null;
	this.cooldown = 0;
}

Agent.prototype = Object.create(MapObject.prototype);
Object.defineProperty(Agent.prototype, 'constructor', {
		value: Agent,
		enumerable: false,
		writable: true
	});

Agent.prototype.DEFAULT_SPEED = 0.5;
Agent.prototype.DISTANCE_TOLERANCE = 15;

Agent.prototype.DEFAULT_WIDTH = 32;
Agent.prototype.DEFAULT_HEIGHT = 128;
Agent.prototype.DEBUG_COLOUR = "#fafbff";

/**
	Creates a data object with necessary fields.
	Calls everything down the chain.
	
	@date 2020-05-21
	@author laifrank2002
	@return an object without the prototype that can be safely 
		converted to a JSON stringy
 */
Agent.prototype.toData = function()
{	
	var data = {name: this.name};
	Object.assign(data, MapObject.prototype.toData.call(this));
	return data;
}

/**
	Takes a data object and assigns parameters all the way down.
	
	@date 2020-05-21
	@author laifrank2002
	@return whether or not the operation was successful
 */
Agent.prototype.fromData = function(data)
{
	this.name = data.name;
	return MapObject.prototype.fromData.call(this,data);
}

Agent.prototype.tick = function(lapse)
{
	this.think(lapse);
	if(!this.currentAction)
	{
		var nextAction = this.nextAction();
		if(nextAction) 
		{
			this.currentAction = nextAction;
		}
		else 
		{
			// dummy do nothing 
			return;
		}
	}
	this.doCurrentAction(lapse);
}

// @override
Agent.prototype.draw = function(context, x, y)
{
	if(!this.isDrawSafe()) return;
	
	context.fillStyle = this.DEBUG_COLOUR;
	context.beginPath();
	context.rect(this.x + x, this.y + y, this.width, this.height);
	context.closePath();
	context.stroke();
		
	context.fill();

	// nameo
	context.fillStyle = "black";
	context.font = "12px Arial";
	context.fillText(this.name,this.x + x, this.y + y - 10);
}

// safety, default behaviour IS to do nothing 
Agent.prototype.think = function(lapse){}

Agent.prototype.doCurrentAction = function(lapse)
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
					this.target = null;
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
		default:
			// default do nothing, in fact this shouldn't be here! 
			Engine.log(`Attempted to do unrecognized ${this.currentAction}.`);
			this.currentAction = null;
	}
}

Agent.prototype.nextAction = function()
{
	// let us not trouble the array with the expensive shift function
	if(this.actionQueue.length <= 0) return null;
	
	return this.actionQueue.shift();
}

Agent.prototype.addAction = function(action)
{
	this.actionQueue.push(action);
}

Agent.prototype.addActionToFront = function(action)
{
	this.actionQueue.unshift(action);
}

// a double trick: takes the current action, and SHOVES it to the front of the queue 
// while the new action takes its place.
Agent.prototype.shoveAction = function(action)
{
	if(!action)
	{
		Engine.log(`You can't shove with no action!`);
		return false;
	}
	
	if(!this.currentAction) 
	{
		Engine.log(`Since there is no currentAction, we don't need to shove.`);
		this.currentAction = action;
		return true;
	}
	
	this.addActionToFront(this.currentAction);
	this.currentAction = action;
	return true;
}

Agent.prototype.moveTo = function(target, lapse)
{
	// x, then y.
	if(Math.abs(this.x - target.x) > this.DISTANCE_TOLERANCE)
	{
		this.moveTowards(target, lapse);
		return true;
	}
	/*
		In this house WE OBEY THE LAW OF GRABITY!
	if(Math.abs(this.y - target.y) > this.distance_moved)
	{
		this.moveTowards(target, lapse);
		return true;
	}
	else 
	{
		if(this.y != target.y)
		{
			this.y = target.y;
		}
		else 
		{
			return false;
		}
	}
	*/
	return false;
}

Agent.prototype.moveToTarget = function(lapse)
{
	return this.moveTo(this.target, lapse);
}

/**
	A pathfinding algorithm that's simple (thankfully) due to the floored design
	Target must be a MapObject or child 
 */
Agent.prototype.findPathToTarget = function(target)
{
	this.path.push(target);
}
/*
Agent.prototype.ascendStairs = function(stairwell)
{
	this.x = stairwell.x;
	this.y = stairwell.y - this.map.GRID_VERTICAL_SIZE;
}

Agent.prototype.descendStairs = function(stairwell)
{
	this.x = stairwell.x;
	this.y = stairwell.y;
}
*/
/**
	Spawns upright.
 */
Agent.prototype.spawn = function(x,y)
{
	this.x = x;
	// spawn upright
	this.y = y - this.height;
}

Agent.prototype.despawn = function() {}