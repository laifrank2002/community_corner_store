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
				ui = {};
				ui["content"] = new UITabbedPanel(0,0,800,575);
				
				var reports_tab = new UIScrollPanel(0,0,800,550,2000);
				reports_tab.content_panel.addSubElement(new UILabel(100,100,"Hello World","left"),100,100);
				reports_tab.content_panel.addSubElement(new UILabel(100,100,"More text to be lorem ipsum!","left"),100,120);
				reports_tab.content_panel.addSubElement(new UILabel(100,100,"Hello World","left"),100,380);
				ui["content"].addSubPanel("Reports",reports_tab);
								
				var settings_tab = new UIPanel();
				ui["content"].addSubPanel("Settings",settings_tab);
				
				ui["bottom_bar"] = new UIPanel(0,575,800,25,"panel");
				ui["bottom_bar"].addSubElement(new UILabel(0,575,"By Frank Lai","left"));
				// tabs or pseudopages				
				// process this element last, as it is special
				// ui["shop"] = Shop;
				
			},
			
			draw: function(context)
			{
				for(uielement in ui)
				{
					ui[uielement].draw(context);
				}
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
						return true;
					}
				}
			},
			
		}
	}
)();