/**
* Logical (storage-agnostic) matrices: the mathematical objects the harness
* generates and checks against, independent of any physical storage scheme.
*
* A `LogicalMatrix` holds element VALUES in the scalar trait's representation
* (numbers for real, `{re,im}` for complex) and exposes `get(i,j)` / `set(i,j)`.
* Structure (symmetry, Hermitian, positive-definiteness, triangularity,
* bandwidth) is imposed here, once, against the scalar trait — so the same code
* produces a real symmetric matrix and a complex Hermitian one. Physical layout
* (dense strided, banded, packed; column- or row-major; strides; offsets) is the
* separate concern of the storage schemes, which read values back out of a
* logical matrix via `get`.
*
* Each constructor tags the result with `.meta` describing its structure so a
* storage scheme knows how to pack it (uplo, kl/ku, half-bandwidth k, unit
* diagonal, ...).
*/

// MAIN //

class LogicalMatrix {
	/**
	* @param {Object} scalar - scalar trait (see scalar.js)
	* @param {number} rows
	* @param {number} cols
	*/
	constructor( scalar, rows, cols ) {
		this.scalar = scalar;
		this.rows = rows;
		this.cols = cols;
		this._v = new Array( rows * cols ).fill( scalar.zero );
		this.meta = { 'kind': 'general' };
	}

	get( i, j ) {
		return this._v[ i + ( j * this.rows ) ];
	}

	set( i, j, v ) {
		this._v[ i + ( j * this.rows ) ] = v;
		return this;
	}

	/**
	* Deep copy (values + meta).
	*
	* @returns {LogicalMatrix}
	*/
	copy() {
		var out = new LogicalMatrix( this.scalar, this.rows, this.cols );
		out._v = this._v.slice();
		out.meta = Object.assign( {}, this.meta );
		return out;
	}
}


// CONSTRUCTORS //

/**
* Dense general m x n matrix of trait-random entries.
*/
function general( scalar, rng, m, n ) {
	var M = new LogicalMatrix( scalar, m, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			M.set( i, j, scalar.random( rng ) );
		}
	}
	M.meta = { 'kind': 'general' };
	return M;
}

/**
* Symmetric n x n matrix: `A(j,i) = A(i,j)` (NO conjugation; complex-symmetric).
*/
function symmetric( scalar, rng, n ) {
	var M = new LogicalMatrix( scalar, n, n );
	var v;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = j; i < n; i++ ) {
			v = scalar.random( rng );
			M.set( i, j, v );
			M.set( j, i, v );
		}
	}
	M.meta = { 'kind': 'symmetric' };
	return M;
}

/**
* Hermitian n x n matrix: `A(j,i) = conj(A(i,j))`, real diagonal. For a real
* scalar this is exactly a symmetric matrix.
*/
function hermitian( scalar, rng, n ) {
	var M = new LogicalMatrix( scalar, n, n );
	var v;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = j; i < n; i++ ) {
			if ( i === j ) {
				M.set( i, i, scalar.fromReal( rng.normal() ) ); // real diagonal
			} else {
				v = scalar.random( rng );
				M.set( i, j, v );
				M.set( j, i, scalar.conj( v ) );
			}
		}
	}
	M.meta = { 'kind': 'hermitian' };
	return M;
}

/**
* Hermitian (SPD/HPD) positive-definite n x n matrix via strict diagonal
* dominance with a positive real diagonal.
*/
function positiveDefinite( scalar, rng, n ) {
	var M = hermitian( scalar, rng, n );
	var s;
	var i;
	var j;
	for ( i = 0; i < n; i++ ) {
		s = 0.0;
		for ( j = 0; j < n; j++ ) {
			if ( j !== i ) {
				s += scalar.abs( M.get( i, j ) );
			}
		}
		M.set( i, i, scalar.fromReal( s + 1.0 + rng.between( 0.5, 1.5 ) ) );
	}
	M.meta = { 'kind': 'hermitian', 'definite': true };
	return M;
}

/**
* Triangular n x n matrix; the opposite triangle is exact zero. Diagonally
* dominant (well-conditioned for solves). Unit diagonal stores 1.
*
* @param {Object} opts - { uplo: 'upper'|'lower', unit: boolean }
*/
function triangular( scalar, rng, n, opts ) {
	var o = opts || {};
	var upper = ( o.uplo || 'upper' )[ 0 ].toLowerCase() === 'u';
	var unit = !!o.unit;
	var M = new LogicalMatrix( scalar, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( i === j ) {
				M.set( i, j, unit ? scalar.one : scalar.fromReal( ( n + 1.0 ) * rng.sign() ) );
			} else if ( ( upper && i < j ) || ( !upper && i > j ) ) {
				M.set( i, j, scalar.random( rng ) );
			} else {
				M.set( i, j, scalar.zero );
			}
		}
	}
	M.meta = { 'kind': 'triangular', 'uplo': upper ? 'upper' : 'lower', 'unit': unit };
	return M;
}

