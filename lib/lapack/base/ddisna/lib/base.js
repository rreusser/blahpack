

// MODULES //

import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );
var OVERFLOW = dlamch( 'overflow' );


// MAIN //

/**
* Compute the reciprocal condition numbers for the eigenvectors of a real symmetric or complex Hermitian matrix or for the left or right singular vectors of a general m-by-n matrix.
*
* @private
* @param {string} job - specifies the operation type
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} SEP - output array
* @param {integer} strideSEP - stride length for `SEP`
* @param {NonNegativeInteger} offsetSEP - starting index for `SEP`
* @returns {integer} status code (0 = success)
*/
function ddisna( job, M, N, d, strideD, offsetD, SEP, strideSEP, offsetSEP ) { // eslint-disable-line max-len, max-params
	var thresh;
	var newgap;
	var oldgap;
	var anorm;
	var eigen;
	var right;
	var left;
	var sing;
	var incr;
	var decr;
	var info;
	var k;
	var i;

	info = 0;
	eigen = ( job === 'eigenvalues' );
	left = ( job === 'left-vectors' );
	right = ( job === 'right-vectors' );
	sing = left || right;

	if ( eigen ) {
		k = M;
	} else if ( sing ) {
		k = Math.min( M, N );
	}
	if ( !eigen && !sing ) {
		info = -1;
	} else if ( M < 0 ) {
		info = -2;
	} else if ( k < 0 ) {
		info = -3;
	} else {
		incr = true;
		decr = true;
		for ( i = 0; i < k - 1; i++ ) {
			if ( incr ) {
				incr = incr && d[ offsetD + (i * strideD) ] <= d[ offsetD + ((i + 1) * strideD) ]; // eslint-disable-line max-len
			}
			if ( decr ) {
				decr = decr && d[ offsetD + (i * strideD) ] >= d[ offsetD + ((i + 1) * strideD) ]; // eslint-disable-line max-len
			}
		}
		if ( sing && k > 0 ) {
			if ( incr ) {
				incr = incr && d[ offsetD ] >= 0.0;
			}
			if ( decr ) {
				decr = decr && d[ offsetD + ((k - 1) * strideD) ] >= 0.0;
			}
		}
		if ( !( incr || decr ) ) {
			info = -4;
		}
	}
	if ( info !== 0 ) {
		return info;
	}

	// Quick return if possible:
	if ( k === 0 ) {
		return 0;
	}

	// Compute reciprocal condition numbers:
	if ( k === 1 ) {
		SEP[ offsetSEP ] = OVERFLOW;
	} else {
		oldgap = Math.abs( d[ offsetD + strideD ] - d[ offsetD ] );
		SEP[ offsetSEP ] = oldgap;
		for ( i = 1; i < k - 1; i++ ) {
			newgap = Math.abs( d[ offsetD + ((i + 1) * strideD) ] - d[ offsetD + (i * strideD) ] ); // eslint-disable-line max-len
			SEP[ offsetSEP + (i * strideSEP) ] = Math.min( oldgap, newgap );
			oldgap = newgap;
		}
		SEP[ offsetSEP + ((k - 1) * strideSEP) ] = oldgap;
	}

	if ( sing ) {
		if ( ( left && M > N ) || ( right && M < N ) ) {
			if ( incr ) {
				SEP[ offsetSEP ] = Math.min( SEP[ offsetSEP ], d[ offsetD ] ); // eslint-disable-line max-len
			}
			if ( decr ) {
				SEP[ offsetSEP + ((k - 1) * strideSEP) ] = Math.min( SEP[ offsetSEP + ((k - 1) * strideSEP) ], d[ offsetD + ((k - 1) * strideD) ] ); // eslint-disable-line max-len
			}
		}
	}

	// Ensure reciprocal condition numbers are not less than threshold:
	anorm = Math.max( Math.abs( d[ offsetD ] ), Math.abs( d[ offsetD + ((k - 1) * strideD) ] ) ); // eslint-disable-line max-len
	if ( anorm === 0.0 ) {
		thresh = EPS;
	} else {
		thresh = Math.max( EPS * anorm, SAFMIN );
	}
	for ( i = 0; i < k; i++ ) {
		SEP[ offsetSEP + (i * strideSEP) ] = Math.max( SEP[ offsetSEP + (i * strideSEP) ], thresh ); // eslint-disable-line max-len
	}

	return 0;
}


// EXPORTS //

export default ddisna;
