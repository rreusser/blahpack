'use strict';

/*
* Translate the reference Fortran leading-dimension rules into the checks a
* layout wrapper `<routine>.js` must perform.
*
* Source of truth: data/fortran-ld-rules.json (bin/gen_fortran_ld_rules.js), which
* holds each routine's Fortran argument-check conditions verbatim, e.g.
*
*   LDVL: "LDVL.LT.1 .OR. ( WANTVL .AND. LDVL.LT.N )"
*
* plus the locals they use (`WANTVL = LSAME( JOBVL, 'V' )`). Column counts for the
* row-major bound come from the declared shapes in data/fortran-signatures.json
* (`VL ... dimension (LDVL,N)`).
*
* Convention (matches every wrapper's stride setup): column-major element (i,j)
* lives at i + j*LD, so LD must cover the ROWS — exactly the Fortran rule;
* row-major element (i,j) lives at i*LD + j, so LD must cover the COLUMNS of the
* Fortran-shaped array, under the same job-flag condition.
*
* Identifier resolution, in order: wrapper parameter (case-insensitive); a
* same-named flag defined in base.js (`const wantvl = ( jobvl === ... );`) whose
* expression only uses wrapper parameters; the Fortran local definition,
* translated (LSAME on the standard option families only); OVERRIDES below.
* Anything else is reported as unresolved — never guessed.
*/

var fs = require( 'fs' );
var path = require( 'path' );

var ROOT = path.join( __dirname, '..', '..' );
var RULES = null;
var SIGS = null;

// LSAME letter → JS option string, for option families whose vocabulary is fixed.
var FAMILIES = [
	{ 're': /^TRANS/, 'map': { 'N': 'no-transpose', 'T': 'transpose', 'C': 'conjugate-transpose' } },
	{ 're': /^SIDE$/, 'map': { 'L': 'left', 'R': 'right', 'B': 'both' } },
	{ 're': /^UPLO$/, 'map': { 'U': 'upper', 'L': 'lower' } },
	{ 're': /^DIAG$/, 'map': { 'U': 'unit', 'N': 'non-unit' } }
];

