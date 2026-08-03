'use strict';

// The deterministic strided projection: base.js (offset form) → <routine>.js
// (strided form). Encodes the resolved, stdlib-deferred conventions from
// lint/CONVENTIONS.md (D1–D3) with no wiggle room.
//
//   2-D matrix `A, strideA1, strideA2, offsetA`  → `A, LD<A>`    (+ triggers order)
//   packed matrix `AP, strideAP, offsetAP`       → `AP`          (+ triggers order)
//   1-D workspace `WORK, strideWork, offsetWork`  → `WORK`        (no stride: scratch)
//   1-D vector/index `x, strideX, offsetX`        → `x, strideX`  (keep stride, drop offset)
//   complex scalar `x, offsetX`                   → `x`           (drop offset)
//   scalar / dimension / character                → unchanged
//   prepend `order` iff the routine has a matrix argument (2-D, packed, or banded)
//
// The offset is never present in the strided form (computed internally via
// stride2offset). `order` never appears in the ndarray form.
//
// Banded matrices are stored as 2-D arrays in base.js, so they are handled by
// the 2-D case. A packed matrix is stored as a 1-D triangle: it is a matrix (so
// it takes `order` and no stride), identified from the routine's storage code —
// `sp`/`hp`/`tp`/`pp` (symmetric/Hermitian/triangular/positive-definite packed)
// — plus the conventional packed-matrix name suffix `…P` (AP, AFP, BP).

// A workspace array by conventional name: WORK, IWORK, RWORK, SWORK, WORKD,
// WORKL, WORK2, …
var WORKSPACE_RE = /^[a-z]?work[a-z0-9]*$/i;

// Packed storage codes (chars 2–3 of a BLAS/LAPACK routine name).
var PACKED_CODES = { 'sp': true, 'hp': true, 'tp': true, 'pp': true };

function isStride( x ) {
	return /^stride/i.test( x );
}
function isOffset( x ) {
	return /^offset/i.test( x );
}
function isWorkspace( name ) {
	return WORKSPACE_RE.test( name );
}

// The 2-letter storage code of a routine name (e.g. dspmv → "sp", zhpr → "hp").
function storageCode( routine ) {
	return String( routine || '' ).slice( 1, 3 ).toLowerCase();
}

// Is array `name` the packed matrix of routine `routine`? Packed-storage routine
// + a packed-matrix name (ends in "P": AP, AFP, BP).
function isPackedMatrix( name, routine ) {
	return PACKED_CODES[ storageCode( routine ) ] === true && /p$/i.test( name );
}

// Project an offset-form parameter list (base.js) to the strided form.
//   opts.routine — the routine name, used to identify packed matrices.
// Returns { params: [...], hasMatrix: bool }.
function project( base, opts ) {
	opts = opts || {};
	var routine = opts.routine || '';
	var out = [];
	var hasMatrix = false;
	var i = 0;
	while ( i < base.length ) {
		var p = base[ i ];
		var n1 = base[ i + 1 ] || '';
		var n2 = base[ i + 2 ] || '';
		var n3 = base[ i + 3 ] || '';

		// 2-D array (incl. banded): P, strideP1, strideP2, offsetP  →  P, LD<P>
		if ( isStride( n1 ) && isStride( n2 ) && isOffset( n3 ) ) {
			out.push( p, 'LD' + p.toUpperCase() );
			if ( !isWorkspace( p ) ) {
				hasMatrix = true;
			}
			i += 4;
			continue;
		}
		// 1-D array: P, strideP, offsetP
		if ( isStride( n1 ) && isOffset( n2 ) ) {
			if ( isPackedMatrix( p, routine ) ) {
				out.push( p );               // packed matrix: no stride
				hasMatrix = true;            // …and it takes `order`
			} else if ( isWorkspace( p ) ) {
				out.push( p );               // workspace: no stride
			} else {
				out.push( p, n1 );           // vector/index: keep the stride
			}
			i += 3;
			continue;
		}
		// complex scalar as array: P, offsetP  →  P. The offset must be suffixed
		// (`offsetX`), never a bare `offset` — that is a standalone scalar
		// parameter (e.g. dlaqp2's row count), not this argument's offset.
		if ( isOffset( n1 ) && n1.toLowerCase() !== 'offset' ) {
			out.push( p );
			i += 2;
			continue;
		}
		// plain scalar / dimension / character
		out.push( p );
		i += 1;
	}
	return {
		'params': hasMatrix ? [ 'order' ].concat( out ) : out,
		'hasMatrix': hasMatrix
	};
}

module.exports = {
	'project': project,
	'isWorkspace': isWorkspace,
	'isPackedMatrix': isPackedMatrix,
	'storageCode': storageCode
};
