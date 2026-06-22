
// MODULES //

var abs = Math.abs;


// MAIN //

/**
* Solves a general real tridiagonal system of linear equations A * X = B.
* using Gaussian elimination with partial pivoting.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix A
* @param {integer} nrhs - number of right hand sides
* @param {Float64Array} DL - sub-diagonal elements (length N-1)
* @param {integer} strideDL - stride length for `DL`
* @param {NonNegativeInteger} offsetDL - starting index for `DL`
* @param {Float64Array} d - diagonal elements (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} DU - super-diagonal elements (length N-1)
* @param {integer} strideDU - stride length for `DU`
* @param {NonNegativeInteger} offsetDU - starting index for `DU`
* @param {Float64Array} B - right hand side matrix (N x nrhs)
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @returns {integer} status code (0 = success)
*/
function dgtsv( N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, B, strideB1, strideB2, offsetB ) { // eslint-disable-line max-len, max-params
	var fact;
	var temp;
	var idl;
	var idu;
	var id;
	var ib;
	var jb;
	var i;
	var j;

	if ( N === 0 ) {
		return 0;
	}

	// Pointer variables for current positions:
	// idl = offsetDL + i*strideDL  (subdiag, 0-based i)
	// id  = offsetD  + i*strideD   (diag, 0-based i)
	// idu = offsetDU + i*strideDU  (superdiag, 0-based i)

	if ( nrhs === 1 ) {
		// Single RHS: optimized path (no inner j loop)
		// Forward elimination: i = 0 .. N-3
		idl = offsetDL;
		id = offsetD;
		idu = offsetDU;
		ib = offsetB;

		for ( i = 0; i < N - 2; i++ ) {
			if ( abs( d[ id ] ) >= abs( DL[ idl ] ) ) {
				// No row interchange required
				if ( d[ id ] !== 0.0 ) {
					fact = DL[ idl ] / d[ id ];
					d[ id + strideD ] -= fact * DU[ idu ];
					B[ ib + strideB1 ] -= fact * B[ ib ];
				} else {
					return i + 1; // INFO = i+1 (1-based)
				}
				DL[ idl ] = 0.0;
			} else {
				// Interchange rows i and i+1
				fact = d[ id ] / DL[ idl ];
				d[ id ] = DL[ idl ];
				temp = d[ id + strideD ];
				d[ id + strideD ] = DU[ idu ] - fact * temp;
				DL[ idl ] = DU[ idu + strideDU ];
				DU[ idu + strideDU ] = -fact * DL[ idl ];
				DU[ idu ] = temp;
				temp = B[ ib ];
				B[ ib ] = B[ ib + strideB1 ];
				B[ ib + strideB1 ] = temp - fact * B[ ib + strideB1 ];
			}
			idl += strideDL;
			id += strideD;
			idu += strideDU;
			ib += strideB1;
		}

		// Handle i = N-2 (last elimination step, if N > 1)
		if ( N > 1 ) {
			// idl, id, idu, ib already point to i = N-2
			if ( abs( d[ id ] ) >= abs( DL[ idl ] ) ) {
				if ( d[ id ] !== 0.0 ) {
					fact = DL[ idl ] / d[ id ];
					d[ id + strideD ] -= fact * DU[ idu ];
					B[ ib + strideB1 ] -= fact * B[ ib ];
				} else {
					return N - 1; // INFO = N-1 (1-based)
				}
			} else {
				fact = d[ id ] / DL[ idl ];
				d[ id ] = DL[ idl ];
				temp = d[ id + strideD ];
				d[ id + strideD ] = DU[ idu ] - fact * temp;
				DU[ idu ] = temp;
				temp = B[ ib ];
				B[ ib ] = B[ ib + strideB1 ];
				B[ ib + strideB1 ] = temp - fact * B[ ib + strideB1 ];
			}
		}

		// Check last diagonal
		if ( d[ offsetD + ( N - 1 ) * strideD ] === 0.0 ) {
			return N;
		}
	} else {
		// Multiple RHS path
		idl = offsetDL;
		id = offsetD;
		idu = offsetDU;
		ib = offsetB;

		for ( i = 0; i < N - 2; i++ ) {
			if ( abs( d[ id ] ) >= abs( DL[ idl ] ) ) {
				// No row interchange required
				if ( d[ id ] !== 0.0 ) {
					fact = DL[ idl ] / d[ id ];
					d[ id + strideD ] -= fact * DU[ idu ];
					jb = ib;
					for ( j = 0; j < nrhs; j++ ) {
						B[ jb + strideB1 ] -= fact * B[ jb ];
						jb += strideB2;
					}
				} else {
					return i + 1;
				}
				DL[ idl ] = 0.0;
			} else {
				// Interchange rows i and i+1
				fact = d[ id ] / DL[ idl ];
				d[ id ] = DL[ idl ];
				temp = d[ id + strideD ];
				d[ id + strideD ] = DU[ idu ] - fact * temp;
				DL[ idl ] = DU[ idu + strideDU ];
				DU[ idu + strideDU ] = -fact * DL[ idl ];
				DU[ idu ] = temp;
				jb = ib;
				for ( j = 0; j < nrhs; j++ ) {
					temp = B[ jb ];
					B[ jb ] = B[ jb + strideB1 ];
					B[ jb + strideB1 ] = temp - fact * B[ jb + strideB1 ];
					jb += strideB2;
				}
			}
			idl += strideDL;
			id += strideD;
			idu += strideDU;
			ib += strideB1;
		}

		// Handle i = N-2 (last elimination step, if N > 1)
		if ( N > 1 ) {
			if ( abs( d[ id ] ) >= abs( DL[ idl ] ) ) {
				if ( d[ id ] !== 0.0 ) {
					fact = DL[ idl ] / d[ id ];
					d[ id + strideD ] -= fact * DU[ idu ];
					jb = ib;
					for ( j = 0; j < nrhs; j++ ) {
						B[ jb + strideB1 ] -= fact * B[ jb ];
						jb += strideB2;
					}
				} else {
					return N - 1;
				}
			} else {
				fact = d[ id ] / DL[ idl ];
				d[ id ] = DL[ idl ];
				temp = d[ id + strideD ];
				d[ id + strideD ] = DU[ idu ] - fact * temp;
				DU[ idu ] = temp;
				jb = ib;
				for ( j = 0; j < nrhs; j++ ) {
					temp = B[ jb ];
					B[ jb ] = B[ jb + strideB1 ];
					B[ jb + strideB1 ] = temp - fact * B[ jb + strideB1 ];
					jb += strideB2;
				}
			}
		}

		// Check last diagonal
		if ( d[ offsetD + ( N - 1 ) * strideD ] === 0.0 ) {
			return N;
		}
	}

	// Back solve with the matrix U from the factorization
	backSolve( N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, B, strideB1, strideB2, offsetB ); // eslint-disable-line max-len

	return 0;
}