// Column counts the declarations express with doc-only names (BLAS `ka`, `kb`, `k`):
// routine → { LDX: Fortran expression for the number of columns }.
var COLS = {
	'gemm': { 'LDA': 'NCOLA', 'LDB': 'NCOLB' },
	'symm': { 'LDA': 'NROWA' },
	'hemm': { 'LDA': 'NROWA' },
	'trmm': { 'LDA': 'NROWA' },
	'trsm': { 'LDA': 'NROWA' },
	'syrk': { 'LDA': 'NCOLA' },
	'herk': { 'LDA': 'NCOLA' },
	'syr2k': { 'LDA': 'NCOLA', 'LDB': 'NCOLA' },
	'her2k': { 'LDA': 'NCOLA', 'LDB': 'NCOLA' },
	'sfrk': { 'LDA': 'NCOLA' },
	'hfrk': { 'LDA': 'NCOLA' },
	// Arrays whose column count depends on SIDE (reflectors stored rowwise / NQ-square):
	'orml2': { 'LDA': "js:( side === 'left' ) ? M : N" },
	'ormlq': { 'LDA': "js:( side === 'left' ) ? M : N" },
	'ormr2': { 'LDA': "js:( side === 'left' ) ? M : N" },
	'ormr3': { 'LDA': "js:( side === 'left' ) ? M : N" },
	'ormrq': { 'LDA': "js:( side === 'left' ) ? M : N" },
	'ormhr': { 'LDA': "js:( side === 'left' ) ? M : N" },
	'ormtr': { 'LDA': "js:( side === 'left' ) ? M : N" },
	'orm22': { 'LDQ': "js:( side === 'left' ) ? M : N" },
	'unml2': { 'LDA': "js:( side === 'left' ) ? M : N" },
	'unmlq': { 'LDA': "js:( side === 'left' ) ? M : N" },
	'unmr2': { 'LDA': "js:( side === 'left' ) ? M : N" },
	'unmr3': { 'LDA': "js:( side === 'left' ) ? M : N" },
	'unmrq': { 'LDA': "js:( side === 'left' ) ? M : N" },
	'unmhr': { 'LDA': "js:( side === 'left' ) ? M : N" },
	'unmtr': { 'LDA': "js:( side === 'left' ) ? M : N" },
	'unm22': { 'LDQ': "js:( side === 'left' ) ? M : N" },
	'gemlqt': { 'LDV': "js:( side === 'left' ) ? M : N" },
	'lamswlq': { 'LDA': "js:( side === 'left' ) ? M : N", 'LDT': 'skip' },
	'tpmlqt': { 'LDA': "js:( side === 'left' ) ? N : K" },
	'tpmqrt': { 'LDA': "js:( side === 'left' ) ? N : K" },
	'gesvd': { 'LDU': "js:( jobu === 'all-columns' ) ? M : min( M, N )" },
	'trsna': { 'LDVL': 'js:mm', 'LDVR': 'js:mm' },
	// LAPACK documents T as (LDT,N), but an LQ factorization of M rows has M reflectors
	// and the code addresses T(1:MB, 1:M) (dtplqt2/dgelqt3 calls use the M-row block).
	'gelqt3': { 'LDT': 'M' },
	'tplqt': { 'LDT': 'M' },
	// WORK( LDWORK, N+6 ) (real) / ( LDWORK, N+1 ) (complex: the doc's N+6 is copied
	// from DTRSNA; only column N+1 holds the norm-estimator vector). Unused for N < 2.
	'dtrsna': { 'LDWORK': 'js:( N < 2 ) ? N : N + 6' },
	'ztrsna': { 'LDWORK': 'js:( N < 2 ) ? N : N + 1' },
	// Z( LDZ, max(1,M) ) where M (found eigenvalues) is an output: its largest possible value.
	'syevx': { 'LDZ': "js:( range === 'index' ) ? iu - il + 1 : N" },
	'stevx': { 'LDZ': "js:( range === 'index' ) ? iu - il + 1 : N" },
	// VL( LDVL, * ) / VR( LDVR, * ) hold MM columns; M (columns used) is an output.
	'tgsna': { 'LDVL': 'js:mm', 'LDVR': 'js:mm' },
	'syevr': { 'LDZ': "js:( range === 'index' ) ? iu - il + 1 : N" },
	'stevr': { 'LDZ': "js:( range === 'index' ) ? iu - il + 1 : N" },
	'sbevx': { 'LDZ': "js:( range === 'index' ) ? iu - il + 1 : N" },
	'spevx': { 'LDZ': "js:( range === 'index' ) ? iu - il + 1 : N" },
	'spgvx': { 'LDZ': "js:( range === 'index' ) ? iu - il + 1 : N" },
	'sygvx': { 'LDZ': "js:( range === 'index' ) ? iu - il + 1 : N" },
	'heevx': { 'LDZ': "js:( range === 'index' ) ? iu - il + 1 : N" },
	'heevr': { 'LDZ': "js:( range === 'index' ) ? iu - il + 1 : N" },
	'hegvx': { 'LDZ': "js:( range === 'index' ) ? iu - il + 1 : N" },
	'hbevx': { 'LDZ': "js:( range === 'index' ) ? iu - il + 1 : N" },
	'hpevx': { 'LDZ': "js:( range === 'index' ) ? iu - il + 1 : N" },
	// TSQR/TSLQ block-structured T: row-major layout not yet verified against the kernels.
	'latsqr': { 'LDT': 'skip' },
	'laswlq': { 'LDT': 'skip' },
	'lamtsqr': { 'LDT': 'skip' },
	'orgtsqr': { 'LDT': 'skip' },
	'orgtsqr_row': { 'LDT': 'skip' },
	'orhr_col': { 'LDT': 'skip' },
	'ungtsqr': { 'LDT': 'skip' },
	'ungtsqr_row': { 'LDT': 'skip' },
	'unhr_col': { 'LDT': 'skip' }
};

// Extra locals for the doc-only column names above (Fortran-expression cascades).
var EXTRA_LOCALS = {
	'gemm': {
		'NCOLA': [ [ 'NOTA', 'K' ], [ 'ELSE', 'M' ] ],
		'NCOLB': [ [ 'NOTB', 'N' ], [ 'ELSE', 'K' ] ]
	},
	'syrk': { 'NCOLA': [ [ "LSAME(TRANS,'N')", 'K' ], [ 'ELSE', 'N' ] ] },
	'herk': { 'NCOLA': [ [ "LSAME(TRANS,'N')", 'K' ], [ 'ELSE', 'N' ] ] },
	'syr2k': { 'NCOLA': [ [ "LSAME(TRANS,'N')", 'K' ], [ 'ELSE', 'N' ] ] },
	'her2k': { 'NCOLA': [ [ "LSAME(TRANS,'N')", 'K' ], [ 'ELSE', 'N' ] ] },
	'sfrk': { 'NCOLA': [ [ "LSAME(TRANS,'N')", 'K' ], [ 'ELSE', 'N' ] ] },
	'hfrk': { 'NCOLA': [ [ "LSAME(TRANS,'N')", 'K' ], [ 'ELSE', 'N' ] ] }
};

