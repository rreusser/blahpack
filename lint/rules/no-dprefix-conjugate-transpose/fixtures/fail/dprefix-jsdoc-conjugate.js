// target: lib/blas/dtpmv/lib/dtpmv.js
// expect: documents "conjugate-transpose"
/**
* Computes `x := A*x` or `x := A**T*x`.
*
* @param {string} trans - `'no-transpose'`: x := A*x. `'transpose'`: x := A**T*x. `'conjugate-transpose'`: x := A**T*x.
* @returns {Float64Array} `x`
*/
function dtpmv( trans ) {
	return trans;
}

export default dtpmv;
