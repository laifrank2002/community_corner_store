function AddMapTests()
{
	Engine.log("Adding tests for Map...");
	
	// testing const vars 
	var gridObj = new GridObject(FurnitureTemplateList["shelf"].prototype.template);
	var grid = new Grid(5,5);
	/* saving and loading tests */
	
	function TestGridObjectFromDataToData()
	{
		// I know we're supposed to be independant, but the whole system needs ANOTHER refactoring.
		// So this will have to do for now.
		var data = gridObj.toData();
		var string = JSON.stringify(data);
		var reparsed = JSON.parse(string);
		var newObj = new GridObject();
		newObj.fromData(reparsed);
		
		return newObj;
	}
	
	function TestGridFromDataToData()
	{
		var data = grid.toData();
		var string = JSON.stringify(data);
		var reparsed = JSON.parse(string);
		var newGrid = new Grid();
		newGrid.fromData(reparsed);
		
		return newGrid;
	}
	
	function TestGridFromDataToDataTile()
	{
		var data = grid.toData();
		var string = JSON.stringify(data);
		var reparsed = JSON.parse(string);
		var newGrid = new Grid();
		newGrid.fromData(reparsed);
		
		return newGrid.map[0][0] instanceof GridTile;
	}
	
	TestingManager.addTest("TestGridObjectFromDataToData", TestGridObjectFromDataToData, gridObj, "assertObjectDeepEquals");
	TestingManager.addTest("TestGridFromDataToData", TestGridFromDataToData, grid, "assertObjectDeepEquals");
	TestingManager.addTest("TestGridFromDataToDataTile", TestGridFromDataToDataTile, true, "assertEquals");
}