'use strict';

// Shared stride/offset naming-discipline check.
//
// Across every file that declares a routine (base.js, ndarray.js, and the
// classic <routine>.js wrapper), a `stride*` parameter must refer to a real
// array parameter under the project's naming convention, and — in the
// offset-carrying forms — must have a matching `offset*`. This module holds that
// logic in one place so the offset form (base/ndarray) and the strided form
// (<routine>.js, which drops offsets and shares strides across parallel arrays)
// check it identically.
//
// Accepted relaxations, each a real project convention (see the rule READMEs):
//   * Precision prefix — array `zx`/`cy` satisfies stride suffix `X`/`Y`.
//   * Digit-suffixed 1D arrays — `VN1`/`VN2` are distinct arrays; exact match
//     wins before any 2D digit-grouping.
//   * 2D dimension strides — `stride<A>1` + `stride<A>2` denote array `A` only
//     when both siblings are present.
//   * Stride-name collision — a 1D array `B` whose `stride<B>` is claimed by a
//     2D array's dimension becomes `stride<B>1` (keeping `offset<B>`).
//   * Shared stride — the classic strided form gives parallel arrays one stride
//     whose suffix concatenates their names (`strideXYZ` for `x`,`y`,`z`;
//     `strideCS` for `c`,`s`).
//
// `LD*` (leading-dimension) parameters in the strided form use Fortran-native
// names (`LDGCOL`, `LDAB`) that need not derive from the JS array name, so they
// are not resolved here.

var PRECISION = [ 'z', 'c', 'd', 's' ];

// Build a lowercase name-set + membership helpers for a parameter list.
function indexParams( params ) {
	var set = {};
	params.forEach( function forEach( p ) {
		set[ p.toLowerCase() ] = true;
	});
	function has( name ) {
		return set[ String( name ).toLowerCase() ] === true;
	}
	// An array parameter satisfies `suffix` if it equals it, or equals it with a
	// single leading precision letter.
	function hasArray( suffix ) {
		if ( has( suffix ) ) {
			return true;
		}
		return PRECISION.some( function some( pfx ) {
			return has( pfx + suffix );
		});
	}
	return { 'has': has, 'hasArray': hasArray, 'set': set };
}

// Can `suffix` be segmented into a concatenation of two or more array
// parameters (a shared stride, e.g. "XYZ" -> x,y,z)? Greedy word-break over the
// candidate array names present in the signature.
function isSharedStride( suffix, params, idx ) {
	var lower = suffix.toLowerCase();
	// Candidate pieces: params that are plain names (not stride/offset/ld) and
	// are a prefix-usable token. Longest-first for a stable segmentation.
	var candidates = params
		.filter( function filter( p ) {
			return !/^(stride|offset|ld)/i.test( p );
		})
		.map( function map( p ) {
			return p.toLowerCase();
		})
		.sort( function cmp( a, b ) {
			return b.length - a.length;
		});

	function segment( s, depth ) {
		if ( s === '' ) {
			return depth >= 2;
		}
		for ( var i = 0; i < candidates.length; i++ ) {
			var c = candidates[ i ];
			if ( c.length > 0 && s.indexOf( c ) === 0 ) {
				if ( segment( s.slice( c.length ), depth + 1 ) ) {
					return true;
				}
			}
		}
		return false;
	}
	return segment( lower, 0 );
}

// Resolve the array a `stride<suffix>` parameter refers to.
// Returns { resolved: bool, effSuffix: string|null }.
//   effSuffix is the suffix to use for the matching offset check (1D/2D single
//   array); it is null for a shared stride (no single owning array).
function resolveStride( suffix, params, idx ) {
	// (1) exact / precision-prefixed 1D array.
	if ( idx.hasArray( suffix ) ) {
		return { 'resolved': true, 'effSuffix': suffix };
	}

	// (2) 2D dimension stride, or collision form.
	var dm = /^(.*)([12])$/.exec( suffix );
	if ( dm ) {
		var base = dm[ 1 ];
		var other = ( dm[ 2 ] === '1' ) ? '2' : '1';
		if ( idx.has( 'stride' + base + other ) && idx.hasArray( base ) ) {
			return { 'resolved': true, 'effSuffix': base };
		}
		if ( dm[ 2 ] === '1' && idx.hasArray( base ) && idx.has( 'stride' + base ) ) {
			return { 'resolved': true, 'effSuffix': base };
		}
	}

	// (3) shared stride over parallel arrays (strided form).
	if ( isSharedStride( suffix, params, idx ) ) {
		return { 'resolved': true, 'effSuffix': null };
	}

	return { 'resolved': false, 'effSuffix': null };
}

// Check naming discipline over a parameter list. Returns an array of violations:
//   { index, param, kind: 'strideNoArray'|'strideNoOffset', data }
//
// opts.requireOffset — enforce that each single-array stride has a matching
// offset (true for the offset forms base/ndarray; false for the strided form).
function checkNaming( params, opts ) {
	opts = opts || {};
	var idx = indexParams( params );
	var violations = [];

	params.forEach( function forEach( p, i ) {
		var m = /^stride(.+)$/i.exec( p );
		if ( !m ) {
			return;
		}
		var suffix = m[ 1 ];
		var res = resolveStride( suffix, params, idx );
		if ( !res.resolved ) {
			violations.push({
				'index': i,
				'param': p,
				'kind': 'strideNoArray',
				'data': { 'stride': p, 'array': suffix }
			});
			return;
		}
		if ( opts.requireOffset && res.effSuffix !== null && !idx.has( 'offset' + res.effSuffix ) ) {
			violations.push({
				'index': i,
				'param': p,
				'kind': 'strideNoOffset',
				'data': { 'stride': p, 'offset': 'offset' + res.effSuffix }
			});
		}
	});

	return violations;
}

module.exports = {
	'checkNaming': checkNaming,
	'indexParams': indexParams,
	'resolveStride': resolveStride
};
