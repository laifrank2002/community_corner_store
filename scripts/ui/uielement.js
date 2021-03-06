/**
	****UI Element Documentation****
	function UIElement(x,y,width,height,type = "generic",onmouseclick = null)
	
	function UIWindow(x,y,width,height,title = "",draggable = false, menuButton = false)
	
	function UIPanel (x,y,width,height)
	function UITabbedPanel (x,y,width,height)
	function UIScrollPanel (x,y,width,height,max_height)
	
	function UIButton (width,height,text,onmouseclick)
	function UILabel (text, align = "center")
	function UIImage (width,height,source,image_resizing = "fit")
	function UITextField(width,height,validate)
	function UITextArea(width,height,text)
	function UITable(width, height, rows = 1, columns = 1)
	function UIComboBox(width,height,choices,onselect)
	
 */
/** 
	UI Element 
	X and Y are absolute within canvas 
*/
function UIElement(x,y,width,height,type = "generic",onmouseclick = null)
{
	this.x = x;
	this.y = y;
	this.relative_x = x;
	this.relative_y = y;
	this.width = width;
	this.height = height;
	this.onmouseclick = onmouseclick;

	this.type = type;
	// element interactions
	this.children = [];
	this.hidden = false;
	this.focused = false;
}

// defined colours and settings. THESE are what you CAN play around with.
UIElement.prototype.line_width = 2;
UIElement.prototype.indent_size = 2;
UIElement.prototype.default_colour = "#4f89e0";
UIElement.prototype.darker_colour = "#125dcc";
UIElement.prototype.lighter_colour = "#94bcf7";
UIElement.prototype.font = "Arial";
UIElement.prototype.font_size = 14;
UIElement.prototype.font_colour = "#ffffff";

UIElement.prototype.scroll_bar_background_colour = "#94bcf7";

UIElement.prototype.title_default_colour = "#4f89e0";
UIElement.prototype.title_darker_colour = "#125dcc";
UIElement.prototype.title_lighter_colour = "#94bcf7";
UIElement.prototype.title_font_colour = "#ffffff";


UIElement.prototype.title_quit_button_default_colour = "#d65656";
UIElement.prototype.title_quit_button_darker_colour = "#a62828";
UIElement.prototype.title_quit_button_lighter_colour = "#f78181";

UIElement.prototype.draw = function(context)
{
	if(this.hidden) return false;
	context.save();
	/* draw self */
	context.fillStyle = this.default_colour;
	context.strokeStyle = this.darker_colour;
	context.lineWidth = this.line_width;
	// standard
	context.beginPath();
	context.rect(this.x, this.y, this.width, this.height);
	context.closePath();
	context.fill();
	// we clip in order to prevent overlap onto other elements 
	context.clip();
	
	if(this.paint) this.paint(context,this.x,this.y);
	
	if(this.children)
	{
		var elements_to_draw = [...this.children].reverse();
		elements_to_draw.forEach(element => element.draw(context));
	}
	
	context.restore();
}

UIElement.prototype.draw_borders = function(context)
{
	// borders, top left 
	context.beginPath();
	UIDrawer.draw_border(context, this, "top");
	UIDrawer.draw_border(context, this, "left");
	context.closePath();
	context.strokeStyle = this.lighter_colour;
	context.stroke();
	
	// bottom right 
	context.beginPath();
	UIDrawer.draw_border(context, this, "bottom");
	UIDrawer.draw_border(context, this, "right");
	context.closePath();
	context.strokeStyle = this.darker_colour;
	context.stroke();
}

UIElement.prototype.draw_convex_indents = function(context)
{
	// indent up!
	// top and left 
	context.beginPath();
	UIDrawer.draw_indent(context, this, this.indent_size, "top");
	UIDrawer.draw_indent(context, this, this.indent_size, "left");
	context.closePath();
	context.fillStyle = this.lighter_colour;
	context.fill();
	// bottom and right 
	context.beginPath();
	UIDrawer.draw_indent(context, this, this.indent_size, "bottom");
	UIDrawer.draw_indent(context, this, this.indent_size, "right");
	context.closePath();
	context.fillStyle = this.darker_colour;
	context.fill();
}

UIElement.prototype.draw_concave_indents = function(context)
{
	// indent down!
	// top and left 
	context.beginPath();
	UIDrawer.draw_indent(context, this, this.indent_size, "top");
	UIDrawer.draw_indent(context, this, this.indent_size, "left");
	context.closePath();
	context.fillStyle = this.darker_colour;
	context.fill();
	// bottom and right 
	context.beginPath();
	UIDrawer.draw_indent(context, this, this.indent_size, "bottom");
	UIDrawer.draw_indent(context, this, this.indent_size, "right");
	context.closePath();
	context.fillStyle = this.lighter_colour;
	context.fill();
}

UIElement.prototype.isInBounds = function(x,y)
{
	// falsey values such as 0 are OK here because if it has no height or width... there are no bounds!
	if(!this.width || !this.height) return false;
	if(x > this.x && y > this.y && x < this.x + this.width && y < this.y + this.height)
	{
		return true;
	}
	return false;
}

/**
	EVERYTHING moves
	Sets ABSOLUTELY
 */
UIElement.prototype.setPosition = function(x,y)
{
	this.x = x;
	this.y = y;
	
	if(this.parent)
	{
		this.relative_x = x - this.parent.x;
		this.relative_y = y - this.parent.y;
	}
	
	if(this.children)
	{
		this.children.forEach(child =>
			{
				child.setPosition(x + child.relative_x,y + child.relative_y);
			});
	}
}

/**
	Sets RELATIVELY
 */
UIElement.prototype.setRelativePosition = function(x,y)
{
	this.relative_x = x;
	this.relative_y = y;
	
	if(this.parent)
	{
		this.x = this.relative_x + this.parent.x;
		this.y = this.relative_y + this.parent.y;
	}
	else 
	{
		this.x = x;
		this.y = y;
	}
	
	if(this.children)
	{
		this.children.forEach(child =>
			{
				child.setRelativePosition(child.relative_x,child.relative_y);
			});
	}
}
/**
	Moves without actually changing the relative_x and relative_y. Useful for SCROLL.
 */
UIElement.prototype.setTemporaryPosition = function(x,y)
{
	this.x = x;
	this.y = y;
	
	if(this.children)
	{
		this.children.forEach(child =>
			{
				child.setTemporaryPosition(x + child.relative_x,y + child.relative_y);
			});
	}
}
/*
UIElement.prototype.move = function(x,y)
{
	
}
*/
UIElement.prototype.resize = function(width,height)
{
	if(width >= 0) this.width = width;
	if(height >= 0) this.height = height;
}

