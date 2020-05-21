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
				
		var checkouts = [];
		var shelves = [];
		
		var employees = [];
		var customers = [];
		
		// these are NOT saved, and are typically temporary variables.
		// UI
		var newDayButton;
		
		var speed = 1;
		var paused = true;
		var day_in_progress = false;
		var time_elapsed = 0;
		
		var build_mode = false;
		var build_mode_item_selected = 0;
		
		// DEBUG
		var autonewday = true; // leaving it on AFK to see what would happen
		var autostock = true; // prototype for later feature
		
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
				map = new Map(images["background1"],1600,1200,20,1);
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
				
				list.forEach( (key,index) =>
				{
					var shelf = new NarrowShelf();
					shelf.setItem(items[key]);
					shelf.stock(5);
					
					Shop.setTargetStock(key, 50);
					
					Shop.plopGridObject(shelf, 4 + index * 1, 0);
				});
				
				Shop.plopGridObject(new CheckoutCounter(),1,0);
				
				// Shop.startNewDay();
			},
			
			fromData: function(data)
			{
				// turns data into something useful
				map = new Map();
				map = map.fromData(data.map);
				
				employees = data.employees.map(datum => 
				{
					var employee = new Employee();
					employee.fromData(datum);
				});
				customers = data.customers.map(datum => 
				{
					var customer = new Customer();
					customer.fromData(datum);
				});
				
				// we gotta refind our shelves and checkouts cause it turns out that JSON can't store references 
				// we don't want bitwise copies of what SHOULD be the same thing. 
				// then it's no longer useful and everything becomes difficult.
				
				checkouts = Shop.getFurnitureOfType(CheckoutCounter);
				shelves = Shop.getFurnitureOfType(Shelf)
			},
			
			toData: function()
			{
				// turns this into data
				return {
					map: map,
					employees: employees,
					customers: customers,
				}
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
				// we respawn the employees 
				employees.forEach(employee => 
				map.spawnAgent(employee));
				
				Shop.unpause();
				day_in_progress = true;
				State_manager.add_state("world","day",1);
				
				// NOW we restock to target levels.
				if(autostock)
				{
					Engine.log(`----AUTOSTOCK REPORT DAY ${World.day}----`);
					for(var key in items)
					{
						var count = Stock.getCount(key);
						var target = Stock.getTargetCount(key);
						
						if(count < target) 
						{
							var amount = Stock.buyItem(key, target-count, World.prices[key].wholesale);
							
							Engine.log(`Autobought ${amount} units of ${key}.`);
						}
					}
				}
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
					if(object instanceof Furniture)
					{
						object.endDay();
					}
				});
				
				// everybody leaves for the night 
				Shop.despawnAgents();
				Shop.pause();
				day_in_progress = false;
				
				// now we run payroll
				employees.forEach(employee => State_manager.add_state("player","money",-employee.salary));
				
				if(autonewday)
				{
					Shop.startNewDay();
				}
				else 
				{
					newDayButton.show();
				}
			},
			
			pause: function()
			{
				paused = true;
			},
			
			unpause: function()
			{
				paused = false;
			},
			
			togglePause: function()
			{
				paused = !paused;
			},
		
			spawnCustomer: function(customer)
			{
				map.spawnAgent(customer);
			},
			// this is used when a customer leaves the store 
			// and has completed purchase and everything.
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
						for(var key in item.item.effects)
						{
							State_manager.add_state("community",key,item.item.effects[key]);
						}
						
						// and stats!
						State_manager.add_state("statistics",`total_${item.key}_sales_value`,item.price);
						State_manager.add_state("statistics",`total_${item.key}_sales_count`,1);
					});
				}
				customer.despawn();
			},
			
			despawnAgents: function()
			{
				map.filterObjects(object => 
				{
					if(object instanceof Agent) 
					{
						if(object instanceof Customer)
						{
							if(!object.hasPaid) State_manager.add_state("statistics","customers_left_without_buying",1);
						}
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
				if(time_elapsed/LENGTH_OF_DAY < 0.7)
				{
					if(Math.random() < 0.01) map.spawnAgent(Shop.generateCustomer());
				}
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
			
			getFurnitureOfType: function(type)
			{
				var list = [];
				map.forEachObject(object =>
				{
					if(object instanceof type)
					{
						list.push(object);
					}
				});
				
				return list;
			},
			
			// returns the last (newest) object which is within coordinates (x,y)
			getObjectAt: function(x,y)
			{
				if(!map) return null;
				
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
			
			setTargetStock: function(key, amount)
			{
				return Stock.setTargetCount(key, amount);
			},
		}
	}
)();