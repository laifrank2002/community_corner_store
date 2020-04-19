/**
	Where all of the business logic will be. 
	The second pseudoengine in terms of the game.
 */
var Shop = (
	function()
	{
		// constants
		var MAX_LAPSE = 100;
		var STARTING_Y = 880;
		var STARTING_X = 128;
		
		// fields
		var current_map;
		
		var shopBoundingBox;
		
		var palette_selected = null;
		
		var inventory = [];
		
		var checkouts = [];
		var shelves = [];
		
		return {
			get current_map() {return current_map},
			
			initialize: function()
			{
				current_map = new Map(create_image("assets/background1.png"),1600,1200,10,1);
				current_map.setViewportCoordinates(STARTING_X, STARTING_Y);
				
				Shop.plopGridObject(new CheckoutCounter(),1,0);
				Shop.plopGridObject(new Shelf(),4,0);
				Shop.plopGridObject(new Shelf(),6,0);
				Shop.plopGridObject(new Shelf(),8,0);

				current_map.spawnAgent(new Customer(current_map));
			},
			
			draw: function(context,x,y)
			{
				if(current_map)current_map.draw(context,x,y);
			},
			
			tick: function(lapse)
			{
				if(current_map)current_map.tick(lapse);
			},
			
			getClosestCheckout: function(x,y)
			{
				if(checkouts.length < 1) return null;
				var closestCheckout = checkouts[0];
				var closestDistance = checkouts[0].getDistanceTo(x,y);
				
				checkouts.forEach(checkout =>
				{
					var distance = checkout.getDistanceTo(x,y);
					if(distance < closestDistance) 
					{
						closestCheckout = checkout;
						closestDistance = distance;
					}
				});
				
				return closestCheckout;
			},
			
			getRandomShelf: function()
			{
				if(shelves.length < 1) return null;
				return randomElementInArray(shelves);
			},
			
			getExit: function()
			{
				return current_map.exit_left;
			},
			
			leaveCustomer: function(customer)
			{
				current_map.removeObject(customer);
			},
			
			plopGridObject: function(object, x, y)
			{
				if(!current_map.plopGridObject(object, x, y))
				{
					return false;
				}
				
				if(object instanceof Shelf)
				{
					shelves.push(object);
				}
				
				if(object instanceof CheckoutCounter)
				{
					checkouts.push(object);
				}
				
				return true;
			},
			
			unplopGridObject: function(object, x, y)
			{
				if(!current_map.unplopGridObject(object))
				{
					return false;
				}
				
				if(object instanceof Shelf)
				{
					removeElementInArray(shelves, object);
				}
				
				if(object instanceof CheckoutCounter)
				{
					removeElementInArray(checkouts, object);
				}
				
				return true;
			},
		}
	}
)();