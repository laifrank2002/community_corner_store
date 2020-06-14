// configuration file
var images = {
	"checkout_counter": create_image("assets/checkout_counter.png"),
	"shelf": create_image("assets/shelf.png"),
	"shelf_stocked": create_image("assets/shelf_stocked.png"),
	"narrow_shelf": create_image("assets/narrow_shelf.png"),
	"narrow_shelf_stocked": create_image("assets/narrow_shelf_stocked.png"),
	"background1": create_image("assets/background1.png"),
}

window.onload = function()
{
	// All the manual inits shall go here.
	Engine.initialize();
	Stock.initialize();
	Shop.initialize();
	History.initialize();
	Reports.initialize();
}