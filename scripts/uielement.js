/* 
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

	this.mousedown = null;
	
	this.paint = null;
	this.type = type;
	// element interactions
	this.children = [];
	this.parent = null;
	this.hidden = false;
}
UIElement.prototype.indent_size = 2;
UIElement.prototype.default_colour = "#4f89e0";
UIElement.prototype.darker_colour = "#125dcc";
UIElement.prototype.lighter_colour = "#94bcf7";
UIElement.prototype.font = "Arial";
UIElement.prototype.font_size = 14;
UIElement.prototype.font_colour = "#ffffff";

UIElement.prototype.draw = function(context)
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
	
	if(this.paint) this.paint(context);
	
	if(this.children)
	{
		// draw children
		this.children.forEach(child =>
			child.draw(context));
	}
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
	if(x > this.x && y > this.y && x < this.x + this.width && y < this.y + this.height)
	{
		return true;
	}
	return false;
}

UIElement.prototype.move = function(x,y)
{
	this.x = x;
	this.y = y;
}

UIElement.prototype.resize = function(width,height)
{
	this.width = width;
	this.height = height;
}

UIElement.prototype.handle_mousedown = function(mouseX, mouseY)
{
	if(this.hidden) return false;
	// check if in bounds 
	if(!this.isInBounds(mouseX,mouseY)) return false;
	// handle children first 
	if(this.children)
	{
		this.children.forEach(child =>
			{
				if(child.handle_mousedown(mouseX, mouseY)) return true;
			});
	}
	// handle self 
	if(this.onmousedown)
	{
		this.onmousedown(mouseX,mouseY);
	}
	this.mousedown = new Point(mouseX, mouseY);;
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
	if(this.isInBounds(mouseX,mouseY) && this.onmouseclick && this.mousedown)
	{
		this.onmouseclick(this.mousedown.x,this.mousedown.y);
	}
	this.mousedown = null;
}


UIElement.prototype.addSubElement = function(element, x=0, y=0)
{
	element.parent = this;
	element.relative_x = x;
	element.relative_y = y;
	element.move(element.parent.x + x, element.parent.y + y);
	this.children.push(element);
}

UIElement.prototype.removeSubElement = function(element)
{
	element.parent = null;
	this.children = this.children.filter (child => child !== element);
}

UIElement.prototype.hide = function()
{
	this.hidden = true;
}

UIElement.prototype.show = function()
{
	this.hidden = false;
}

// a button typed element 
function UIButton (x,y,width,height,text,onmouseclick)
{
	UIElement.call(this,x,y,width,height,"button",onmouseclick);
	
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
	
	if(this.paint)this.paint(context);
	
	// draw text and center
	var textMetric = context.measureText(this.text);
	context.font = this.font_size + "px " + this.font;
	context.fillStyle = this.font_colour;
	context.fillText(this.text,this.x + (this.width - textMetric.width)/2,this.y + (this.height + this.font_size)/2);
}	

// a label typed element 
function UILabel (x,y,text, align = "center")
{
	UIElement.call(this,x,y,null,null,"image");
	
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
	
	var textMetric = context.measureText(this.text);
	context.font = this.font_size + "px " + this.font;
	context.fillStyle = this.font_colour;

	switch(this.text_align)
	{
		case "left":
			// draw text and left
			context.fillText(this.text,this.x,this.y + this.font_size);
			break;
		case "center":
		default:
			// draw text from center
			context.fillText(this.text,this.x - textMetric.width/2,this.y + this.font_size/2);
	}
	
}

UILabel.prototype.handle_mousedown = function(mouseX, mouseY)
{
	if(this.hidden) return false;
	// check if in bounds 
	if(!this.isInBounds(mouseX,mouseY)) return false;
	// handle self 
	if(this.onmousedown)
	{
		this.onmousedown(mouseX,mouseY);
	}
	this.mousedown = new Point(mouseX, mouseY);;
	return true;
};	
UILabel.prototype.handle_mouseup = function(mouseX, mouseY)
{
	if(this.onmouseup)
	{
		this.onmouseup(mouseX, mouseY);
	}
	if(this.isInBounds(mouseX,mouseY) && this.onmouseclick && this.mousedown)
	{
		this.onmouseclick(this.mousedown.x,this.mousedown.y);
	}
	this.mousedown = null;
};	

// an image loader 
function UIImage (x,y,width,height,source)
{
	UIElement.call(this,x,y,width,height,"image");
	
	this.image = new Image();
	this.image.onload = function(){this.image_loaded = true;};
	this.image.src = source;
}

UIImage.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIImage.prototype, 'constructor', {
	value: UIImage,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UIImage.prototype.draw = function(context)
{
	// check if loaded first.
	if (this.image.image_loaded)
	{
		// try to render 
		try 
		{
			context.drawImage(this.image,this.x,this.y,this.width,this.height);
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
	/* draw self */
	context.fillStyle = this.default_colour;
	context.strokeStyle = this.darker_colour;
	
	// standard
	context.beginPath();
	context.rect(this.x, this.y, this.width, this.height);
	context.closePath();
	context.fill();
	
	this.draw_borders(context);
	
	// draw children
	this.children.forEach(child =>
		child.draw(context));
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

