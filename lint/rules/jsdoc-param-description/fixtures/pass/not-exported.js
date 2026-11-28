// target: lib/lapack/dgesv/lib/base.js
// Only the exported function's JSDoc is the contract; private helpers may be terse.
/**
* Helper.
*
* @private
* @param {integer} N - N
* @returns {integer} N
*/
function helper( N ) {
	return N;
}

/**
* Solves a linear system.
*
* @param {NonNegativeInteger} N - order of `A`
* @returns {integer} status code
*/
function dgesv( N ) {
	return helper( N );
}
export default dgesv;
