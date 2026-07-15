/**
* Norms over the scalar trait, computed independently of the library.
* Operate on LogicalMatrix objects or arrays of scalar values.
*/

// MAIN //

/**
* 2-norm of an array of scalar values.
*
* @param {Object} scalar - scalar trait
* @param {Array} a - scalar values
* @returns {number}
*/
function norm2( scalar, a ) {
	var s = 0.0;
	var m;
	var i;
	for ( i = 0; i < a.length; i++ ) {
		m = scalar.abs( a[ i ] );
		s += m * m;
	}
	return Math.sqrt( s );
}

/**
* Frobenius norm of a LogicalMatrix.
*
* @param {Object} scalar - scalar trait
* @param {LogicalMatrix} M
* @returns {number}
*/
function frobenius( scalar, M ) {
	var s = 0.0;
	var m;
	var i;
	var j;
	for ( i = 0; i < M.rows; i++ ) {
		for ( j = 0; j < M.cols; j++ ) {
			m = scalar.abs( M.get( i, j ) );
			s += m * m;
		}
	}
	return Math.sqrt( s );
}

/**
* Max modulus over a LogicalMatrix.
*
* @param {Object} scalar - scalar trait
* @param {LogicalMatrix} M
* @returns {number}
*/
function maxAbs( scalar, M ) {
	var mx = 0.0;
	var m;
	var i;
	var j;
	for ( i = 0; i < M.rows; i++ ) {
		for ( j = 0; j < M.cols; j++ ) {
			m = scalar.abs( M.get( i, j ) );
			if ( m > mx ) {
				mx = m;
			}
		}
	}
	return mx;
}


// EXPORTS //

export { norm2, frobenius, maxAbs };
