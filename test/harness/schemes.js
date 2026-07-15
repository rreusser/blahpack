/**
* Storage schemes: the pluggable layer that realizes a logical matrix (logical.js)
* into a physical, poisoned, API-ready buffer AND yields the stride/offset
* argument list to splat into a routine's `ndarray` call.
*
* This is the abstraction that was missing: `(s1, s2, offset)` describes only ONE
* addressing scheme (dense strided). BLAS/LAPACK have several, encoded by the
* matrix type-code in the routine name:
*
*   - DENSE  (ge; and one triangle of sy/he/tr): `addr = offset + i*s1 + j*s2`.
*     Column-major, row-major, negative strides, and gaps are layouts WITHIN
*     this scheme.
*   - BANDED (gb/sb/hb/tb/pb): an (ldab x n) band array — itself dense-strided —
*     with the map `(i,j) -> (bandrow, j)`. Composes the dense scheme.
*   - PACKED (sp/hp/tp): a 1-D column-packed triangle with a stride;
*     `addr = offset + P(i,j)*stride`.
*
* Every scheme exposes the same seam:
*   realize(scalar, logicalM, spec, layout) -> { data, args, read(i,j) }
*     - `data`  : typed array to pass to the routine
*     - `args`  : the stride/offset arguments that follow `data` in the call
*     - `read`  : read a (referenced) element back out of physical storage
*   layouts(rng) -> [ layout, ... ]   // free physical layouts for invariance
*
* `spec` describes which elements the routine references (`part`: full/upper/
* lower, `unit` diagonal, `kl`/`ku`/`k`), so unreferenced slots stay poisoned and
* a routine that reads the wrong triangle / a unit diagonal / out of band trips a
* NaN.
*/

// HELPERS //

/**
* Low-level strided 2-D allocation in ELEMENT units, general over sign, order,
* gap, leading-dimension padding, base offset, and trailing pad. Backing is
* poisoned by the scalar trait's `alloc`.
*
* @private
* @returns {Object} { data, s1, s2, offset, addr }
*/
function denseAlloc( scalar, rows, cols, layout ) {
	var L = layout || {};
	var order = L.order || 'col';
	var g = ( L.g === void 0 ) ? 1 : L.g;
	var sgn1 = ( L.sgn1 === void 0 ) ? 1 : L.sgn1;
	var sgn2 = ( L.sgn2 === void 0 ) ? 1 : L.sgn2;
	var extra = ( L.ldaExtra === void 0 ) ? 0 : L.ldaExtra;
	var lead = ( L.lead === void 0 ) ? 0 : L.lead;
	var tail = ( L.tail === void 0 ) ? 0 : L.tail;
	var s1;
	var s2;
	var lda;
	if ( order === 'row' ) {
		lda = ( cols * g ) + extra;
		s2 = sgn2 * g;
		s1 = sgn1 * Math.max( lda, 1 );
	} else {
		lda = ( rows * g ) + extra;
		s1 = sgn1 * g;
		s2 = sgn2 * Math.max( lda, 1 );
	}
	if ( rows === 0 || cols === 0 ) {
		return {
			'data': scalar.alloc( lead + tail + 1 ),
			's1': s1,
			's2': s2,
			'offset': lead,
			'addr': function addr() { return lead; }
		};
	}
	var minRel = ( s1 < 0 ? ( rows - 1 ) * s1 : 0 ) + ( s2 < 0 ? ( cols - 1 ) * s2 : 0 );
	var maxRel = ( s1 > 0 ? ( rows - 1 ) * s1 : 0 ) + ( s2 > 0 ? ( cols - 1 ) * s2 : 0 );
	var offset = lead - minRel;
	var len = lead + ( maxRel - minRel ) + 1 + tail;
	var data = scalar.alloc( len );
	return {
		'data': data,
		's1': s1,
		's2': s2,
		'offset': offset,
		'addr': function addr( i, j ) {
			return offset + ( i * s1 ) + ( j * s2 );
		}
	};
}

/**
* Whether (i,j) is referenced given spec.part / spec.unit.
*
* @private
*/
function referenced( spec, i, j ) {
	var part = spec.part || 'full';
	if ( spec.unit && i === j ) {
		return false; // implicit unit diagonal — never stored/read
	}
	if ( part === 'upper' ) {
		return i <= j;
	}
	if ( part === 'lower' ) {
		return i >= j;
	}
	return true;
}

