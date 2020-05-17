/**
	A set of specific UI elements primitives meshed together for better use.
	I don't want to make TWO buttons when I can be lazy and only write one!
	
	function UITextInput(width,height,buttonText,action)
	
	@date 2020-05
 */
function UITextInput(width,height,buttonText,action)
{
	UIElement.call(this,null,null,width,height,"text_input");
	this.action = action;

	this.text_field = new UITextField(width-110,height);
	// pneumonic
	this.text_field.onenter = ()=>{this.doAction()};
	this.action_button = new UIButton(100,height,buttonText,()=>{this.doAction()});
	this.addSubElement(this.text_field,0,0);
	this.addSubElement(this.action_button,width-100,0);
}

UITextInput.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UITextInput.prototype, 'constructor', {
	value: UITextInput,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UITextInput.prototype.doAction = function()
{
	if(this.action)
	{
		this.action();
	}
}

UITextInput.prototype.getInput = function()
{
	return this.text_field.getText();
}

UITextInput.prototype.setInput = function(text)
{
	this.text_field.setText(text);
}