var FKEYWORDS = /^(MAX|MIN|MOD|ABS|LSAME)$/;

// LSAME letter → candidate JS option strings. The one the routine's ndarray.js /
// base.js actually accepts for that parameter is used; zero or several matches
// is reported as unresolved (never guessed).
var CANDIDATES = {
	'A': [ 'all', 'all-columns', 'all-rows', 'apply-v' ],
	'B': [ 'both' ],
	'E': [ 'eigenvalues' ],
	'I': [ 'initialize', 'index' ],
	'N': [ 'none', 'no-vectors', 'no-v' ],
	'P': [ 'p-only', 'apply-P' ],
	'Q': [ 'q-only', 'apply-Q', 'compute-Q', 'update' ],
	'S': [ 'schur', 'economy' ],
	'U': [ 'update', 'compute-U' ],
	'V': [ 'update', 'compute-vectors', 'eigenvectors', 'value', 'compute-v', 'compute-V' ]
};

// routine stem → { PARAM: { letter: 'js string' } } where CANDIDATES is ambiguous.
var VOCAB = {
	'sbtrd': { 'VECT': { 'V': 'initialize', 'U': 'update', 'N': 'none' } },
	'hbtrd': { 'VECT': { 'V': 'initialize', 'U': 'update', 'N': 'none' } }
};

// Whole-rule overrides (JS), for rules the Fortran expresses through derived
// codes the translator cannot follow. routine stem → { LDX: { col, row } }.
var RULE_JS = {
	// A is (LDA, min(NQ,K)) when applying Q and (LDA, NQ) when applying P^T.
	'ormbr': {
		'LDA': {
			'col': "LDA < max( 1, ( vect === 'apply-Q' ) ? ( ( side === 'left' ) ? M : N ) : min( ( side === 'left' ) ? M : N, K ) )",
			'row': "LDA < max( 1, ( vect === 'apply-Q' ) ? min( ( side === 'left' ) ? M : N, K ) : ( ( side === 'left' ) ? M : N ) )"
		}
	},
	'unmbr': {
		'LDA': {
			'col': "LDA < max( 1, ( vect === 'apply-Q' ) ? ( ( side === 'left' ) ? M : N ) : min( ( side === 'left' ) ? M : N, K ) )",
			'row': "LDA < max( 1, ( vect === 'apply-Q' ) ? min( ( side === 'left' ) ? M : N, K ) : ( ( side === 'left' ) ? M : N ) )"
		}
	},
	'lascl': {
		'LDA': {
			'col': "( ( type === 'general' || type === 'lower' || type === 'upper' || type === 'upper-hessenberg' ) && LDA < max( 1, M ) ) || ( type === 'lower-band' && LDA < kl + 1 ) || ( type === 'upper-band' && LDA < ku + 1 ) || ( type === 'band' && LDA < ( 2 * kl ) + ku + 1 )",
			'row': '( LDA < max( 1, N ) )'
		}
	}
};


// FUNCTIONS //

function load() {
	if ( !RULES ) {
		RULES = JSON.parse( fs.readFileSync( path.join( ROOT, 'data', 'fortran-ld-rules.json' ), 'utf8' ) );
		SIGS = JSON.parse( fs.readFileSync( path.join( ROOT, 'data', 'fortran-signatures.json' ), 'utf8' ) );
	}
}

function stem( routine ) {
	return routine.replace( /^[sdcz]/, '' );
}

/**
* Parameters of the exported wrapper function.
*/
function wrapperParams( src, routine ) {
	var m = src.match( new RegExp( 'function ' + routine + '\\s*\\(([^)]*)\\)' ) );
	if ( !m ) {
		return [];
	}
	return m[ 1 ].split( ',' ).map( function t( s ) {
		return s.trim();
	}).filter( Boolean );
}

