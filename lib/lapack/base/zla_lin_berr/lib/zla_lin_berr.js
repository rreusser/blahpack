/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a component-wise relative backward error.
*
* @param {NonNegativeInteger} N - number of rows of `res` and `ayb`
* @param {integer} nz - sparsity guard parameter
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} res - residual matrix, dimension `(N, nrhs)`
* @param {integer} strideRES - element stride for `res`
* @param {Float64Array} ayb - denominator matrix, dimension `(N, nrhs)`
* @param {integer} strideAYB - element stride for `ayb`
* @param {Float64Array} berr - output array, dimension `nrhs`
* @param {integer} strideBERR - stride length for `berr`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Float64Array} `berr`
*/
function zlaLinBerr( N, nz, nrhs, res, strideRES, ayb, strideAYB, berr, strideBERR ) {
	var oberr;
	var ores;
	var oayb;

	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	ores = stride2offset( N, strideRES );
	oayb = stride2offset( N, strideAYB );
	oberr = stride2offset( nrhs, strideBERR );
	return base( N, nz, nrhs, res, strideRES, ores, ayb, strideAYB, oayb, berr, strideBERR, oberr );
}


// EXPORTS //

export default zlaLinBerr;
