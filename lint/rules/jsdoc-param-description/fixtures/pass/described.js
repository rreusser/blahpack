// target: lib/lapack/base/dgesv/lib/base.js
/**
* Solves a linear system.
*
* @param {NonNegativeInteger} N - number of linear equations (order of `A`)
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @returns {integer} status code
*/
function dgesv( N, A, strideA1 ) {
	return N + A[ strideA1 ];
}
export default dgesv;
