/* turns cents to dollars */
function toCurrencyDisplayString(number)
{
	return "$" + (number/100).toFixed(2);
}