/**
* Columns of the array whose leading dimension is `ld`, from its declaration.
*/
function declaredCols( routine, ld ) {
	var sig = SIGS[ routine ];
	var i;
	var t;
	var k;
	var depth;
	var start;
	if ( !sig || !sig.arguments ) {
		return null;
	}
	for ( i = 0; i < sig.arguments.length; i++ ) {
		t = sig.arguments[ i ].type || '';
		k = t.search( new RegExp( 'dimension\\s*\\(\\s*' + ld + '\\s*,', 'i' ) );
		if ( k < 0 ) {
			continue;
		}
		start = t.indexOf( ',', k ) + 1;
		depth = 1;
		for ( k = t.indexOf( '(', k ) + 1; k < t.length; k++ ) {
			if ( t[ k ] === '(' ) {
				depth += 1;
			} else if ( t[ k ] === ')' ) {
				depth -= 1;
				if ( depth === 0 ) {
					return t.slice( start, k ).trim().toUpperCase();
				}
			}
		}
	}
	return null;
}

/**
* Translate a Fortran expression to JS. Returns { js, unresolved: [] }.
*/
function translate( expr, ctx, seen ) {
	var unresolved = [];
	var s = ' ' + expr + ' ';
	seen = seen || {};

	// LSAME( P, 'c' ) first.
	s = s.replace( /LSAME\s*\(\s*([A-Z][A-Z0-9_]*)\s*,\s*'(\w)'\s*\)/gi, function lsame( m, p, c ) {
		var name = ctx.params[ p.toUpperCase() ];
		var i;
		if ( !name ) {
			unresolved.push( 'LSAME(' + p + ')' );
			return m;
		}
		var v = optionString( p.toUpperCase(), c.toUpperCase(), name, ctx );
		if ( v ) {
			return '( ' + name + ' === \'' + v + '\' )';
		}
		unresolved.push( 'LSAME(' + p + ",'" + c + "')" );
		return m;
	});
	s = s.replace( /\.LT\./gi, ' < ' ).replace( /\.LE\./gi, ' <= ' ).replace( /\.GT\./gi, ' > ' )
		.replace( /\.GE\./gi, ' >= ' ).replace( /\.EQ\./gi, ' === ' ).replace( /\.NE\./gi, ' !== ' )
		.replace( /\.AND\./gi, ' && ' ).replace( /\.OR\./gi, ' || ' ).replace( /\.NOT\./gi, ' !' )
		.replace( /\.TRUE\./gi, ' true ' ).replace( /\.FALSE\./gi, ' false ' );
	s = s.replace( /(^|[^'\w])([A-Z][A-Z0-9_]*)\b(?!')/g, function id( m, pre, name ) {
		var up = name.toUpperCase();
		if ( FKEYWORDS.test( up ) ) {
			return pre + up.toLowerCase();
		}
		if ( ctx.arrays[ up ] ) {
			// An array argument is never a bound: Fortran scalar outputs such as
			// M (eigenvectors found) are Int32Array in JS, and `max( 1, M )` is NaN,
			// which makes `LD < NaN` a check that never fires (tickets/0001).
			unresolved.push( up + '(array argument; give the column count in COLS)' );
			return m;
		}
		if ( ctx.outputs[ up ] ) {
			// Nor is an output: its value on entry is meaningless (ztgsna's M).
			unresolved.push( up + '(output argument; give the column count in COLS)' );
			return m;
		}
		if ( ctx.params[ up ] ) {
			return pre + ctx.params[ up ];
		}
		var r = resolveLocal( up, ctx, seen );
		if ( r.js === null ) {
			unresolved.push.apply( unresolved, r.unresolved.length ? r.unresolved : [ up ] );
			return m;
		}
		return pre + r.js;
	});
	return { 'js': tidy( s ), 'unresolved': unresolved };
}

/**
* JS option string for LSAME( P, 'c' ) in this routine (see FAMILIES, VOCAB, CANDIDATES).
*/
function optionString( P, c, name, ctx ) {
	var accepted;
	var hits;
	var i;
	var v = ctx.vocab && ctx.vocab[ P ] && ctx.vocab[ P ][ c ];
	if ( v ) {
		return v;
	}
	for ( i = 0; i < FAMILIES.length; i++ ) {
		if ( FAMILIES[ i ].re.test( P ) && FAMILIES[ i ].map[ c ] ) {
			return FAMILIES[ i ].map[ c ];
		}
	}
	accepted = acceptedValues( name, ctx );
	hits = ( CANDIDATES[ c ] || [] ).filter( function f( x ) {
		return accepted.indexOf( x ) >= 0;
	});
	return ( hits.length === 1 ) ? hits[ 0 ] : null;
}

/**
* Option values a parameter is compared against in ndarray.js / base.js.
*/
function acceptedValues( name, ctx ) {
	var re = new RegExp( '\\b' + name + ' [!=]== \'([^\']*)\'', 'g' );
	var out = [];
	var m;
	var src = ctx.base + '\n' + ( ctx.ndarray || '' );
	while ( ( m = re.exec( src ) ) !== null ) {
		if ( out.indexOf( m[ 1 ] ) === -1 ) {
			out.push( m[ 1 ] );
		}
	}
	return out;
}

/**
* Rewrite n-ary `max(`/`min(` calls (not `Math.max`) into nested binary calls:
* the stdlib functions are binary and silently ignore extra arguments.
*
* @param {string} s - JS source
* @returns {string} rewritten source
*/
function nestMinMax( s ) {
	var re = /(^|[^.\w])(max|min)\(/g;
	var out = '';
	var last = 0;
	var m;
	while ( ( m = re.exec( s ) ) !== null ) {
		var open = m.index + m[ 0 ].length - 1;
		var depth = 0;
		var args = [];
		var start = open + 1;
		var k;
		for ( k = open; k < s.length; k++ ) {
			var ch = s[ k ];
			if ( ch === '(' || ch === '[' ) {
				depth += 1;
			} else if ( ch === ')' || ch === ']' ) {
				depth -= 1;
				if ( depth === 0 ) {
					args.push( s.slice( start, k ) );
					break;
				}
			} else if ( ch === ',' && depth === 1 ) {
				args.push( s.slice( start, k ) );
				start = k + 1;
			}
		}
		if ( args.length <= 2 ) {
			continue;
		}
		args = args.map( function t( a ) {
			return nestMinMax( a.trim() );
		});
		var nested = args[ args.length - 1 ];
		for ( var j = args.length - 2; j >= 0; j-- ) {
			nested = m[ 2 ] + '( ' + args[ j ] + ', ' + nested + ' )';
		}
		out += s.slice( last, m.index + m[ 1 ].length ) + nested;
		last = k + 1;
		re.lastIndex = k + 1;
	}
	return out + s.slice( last );
}

function tidy( s ) {
	var strs = [];
	s = s.replace( /'[^']*'/g, function save( q ) {
		strs.push( q );
		return '\u0000' + ( strs.length - 1 ) + '\u0000';
	});
	s = tidyCode( s );
	s = nestMinMax( s );
	return s.replace( /\u0000(\d+)\u0000/g, function restore( m, k ) {
		return strs[ +k ];
	});
}

