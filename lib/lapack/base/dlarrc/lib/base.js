/* eslint-disable max-len */

// MAIN //

/**
* Counts the number of eigenvalues of a symmetric tridiagonal matrix in an interval.
*
* ## Notes
*
* -   Finds the number of eigenvalues of the symmetric tridiagonal matrix `T`
*     that are in the interval `(vl, vu]` if `jobt` is `'tridiagonal'`, and of
*     `L * D * L^T` if `jobt` is `'ldl'`.
*
* @private
* @param {string} jobt - specifies the matrix type: `'tridiagonal'` for matrix T, `'ldl'` for matrix `L * D * L^T`
* @param {NonNegativeInteger} N - order of the matrix
* @param {number} vl - lower bound for the eigenvalues
* @param {number} vu - upper bound for the eigenvalues
* @param {Float64Array} D - diagonal elements (length N)
* @param {integer} strideD - stride length for `D`
* @param {NonNegativeInteger} offsetD - starting index for `D`
* @param {Float64Array} E - off-diagonal elements (length N-1)
* @param {integer} strideE - stride length for `E`
* @param {NonNegativeInteger} offsetE - starting index for `E`
* @param {number} pivmin - minimum pivot in the Sturm sequence
* @returns {Object} object with `info`, `eigcnt`, `lcnt`, and `rcnt` properties
*/
function dlarrc( jobt, N, vl, vu, D, strideD, offsetD, E, strideE, offsetE, pivmin ) { // eslint-disable-line no-unused-vars, max-params
	var lpivot;
	var rpivot;
	var eigcnt;
	var lcnt;
	var rcnt;
	var tmp2;
	var tmp;
	var id;
	var ie;
	var sl;
	var su;
	var i;

	lcnt = 0;
	rcnt = 0;
	eigcnt = 0;

	// Quick return if possible:
	if ( N <= 0 ) {
		return {
			'info': 0,
			'eigcnt': 0,
			'lcnt': 0,
			'rcnt': 0
		};
	}

	if ( jobt === 'tridiagonal' ) {
		// Sturm sequence count on T:
		id = offsetD;
		ie = offsetE;

		lpivot = D[ id ] - vl;
		rpivot = D[ id ] - vu;
		if ( lpivot <= 0.0 ) {
			lcnt += 1;
		}
		if ( rpivot <= 0.0 ) {
			rcnt += 1;
		}
		for ( i = 0; i < N - 1; i += 1 ) {
			tmp = E[ ie + ( i * strideE ) ] * E[ ie + ( i * strideE ) ];
			lpivot = ( D[ id + ( ( i + 1 ) * strideD ) ] - vl ) - ( tmp / lpivot );
			rpivot = ( D[ id + ( ( i + 1 ) * strideD ) ] - vu ) - ( tmp / rpivot );
			if ( lpivot <= 0.0 ) {
				lcnt += 1;
			}
			if ( rpivot <= 0.0 ) {
				rcnt += 1;
			}
		}
	} else {
		// Sturm sequence count on L * D * L^T:
		id = offsetD;
		ie = offsetE;

		sl = -vl;
		su = -vu;
		for ( i = 0; i < N - 1; i += 1 ) {
			lpivot = D[ id + ( i * strideD ) ] + sl;
			rpivot = D[ id + ( i * strideD ) ] + su;
			if ( lpivot <= 0.0 ) {
				lcnt += 1;
			}
			if ( rpivot <= 0.0 ) {
				rcnt += 1;
			}
			tmp = E[ ie + ( i * strideE ) ] * D[ id + ( i * strideD ) ] * E[ ie + ( i * strideE ) ];

			tmp2 = tmp / lpivot;
			if ( tmp2 === 0.0 ) {
				sl = tmp - vl;
			} else {
				sl = ( sl * tmp2 ) - vl;
			}

			tmp2 = tmp / rpivot;
			if ( tmp2 === 0.0 ) {
				su = tmp - vu;
			} else {
				su = ( su * tmp2 ) - vu;
			}
		}
		lpivot = D[ id + ( ( N - 1 ) * strideD ) ] + sl;
		rpivot = D[ id + ( ( N - 1 ) * strideD ) ] + su;
		if ( lpivot <= 0.0 ) {
			lcnt += 1;
		}
		if ( rpivot <= 0.0 ) {
			rcnt += 1;
		}
	}
	eigcnt = rcnt - lcnt;

	return {
		'info': 0,
		'eigcnt': eigcnt,
		'lcnt': lcnt,
		'rcnt': rcnt
	};
}


// EXPORTS //

export default dlarrc;
