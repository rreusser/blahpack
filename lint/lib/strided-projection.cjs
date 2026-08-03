'use strict';

// The deterministic strided projection: base.js (offset form) → <routine>.js
// (strided form). Encodes the resolved, stdlib-deferred conventions from
// lint/CONVENTIONS.md (D1–D3) with no wiggle room.
//
//   matrix `A, strideA1, strideA2, offsetA`  → `A, LD<A>`        (+ triggers order)
//   1-D workspace `WORK, strideWork, offsetWork` → `WORK`        (no stride: scratch)
//   1-D vector/index `x, strideX, offsetX`   → `x, strideX`      (keep stride, drop offset)
//   complex scalar `x, offsetX`              → `x`               (drop offset)
//   scalar / dimension / character           → unchanged
//   prepend `order` iff the routine has a (non-workspace) matrix argument
//
// The offset is never present in the strided form (computed internally via
// stride2offset). `order` never appears in the ndarray form.

// A workspace array by conventional name: WORK, IWORK, RWORK, SWORK, WORKD,
// WORKL, WORK2, …
var WORKSPACE_RE = /^[a-z]?work[a-z0-9]*$/i;

function isStride( x ) {
	return /^stride/i.test( x );
}
function isOffset( x ) {
	return /^offset/i.test( x );
}
function isWorkspace( name ) {
	return WORKSPACE_RE.test( name );
}

// Project an offset-form parameter list (base.js) to the strided form.
// Returns { params: [...], hasMatrix: bool }.
function project( base ) {
	var out = [];
	var hasMatrix = false;
	var i = 0;
	while ( i < base.length ) {
		var p = base[ i ];
		var n1 = base[ i + 1 ] || '';
		var n2 = base[ i + 2 ] || '';
		var n3 = base[ i + 3 ] || '';

		// 2-D array: P, strideP1, strideP2, offsetP  →  P, LD<P>
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
			if ( isWorkspace( p ) ) {
				out.push( p );               // workspace: no stride
			} else {
				out.push( p, n1 );           // vector/index: keep the stride
			}
			i += 3;
			continue;
		}
		// complex scalar as array: P, offsetP  →  P
		if ( isOffset( n1 ) ) {
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
	'isWorkspace': isWorkspace
};
