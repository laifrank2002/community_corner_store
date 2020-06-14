// a fancy schmancy bunch of constants THAT CAN CHANGE
// these values are stored in other handlers, such as in State_manager
// this just makes life easy for us 
var World = {
	get sales_tax () { return State_manager.get_state("world", "sales_tax") },
	get day() { return State_manager.get_state("world", "day") },
	get prices() { return State_manager.get_state("world", "prices") },
	
	set sales_tax(value) { State_manager.set_state("world", "sales_tax", value) },
	set day(value) { State_manager.set_state("world", "day", value) },
}