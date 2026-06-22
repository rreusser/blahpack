
// VARIABLES //

var ZERO = 0.0;

// MAIN //

/**
* Sets a scalar multiple of the first column of the product.
* (H - (sr1 + i_si1)_I)_(H - (sr2 + i_si2)*I), scaling to avoid
* overflows and most underflows.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix H (must be 2 or 3)
* @param {Float64Array} H - input matrix
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {number} sr1 - real part of first shift
* @param {number} si1 - imaginary part of first shift
* @param {number} sr2 - real part of second shift
* @param {number} si2 - imaginary part of second shift
* @param {Float64Array} v - output array of length N
* @param {integer} strideV - stride length for `v`
* @param {NonNegativeInteger} offsetV - starting index for `v`
*/
function dlaqr1( N, H, strideH1, strideH2, offsetH, sr1, si1, sr2, si2, v, strideV, offsetV ) { // eslint-disable-line max-len, max-params
	var h21s;
	var h31s;
	var s;

	// Quick return if possible:
	if ( N !== 2 && N !== 3 ) {
		return;
	}

	if ( N === 2 ) {
		// s = |H(1,1) - sr2| + |si2| + |H(2,1)|
		s = Math.abs( H[ offsetH ] - sr2 ) +
			Math.abs( si2 ) +
			Math.abs( H[ offsetH + strideH1 ] );

		if ( s === ZERO ) {
			v[ offsetV ] = ZERO;
			v[ offsetV + strideV ] = ZERO;
		} else {
			h21s = H[ offsetH + strideH1 ] / s;
			v[ offsetV ] = ( h21s * H[ offsetH + strideH2 ] ) +
				( ( H[ offsetH ] - sr1 ) * ( ( H[ offsetH ] - sr2 ) / s ) ) -
				( si1 * ( si2 / s ) );
			v[ offsetV + strideV ] = h21s * ( H[ offsetH ] + H[ offsetH + strideH1 + strideH2 ] - sr1 - sr2 );
		}
	} else {
		// N === 3
		// s = |H(1,1) - sr2| + |si2| + |H(2,1)| + |H(3,1)|
		s = Math.abs( H[ offsetH ] - sr2 ) +
			Math.abs( si2 ) +
			Math.abs( H[ offsetH + strideH1 ] ) +
			Math.abs( H[ offsetH + ( 2 * strideH1 ) ] );

		if ( s === ZERO ) {
			v[ offsetV ] = ZERO;
			v[ offsetV + strideV ] = ZERO;
			v[ offsetV + ( 2 * strideV ) ] = ZERO;
		} else {
			h21s = H[ offsetH + strideH1 ] / s;
			h31s = H[ offsetH + ( 2 * strideH1 ) ] / s;
			v[ offsetV ] = ( ( H[ offsetH ] - sr1 ) * ( ( H[ offsetH ] - sr2 ) / s ) ) -
				( si1 * ( si2 / s ) ) +
				( H[ offsetH + strideH2 ] * h21s ) +
				( H[ offsetH + ( 2 * strideH2 ) ] * h31s );
			v[ offsetV + strideV ] = ( h21s * ( H[ offsetH ] + H[ offsetH + strideH1 + strideH2 ] - sr1 - sr2 ) ) +
				( H[ offsetH + strideH1 + ( 2 * strideH2 ) ] * h31s );
			v[ offsetV + ( 2 * strideV ) ] = ( h31s * ( H[ offsetH ] + H[ offsetH + ( 2 * strideH1 ) + ( 2 * strideH2 ) ] - sr1 - sr2 ) ) +
				( h21s * H[ offsetH + ( 2 * strideH1 ) + strideH2 ] );
		}
	}
}


// EXPORTS //

export default dlaqr1;
