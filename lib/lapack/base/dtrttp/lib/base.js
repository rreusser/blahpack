// MAIN //

/**
* Copies a triangular matrix from full format (TR) to standard packed format (TP).
*
* @private
* @param {string} uplo - specifies whether `A` is upper or lower triangular (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input matrix in full storage
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} AP - output array in packed storage
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @returns {integer} status code (0 = success)
*/
function dtrttp( uplo, N, A, strideA1, strideA2, offsetA, AP, strideAP, offsetAP ) { // eslint-disable-line max-len, max-params
	var da;
	var k;
	var i;
	var j;

	k = offsetAP;
	if ( uplo === 'lower' ) {
		for ( j = 0; j < N; j++ ) {
			da = offsetA + ( j * strideA2 );
			for ( i = j; i < N; i++ ) {
				AP[ k ] = A[ da + ( i * strideA1 ) ];
				k += strideAP;
			}
		}
	} else {
		for ( j = 0; j < N; j++ ) {
			da = offsetA + ( j * strideA2 );
			for ( i = 0; i <= j; i++ ) {
				AP[ k ] = A[ da + ( i * strideA1 ) ];
				k += strideAP;
			}
		}
	}
	return 0;
}


// EXPORTS //

export default dtrttp;
