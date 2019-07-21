/*
	Proxy for the shop.js element
	This is how we are able to render the shop 
 */
var ShopHandler = new UIElement(0,0,800,550);

ShopHandler.default_colour = '#ffffff';

ShopHandler.paint = function(context)
{
	Shop.draw(context, this.x, this.y);
}

ShopHandler.onmousedown = function(mouseX, mouseY)
{
	
}

ShopHandler.onmouseup = function(mouseX, mouseY)
{
	
}

ShopHandler.onmouseclick = function(mouseX, mouseY)
{
	
}