UITabbedPanel.prototype.addSubPanel = function(name,panel)
{
	// add a tab to the tabbed pane
	var previousButtonCount = this.tab_bar.children.length;
	var tabButton = new UIButton(0, 0, this.TAB_WIDTH, this.TAB_HEIGHT, name
		,(mouseX,mouseY) => 
		{
			this.hideAllTabs();
			this.content_panel.children[previousButtonCount].show();
		});
	this.tab_bar.addSubElement(tabButton
		,this.x + previousButtonCount * this.TAB_WIDTH
		,this.y);
	
	// add it to the content pane 
	panel.move(this.content_panel.x, this.content_panel.y);
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
	
	this.max_height = max_height;
			
	this.content_panel = new UIPanel(this.x, this.y, this.width - this.SCROLL_WIDTH, this.height);
	this.addSubElement(this.content_panel);
	
	this.scroll_bar = new UIScrollBar();
	this.addSubElement(this.scroll_bar);
	// Attach always AFTER adding
	this.scroll_bar.attach(this);
}

UIScrollPanel.prototype = Object.create(UIPanel.prototype);
Object.defineProperty(UIScrollPanel.prototype, 'constructor', {
	value: UIScrollPanel,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UIScrollPanel.prototype.SCROLL_WIDTH = 25;
UIScrollPanel.prototype.SCROLL_COLOUR = '#ffffff';

UIScrollPanel.prototype.move = function(x,y)
{
	this.x = x;
	this.y = y;
	this.content_panel.move(x,y);
	this.scroll_bar.attach(this);
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
	this.content_panel.children.forEach(child => child.move(child.relative_x + this.x
		,child.relative_y + this.y - scroll * this.max_height));
}

function UIScrollBar()
{
	UIElement.call(this,0,0,this.SCROLL_WIDTH,0,"scroll_bar");
	
	this.attached = null;
		
	// add the top and bottom buttons 
	this.topButton = new UIButton(this.x, this.y, this.SCROLL_WIDTH,this.SCROLL_WIDTH, "", ()=>this.scrollUp());
	this.addSubElement(this.topButton);
	
	this.bottomButton = new UIButton(this.x, this.y + this.height - this.SCROLL_WIDTH, this.SCROLL_WIDTH, this.SCROLL_WIDTH, "", ()=>this.scrollDown());
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
	UIElement.prototype.draw.call(this,context);
	this.scrollComponent.draw_borders(context);
}

UIScrollBar.prototype.attach = function(panel)
{
	this.parent = panel;
	
	this.x = this.parent.x + this.parent.width - this.SCROLL_WIDTH;
	this.y = this.parent.y;
	this.width = this.SCROLL_WIDTH;
	this.height = this.parent.height;
	
	// change children 
	this.topButton.move(this.x,this.y);
	this.bottomButton.move(this.x,this.y + this.height - this.SCROLL_WIDTH);
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
	
	this.x = scrollBar.x;
	this.y = scrollBar.y + scrollBar.SCROLL_WIDTH;
	this.width = scrollBar.SCROLL_WIDTH;
	// minus twice, once for top and once for bottom 
	this.height = scrollBar.height - scrollBar.SCROLL_WIDTH - scrollBar.SCROLL_WIDTH
	
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

UIScrollBarComponentBar.prototype.attach = function(scrollBar)
{
	this.parent = scrollBar;
	this.x = this.parent.x;
	this.y = this.parent.y + this.parent.scroll*(this.parent.height-this.parent.bar_height);
	this.height = this.parent.bar_height;
}

UIScrollBarComponentBar.prototype.moveToScroll = function()
{
	this.y = this.parent.y + this.parent.scroll*(this.parent.height-this.parent.bar_height);
}

// going to cheat a little here, if mousedown then we'll also modify the y position
UIScrollBarComponentBar.prototype.draw = function(context)
{
	UIElement.prototype.draw.call(this,context);
	if(this.mousedown)
	{
		this.y = Engine.mouseY;
		if(this.y < this.parent.y) this.y = this.parent.y;
		if(this.y > this.parent.y + this.parent.height - this.parent.bar_height) this.y = this.parent.y + this.parent.height - this.parent.bar_height;
		// affect everything ALL the way down the line 
		this.parent.performMouseScroll();
	}
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
		}
	}
	
)();
