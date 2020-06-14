/*
	Proxy for the shop.js element
	This is how we are able to render the shop 
 */
 
// note height is overriden by tab setting.
var ShopElement = new UIElement(0,0,800,525);

ShopElement.default_colour = '#ffffff';

ShopElement.initialize = function()
{
	ShopElement.addSubElement(ShopInspectWindow,10,10);
	ShopInspectWindow.initialize();
	ShopInspectWindow.hide();
	
	// other UI elements are initialized in Shop due to privacy and permissions.
}

ShopElement.paint = function(context)
{
	Shop.draw(context, this.x, this.y);
}

ShopElement.onmousedown = function(mouseX, mouseY){}

ShopElement.onmouseup = function(mouseX, mouseY){}

ShopElement.onmouseclick = function(mouseX, mouseY)
{
	Shop.onmouseclick(mouseX, mouseY);
}