UIElement.prototype.handle_mousedown = function(mouseX, mouseY)
{
	if(this.hidden) return false;
	// check if in bounds 
	if(!this.isInBounds(mouseX,mouseY)) return false;
	// handle children first 
	if(this.children)
	{
		// a good ol' fashion for loop to prevent propagation errors
		for(var index = 0; index < this.children.length; index++)
		{
			var child = this.children[index];
			if(child.handle_mousedown(mouseX, mouseY)) return true;
		}
	}
	// handle self 
	if(this.onmousedown)
	{
		this.onmousedown(mouseX,mouseY);
	}
	this.mousedown = new Point(mouseX, mouseY);
	this.mousedown.relative_x = this.mousedown.x - this.x;
	this.mousedown.relative_y = this.mousedown.y - this.y;
	return true;
}

UIElement.prototype.handle_mouseup = function(mouseX, mouseY)
{
	// we DON'T return because every object needs to understand the mouseup
	if(this.children)
	{
		this.children.forEach(child =>
			{
				child.handle_mouseup(mouseX, mouseY);
			});
	}
	if(this.onmouseup)
	{
		this.onmouseup(mouseX, mouseY);
	}
	if(this.isInBounds(mouseX,mouseY) && this.mousedown)
	{
		if(this.onmouseclick) this.onmouseclick(mouseX,mouseY);
		this.focus();
	}
	else 
	{
		this.unfocus();
	}
	this.mousedown = null;
}

UIElement.prototype.handle_keydown = function(character)
{
	if(this.hidden) return false;
	if(this.children)
	{
		// a good ol' fashion for loop to prevent propagation errors
		for(var index = 0; index < this.children.length; index++)
		{
			var child = this.children[index];
			if(child.handle_keydown(character)) return true;
		}
	}
	
	// handle self 
	if(!this.focused) return false;
	
	if(this.onkeydown)
	{
		this.onkeydown(character);
	}
	return true;
}

UIElement.prototype.handle_keyup = function(character)
{
	if(this.children)
	{
		// a good ol' fashion for loop to prevent propagation errors
		for(var index = 0; index < this.children.length; index++)
		{
			var child = this.children[index];
			child.handle_keyup(character);
		}
	}
	
	if(this.onkeyup)
	{
		this.onkeyup(character);
	}
	return true;
}

UIElement.prototype.handle_wheel = function(deltaY)
{
	if(this.children)
	{
		// a good ol' fashion for loop to prevent propagation errors
		for(var index = 0; index < this.children.length; index++)
		{
			var child = this.children[index];
			child.handle_wheel(deltaY);
		}
	}
	
	if(this.onwheel)
	{
		this.onwheel(deltaY);
	}
	return true;
}

UIElement.prototype.addSubElement = function(element, x=0, y=0)
{
	if(element.parent) element.parent.removeSubElement(element);
	element.parent = this;
	element.setPosition(element.parent.x + x, element.parent.y + y);
	element.relative_x = x;
	element.relative_y = y;
	this.children.push(element);
	return element; // allows us to chain elements
}

UIElement.prototype.removeSubElement = function(element)
{
	element.parent = null;
	this.children = this.children.filter (child => child !== element);
	return element;
}

UIElement.prototype.removeAllSubElements = function()
{
	this.children.forEach(child => child.parent = null);
	this.children = [];
	return true;
}

UIElement.prototype.isSubElementFocused = function()
{
	if(this.children)
	{
		// a good ol' fashion for loop to prevent propagation errors
		for(var index = 0; index < this.children.length; index++)
		{
			var child = this.children[index];
			if(child.isSubElementFocused()) return true;
		}
	}
	
	if(this.focused) return true;
	
	return false;
}

/*
	Working with scroll panels...
 */
UIElement.prototype.isSubElementNotScrollableFocused = function()
{
	if(this.children)
	{
		// a good ol' fashion for loop to prevent propagation errors
		for(var index = 0; index < this.children.length; index++)
		{
			var child = this.children[index];
			if(child.isSubElementNotScrollableFocused()) return true;
		}
	}
	
	if(this.focused)
	{
		if(this.scrollable) return false;
		return true;
	}
	
	return false;
}

UIElement.prototype.hide = function()
{
	this.hidden = true;
	if(this.onhide) this.onhide();
}

UIElement.prototype.show = function()
{
	this.hidden = false;
	if(this.onshow) this.onshow();
}

UIElement.prototype.focus = function()
{	
	this.focused = true;
}

UIElement.prototype.unfocus = function()
{
	this.focused = false;
}

// a button typed element 
function UIButton (width,height,text = "",onmouseclick)
{
	UIElement.call(this,null,null,width,height,"button",onmouseclick);
	
	this.text = text;
}

