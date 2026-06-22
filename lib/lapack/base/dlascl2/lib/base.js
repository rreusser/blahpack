
// MAIN //

/**
* Performs diagonal scaling on a matrix: `X = D * X` where `D` is a diagonal matrix stored as a vector.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} d - scaling vector of length `M`
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} X - input/output matrix
* @param {integer} strideX1 - stride of the first dimension of `X`
* @param {integer} strideX2 - stride of the second dimension of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @returns {Float64Array} `X`
*/
function dlascl2( M, N, d, strideD, offsetD, X, strideX1, strideX2, offsetX ) { // eslint-disable-line max-len, max-params
	var ix;
	var id;
	var i;
	var j;

	for ( j = 0; j < N; j += 1 ) {
		ix = offsetX + ( j * strideX2 );
		id = offsetD;
		for ( i = 0; i < M; i += 1 ) {
			X[ ix ] *= d[ id ];
			ix += strideX1;
			id += strideD;
		}
	}
	return X;
}


// EXPORTS //

export default dlascl2;
