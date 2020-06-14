/**
	The window that processes the inspect tool.
	A GUI bridge that takes user actions and calls the right functions.
 */
var ShopInspectWindow = new UIWindow(10,10,300,400,"Inspect",true,true);

ShopInspectWindow.initialize = function()
{
	// message box for all cases.
	this.messageBox = new UILabel(``,"center");
	this.addSubElement(this.messageBox, this.width/2, this.content_panel.height - 16);
	
	// shelf
	this.shelfDisplay = {
		display: new UIPanel(null, null, this.width,this.content_panel.height - 25),
		item: new UILabel(`Item`,"center"),
		price: new UILabel(`Price: `,"left"),
		count: new UILabel(`Count: `,"left"),
		soldCount: new UILabel(`Items Sold`,"left"),
		setPrice: new UITextInput(250,25,"Set Price",
			function()
			{
				var input = this.getInput();
				// we float and round to deal with any floating point to the right.
				var price = Math.round(100 * parseFloat(input));
				// any nulls and undefined should be dealt with in the price>0 condition
				if(price > 0)
				{
					if(ShopInspectWindow.selectedObject instanceof Shelf)
					{
						ShopInspectWindow.selectedObject.setPrice(price);
						ShopInspectWindow.messageBox.setText(`Price set to ${toCurrencyDisplayString(price)}`);
						ShopInspectWindow.update();
					}
					this.setInput((price/100).toFixed(2));
				}
				else 
				{
					ShopInspectWindow.messageBox.setText(`Invalid Price.`);
					this.setInput("0.00");
				}
			}),
			/*
		setItem: new UITextInput(250,25,"Set Item",
			function()
			{
				var input = this.getInput().toLowerCase();
				
				var item;
				for(var key in items)
				{
					if(items[key].name.toLowerCase() === input)
					{
						item = items[key];
						break;
					}
				}
				
				// if it exists, we set it 
				if(item)
				{
					if(ShopInspectWindow.selectedObject instanceof Shelf)
					{
						ShopInspectWindow.selectedObject.setItem(item);
						ShopInspectWindow.messageBox.setText(`Item set to ${item.name}.`);
					}
				}
				else 
				{
					ShopInspectWindow.messageBox.setText(`Item not found. Check your spelling.`);
				}
			}),
			*/
		setItem: new UIComboBox(250,25,Object.keys(items).map(key => items[key].name),
			function(value)
			{
				var item = items[findValueInPropertyInObject(items,"name",value)];
				
				if(item)
				{
					if(ShopInspectWindow.selectedObject instanceof Shelf)
					{
						var set_flag = ShopInspectWindow.selectedObject.setItem(item);
						if(set_flag)
						{
							ShopInspectWindow.messageBox.setText(`Item set to ${item.name}.`);
							ShopInspectWindow.update();
						}
						else 
						{
							ShopInspectWindow.messageBox.setText(`Item is already set to ${item.name}.`);
						}
					}
				}
				else 
				{
					ShopInspectWindow.messageBox.setText(`Item not found. Check your spelling.`);
				}
			}),
	};
	this.shelfDisplay.display.addSubElement(this.shelfDisplay.item,this.width/2,25);
	this.shelfDisplay.display.addSubElement(this.shelfDisplay.price,25,50);
	this.shelfDisplay.display.addSubElement(this.shelfDisplay.count,25,75);
	this.shelfDisplay.display.addSubElement(this.shelfDisplay.soldCount,25,100);
	this.shelfDisplay.display.addSubElement(this.shelfDisplay.setPrice,25,125);
	this.shelfDisplay.display.addSubElement(this.shelfDisplay.setItem,25,160);
	this.addSubElement(this.shelfDisplay.display, 0, 0);
	// checkout counter 
	this.checkoutCounterDisplay = {
			display: new UIPanel(null, null, this.width, this.content_panel.height - 25),
			customersProcessedCount: new UILabel(`Customer Count`, "left"),
			totalValueOfTransactions: new UILabel(`Total Sales Value: `, "left"),
			totalSalesTaxPaid: new UILabel(`Total Sales Tax Paid: `, "left"),
		}
	this.checkoutCounterDisplay.display.addSubElement(this.checkoutCounterDisplay.customersProcessedCount,25,25);
	this.checkoutCounterDisplay.display.addSubElement(this.checkoutCounterDisplay.totalValueOfTransactions,25,50);
	this.checkoutCounterDisplay.display.addSubElement(this.checkoutCounterDisplay.totalSalesTaxPaid,25,75);
	this.addSubElement(this.checkoutCounterDisplay.display, 0, 0);
	
	// customers 
	this.customerDisplay = {
			display: new UIPanel(null, null, this.width, this.content_panel.height - 25),
			budget: new UILabel(`Budget: `, "left"),
			cart: new UILabel(`Cart: `, "left"),
			needs: new UILabel(`Needs: `, "left"),
		}
	this.customerDisplay.display.addSubElement(this.customerDisplay.budget,25,25);
	this.customerDisplay.display.addSubElement(this.customerDisplay.cart,25,50);
	this.customerDisplay.display.addSubElement(this.customerDisplay.needs,25,75);
	this.addSubElement(this.customerDisplay.display,0,0);
	
}

