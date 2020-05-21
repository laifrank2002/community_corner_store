/**
	Advanced mathematical functions.
	@author laifrank2002
	@date 2020-06-15
 */

/**
	The gompertz function! Yay!
	
	@date 2020-05-21
	@author laifrank2002
 */
function gompertz(x,a,b,c)
{
	return a * Math.pow(Math.E, b * Math.pow(Math.E, c * x));
}