/**
* Back substitution: solve U * X = B where U is the upper triangular factor.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {integer} nrhs - number of right hand sides
* @param {Float64Array} DL - second superdiagonal from factorization
* @param {integer} strideDL - stride for DL
* @param {NonNegativeInteger} offsetDL - offset for DL
* @param {Float64Array} d - diagonal of U
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - offset for d
* @param {Float64Array} DU - first superdiagonal of U
* @param {integer} strideDU - stride for DU
* @param {NonNegativeInteger} offsetDU - offset for DU
* @param {Float64Array} B - right hand side / solution
* @param {integer} strideB1 - row stride for B
* @param {integer} strideB2 - column stride for B
* @param {NonNegativeInteger} offsetB - offset for B
*/
function backSolve( N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, B, strideB1, strideB2, offsetB ) { // eslint-disable-line max-len, max-params
	var pNm1;
	var idu;
	var idl;
	var pN;
	var ib;
	var id;
	var i;
	var j;

	pN = offsetD + ( N - 1 ) * strideD;

	for ( j = 0; j < nrhs; j++ ) {
		ib = offsetB + ( N - 1 ) * strideB1 + j * strideB2;

		// B(N, j) = B(N, j) / D(N)
		B[ ib ] /= d[ pN ];

		if ( N > 1 ) {
			// B(N-1, j) = (B(N-1, j) - DU(N-1) * B(N, j)) / D(N-1)
			pNm1 = offsetD + ( N - 2 ) * strideD;
			B[ ib - strideB1 ] = ( B[ ib - strideB1 ] - DU[ offsetDU + ( N - 2 ) * strideDU ] * B[ ib ] ) / d[ pNm1 ];
		}

		// Back substitute: i = N-3 .. 0 (0-based)
		for ( i = N - 3; i >= 0; i-- ) {
			id = offsetD + i * strideD;
			idu = offsetDU + i * strideDU;
			idl = offsetDL + i * strideDL;
			ib = offsetB + i * strideB1 + j * strideB2;

			// B(i, j) = (B(i, j) - DU(i)*B(i+1, j) - DL(i)*B(i+2, j)) / D(i)
			B[ ib ] = ( B[ ib ] - DU[ idu ] * B[ ib + strideB1 ] - DL[ idl ] * B[ ib + 2 * strideB1 ] ) / d[ id ];
		}
	}
}


// EXPORTS //

export default dgtsv;
