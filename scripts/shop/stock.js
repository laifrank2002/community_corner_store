/**
	Handles inventory and ordering.
	@date 2020-04-28
 */
var Stock = (
	function()
	{
		/*
		var DEFAULT_CAPACITY = 500;
		
		var capacity = DEFAULT_CAPACITY;
		var used_capacity = 0;
		
		*/
		var inventory;
		var displays = {};
		return {
			initialize: function()
			{
				inventory = State_manager.get_state("stock","inventory");
				
				for(var key in items)
				{
					inventory[key] = {count: 0, average_cost: 0, target_count: 0};
				}
				
				// now we initialize the displayer
				var ITEM_DISPLAY_HEIGHT = 50;
				var index = 0;
				for(var key in inventory)
				{
					var itemDisplay = new UIPanel(0,0,StockElement.content_panel.width, ITEM_DISPLAY_HEIGHT);
					var titleDisplay = new UILabel(items[key].name,"left");
					itemDisplay.addSubElement(titleDisplay, 10, 15);
					var countDisplay = new UILabel(inventory[key].count, "left");
					itemDisplay.addSubElement(countDisplay, 150, 15);
					var averageCostDisplay = new UILabel(inventory[key].average_cost, "left");
					itemDisplay.addSubElement(averageCostDisplay, 250, 15);
					var worldPriceDisplay = new UILabel(World.prices[key].wholesale, "left");
					itemDisplay.addSubElement(worldPriceDisplay, 400, 15);
					var buyTextField = new UITextField(125,25);
					itemDisplay.addSubElement(buyTextField,500,15);
					var buyButton = new UIButton(100,25,"Order");
					itemDisplay.addSubElement(buyButton, 650, 15);
					
					buyButton.textfield = buyTextField;
					buyButton.itemKey = key;
					buyButton.onmouseclick = function()
					{
						// validate input
						var input = this.textfield.getText();
						var amount = parseInt(input, 10);
						if(amount !== NaN && amount > 0)
						{
							// the function is really delegated to Stock, 
							// no funny business going on with transactions!
							Stock.buyItem(this.itemKey, amount, World.prices[this.itemKey].wholesale);
							this.textfield.setText(amount.toString(10));
						}
						else 
						{
							// then, we revalidate and clean up the ui in case user screws up 
							this.textfield.setText("0");
						}
					};
					// shortcut, when player click enter 
					// is the same thing as clicking the big buy button 
					buyTextField.button = buyButton;
					buyTextField.onenter = function(){this.button.onmouseclick()}; 
					
					displays[key] = {display: itemDisplay, title: titleDisplay, count: countDisplay, averageCost: averageCostDisplay, worldPrice: worldPriceDisplay, buyTextField: buyTextField, buyButton: buyButton};
					
					StockElement.addSubElement(itemDisplay, 0, ITEM_DISPLAY_HEIGHT * index);
					index++;
				}
				
				StockElement.resizeMaxHeight((index) * ITEM_DISPLAY_HEIGHT);
				
				Stock.updateDisplays();
			},
			
			updateDisplays: function()
			{
				for(var key in displays)
				{
					Stock.updateDisplay(key);
				}
			},
			
			updateDisplay: function(key)
			{
				var display = displays[key];
				display.count.setText(`Count: ${State_manager.get_state("stock","inventory")[key].count}`);
				display.averageCost.setText(`Average Cost:  ${toCurrencyDisplayString(State_manager.get_state("stock","inventory")[key].average_cost)}`);
				display.worldPrice.setText(`Price: ${toCurrencyDisplayString(World.prices[key].wholesale)}`);
			},
			
			getItem: function(key)
			{
				if(!State_manager.get_state("stock","inventory")[key])
				{
					Engine.log(`Stock.getItem: ${key} does not exist. All inventory are defined in inventory. Check the keys too.`);
					return null;
				}
				
				return State_manager.get_state("stock","inventory")[key];
			},
			
			getCount: function(key)
			{
				var item = Stock.getItem(key);
				if(!item) return 0;
				
				return item.count;
			},
			
			isCountEmpty: function(key)
			{
				var item = Stock.getItem(key);
				if(!item) return true;
				
				if(item.count <= 0) return true;
				
				return false;
			},
			
			getAverageCost: function(key)
			{
				var item = Stock.getItem(key);
				if(!item) return 0;
				
				return item.average_cost;
			},
			
			getTargetCount: function(key)
			{
				var item = Stock.getItem(key);
				if(!item) return 0;
				
				return item.target_count;
			},
			
			addCount: function(key, amount, cost = 0)
			{
				var item = Stock.getItem(key);
				if(!item) return false;
				
				var count = amount;
				if(count < 0) count = 0;
				
				// if count is 0, we do nothing
				// prevent divide by zero errors 
				// we seperate this from the <0 check to catch any cases where count specifically calls for adding 0 
				// (say because we couldn't afford it)
				if(count === 0) return count;
				
				item.average_cost = (item.average_cost * item.count + cost * count) / (item.count + count);
				// sanity check 
				// REMINDER, since 0 is autocast, when we set to 0 again it should do nothing.
				// if using a different default value, be wary.
				if(!item.average_cost) item.average_cost = 0;
				
				item.count += count;
				
				// update gfx
				Stock.updateDisplay(key);
				
				return count;
			},
			
			removeCount: function(key, amount)
			{
				var item = Stock.getItem(key);
				if(!item) return false;
				
				var count = amount;
				
				if(item.count < count) count = item.count;
				
				item.count -= count;
				
				// update gfx
				Stock.updateDisplay(key);
				
				return count;
			},
			
			setTargetCount: function(key, amount)
			{
				var item = Stock.getItem(key);
				if(!item) return false;
				
				var target_count = amount;
				
				if(target_count < 0) target_count = 0;
				
				item.target_count = target_count;
				
				// update gfx
				Stock.updateDisplay(key);
				
				return target_count;
			},
			
			// temp buying function for now 
			// in the future, delegate to another module
			// we can't buy things, remember, if it's during the shop day.
			buyItem: function(key, amount, price)
			{
				var buyingPrice = price;
				if(buyingPrice === undefined)
				{
					var buyingPrice = World.prices[key].wholesale;
				}
				
				var buyingAmount = amount;
				if(buyingAmount < 0) buyingAmount = 0;
				
				if(buyingAmount * buyingPrice > State_manager.get_state("player","money"))
				{
					var buyingAmount = Math.floor(State_manager.get_state("player","money") / buyingPrice);
				}
				
				// we won't discard the overflow. surely no purchasing manager is _that_ stupid.
				var buyingAmount = Stock.addCount(key, buyingAmount, buyingPrice);
				State_manager.add_state("player","money",-buyingPrice * buyingAmount);
				
				return buyingAmount;
			},
		}
	}
)();