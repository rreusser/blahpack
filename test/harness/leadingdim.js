/**
* Leading-dimension conformance: the seam the property/layout harness could not
* see.
*
* The property and layout-invariance layers drive a routine's `ndarray` form
* (explicit `stride…, offset`) with operand buffers sized to the operand's full
* logical shape. That deliberately bypasses the leading-dimension WRAPPER
* (`<routine>.js`: `order` + `LDA`/`LDB` validation and the order→stride mapping),
* and it never stresses the case where a routine's OUTPUT occupies a larger region
* of a shared buffer than its INPUT (e.g. dgels with `M<N`: `B` grows from `M`
* input rows to `N` output rows in place). A wrong `LDB` constraint there is a
* silent out-of-bounds write, invisible to a harness that always over-sizes.
*
* This module closes that gap with an oracle taken from the MATHEMATICS, not from
* the wrapper's own code: for a matrix operand whose full (output-inclusive)
* logical shape is `rows × cols`, the required leading dimension is
*   - column-major: `max(1, rows)`
*   - row-major:    `max(1, cols)`
* The wrapper MUST reject anything below that (else the output overflows caller
* storage) and MUST accept it (else valid calls are rejected). Both directions are
* real, shipped bug classes.
*/

var real = {
	'alloc': function alloc( n ) {
		var d = new Float64Array( n );
		d.fill( NaN ); // poison
		return d;
	}
};


// MAIN //

/**
* Realize a dense matrix into a leading-dimension (LAPACK wrapper) buffer, poisoned
* in every slot the caller would not have initialized. Column-major addresses
* `(i,j)` at `j*ld + i`; row-major at `i*ld + j`. The buffer spans `ld*cols`
* (col-major) or `ld*rows` (row-major) — the standard wrapper allocation — so that
* an operand written past the `ld`-implied region lands out of bounds and reads
* back as a non-finite value.
*
* @param {string} order - 'column-major' | 'row-major'
* @param {number} rowsRef - number of referenced (initialized) input rows
* @param {number} colsRef - number of referenced input columns
* @param {number} rowsFull - full leading extent used to size the buffer's rows
* @param {number} colsFull - full trailing extent used to size the buffer's cols
* @param {number} ld - leading dimension to use
* @param {Function} val - `val(i,j)` supplies the referenced element value
* @returns {Object} { data, ld, read(i,j) }
*/
function realizeLD( order, rowsRef, colsRef, rowsFull, colsFull, ld, val ) {
	var col = ( order === 'column-major' );
	var len = col ? ( ld * colsFull ) : ( ld * rowsFull );
	var data = real.alloc( Math.max( len, 1 ) );
	var i;
	var j;
	function addr( a, b ) {
		return col ? ( ( b * ld ) + a ) : ( ( a * ld ) + b );
	}
	for ( j = 0; j < colsRef; j++ ) {
		for ( i = 0; i < rowsRef; i++ ) {
			data[ addr( i, j ) ] = val( i, j );
		}
	}
	return {
		'data': data,
		'ld': ld,
		'read': function read( a, b ) {
			var idx = addr( a, b );
			return ( idx >= 0 && idx < data.length ) ? data[ idx ] : void 0;
		}
	};
}

/**
* The mathematically-required minimum leading dimension for a `rows × cols`
* operand in `order`.
*/
function requiredLD( order, rows, cols ) {
	return Math.max( 1, ( order === 'column-major' ) ? rows : cols );
}

/**
* Assert a leading-dimension wrapper enforces exactly the required minimum. `call(
* ld )` must drive the wrapper with the operand under test at leading dimension
* `ld` (all OTHER operands at safe, valid dimensions), throwing a RangeError when
* the wrapper rejects `ld`.
*
*   - under-constrained bug: `call(required-1)` does NOT throw → the wrapper lets
*     the output overflow caller storage. FAIL.
*   - over-constrained bug: `call(required)` throws → the wrapper rejects a valid
*     call. FAIL (propagates).
*
* @param {Function} call - `call( ld )` drives the wrapper; throws on rejection.
* @param {number} required - required minimum leading dimension (from math).
* @param {string} label
*/
function assertLeadingDimGuard( call, required, label ) {
	var threw;
	if ( required > 1 ) {
		threw = false;
		try {
			call( required - 1 );
		} catch ( e ) {
			threw = true;
		}
		if ( !threw ) {
			throw new Error( label + ': wrapper ACCEPTED leading dimension ' + ( required - 1 ) + ' below the required minimum ' + required + ' — a routine whose output exceeds that extent overflows caller storage (silent out-of-bounds write).' );
		}
	}
	// At the required minimum the wrapper must accept (throws here => over-strict):
	call( required );
}


// EXPORTS //

export { realizeLD, requiredLD, assertLeadingDimGuard };
