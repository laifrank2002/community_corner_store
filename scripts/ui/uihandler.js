/**
	Controller for the whole thing.
 */
var UIHandler = (
	function()
	{
		var mousedown;
		var ui;
		
		return {
			
			get mousedown() { return mousedown },
			get ui() { return ui },
			
			initialize: function()
			{	
				mousedown = null;
				
				ui = [];
				
				var main = new UIWindow(0,0,800,600, "Cornerstone Community Store");
				ui.push(main);
				
				var bottom_bar = new UIPanel(null,null,main.width,25);
				bottom_bar.addSubElement(new UILabel("By Frank Lai 2020","left"),5,5);
				main.addSubElement(bottom_bar,0,main.height - main.title_bar.height - bottom_bar.height);
								
				var top_bar = new UIPanel(null,null,main.width,25);
				main.addSubElement(top_bar,0,0);
				
				var money_display = new UIPanel(null,null,100,25);
				top_bar.addSubElement(money_display,top_bar.width - money_display.width,0);
				var money_display_label = new UILabel(toCurrencyDisplayString(State_manager.get_state("player","money")), "left");
				money_display.addSubElement(money_display_label,10,5);
				State_manager.add_listener("player_money_listener","player","money"
					,(value) => 
					{
						money_display_label.setText(toCurrencyDisplayString(value));
					});
								
				var tabs = new UITabbedPanel(null,null,main.width,main.height - main.title_bar.height - bottom_bar.height - top_bar.height);
				main.addSubElement(tabs,0,top_bar.height);
				
				var shop_tab = ShopElement;
				tabs.addSubPanel("Shop",shop_tab);
				
				var stock_tab = StockElement;
				tabs.addSubPanel("Stock",stock_tab);
				
				var reports_tab = ReportsElement;
				tabs.addSubPanel("Reports",reports_tab);
				
				var settings_tab = new UIPanel();
				tabs.addSubPanel("Settings",settings_tab);
				
				
				
				shop_tab.show();
			},
			
			draw: function(context)
			{
				// draw in reverse order to reflect the order of click propagation
				var elements_to_draw = [...ui].reverse();
				elements_to_draw.forEach(element => element.draw(context));
			},
			
			handle_mousedown: function(mouseX,mouseY)
			{
				for(uielement in ui)
				{
					// if any one of the ui first registers propagation
					// return true as only one mouse down should be registered.
					if(ui[uielement].handle_mousedown(mouseX,mouseY))
					{
						mousedown = new Point(mouseX, mouseY);
						return true;
					}
				}
				// if nothing, then return 
				return false;
			},
			
			handle_mouseup: function(mouseX,mouseY)
			{
				for(uielement in ui)
				{
					// register mouseup for all ui elements to remove last_mousedown
					if(ui[uielement].handle_mouseup(mouseX,mouseY))
					{
						mousedown = null;
					}
				}
			},
			
			handle_keydown: function(character)
			{
				for(uielement in ui)
				{
					if(ui[uielement].handle_keydown(character))
					{
						return true;
					}
				}
			},
			
			handle_keyup: function(character)
			{
				for(uielement in ui)
				{
					if(ui[uielement].handle_keyup(character))
					{
						
					}
				}
			},
		}
	}
)();