/** Cross product of a few discrete layout knobs into a curated list. @private */
function denseLayouts() {
	return [
		{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 0, 'lead': 0, 'tail': 0 }, // tight col-major
		{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 3, 'lead': 2, 'tail': 1 }, // padded col-major
		{ 'order': 'row', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 0, 'lead': 4, 'tail': 0 }, // ROW-major
		{ 'order': 'row', 'sgn1': 1, 'sgn2': 1, 'g': 2, 'ldaExtra': 1, 'lead': 0, 'tail': 3 }, // row-major, gapped
		{ 'order': 'col', 'sgn1': -1, 'sgn2': 1, 'g': 1, 'ldaExtra': 2, 'lead': 5, 'tail': 2 }, // neg row stride
		{ 'order': 'col', 'sgn1': 1, 'sgn2': -1, 'g': 1, 'ldaExtra': 0, 'lead': 3, 'tail': 1 }, // neg col stride
		{ 'order': 'row', 'sgn1': -1, 'sgn2': -1, 'g': 1, 'ldaExtra': 1, 'lead': 6, 'tail': 0 } // both neg, row-major
	];
}


// SCHEMES //

/**
* Dense scheme (ge, and one triangle of sy/he/tr).
*/
var dense = {
	'name': 'dense',
	'layouts': function layouts() {
		return denseLayouts();
	},
	'realize': function realize( scalar, M, spec, layout ) {
		var A = denseAlloc( scalar, M.rows, M.cols, layout );
		var i;
		var j;
		for ( j = 0; j < M.cols; j++ ) {
			for ( i = 0; i < M.rows; i++ ) {
				if ( referenced( spec, i, j ) ) {
					scalar.write( A.data, A.addr( i, j ), M.get( i, j ) );
				}
			}
		}
		return {
			'data': A.data,
			'args': [ A.s1, A.s2, A.offset ],
			'read': function read( i, j ) {
				return scalar.read( A.data, A.addr( i, j ) );
			}
		};
	}
};

/**
* Banded scheme (gb: general with kl/ku; sb/hb/tb/pb: symmetric/Hermitian/
* triangular band with half-bandwidth k and uplo). The band array is dense, so
* its physical layout is fuzzed exactly like a dense matrix.
*
* Band-row map:
*   gb              : bandrow = ku + i - j
*   sb/hb/tb upper  : bandrow = k  + i - j   (referenced: max(0,j-k) <= i <= j)
*   sb/hb/tb lower  : bandrow = i - j        (referenced: j <= i <= min(n-1,j+k))
*/
var banded = {
	'name': 'banded',
	'layouts': function layouts() {
		return denseLayouts();
	},
	'realize': function realize( scalar, M, spec, layout ) {
		var n = M.cols;
		var m = M.rows;
		var general = ( spec.kl !== void 0 );
		var kl = general ? spec.kl : ( spec.part === 'lower' ? spec.k : 0 );
		var ku = general ? spec.ku : ( spec.part === 'lower' ? 0 : spec.k );
		var ldab = kl + ku + 1;
		var A = denseAlloc( scalar, ldab, n, layout );

		function bandrow( i, j ) {
			return ku + i - j; // valid for gb; for sb-upper ku=k; sb-lower ku=0
		}
		function inBand( i, j ) {
			return i >= Math.max( 0, j - ku ) && i <= Math.min( m - 1, j + kl );
		}
		var i;
		var j;
		for ( j = 0; j < n; j++ ) {
			for ( i = 0; i < m; i++ ) {
				if ( inBand( i, j ) && referenced( spec, i, j ) ) {
					scalar.write( A.data, A.addr( bandrow( i, j ), j ), M.get( i, j ) );
				}
			}
		}
		return {
			'data': A.data,
			'args': [ A.s1, A.s2, A.offset ],
			'read': function read( i, j ) {
				return scalar.read( A.data, A.addr( bandrow( i, j ), j ) );
			}
		};
	}
};