/**
* General banded m x n matrix with lower/upper bandwidths (kl, ku); zero outside
* the band.
*/
function banded( scalar, rng, m, n, kl, ku ) {
	var M = new LogicalMatrix( scalar, m, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = Math.max( 0, j - ku ); i <= Math.min( m - 1, j + kl ); i++ ) {
			M.set( i, j, scalar.random( rng ) );
		}
	}
	M.meta = { 'kind': 'banded', 'kl': kl, 'ku': ku };
	return M;
}

/**
* Hermitian banded n x n matrix of half-bandwidth k (zero outside band). Real
* diagonal.
*/
function hermitianBanded( scalar, rng, n, k ) {
	var M = new LogicalMatrix( scalar, n, n );
	var v;
	var i;
	var j;
	for ( i = 0; i < n; i++ ) {
		M.set( i, i, scalar.fromReal( rng.normal() ) );
	}
	for ( j = 0; j < n; j++ ) {
		for ( i = j + 1; i <= Math.min( n - 1, j + k ); i++ ) {
			v = scalar.random( rng );
			M.set( i, j, v );
			M.set( j, i, scalar.conj( v ) );
		}
	}
	M.meta = { 'kind': 'hermitian', 'k': k, 'banded': true };
	return M;
}

/**
* Hermitian positive-definite banded n x n matrix of half-bandwidth k. Diagonal
* dominance restricted to the band => positive-definite, bandwidth preserved.
*/
function positiveDefiniteBanded( scalar, rng, n, k ) {
	var M = hermitianBanded( scalar, rng, n, k );
	var s;
	var i;
	var j;
	for ( i = 0; i < n; i++ ) {
		s = 0.0;
		for ( j = Math.max( 0, i - k ); j <= Math.min( n - 1, i + k ); j++ ) {
			if ( j !== i ) {
				s += scalar.abs( M.get( i, j ) );
			}
		}
		M.set( i, i, scalar.fromReal( s + 1.0 + rng.between( 0.5, 1.5 ) ) );
	}
	M.meta = { 'kind': 'hermitian', 'k': k, 'banded': true, 'definite': true };
	return M;
}

/**
* Triangular banded n x n matrix of half-bandwidth k; exact zero outside the band
* AND in the opposite triangle. Diagonally dominant (well-conditioned for solves);
* a unit diagonal stores 1. Pairs with `schemes.banded` under spec
* `{ part:uplo, k, unit }` (upper => kl=0/ku=k, lower => kl=k/ku=0), matching the
* standard `tb` band-storage map.
*
* @param {Object} scalar - scalar trait
* @param {Object} rng - RNG
* @param {number} n - order
* @param {number} k - half-bandwidth
* @param {Object} opts - { uplo:'upper'|'lower', unit:boolean }
* @returns {LogicalMatrix}
*/
function triangularBanded( scalar, rng, n, k, opts ) {
	var o = opts || {};
	var upper = ( o.uplo || 'upper' )[ 0 ].toLowerCase() === 'u';
	var unit = !!o.unit;
	var M = new LogicalMatrix( scalar, n, n ); // inits to scalar.zero everywhere
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		M.set( j, j, unit ? scalar.one : scalar.fromReal( ( n + 1.0 ) * rng.sign() ) );
		if ( upper ) {
			for ( i = Math.max( 0, j - k ); i < j; i++ ) {
				M.set( i, j, scalar.random( rng ) );
			}
		} else {
			for ( i = j + 1; i <= Math.min( n - 1, j + k ); i++ ) {
				M.set( i, j, scalar.random( rng ) );
			}
		}
	}
	M.meta = { 'kind': 'triangular', 'uplo': upper ? 'upper' : 'lower', 'unit': unit, 'k': k, 'banded': true };
	return M;
}


// EXPORTS //

export {
	LogicalMatrix,
	general,
	symmetric,
	hermitian,
	positiveDefinite,
	triangular,
	banded,
	hermitianBanded,
	positiveDefiniteBanded,
	triangularBanded
};