/**
	Takes a type and formats the UI for that window.
 */
ShopInspectWindow.prepare = function(object)
{
	this.hideDisplays();
	this.messageBox.setText(``);
	
	this.selectedObject = object;
	
	if(object instanceof Furniture)
	{
		this.setTitle(object.template.name);
	}
	else if(object instanceof Agent)
	{
		this.setTitle(object.name);
	}
	else 
	{
		this.setTitle(`Inspect`);
	}
	
	this.update();
}

ShopInspectWindow.update = function()
{
	if(!this.selectedObject) return;
	var object = this.selectedObject;
	
	if(object instanceof Shelf)
	{
		// configure options for shelf
		var item = object.item;
		if(item)
		{
			this.shelfDisplay.item.setText(item.name);
			this.shelfDisplay.price.setText(`Price: ${toCurrencyDisplayString(object.price)}`);
			this.shelfDisplay.count.setText(`Count: ${object.count}`);
			this.shelfDisplay.soldCount.setText(`Items Sold: ${object.itemTakenCount}`);
			this.shelfDisplay.setItem.set_selected(item.name);
		}
		this.shelfDisplay.display.show();
	}
	else if(object instanceof CheckoutCounter)
	{
		this.checkoutCounterDisplay.customersProcessedCount.setText(`Customers Processed: ${object.customersProcessedCount}`);
		this.checkoutCounterDisplay.totalValueOfTransactions.setText(`Total Transaction Value: ${toCurrencyDisplayString(object.totalValueOfTransactions)}`);
		this.checkoutCounterDisplay.totalSalesTaxPaid.setText(`Sales Tax Paid: ${toCurrencyDisplayString(object.totalSalesTaxPaid)}`);
		this.checkoutCounterDisplay.display.show();
	}
	else if(object instanceof Customer)
	{
		this.customerDisplay.budget.setText(`Budget: ${toCurrencyDisplayString(object.budget)}`);
		this.customerDisplay.cart.setText(`Cart: ${object.cart.reduce( (text, item, index, array) => text + (index > 0 ? "," : "") + item.item.name, "")}`);
		this.customerDisplay.needs.setText(`Needs: ${object.needs.reduce( (text, item, index, array) => text + (index > 0 ? "," : "") + items[item.key].name, "")}`);
		this.customerDisplay.display.show();
	}
}

ShopInspectWindow.hideDisplays = function()
{
	this.shelfDisplay.display.hide();
	this.checkoutCounterDisplay.display.hide();
	this.customerDisplay.display.hide();
}