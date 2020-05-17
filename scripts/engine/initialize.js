// configuration file
var images = {
	"checkout_counter": create_image("assets/checkout_counter.png"),
	"shelf": create_image("assets/shelf.png"),
	"shelf_stocked": create_image("assets/shelf_stocked.png"),
	
}

window.onload = function()
{
	// All the manual inits shall go here.
	Engine.initialize();
	Stock.initialize();
	Shop.initialize();
	Reports.initialize();
}