/**
* Packed scheme (sp/hp/tp): column-packed triangle with a stride.
*
* Packed linear index:
*   upper: P(i,j) = i + j*(j+1)/2                 (i <= j)
*   lower: P(i,j) = (i - j) + j*(2N - j + 1)/2     (i >= j)
*/
var packed = {
	'name': 'packed',
	'layouts': function layouts() {
		return [
			{ 'stride': 1, 'lead': 0, 'tail': 0 },
			{ 'stride': 1, 'lead': 3, 'tail': 2 },
			{ 'stride': 2, 'lead': 0, 'tail': 1 },
			{ 'stride': 3, 'lead': 2, 'tail': 0 },
			{ 'stride': -1, 'lead': 4, 'tail': 1 },
			{ 'stride': -2, 'lead': 1, 'tail': 2 }
		];
	},
	'realize': function realize( scalar, M, spec, layout ) {
		var n = M.cols;
		var upper = ( spec.part || 'upper' ) === 'upper';
		var L = layout || {};
		var stride = ( L.stride === void 0 ) ? 1 : L.stride;
		var lead = ( L.lead === void 0 ) ? 0 : L.lead;
		var tail = ( L.tail === void 0 ) ? 0 : L.tail;
		var npk = ( n * ( n + 1 ) ) / 2;

		function P( i, j ) {
			if ( upper ) {
				return i + ( ( j * ( j + 1 ) ) / 2 );
			}
			return ( i - j ) + ( ( j * ( ( 2 * n ) - j + 1 ) ) / 2 );
		}
		// P ranges over 0..npk-1 contiguously, so span uses those extremes:
		var minRel = ( stride < 0 ) ? ( npk - 1 ) * stride : 0;
		var maxRel = ( stride > 0 ) ? ( npk - 1 ) * stride : 0;
		var offset = lead - minRel;
		var len = ( npk === 0 ) ? ( lead + tail + 1 ) : ( lead + ( maxRel - minRel ) + 1 + tail );
		var data = scalar.alloc( len );

		function addr( i, j ) {
			return offset + ( P( i, j ) * stride );
		}
		var i;
		var j;
		for ( j = 0; j < n; j++ ) {
			for ( i = 0; i < n; i++ ) {
				if ( ( upper ? i <= j : i >= j ) && referenced( spec, i, j ) ) {
					scalar.write( data, addr( i, j ), M.get( i, j ) );
				}
			}
		}
		return {
			'data': data,
			'args': [ stride, offset ],
			'read': function read( i, j ) {
				return scalar.read( data, addr( i, j ) );
			}
		};
	}
};


// VECTORS //

/**
* Realize a logical vector (plain array of scalar values) into strided,
* poisoned storage. Layout: { stride, lead, tail }; stride may be negative.
*
* @returns {Object} { data, args:[stride,offset], read(i) }
*/
function realizeVector( scalar, values, layout ) {
	var L = layout || {};
	var stride = ( L.stride === void 0 ) ? 1 : L.stride;
	var lead = ( L.lead === void 0 ) ? 0 : L.lead;
	var tail = ( L.tail === void 0 ) ? 0 : L.tail;
	var n = values.length;
	var span = ( n > 0 ) ? ( n - 1 ) * Math.abs( stride ) : 0;
	var offset = ( stride < 0 ) ? ( lead + span ) : lead;
	var len = lead + span + tail + 1;
	var data = scalar.alloc( len );
	var i;
	for ( i = 0; i < n; i++ ) {
		scalar.write( data, offset + ( i * stride ), values[ i ] );
	}
	return {
		'data': data,
		'args': [ stride, offset ],
		'read': function read( i ) {
			return scalar.read( data, offset + ( i * stride ) );
		}
	};
}

function vectorLayouts() {
	return [
		{ 'stride': 1, 'lead': 0, 'tail': 0 },
		{ 'stride': 1, 'lead': 3, 'tail': 2 },
		{ 'stride': 2, 'lead': 1, 'tail': 0 },
		{ 'stride': 3, 'lead': 0, 'tail': 3 },
		{ 'stride': -1, 'lead': 4, 'tail': 1 },
		{ 'stride': -2, 'lead': 2, 'tail': 2 }
	];
}


// EXPORTS //

export { dense, banded, packed, realizeVector, vectorLayouts, denseAlloc };