UIButton.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIButton.prototype, 'constructor', {
	value: UIButton,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UIButton.prototype.draw = function(context)
{
	if(this.hidden) return false;
	
	/* draw self */
	context.fillStyle = this.default_colour;
	context.strokeStyle = this.darker_colour;
	
	// standard
	context.beginPath();
	context.rect(this.x, this.y, this.width, this.height);
	context.closePath();
	context.fill();
	
	if(this.mousedown)
	{
		this.draw_concave_indents(context);
	}
	else 
	{
		this.draw_convex_indents(context);
	}
	
	if(this.paint)this.paint(context,this.x,this.y);
	
	// draw text and center
	context.font = this.font_size + "px " + this.font;
	var textMetric = context.measureText(this.text);
	context.fillStyle = this.font_colour;
	context.fillText(this.text,this.x + (this.width - textMetric.width)/2,this.y + (this.height + this.font_size)/2);
}	

// a label typed element 
function UILabel (text, align = "center")
{
	UIElement.call(this,null,null,null,null,"image");
	
	this.text = text;
	this.text_align = align;
	
}

UILabel.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UILabel.prototype, 'constructor', {
	value: UILabel,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UILabel.prototype.draw = function(context)
{
	if(this.hidden) return false;
	context.fillStyle = this.font_colour;
	UIDrawer.draw_text(context,this.text,this.x,this.y,this.text_align,this.font,this.font_size);
}

UILabel.prototype.setText = function(text)
{
	this.text = text;
}

// an image loader 
function UIImage (width,height,source, image_resizing = "fit")
{
	UIElement.call(this,null,null,width,height,"image");
	
	this.image_resizing = image_resizing;
	if(typeof source === "object")
	{
		this.image = source;
		source.image_loaded = true;
	}
	else
	{
		this.image = new Image();
		this.image.onload = function(){this.image_loaded = true;};
		this.image.src = source;
	}
}

UIImage.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIImage.prototype, 'constructor', {
	value: UIImage,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UIImage.prototype.draw = function(context)
{
	if(this.hidden) return false;
	// check if loaded first.
	if (this.image.image_loaded)
	{
		// try to render 
		try 
		{
			switch(this.image_resizing)
			{
				case "horizontal": 
					context.drawImage(this.image,this.x,this.y,this.width,(this.width/this.image.width)*this.image.height);
					break;
				case "vertical":
					context.drawImage(this.image,this.x,this.y,(this.height/this.image.height)*this.image.width,this.height);
					break;
				case "fit":
				default:	
					context.drawImage(this.image,this.x,this.y,this.width,this.height);
			}
		}
		catch(exception)
		{
			Engine.log(exception);
		}
	}
}	

UIImage.prototype.set_image = function(source)
{
	this.image = new Image();
	this.image.onload = function(){this.image_loaded = true;};
	this.image.src = source;
}

// an panel style element, a generic styled UI element
function UIPanel (x,y,width,height)
{
	UIElement.call(this,x,y,width,height,"panel");
}

UIPanel.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIPanel.prototype, 'constructor', {
	value: UIPanel,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UIPanel.prototype.draw = function(context)
{
	if(this.hidden) return false;
	context.save();
	/* draw self */
	context.fillStyle = this.default_colour;
	context.strokeStyle = this.darker_colour;
	
	// standard
	context.beginPath();
	context.rect(this.x, this.y, this.width, this.height);
	context.closePath();
	context.fill();
	context.clip();
	this.draw_borders(context);
	
	if(this.paint) this.paint(context,this.x,this.y);
	
	// draw children
	if(this.children)
	{
		var elements_to_draw = [...this.children].reverse();
		elements_to_draw.forEach(element => element.draw(context));
		// draw children
		//this.children.forEach(child =>
		//	child.draw(context));
	}
	context.restore();
}

// a tabbed panel
function UITabbedPanel (x,y,width,height)
{
	UIElement.call(this,x,y,width,height,"tabbed_panel");
	
	this.tab_bar = new UIPanel(this.x, this.y, this.width, this.TAB_HEIGHT);
	this.content_panel = new UIPanel(this.x, this.y + this.TAB_HEIGHT, this.width, this.height - this.TAB_HEIGHT);
	// initial top bar
	this.addSubElement(this.tab_bar,0,0);
	// content panel
	this.addSubElement(this.content_panel,0,25);
}

UITabbedPanel.prototype = Object.create(UIPanel.prototype);
Object.defineProperty(UITabbedPanel.prototype, 'constructor', {
	value: UITabbedPanel,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UITabbedPanel.prototype.TAB_HEIGHT = 25;
UITabbedPanel.prototype.TAB_WIDTH = 100;

UITabbedPanel.prototype.addSubPanel = function(name,panel,onopen)
{
	// add a tab to the tabbed pane
	var previousButtonCount = this.tab_bar.children.length;
	var tabButton = new UIButton(this.TAB_WIDTH, this.TAB_HEIGHT, name
		,(mouseX,mouseY) => 
		{
			this.hideAllTabs();
			this.content_panel.children[previousButtonCount].show();
			
			if(onopen) onopen();
		});
	this.tab_bar.addSubElement(tabButton
		,this.x + previousButtonCount * this.TAB_WIDTH
		,0);
		
	// add it to the content pane 
	panel.setPosition(this.content_panel.x, this.content_panel.y);
	panel.resize(this.content_panel.width, this.content_panel.height);
	this.content_panel.addSubElement(panel);
	
}

UITabbedPanel.prototype.hideAllTabs = function()
{
	this.content_panel.children.forEach(child => child.hide());
}

// Scrolling, finally!
function UIScrollPanel (x,y,width,height,max_height)
{
	UIElement.call(this,x,y,width,height,"scroll_panel");
	this.scrollable = true;
	
	if(max_height < this.height || !max_height)
	{
		this.max_height = this.height + 1;
	}
	else 
	{
		this.max_height = max_height;
	}
	
	this.content_panel = new UIPanel(this.x, this.y, this.width - this.SCROLL_WIDTH, this.height);
	// we do this because addSubElement is overriden.
	UIElement.prototype.addSubElement.call(this,this.content_panel);
	
	this.scroll_bar = new UIScrollBar();
	UIElement.prototype.addSubElement.call(this,this.scroll_bar);
	// Attach always AFTER adding
	this.scroll_bar.attach(this);
}

UIScrollPanel.prototype = Object.create(UIPanel.prototype);
Object.defineProperty(UIScrollPanel.prototype, 'constructor', {
	value: UIScrollPanel,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UIScrollPanel.prototype.SCROLL_WIDTH = 25;
UIScrollPanel.prototype.SCROLL_COLOUR = UIElement.prototype.scroll_bar_background_colour;

UIScrollPanel.prototype.setPosition = function(x,y)
{
	UIElement.prototype.setPosition.call(this,x,y);
	// because they are all temp positions, we need to recalculate the scroll offsets.
	this.moveToScroll();
}

UIScrollPanel.prototype.resize = function(width,height)
{
	UIElement.prototype.resize.call(this,width,height);
	this.content_panel.resize(width - this.SCROLL_WIDTH, height);
}

UIScrollPanel.prototype.resizeMaxHeight = function(maxHeight)
{
	
	if(maxHeight < this.height)
	{
		this.max_height = this.height + 1;
	}
	else 
	{
		this.max_height = maxHeight;
	}
	this.scroll_bar.attach(this);
	
}
/**
	One can only add to content panel, nothing else.
 */
UIScrollPanel.prototype.addSubElement = function(element, x=0, y=0)
{
	this.content_panel.addSubElement(element,x,y);
}

/**
	Ditto for removing all sub elements!
 */
UIScrollPanel.prototype.removeAllSubElements = function()
{
	this.content_panel.removeAllSubElements();
}

UIScrollPanel.prototype.moveToScroll = function()
{
	var scroll = this.scroll_bar.getScroll();
	// move everything based on relative xs and ys
	// use the parent to reconstruct the mainframe
	// we'll use the parent ABSOLUTE and the child RELATIVE 
	// in order to get the child ABSOLUTE
	// of course, we are going to be using the CONTENT panel's children 
	// then we can factor in SCROLL
	this.content_panel.children.forEach(child => child.setTemporaryPosition(child.relative_x + this.x
		,child.relative_y + this.y - scroll * (this.max_height - this.height)));
}

UIScrollPanel.prototype.handle_wheel = function(deltaY)
{
	if(this.children)
	{
		// a good ol' fashion for loop to prevent propagation errors
		for(var index = 0; index < this.children.length; index++)
		{
			var child = this.children[index];
			child.handle_wheel(deltaY);
		}
	}
	
	if(this.onwheel)
	{
		this.onwheel(deltaY);
	}
	
	if(this.isSubElementNotScrollableFocused())
	{
		if(deltaY < 0) 
		{
			this.scroll_bar.scrollUp(-deltaY);
		}
		else 
		{
			this.scroll_bar.scrollDown(deltaY);
		}
	}
	
	return true;
}

function UIScrollBar()
{
	UIElement.call(this,0,0,this.SCROLL_WIDTH,0,"scroll_bar");
	
	this.attached = null;
		
	// add the top and bottom buttons 
	this.topButton = new UIButton(this.SCROLL_WIDTH,this.SCROLL_WIDTH, "", ()=>this.scrollUp());
	this.topButton.paint = function(context,x,y)
	{
		UIDrawer.draw_arrow(context
			,x + this.indent_size * 3
			,y + this.indent_size * 2 + Math.round((this.height - this.indent_size * 4) / 4)
			,this.width - this.indent_size * 6
			,Math.round((this.height - this.indent_size * 4) / 2)
			,"north");
		context.fill();
		context.stroke();
	}
	this.addSubElement(this.topButton);
	
	this.bottomButton = new UIButton(this.SCROLL_WIDTH, this.SCROLL_WIDTH, "", ()=>this.scrollDown());
	this.bottomButton.paint = function(context,x,y)
	{
		UIDrawer.draw_arrow(context
			,x + this.indent_size * 3
			,y + this.indent_size * 2 + Math.round((this.height - this.indent_size * 4) / 4)
			,this.width - this.indent_size * 6
			,Math.round((this.height - this.indent_size * 4) / 2)
			,"south");
		context.fill();
		context.stroke();
	}
	this.addSubElement(this.bottomButton);
	
	// add the middle section
	this.scrollComponent = new UIScrollBarComponent();
	this.addSubElement(this.scrollComponent);
	this.scrollComponent.attach(this);
}

UIScrollBar.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIScrollBar.prototype, 'constructor', {
	value: UIScrollBar,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UIScrollBar.prototype.SCROLL_WIDTH = UIScrollPanel.prototype.SCROLL_WIDTH;
UIScrollBar.prototype.default_colour = UIScrollPanel.prototype.SCROLL_COLOUR;

UIScrollBar.prototype.draw = function(context)
{
	if(this.hidden) return false;
	UIElement.prototype.draw.call(this,context);
}

UIScrollBar.prototype.attach = function(panel)
{
	this.parent = panel;
	this.setRelativePosition(this.parent.width - this.SCROLL_WIDTH,0);
	
	this.width = this.SCROLL_WIDTH;
	this.height = this.parent.height;
	// change children 
	this.topButton.setPosition(this.x,this.y);
	this.bottomButton.setPosition(this.x,this.y + this.height - this.SCROLL_WIDTH);
	this.scrollComponent.attach(this);	

}

// instead of amount, we'll be converting pixels to amount
UIScrollBar.prototype.scrollUp = function(pixels = 100)
{
	var amount = (pixels/this.parent.max_height)
	this.scrollComponent.scrollUp(amount);
	if(this.parent) this.parent.moveToScroll();
}

UIScrollBar.prototype.scrollDown = function(pixels = 100)
{
	var amount = (pixels/this.parent.max_height)
	this.scrollComponent.scrollDown(amount);
	if(this.parent) this.parent.moveToScroll();
}

UIScrollBar.prototype.setScroll = function(amount)
{
	this.scrollComponent.setScroll(amount);
	if(this.parent) this.parent.moveToScroll();
}

UIScrollBar.prototype.getScroll = function()
{
	return this.scrollComponent.scroll;
}

UIScrollBar.prototype.performMouseScroll = function()
{
	this.parent.scroll = this.getScroll();
	this.parent.moveToScroll();
}

function UIScrollBarComponent()
{
	UIElement.call(this,0,0,this.SCROLL_WIDTH,0,"scroll_bar_component");
	
	this.scroll = 0;
	
	this.bar = new UIScrollBarComponentBar();
	this.addSubElement(this.bar);
	this.bar_y = 0; // relative_y
	this.bar_height;
}

UIScrollBarComponent.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIScrollBarComponent.prototype, 'constructor', {
	value: UIScrollBarComponent,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UIScrollBarComponent.prototype.SCROLL_WIDTH = UIScrollPanel.prototype.SCROLL_WIDTH;
UIScrollBarComponent.prototype.default_colour = UIScrollPanel.prototype.SCROLL_COLOUR;

UIScrollBarComponent.prototype.attach = function(scrollBar)
{
	this.parent = scrollBar;
	
	this.setRelativePosition(0,scrollBar.SCROLL_WIDTH);
	this.width = scrollBar.SCROLL_WIDTH;
		
	// minus twice, once for top and once for bottom 
	this.height = scrollBar.height - (2 * scrollBar.SCROLL_WIDTH);

	var panel = this.parent.parent;
	if(panel)
	{
		this.bar_height = (panel.height / panel.max_height) * this.height;
		this.bar.attach(this);
	}
}

UIScrollBarComponent.prototype.scrollUp = function(amount = 0.1)
{
	this.scroll -= amount;
	if(this.scroll < 0) this.scroll = 0;
	this.bar.moveToScroll();
	
}

UIScrollBarComponent.prototype.scrollDown = function(amount = 0.1)
{
	this.scroll += amount;
	if(this.scroll > 1) this.scroll = 1;
	this.bar.moveToScroll();
	
}

UIScrollBarComponent.prototype.setScroll = function(amount)
{
	this.scroll = amount;
	if(amount < 0) this.scroll = 0;
	if(amount > 1) this.scroll = 1;
	this.bar.moveToScroll();
}
// gets scroll from scroll bar position
UIScrollBarComponent.prototype.getScrollFromBar = function()
{
	return (this.bar.y - this.y)/(this.height - this.bar_height);
}

// does a mouse scroll thing 
// helps us in propagation up the line to its parent 
UIScrollBarComponent.prototype.performMouseScroll = function()
{
	this.scroll = this.getScrollFromBar();
	this.parent.performMouseScroll();
}

function UIScrollBarComponentBar()
{
	UIElement.call(this,0,0,this.SCROLL_WIDTH,0,"scroll_bar_component_bar");
	
}

UIScrollBarComponentBar.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIScrollBarComponentBar.prototype, 'constructor', {
	value: UIScrollBarComponentBar,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UIScrollBarComponentBar.prototype.SCROLL_WIDTH = UIScrollPanel.prototype.SCROLL_WIDTH;
UIScrollBarComponentBar.prototype.indent_size = 4;

UIScrollBarComponentBar.prototype.attach = function(scrollBar)
{
	this.parent = scrollBar;
	this.setRelativePosition(0,this.parent.scroll*(this.parent.height-this.parent.bar_height));
	this.height = this.parent.bar_height;
}

UIScrollBarComponentBar.prototype.setPosition = function(x,y)
{
	UIElement.prototype.setPosition.call(this,x,y);
	// we must recalculate our temporary scroll offset
	this.moveToScroll();
}

UIScrollBarComponentBar.prototype.moveToScroll = function()
{
	this.y = this.parent.y + this.parent.scroll*(this.parent.height-this.parent.bar_height);
}

// going to cheat a little here, if mousedown then we'll also modify the y position
UIScrollBarComponentBar.prototype.draw = function(context)
{
	if(this.hidden) return false;
	UIElement.prototype.draw.call(this,context);
	// we do both to get that nice, edge faded look. of course, that means we're gonna have to cheat a little bit with indents.
	this.draw_concave_indents(context);
	this.draw_borders(context);
	if(this.mousedown)
	{
		this.y = Engine.mouseY - (this.mousedown.relative_y);
		//Engine.log(Engine.mouseY - (this.mousedown.y - this.y));
		if(this.y < this.parent.y) this.y = this.parent.y;
		if(this.y > this.parent.y + this.parent.height - this.parent.bar_height) this.y = this.parent.y + this.parent.height - this.parent.bar_height;
		// affect everything ALL the way down the line 
		this.parent.performMouseScroll();
	}
}
/**
	Craziest component so far. 
	We've had scrolling, we had buttons'n'text.
	Now it's time for some freakin WINDOWS!
	It's actually crazy simple, to be honest.
	Prelude to draggable windows.
	
	Only SIMULATES Windows UI, is NOT a JFRAME except in look.
	
	TITLE BAR 
		MENU BUTTONS
	MENU BAR
	TOOL BAR 
	
	STATUS BAR 
 */

function UIWindow(x,y,width,height,title = "",draggable = false, menuButton = false)
{
	UIElement.call(this,x,y,width,height,"window");
	// title
	this.title_bar = new UITitleBar(title,draggable,menuButton);
	UIElement.prototype.addSubElement.call(this,this.title_bar,0,0);
	this.title_bar.attach(this);
	
	// content
	this.content_panel = new UIPanel(null,null,this.width,this.height - UIWindow.prototype.TITLE_BAR_HEIGHT);
	UIElement.prototype.addSubElement.call(this,this.content_panel,0,UIWindow.prototype.TITLE_BAR_HEIGHT);
}

UIWindow.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIWindow.prototype, 'constructor', {
	value: UIWindow,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UIWindow.prototype.TITLE_BAR_HEIGHT = 25;

UIWindow.prototype.addSubElement = function(element,x=0,y=0)
{
	this.content_panel.addSubElement(element,x,y);
}

UIWindow.prototype.drag = function(x,y)
{
	this.setPosition(x,y);
}

UIWindow.prototype.drop = function(x,y)
{
	// restitute, if there is a parent 
	if(this.parent)
	{
		if(this.x < this.parent.x)
		{
			this.setPosition(this.parent.x,this.y);
		}
		if(this.y < this.parent.y)
		{
			this.setPosition(this.x,this.parent.y);
		}
		if(this.x + this.width > this.parent.x + this.parent.width)
		{
			this.setPosition(this.parent.x + this.parent.width - this.width,this.y);
		}
		if(this.y + this.height > this.parent.y + this.parent.height)
		{
			this.setPosition(this.x,this.parent.y + this.parent.height - this.height);
		}
	}
}	

UIWindow.prototype.setTitle = function(text)
{
	if(text !== null) this.title_bar.setTitle(text);
}

UIWindow.prototype.hide = function()
{
	UIElement.prototype.hide.call(this);
	if(this.parent) this.parent.focus(); // currently broken because of logic order
}

/**
	MENUBUTTONS
		QUIT (That's basically it)
 */
function UITitleBar(text = "",draggable,menuButton = false)
{
	UIElement.call(this,0,0,0,0,"title_bar");
	this.text = text;
	this.draggable = draggable;
	this.attached = null;
	
	this.title = new UILabel(text,"center");
	this.title.font_colour = this.font_colour;
	this.addSubElement(this.title,0,0);
	
	if(menuButton)
	{
		this.quit_button = new UIButton(25,25,"");
		this.quit_button.default_colour = UIElement.prototype.title_quit_button_default_colour;
		this.quit_button.darker_colour = UIElement.prototype.title_quit_button_darker_colour;
		this.quit_button.lighter_colour = UIElement.prototype.title_quit_button_lighter_colour;
		this.quit_button.paint = function(context,x,y)
		{
			UIDrawer.draw_diagonal_cross(context,x+5,y+5,16,16);
			context.fill();
			context.stroke();
		}
		this.addSubElement(this.quit_button, this.width - this.quit_button.width, 0);
	}
}

UITitleBar.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UITitleBar.prototype, 'constructor', {
	value: UITitleBar,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UITitleBar.prototype.default_colour = UIElement.prototype.title_default_colour;	
UITitleBar.prototype.darker_colour = UIElement.prototype.title_darker_colour;	
UITitleBar.prototype.lighter_colour = UIElement.prototype.title_lighter_colour;	

UITitleBar.prototype.font_colour = UIElement.prototype.title_font_colour;	
	
UITitleBar.prototype.HEIGHT = UIWindow.prototype.TITLE_BAR_HEIGHT;	

UITitleBar.prototype.draw = function(context)
{
	if(this.hidden) return false;
	
	UIElement.prototype.draw.call(this,context);
	this.draw_borders(context);
	
	// yes, I know we called drawing TWICE
	// but this is a specific case.
	// if this ever causes problems down the line 
	// KEYWORD
	if(this.children)
	{
		this.children.forEach(child =>
		{
			if(child.type === "button")
			{
				// we redraw the menu buttons 
				// they are clipped by the borders 
				child.draw(context);
			}
		});
	}
	
	// dragging!
	if(this.draggable)
	{
		if(this.mousedown)
		{
			if(this.parent)
			{
				var dragX = Engine.mouseX - this.mousedown.x + this.predrag_x;
				var dragY = Engine.mouseY - this.mousedown.y + this.predrag_y;
				this.parent.drag(dragX,dragY);
			}
		}
	}
}

UITitleBar.prototype.handle_mousedown = function(mouseX,mouseY)
{
	UIElement.prototype.handle_mousedown.call(this,mouseX,mouseY);
	this.predrag_x = this.x;
	this.predrag_y = this.y;
}

UITitleBar.prototype.handle_mouseup = function(mouseX,mouseY)
{
	if(this.draggable)
	{
		if(this.mousedown)
		{
			if(this.parent)
			{
				var dragX = mouseX - this.mousedown.x + this.predrag_x;
				var dragY = mouseY - this.mousedown.y + this.predrag_y;
				this.parent.drop(dragX,dragY);
			}
		}
	}
	UIElement.prototype.handle_mouseup.call(this,mouseX,mouseY);
}
	
UITitleBar.prototype.attach = function(parent)
{
	this.resize(parent.width,this.HEIGHT);	
	
	this.title.setRelativePosition(this.width/2,this.height/2);
	
	if(this.quit_button)
	{
		this.quit_button.setPosition(this.x + this.width - this.quit_button.width,this.y);
		this.quit_button.onmouseclick = () => {this.parent.hide()};
	}
}

UITitleBar.prototype.setTitle = function(text)
{
	this.title.setText(text);
}

UITitleBar.prototype.setDraggable = function(draggable)
{
	this.draggable = draggable;
}

/**
	A label with more control over thy text.
	Text align is left.
	No, it's not editable yet.
 */
function UITextArea(width,height,text)
{
	UIElement.call(this,null,null,width,height,"textarea");
	
	this.text = text;
	this.text_lines = [];
	
	this.rasterized = false;
	
	this.line_spacing = 1;
}

UITextArea.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UITextArea.prototype, 'constructor', {
	value: UITextArea,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UITextArea.prototype.draw = function(context)
{
	if(this.hidden) return false;
	context.save();
	
	context.font = this.font_size + "px " + this.font;
	var textMetric = context.measureText(this.text);
	context.fillStyle = this.font_colour;
	
	context.rect(this.x,this.y,this.width,this.height);
	context.clip();
	
	if(!this.rasterized)
	{
		this.rasterizeText(context);
	}
	
	for(var index = 0, length = this.text_lines.length; index < length; index++)
	{
		context.fillText(this.text_lines[index],this.x,this.y + this.font_size + (index * (this.font_size + this.line_spacing)));
	}
	context.restore();
}

UITextArea.prototype.rasterizeText = function(context)
{
	// set it right so that we'll see the correct rasterization in real use case
	context.font = this.font_size + "px " + this.font;
	
	if(!this.text)
	{
		Engine.log("UI Text Area: Unable to rasterize text, text not in valid form.");
		return false;
	}
	// tokenize text, convert to words
	var words = this.text.split(" ");
	
	var line = "";
	while(words.length !== 0)
	{
		var word = words.shift();
		var clear_space = /\n/gi;
		if(context.measureText(line).width + context.measureText(word).width > this.width || word.indexOf("\n") >= 0)
		{
			this.text_lines.push(line);
			line = "";
		}
		
		line = line.concat(word.trim()," ");
	}
	
	if(line !== "")
	{
		this.text_lines.push(line);
	}
	this.rasterized = true;
}

UITextArea.prototype.getLineCount = function()
{
	if(this.rasterized)
	{
		return this.text_lines.length;
	}
	else 
	{
		return 0;
	}
}

UITextArea.prototype.getTextHeight = function()
{
	return this.getLineCount() * (this.font_size + this.line_spacing);
}

UITextArea.prototype.resize = function(width,height)
{
	UIElement.prototype.resize.call(this,width,height);
	this.text_lines = [];
	this.rasterized = false;
}

/**
	Text fields are ALWAYS nice 
 */
function UITextField(width,height,validate)
{
	UIElement.call(this,null,null,width,height,"textfield");
	this.text = "";
	
	this.isValid = false;
	this.error = "";
	this.validate = validate;
}

UITextField.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UITextField.prototype, 'constructor', {
	value: UITextField,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UITextField.prototype.draw = function(context)
{
	if(this.hidden) return false;
	
	context.font = this.font_size + "px " + this.font;
	var textMetric = context.measureText(this.text);
	
	context.save();
	/* draw self */
	context.fillStyle = this.darker_colour;
	context.strokeStyle = this.default_colour;
	
	// standard
	context.beginPath();
	context.rect(this.x, this.y, this.width, this.height);
	context.closePath();
	context.fill();
	// we clip in order to prevent overlap onto other elements 
	context.clip();
	
	context.fillStyle = this.font_colour;
	context.fillText(this.text,this.x + this.indent_size,this.y + this.font_size);
	
	//context.strokeStyle = this.font_colour;
	if(this.focused)
	{
		context.moveTo(this.x + this.indent_size + textMetric.width + 1, this.y + this.indent_size);
		context.lineTo(this.x + this.indent_size + textMetric.width + 1, this.y + this.height - this.indent_size);
		context.stroke();
	}
	this.draw_concave_indents(context);
	if(this.paint) this.paint(context,this.x,this.y);
	
	context.restore();
}
	
UITextField.prototype.getText = function()
{
	return this.text;
}

UITextField.prototype.setText = function(text)
{
	this.text = text;
}

UITextField.prototype.getErrorText = function()
{
	return this.error;
}

UITextField.prototype.handle_keydown = function(character)
{
	if(UIElement.prototype.handle_keydown.call(this,character))
	{
		this.type_character(character);
	}
}

UITextField.prototype.type_character = function(character)
{
	// also add backspace/delete too!
	if(character.length === 1)
	{
		this.text = this.text + character;
	}
	else if(character === "Backspace")
	{
		this.text = this.text.substring(0, this.text.length - 1);
	}
	else if(character === "Enter")
	{
		if(this.onenter) this.onenter();
	}
	// sets the text by direct attribute instead of setText to avoid an infinite loop.
	if(this.onkeytyped) this.onkeytyped(character); 
}

/**
	A pure TEXT table to speed up processing.
	There are no elements within; Will have no children.
 */
function UITable(width, height, rows = 1, columns = 1)
{
	UIElement.call(this,null,null,width,height,"table");
	this.cells = [];
	for(var index = 0; index < rows * columns; index++)
	{
		this.cells.push("BLANK");
	}
	this.rows = rows;
	this.columns = columns;
	
	this.column_weights = new UIWeightedSum(columns);
	this.row_weights = new UIWeightedSum(rows);
	
	this.resize(this.width,this.height);
}

UITable.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UITable.prototype, 'constructor', {
	value: UITable,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UITable.prototype.margin = 5;	
	
UITable.prototype.draw = function(context)
{
	if(this.hidden) return false;
	context.fillStyle = this.default_colour;
	context.strokeStyle = this.darker_colour;
		
	for(var index = 0; index < this.rows * this.columns; index++)
	{
		var row = Math.floor(index/this.columns);
		var column = index%this.columns;
	
		var row_weight = this.row_weights.getWeight(row);
		var column_weight = this.column_weights.getWeight(column);
		
		var x = Math.floor(this.x + this.cell_width * this.column_weights.getSumToIndex(column));
		var y = Math.floor(this.y + this.cell_height * this.row_weights.getSumToIndex(row));
		
		context.fillStyle = this.font_colour;
		UIDrawer.draw_text(context,this.cells[index],x+this.margin,y+this.cell_height*row_weight/2,"left_center",this.font,this.font_size);
		
		context.beginPath();
		context.strokeStyle = this.lighter_colour;
		context.rect(x-1,y-1,this.cell_width*column_weight,this.cell_height*row_weight);
		context.stroke();
		
		context.beginPath();
		context.strokeStyle = this.darker_colour;
		context.rect(x,y,this.cell_width*column_weight,this.cell_height*row_weight);
		context.stroke();
		
	}
}

UITable.prototype.resize = function(width,height)
{
	UIElement.prototype.resize.call(this,width,height);
	this.cell_width = this.width / this.column_weights.getSum();
	this.cell_height = this.height / this.row_weights.getSum();
}

UITable.prototype.get_position = function(x,y)
{
	return y * this.columns + x;
}

UITable.prototype.get_cell = function(x,y)
{
	return this.cells[this.get_position(x,y)];
}

UITable.prototype.set_cell = function(text, x, y)
{
	this.cells[this.get_position(x,y)] = text;
}

UITable.prototype.add_row = function(rowText)
{
	for(var column = 0; column < this.columns; column++)
	{
		var text = "";
		if(rowText && rowText[column]) text = rowText[column];
		this.cells.push(text); 
	}
	
	this.rows++;
	this.row_weights.addWeight(1);
	this.resize(this.width,this.height);
}

UITable.prototype.set_row_weight = function(row,weight)
{
	this.row_weights.setWeight(row,weight);
}

UITable.prototype.set_column_weight = function(column,weight)
{
	this.column_weights.setWeight(column,weight);
}

/**
	UI Combobox allows us to select things easily 
	(that's what they said about buttons too).
 */
function UIComboBox(width,height,choices,onselect)
{
	UIElement.call(this,null,null,width,height,"combobox");
	
	this.width = width;
	this.height = height;
	
	this.choices = choices;
	this.onselect = onselect;
	
	this.selected_choice = "";
	this.selected_textfield = new UITextField(this.width - height, height);
	this.selected_textfield.onmouseclick = () => this.open_choices();
	this.selected_textfield.onenter = () => this.handle_select(this.selected_textfield.getText());
	this.addSubElement(this.selected_textfield,0,0);
	/*
	this.selected_label = new UILabel(this.selected_choice, "left");
	this.addSubElement(this.selected_label,this.indent_size,this.indent_size);
	*/
	
	this.select_button = new UIButton(height,height,"",()=>this.toggle_choices());
	this.select_button.paint = function(context,x,y)
	{
		var direction = "north";
		if(this.parent)
		{
			if(this.parent.choice_display.hidden)
			{
				direction = "south";
			}
		}
		
		UIDrawer.draw_arrow(context
			,x + this.indent_size * 3
			,y + this.indent_size * 2 + Math.round((this.height - this.indent_size * 4) / 4)
			,this.width - this.indent_size * 6
			,Math.round((this.height - this.indent_size * 4) / 2)
			,direction);
		context.fill();
		context.stroke();
	}
	this.addSubElement(this.select_button,this.width - height,0);
	
	this.choice_display = new UIScrollPanel(this.x, this.y + this.height, this.width, this.height * this.choice_display_count, this.height * this.choices.length);
	this.choice_display.hide();
	this.addSubElement(this.choice_display, 0, this.height);
	
	this.choice_display_options = [];
	this.close_onselect = true;
	
	this.resize(width,height);
	this.set_choices(choices);
}

UIComboBox.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIComboBox.prototype, 'constructor', {
	value: UIComboBox,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UIComboBox.prototype.choice_display_count = 5;

UIComboBox.prototype.resize = function(width, height)
{
	UIElement.prototype.resize.call(this, width, height);
	this.normal_height = height;
}

UIComboBox.prototype.set_choices = function(choices)
{
	this.choices = choices;
	this.prepare_choices();
}

UIComboBox.prototype.prepare_choices = function()
{
	// clean up!
	this.choice_display_options.forEach(option => this.choice_display.removeSubElement(option));
	this.choice_display_options = [];
	
	var count = 0;
	this.choices.forEach(choice =>
		{
			var option = new UIComboBoxOption(this.choice_display.content_panel.width, this.normal_height,choice);
			this.choice_display.addSubElement(option,0,count * this.normal_height);
			this.choice_display_options.push(option);
			count++;
		});
}

UIComboBox.prototype.open_choices = function()
{
	UIElement.prototype.resize.call(this, this.width, this.normal_height * (1 + this.choice_display_count));
	this.choice_display.show();
}

UIComboBox.prototype.close_choices = function()
{
	UIElement.prototype.resize.call(this, this.width, this.normal_height);
	this.choice_display.hide();
}

UIComboBox.prototype.toggle_choices = function()
{
	if(this.choice_display.hidden) 
	{
		this.open_choices();
		return;
	}
	else 
	{
		this.close_choices();
	}
}

UIComboBox.prototype.handle_select = function(value)
{
	this.set_selected(value);
	
	if(this.close_onselect) this.close_choices();
	if(this.onselect) this.onselect(value);
}

UIComboBox.prototype.set_selected = function(value)
{
	this.selected_choice = value;
	
	if(!value) this.selected_choice = "";
	
	this.selected_textfield.setText(this.selected_choice);
}

/**
	A combobox option is a special type of UI Element (nah, it's just a highlightable)
 */
function UIComboBoxOption(width,height,text)
{
	UIElement.call(this,null,null,width,height,"combobox_option",()=>{this.handle_select()});
	this.value = text;
	this.label = new UILabel(text,"left");
	this.addSubElement(this.label, this.indent_size, this.indent_size);
}

UIComboBoxOption.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIComboBoxOption.prototype, 'constructor', {
	value: UIComboBoxOption,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UIComboBoxOption.prototype.default_colour = UIElement.prototype.lighter_colour;	
UIComboBoxOption.prototype.darker_colour = UIElement.prototype.default_colour;	
	
UIComboBoxOption.prototype.draw = function(context)
{
	if(this.hidden) return false;
	
	/* draw self */
	context.fillStyle = this.default_colour;
	context.strokeStyle = this.darker_colour;
	context.lineWidth = this.line_width;
	
	// standard
	context.beginPath();
	context.rect(this.x, this.y, this.width, this.height);
	context.closePath();
	context.fill();
	
	this.draw_concave_indents(context);
	
	if(this.paint) this.paint(context,this.x,this.y);
	
	if(this.children)
	{
		var elements_to_draw = [...this.children].reverse();
		elements_to_draw.forEach(element => element.draw(context));
	}
}
	
UIComboBoxOption.prototype.handle_select = function()
{
	var combobox = this.parent.parent.parent;
	if(!combobox || !(combobox instanceof UIComboBox)){Engine.log(`UIComboBoxOption: Cannot find parent ComboBox.`); return}
	
	combobox.handle_select(this.value);
}
	
// UI Drawer, which handles away all the common features to be drawn in terms of UI
// this helps simplify the amount of 'context.lineTo()'s that we'll have to do
var UIDrawer = (
	function()
	{
		return {
			// directions 
			// top 
			// bottom 
			// left 
			// right 
			draw_indent: function(context, rectangle, indent_size, direction)
			{
				switch(direction)
				{
					case "top":
						context.moveTo(rectangle.x, rectangle.y);
						context.lineTo(rectangle.x + indent_size, rectangle.y + indent_size);
						context.lineTo(rectangle.x + rectangle.width - indent_size, rectangle.y + indent_size);
						context.lineTo(rectangle.x + rectangle.width, rectangle.y);
						context.lineTo(rectangle.x, rectangle.y);
						break;
					case "bottom":
						context.moveTo(rectangle.x, rectangle.y + rectangle.height);
						context.lineTo(rectangle.x + indent_size, rectangle.y + rectangle.height - indent_size);
						context.lineTo(rectangle.x + rectangle.width - indent_size, rectangle.y + rectangle.height - indent_size);
						context.lineTo(rectangle.x + rectangle.width, rectangle.y + rectangle.height);
						context.lineTo(rectangle.x, rectangle.y + rectangle.height);
						break;
					case "left":
						context.moveTo(rectangle.x, rectangle.y);
						context.lineTo(rectangle.x + indent_size, rectangle.y + indent_size);
						context.lineTo(rectangle.x + indent_size, rectangle.y + rectangle.height - indent_size);
						context.lineTo(rectangle.x, rectangle.y + rectangle.height);
						context.lineTo(rectangle.x, rectangle.y);
						break;
					case "right":
						context.moveTo(rectangle.x + rectangle.width, rectangle.y);
						context.lineTo(rectangle.x + rectangle.width - indent_size, rectangle.y + indent_size);
						context.lineTo(rectangle.x + rectangle.width - indent_size, rectangle.y + rectangle.height - indent_size);
						context.lineTo(rectangle.x + rectangle.width, rectangle.y + rectangle.height);
						context.lineTo(rectangle.x + rectangle.width, rectangle.y);					
						break;
					default:
						Engine.log("UIDrawer: invalid indent direction. The directions are top, bottom, left, right.");
				}
			},
			
			// draws borders 
			draw_border: function(context, rectangle, direction)
			{
				switch(direction)
				{
					case "top":
						context.moveTo(rectangle.x + 1, rectangle.y + 1);
						context.lineTo(rectangle.x + rectangle.width, rectangle.y + 1);
						break;
					case "bottom":
						context.moveTo(rectangle.x + 1, rectangle.y + rectangle.height - 1);
						context.lineTo(rectangle.x + rectangle.width, rectangle.y + rectangle.height - 1);
						break;
					case "left":
						context.moveTo(rectangle.x + 1, rectangle.y + 1);
						context.lineTo(rectangle.x + 1, rectangle.y + rectangle.height);
						break;
					case "right":
						context.moveTo(rectangle.x + rectangle.width - 1, rectangle.y - 1);
						context.lineTo(rectangle.x + rectangle.width - 1, rectangle.y + rectangle.height);
						break;
					default:
						Engine.log("UIDrawer: invalid border direction. The directions are top, bottom, left, right.");
				}
			},
			
			// draw text
			// directions: left, right, n' center (default)
			draw_text: function(context,text,x,y,align = "center",font = UIElement.prototype.font,font_size = UIElement.prototype.font_size)
			{
				context.font = font_size + "px " + font;
				var textMetric = context.measureText(text);
				
				switch(align)
				{
						case "left":
							context.fillText(text,x,y+font_size);
							break;
						case "right":
							context.fillText(text,x-textMetric.width,y+font_size);
							break;
						case "left_center":
							context.fillText(text,x,y+font_size/2);
							break;
						case "right_center":
							context.fillText(text,x-textMetric.width,y+font_size/2);
							break;
						case "center": 
						default:
							context.fillText(text,x-textMetric.width/2,y+font_size/2);
							break;
				}
			},
			
			// shapes! fun!
			// directions: north, south, east, west
			draw_arrow: function(context,x,y,width,height,direction="north")
			{
				context.beginPath();
				switch(direction)
				{
					case "west": 
						context.moveTo(x+width,y);
						context.lineTo(x,y+height/2);
						context.lineTo(x+width,y+height);
						context.lineTo(x+width,y);
						break;
					case "east": 
						context.moveTo(x,y);
						context.lineTo(x+width,y+height/2);
						context.lineTo(x,y+height);
						context.lineTo(x,y);
						break;
					case "south":
						context.moveTo(x,y);
						context.lineTo(x+width/2,y+height);
						context.lineTo(x+width,y);
						context.lineTo(x,y);
						break;
					case "north":
						context.moveTo(x+width,y+height);
						context.lineTo(x+width/2,y);
						context.lineTo(x,y+height);
						context.lineTo(x+width,y+height);
					default:
				}
				context.closePath();
			},
			
			draw_diagonal_cross: function(context,x,y, width, height)
			{
				context.beginPath();
				context.moveTo(x+width*(1/4),y+height*(0/4));
				context.lineTo(x+width*(0/4),y+height*(1/4));
				context.lineTo(x+width*(1/4),y+height*(2/4));
				context.lineTo(x+width*(0/4),y+height*(3/4));
				context.lineTo(x+width*(1/4),y+height*(4/4));
				context.lineTo(x+width*(2/4),y+height*(3/4));
				context.lineTo(x+width*(3/4),y+height*(4/4));
				context.lineTo(x+width*(4/4),y+height*(3/4));
				context.lineTo(x+width*(3/4),y+height*(2/4));
				context.lineTo(x+width*(4/4),y+height*(1/4));
				context.lineTo(x+width*(3/4),y+height*(0/4));
				context.lineTo(x+width*(2/4),y+height*(1/4));
				context.closePath();
			},
		}
	}
	
)();

// helps us determine weights for things like flexcol 
function UIWeightedSum(length)
{
	this.weights = [];
	this.sumsToIndex = []; // precalculated!
	for(var index = 0; index < length; index++) this.weights.push(1);
	this.sum = 0;
	
	this.calculateSum();
	this.calculateSumsToIndex();
}

UIWeightedSum.prototype.getSum = function()
{
	return this.sum;
}

UIWeightedSum.prototype.getWeight = function(index)
{
	return this.weights[index];
}
// EXCLUSIVE
UIWeightedSum.prototype.getSumToIndex = function(index)
{
	return this.sumsToIndex[index];
}

UIWeightedSum.prototype.getLength = function()
{
	return this.weights.length;
}

UIWeightedSum.prototype.addWeight = function(weight)
{
	this.weights.push(weight);
	this.calculateSum();
	this.calculateSumsToIndex();
}

UIWeightedSum.prototype.setWeight = function(index,weight)
{
	this.weights[index] = weight;
	this.calculateSum();
	this.calculateSumsToIndex();
}

UIWeightedSum.prototype.calculateSum = function()
{
	var sum = 0;
	for(var index = 0; index < this.weights.length; index++)
	{
		sum+=this.weights[index];
	}
	this.sum = sum;
	return sum;
}

UIWeightedSum.prototype.calculateSumsToIndex = function()
{
	this.sumsToIndex[0] = 0;
	for(var index = 1; index < this.weights.length; index++)
	{
		this.sumsToIndex[index] = this.sumsToIndex[index-1] + this.getWeight(index-1);
	}
}