function tidyCode( s ) {
	var prev;
	s = s.replace( /\s*([-+*])\s*(?=[A-Za-z0-9_(])/g, ' $1 ' )
		.replace( /\(\s*/g, '( ' ).replace( /\s*\)/g, ' )' ).replace( /\(\s+\)/g, '()' )
		.replace( /\s*,\s*/g, ', ' ).replace( /\s+/g, ' ' ).replace( /!\s+/g, '!' ).trim()
		.replace( /\b(max|min)\(\s*/g, '$1( ' );
	// Collapse doubled grouping parens `( ( x ) )` → `( x )` (not call parens).
	do {
		prev = s;
		s = s.replace( /(^|[^\w])\( \( ((?:[^()]|\((?:[^()]|\([^()]*\))*\))*) \) \)/g, '$1( $2 )' );
	} while ( s !== prev );
	// A lone parenthesized bound after `<` needs no parens: `LDA < ( kl + ku + 1 )` stays readable as is.
	return s;
}

/**
* Resolve a Fortran local: base.js flag of the same name, else its Fortran definition.
*/
function resolveLocal( up, ctx, seen ) {
	var lower = up.toLowerCase();
	var defs;
	var m;
	var re;
	var i;
	var parts;
	var out;
	var unresolved = [];
	if ( seen[ up ] ) {
		return { 'js': null, 'unresolved': [ up + '(cycle)' ] };
	}
	seen = Object.assign( {}, seen );
	seen[ up ] = true;
	re = new RegExp( '\\bconst ' + lower + ' = ([^;\\n]+);' );
	m = ctx.base.match( re );
	if ( m && usesOnlyParams( m[ 1 ], ctx ) ) {
		return { 'js': '( ' + tidy( m[ 1 ].replace( /^\(\s*|\s*\)$/g, '' ) ) + ' )', 'unresolved': [] };
	}
	defs = ( ctx.extraLocals && ctx.extraLocals[ up ] ) || ( ctx.locals && ctx.locals[ up ] );
	if ( !defs ) {
		return { 'js': null, 'unresolved': [ up ] };
	}
	if ( defs.length === 1 && defs[ 0 ][ 0 ] === null ) {
		out = translate( defs[ 0 ][ 1 ], ctx, seen );
		return { 'js': out.unresolved.length ? null : '( ' + out.js + ' )', 'unresolved': out.unresolved };
	}
	// Ordered cascade → nested ternary. Without an ELSE the cascade is exhaustive
	// over the (already validated) option, so its last branch acts as the else.
	if ( defs.some( function u( d, k ) {
		return d[ 0 ] === null && k > 0;
	}) ) {
		return { 'js': null, 'unresolved': [ up + '(cascade)' ] };
	}
	parts = translate( defs[ defs.length - 1 ][ 1 ], ctx, seen );
	out = parts.js;
	unresolved = parts.unresolved.slice();
	for ( i = defs.length - 2; i >= 0; i-- ) {
		var g = translate( defs[ i ][ 0 ], ctx, seen );
		var v = translate( defs[ i ][ 1 ], ctx, seen );
		unresolved.push.apply( unresolved, g.unresolved.concat( v.unresolved ) );
		out = '( ' + g.js + ' ) ? ' + v.js + ' : ' + out;
	}
	return { 'js': unresolved.length ? null : '( ' + out + ' )', 'unresolved': unresolved };
}

function usesOnlyParams( expr, ctx ) {
	var ids = expr.replace( /'[^']*'/g, '' ).match( /\b[A-Za-z_]\w*\b/g ) || [];
	return ids.every( function ok( id ) {
		return ctx.params[ id.toUpperCase() ] === id || /^(true|false)$/.test( id );
	});
}

/**
* Wrapper parameters that are arrays (upper-cased name → true): JSDoc type is an
* array, or base.js indexes the parameter. Both, because the JSDoc is not always
* right (tickets/0002).
*/
function arrayParams( wrapperSrc, baseSrc, params ) {
	var out = {};
	params.forEach( function each( name ) {
		var doc = new RegExp( '@param \\{([^}]*)\\} \\[?' + name + '\\b' ).exec( wrapperSrc );
		if ( ( doc && /Array|Collection/.test( doc[ 1 ] ) ) || new RegExp( '\\b' + name + '\\[' ).test( baseSrc ) ) {
			out[ name.toUpperCase() ] = true;
		}
	});
	return out;
}

/**
* Reference arguments with INTENT(OUT) (upper-cased name → true).
*/
function outputArgs( routine ) {
	var out = {};
	( ( SIGS[ routine ] && SIGS[ routine ].arguments ) || [] ).forEach( function each( a ) {
		if ( a.intent === 'out' ) {
			out[ a.name.toUpperCase() ] = true;
		}
	});
	return out;
}

/**
* Expected wrapper checks for a routine: { LDX: { col, row, fortran, unresolved } }.
* `row` is null when the wrapper has no `order` parameter (column-major only).
*/
function expected( routine, wrapperSrc, baseSrc, ndarraySrc ) {
	var out = {};
	var entry;
	var params;
	var ctx;
	var lds;
	load();
	entry = RULES[ routine ];
	params = wrapperParams( wrapperSrc, routine );
	if ( !entry ) {
		return out;
	}
	ctx = {
		'params': {},
		'arrays': arrayParams( wrapperSrc, baseSrc, params ),
		'outputs': outputArgs( routine ),
		'base': baseSrc,
		'locals': entry.locals || {},
		'extraLocals': EXTRA_LOCALS[ stem( routine ) ] || null,
		'vocab': VOCAB[ stem( routine ) ] || null,
		'ndarray': ndarraySrc || ''
	};
	params.forEach( function p( name ) {
		ctx.params[ name.toUpperCase() ] = name;
	});
	lds = params.filter( function f( p ) {
		return /^LD[A-Z0-9]*$/.test( p ) && entry.rules[ p ];
	});
	lds.forEach( function each( ld ) {
		var fcond = entry.rules[ ld ].map( function w( c ) {
			return ( entry.rules[ ld ].length > 1 ) ? '( ' + c + ' )' : c;
		}).join( ' .OR. ' );
		var ov = RULE_JS[ stem( routine ) ] && RULE_JS[ stem( routine ) ][ ld ];
		if ( ov ) {
			out[ ld ] = { 'fortran': fcond, 'col': ov.col, 'row': ( ctx.params.ORDER ) ? ov.row : null, 'unresolved': [] };
			return;
		}
		var col = translate( fcond, ctx );
		var rec = { 'fortran': fcond, 'col': col.js, 'row': null, 'unresolved': col.unresolved.slice() };
		if ( ctx.params.ORDER ) {
			var colsF = ( COLS[ routine ] && COLS[ routine ][ ld ] ) || ( COLS[ stem( routine ) ] && COLS[ stem( routine ) ][ ld ] ) || declaredCols( routine, ld );
			if ( colsF === 'skip' ) {
				rec.row = 'skip';
			} else if ( colsF && colsF.indexOf( 'js:' ) === 0 ) {
				var rowJs = translate( fcond.replace( new RegExp( '\\b' + ld + '\\s*\\.LT\\.\\s*(?!1\\b)(MAX\\s*\\((?:[^()]|\\([^()]*\\))*\\)|\\((?:[^()]|\\([^()]*\\))*\\)|[A-Z0-9_]+(?:\\s*[-+*]\\s*[A-Z0-9_]+)*)', 'g' ), ld + '.LT.__COLS__' ), ctx );
				rec.unresolved.push.apply( rec.unresolved, rowJs.unresolved );
				rec.row = rowJs.js.replace( /__COLS__/g, 'max( 1, ' + colsF.slice( 3 ) + ' )' );
				rec.colsFortran = colsF;
			} else if ( !colsF || /\*/.test( colsF ) ) {
				rec.unresolved.push( 'cols(' + ld + ')' );
			} else {
				var cols = translate( colsF, ctx );
				rec.unresolved.push.apply( rec.unresolved, cols.unresolved );
				// Same rule with each non-trivial row bound replaced by the column count.
				var rowF = fcond.replace( new RegExp( '\\b' + ld + '\\s*\\.LT\\.\\s*(?!1\\b)(MAX\\s*\\((?:[^()]|\\([^()]*\\))*\\)|\\((?:[^()]|\\([^()]*\\))*\\)|[A-Z0-9_]+(?:\\s*[-+*]\\s*[A-Z0-9_]+)*)', 'g' ), function rowBound( m, bound ) {
					// Square case: the row bound already is the column count.
					var b = bound.replace( /\s+/g, '' ).replace( /^MAX\(1,(.*)\)$/, '$1' ).replace( /^\((.*)\)$/, '$1' );
					return ( b === colsF.replace( /\s+/g, '' ) ) ? m : ld + '.LT.MAX( 1, ' + colsF + ' )';
				});
				var row = translate( rowF, ctx );
				rec.unresolved.push.apply( rec.unresolved, row.unresolved );
				rec.row = row.js;
				rec.colsFortran = colsF;
			}
		}
		out[ ld ] = rec;
	});
	return out;
}

var ORDINALS = [ 'Zeroth', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth' ];

function ordinal( n ) {
	var tens = [ '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty' ];
	var ones = [ '', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth' ];
	if ( n < ORDINALS.length ) {
		return ORDINALS[ n ];
	}
	if ( n % 10 === 0 ) {
		return tens[ n / 10 ].replace( /y$/, 'ieth' );
	}
	return tens[ Math.floor( n / 10 ) ] + '-' + ones[ n % 10 ];
}

/**
* The exact check statements a wrapper must contain for one leading dimension.
*
* @param {string} ld - parameter name
* @param {Object} rec - entry from expected()
* @param {Array<string>} params - wrapper parameters
* @returns {Array<Object>} [ { order: 'column-major'|'row-major'|null, code } ]
*/
function checks( ld, rec, params ) {
	var pos = params.indexOf( ld ) + 1;
	var ord = ordinal( pos );
	var fort = rec.fortran.replace( /'/g, '"' );
	var out = [];
	var hasOrder = params.indexOf( 'order' ) >= 0;
	function stmt( guard, cond, why ) {
		return '\tif ( ' + ( guard ? guard + ' && ( ' + cond + ' )' : cond ) + ' ) {\n' +
			'\t\tthrow new RangeError( format( \'invalid argument. ' + ord + ' argument violates the reference leading-dimension rule (' + why + '). Value: `%d`.\', ' + ld + ' ) );\n' +
			'\t}\n';
	}
	if ( !hasOrder || rec.row === null ) {
		out.push({ 'order': null, 'code': stmt( null, rec.col, 'rejected when `' + fort + '`' ) });
		return out;
	}
	if ( rec.row === rec.col ) {
		out.push({ 'order': null, 'code': stmt( null, rec.col, 'rejected when `' + fort + '`' ) });
		return out;
	}
	out.push({ 'order': 'column-major', 'code': stmt( 'order === \'column-major\'', rec.col, 'column-major: rejected when `' + fort + '`' ) });
	if ( rec.row !== 'skip' ) {
		out.push({ 'order': 'row-major', 'code': stmt( 'order === \'row-major\'', rec.row, 'row-major: must also cover the ' + ( rec.colsFortran || '' ).replace( /^js:/, '' ).replace( /'/g, '"' ) + ' columns' ) });
	}
	return out;
}

/**
* Existing RangeError checks mentioning `name <`, with their order context
* (`'column-major'`, `'row-major'`, or `null` for order-independent).
*/
function existingChecks( src, name ) {
	var out = [];
	var re = /(^|\n)(\t+)if \(\s*([^\n]*?)\s*\) \{\n\t+throw new RangeError\([^\n]*\n\t+\}\n/g;
	var lines;
	var m;
	lines = src.split( '\n' );
	while ( ( m = re.exec( src ) ) !== null ) {
		var cond = m[ 3 ];
		if ( !new RegExp( '\\b' + name + '\\s*<' ).test( cond ) ) {
			re.lastIndex = m.index + m[ 0 ].length - 1;
			continue;
		}
		var start = m.index + m[ 1 ].length;
		var depth = m[ 2 ].length;
		var order = null;
		if ( depth === 1 ) {
			if ( /order === 'column-major'/.test( cond ) && !/order === 'row-major'/.test( cond ) ) {
				order = 'column-major';
			} else if ( /order === 'row-major'/.test( cond ) && !/order === 'column-major'/.test( cond ) ) {
				order = 'row-major';
			}
		} else {
			order = enclosingOrder( lines, src.slice( 0, start ).split( '\n' ).length - 1, depth );
		}
		out.push({ 'start': start, 'end': m.index + m[ 0 ].length, 'depth': depth, 'order': order, 'cond': cond });
		re.lastIndex = m.index + m[ 0 ].length - 1;
	}
	return out;
}

function enclosingOrder( lines, lineNo, depth ) {
	var pre = '\t'.repeat( depth - 1 );
	var k;
	var q;
	var L;
	for ( k = lineNo - 1; k >= 0; k-- ) {
		L = lines[ k ];
		if ( !L.startsWith( pre ) || L.startsWith( pre + '\t' ) ) {
			continue;
		}
		if ( /if \( order === 'column-major' \)/.test( L ) ) {
			return 'column-major';
		}
		if ( /if \( order === 'row-major' \)/.test( L ) ) {
			return 'row-major';
		}
		if ( /^\t*\} else \{/.test( L ) ) {
			for ( q = k - 1; q >= 0; q-- ) {
				if ( lines[ q ].startsWith( pre ) && !lines[ q ].startsWith( pre + '\t' ) && /^\t*if \(/.test( lines[ q ] ) ) {
					if ( /order === 'column-major'/.test( lines[ q ] ) ) {
						return 'row-major';
					}
					if ( /order === 'row-major'/.test( lines[ q ] ) ) {
						return 'column-major';
					}
					return null;
				}
			}
		}
		return null;
	}
	return null;
}

module.exports = {
	'existingChecks': existingChecks,
	'expected': expected,
	'checks': checks,
	'nestMinMax': nestMinMax,
	'ordinal': ordinal,
	'wrapperParams': wrapperParams
};
