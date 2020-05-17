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
		
		var LENGTH_OF_DAY = 60000;
		// fields
		var map;
		
		var time_elapsed = 0;
		
		var newDayButton;
		var palette_selected = null;
				
		var checkouts = [];
		var shelves = [];
		
		var employees = [];
		var customers = [];
		
		var speed = 1;
		var paused = true;
		var day_in_progress = false;
		
		return {
			get map() {return map},
			
			get day_in_progress() {return day_in_progress},
			
			initialize: function()
			{
				// data
				map = State_manager.get_state("shop","map");
				checkouts = State_manager.get_state("shop","checkouts");
				shelves = State_manager.get_state("shop","shelves");
				employees = State_manager.get_state("shop","employees");
				customers = State_manager.get_state("shop","customers");
				
				// initialization
				map = new Map(create_image("assets/background1.png"),1600,1200,24,1);
				map.setViewportCoordinates(STARTING_X, STARTING_Y);
				
				ShopElement.initialize();
				// ui
				newDayButton = new UIButton(200,25,"New Day",Shop.startNewDay);
				ShopElement.addSubElement(newDayButton, ShopElement.width/2 - newDayButton.width/2, 20);
				
				
				// state manager
				
				// da testing 
				// so these are safe to delete
				employees.push(new Employee());
				
				// quick testing 
				var list = ["canned_tuna","milk","eggs","flour","cooking_oil","vegetables","fruits","soda","snacks","candy"];
				
				list.forEach( (item,index) =>
				{
					var shelf = new Shelf();
					shelf.setItem(items[item]);
					shelf.stock(15);
					
					Shop.plopGridObject(shelf, 4 + index * 2, 0);
				});
				
				Shop.plopGridObject(new CheckoutCounter(),1,0);
				
				// Shop.startNewDay();
			},
			
			startNewDay: function()
			{
				if(!map)
				{
					Engine.log(`Shop.startNewDay: There is no map.`);
					return;
				}
				if(day_in_progress)
				{
					Engine.log(`Shop.startNewDay: Day is already in progress! End it before starting a new one!`);
					return;
				}
				
				newDayButton.hide();
				// wir respawn the employees 
				employees.forEach(employee => 
				map.spawnAgent(employee));
				
				paused = false;
				day_in_progress = true;
				State_manager.add_state("world","day",1);
			},
			
			endDay: function()
			{
				if(!day_in_progress)
				{
					Engine.log(`Shop.endDay: Day already ended!`);
					return;
				}
				
				map.forEachObject(object =>
				{
					if(object.type === "furniture")
					{
						object.endDay();
					}
				});
				
				// everybody leaves for the night 
				Shop.despawnAgents();
				paused = true;
				day_in_progress = false;
				
				// now we run payroll
				
				
				newDayButton.show();
			},
		
			spawnCustomer: function(customer)
			{
				map.spawnAgent(customer);
			},
			// NOT the despawn agent function 
			// this is used when a customer CONVENTIONALLY leaves the store 
			// as in, has completed purchase and everything.
			despawnCustomer: function(customer)
			{
				map.removeObject(customer);
				if(customer.subtotal <= 0 || customer.cart.length <= 0)
				{
					State_manager.add_state("statistics","customers_left_without_buying",1);
				}
				else 
				{
					State_manager.add_state("statistics","checkouts",1);
					State_manager.add_state("statistics","total_sales_value",customer.subtotal);
					State_manager.add_state("statistics","total_sales_tax",customer.subtotal*World.sales_tax);
					
					// now we must perform its effects
					customer.cart.forEach(item =>
					{
						for(var key in item.effects)
						{
							State_manager.add_state("community",key,item.effects[key]);
						}
					});
				}
				customer.despawn();
			},
			
			despawnAgents: function()
			{
				map.filterObjects(object => 
				{
					if(object.type === "agent") 
					{
						object.despawn();
						return false;
					}
					return true;
				});
			},
			
			draw: function(context,x,y)
			{
				if(map) map.draw(context,x,y);
				
				// data overlays 
				
				// time 
				if(day_in_progress)
				{
					context.fillStyle = "green";
					context.beginPath();
					context.rect(x,y,(time_elapsed/LENGTH_OF_DAY)*ShopElement.width,10);
					context.closePath();
					context.fill();
					
				}
			},
			
			tick: function(lapse)
			{
				if(paused) return;
				// we're going to be VERY cheeky when it comes to time.
				// in a lapsed based system, if we double the speed, we double the lapse.
				if(map)map.tick(lapse * speed);
				
				time_elapsed += lapse * speed;
				
				if(time_elapsed > LENGTH_OF_DAY)
				{
					time_elapsed = 0;
					Shop.endDay();
				}
				
				// temp spawn algorithmn
				if(Math.random() < 0.01) map.spawnAgent(Shop.generateCustomer());
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
			
			getStockableEmptyShelf: function()
			{
				if(shelves.length < 1) return null;
				for(var i = 0; i < shelves.length; i++)
				{
					var shelf = shelves[i];
					if(shelf.count <= 0 && shelf.item && shelf.stockable)
					{
						// if the stock's empty, skip it.
						if(Stock.isCountEmpty(shelf.item.key)) continue;
						return shelf;
					}
				}
			},
			
			// gets the first stockable shelf (usually the oldest)
			getStockableShelf: function()
			{
				if(shelves.length < 1) return null;
				for(var i = 0; i < shelves.length; i++)
				{
					var shelf = shelves[i];
					if(shelf.count < shelf.capacity && shelf.item && shelf.stockable)
					{
						// if the stock's empty, skip it.
						if(Stock.isCountEmpty(shelf.item.key)) continue;
						return shelf;
					}
				}
				return null;
			},
			
			getEmptyShelf: function()
			{
				if(shelves.length < 1) return null;
				for(var i = 0; i < shelves.length; i++)
				{
					if(shelves[i].count <= 0 && shelves[i].item)
					{
						return shelves[i];
					}
				}
				return null;
			},
			
			getExit: function()
			{
				return map.exit_left;
			},
			
			// returns the last (newest) object which is within coordinates (x,y)
			getObjectAt: function(x,y)
			{
				var selected = null;
				map.forEachObject(object =>
				{
					if(object.isCoordinateInBounds(x,y))
					{
						selected = object;
					}
				});
				return selected;
			},
			
			getInternalCoordinatesFromMouseCoordinates: function(mouseX,mouseY)
			{
				return {x: mouseX - ShopElement.x + map.viewport.x, y: mouseY - ShopElement.y + map.viewport.y};
			},
			
			generateCustomer: function()
			{
				var traits = [];
				traits.push( Math.random() < 0.8 ? "blue_collar" : "white_collar" );
				if(Math.random() < 0.3 ) traits.push("student");
				if(Math.random() < 0.1 ) traits.push("alcoholic");
				if(Math.random() < 0.1 ) traits.push("smoker");
				if(Math.random() < 0.1 ) traits.push("business_owner");
				
				var customer = new Customer(traits);
				return customer;
			},
			
			plopGridObject: function(object, x, y)
			{
				if(!map.plopGridObject(object, x, y))
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
				if(!map.unplopGridObject(object))
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
			
			addStock: function(key, amount, price = 0)
			{
				return Stock.addCount(key, amount, price);
			},
			
			// adds stock without changing avg price bought at
			returnStock: function(key, amount)
			{
				return Stock.addCount(key, amount, Stock.getAverageCost(key));
			},
			
			removeStock: function(key, amount)
			{
				return Stock.removeCount(key, amount);
			},
		}
	}
)();