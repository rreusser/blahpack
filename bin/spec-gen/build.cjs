'use strict';

// Stage B (pure; CI-safe): committed Fortran facts → spec/<routine>.json.
//
// Inputs (all committed):
//   data/fortran-signatures.json   arguments, intents, declared types/dimensions
//   data/fortran-checks.json       INFO checks, quick returns, doc constraints
//   spec/options.json              Appendix A letter → canonical string table
//   spec/overrides/<routine>.json  hand overrides, each with a reason
//
// The output is a deterministic function of those files. See spec/README.md.

var fexpr = require( './fexpr.cjs' );

var WORKSPACE_RE = /^[A-Z]?WORK[A-Z0-9]*$/;
var WORKSIZE_RE = /^L[A-Z]*WORK[A-Z0-9]*$/;
var LD_RE = /^LD[A-Z0-9]*$/;
var INC_RE = /^INC[A-Z0-9]*$/;
var BANDED_CODES = { 'gb': 1, 'sb': 1, 'hb': 1, 'pb': 1, 'tb': 1 };
var RFP_CODES = { 'pf': 1, 'sf': 1, 'hf': 1, 'tf': 1 };

// CONVENTIONS S7: canonical aliases. The level-1 BLAS scalars DA/ZA are
// stdlib's `alpha`, DB is `beta`.
var ALIASES = { 'DA': 'alpha', 'DB': 'beta', 'ZA': 'alpha' };
// DX/DY/SX/SY (and the complex ZX/ZY/CX/CY) are the level-1 BLAS vectors
// (stdlib `x`, `y`) and DPARAM is
// stdlib's `param` (drotm); applied unless the alias collides with another
// argument (dla_gbrfsx_extended has both Y and DY).
var VECTOR_ALIASES = { 'DX': 'x', 'DY': 'y', 'SX': 'x', 'SY': 'y', 'ZX': 'x', 'ZY': 'y', 'CX': 'x', 'CY': 'y', 'DPARAM': 'param' };

// Column counts (CONVENTIONS V5, row-major LD bound) of 2-D arrays whose
// declared second extent is a doc pseudo-variable (BLAS `KA`, `KB`, `K`), an
// output (the eigenvector count `M`), or misdocumented. Routine stem → LD
// argument → JS expression in spec names, or null when the column count is
// not established (the row-major bound is then not generated).
var COLS = {
	'gemm': { 'LDA': "transa === 'no-transpose' ? K : M", 'LDB': "transb === 'no-transpose' ? N : K" },
	'symm': { 'LDA': "side === 'left' ? M : N" },
	'hemm': { 'LDA': "side === 'left' ? M : N" },
	'trmm': { 'LDA': "side === 'left' ? M : N" },
	'trsm': { 'LDA': "side === 'left' ? M : N" },
	'syrk': { 'LDA': "trans === 'no-transpose' ? K : N" },
	'herk': { 'LDA': "trans === 'no-transpose' ? K : N" },
	'syr2k': { 'LDA': "trans === 'no-transpose' ? K : N", 'LDB': "trans === 'no-transpose' ? K : N" },
	'her2k': { 'LDA': "trans === 'no-transpose' ? K : N", 'LDB': "trans === 'no-transpose' ? K : N" },
	'sfrk': { 'LDA': "trans === 'no-transpose' ? K : N" },
	'hfrk': { 'LDA': "trans === 'no-transpose' ? K : N" },
	// Reflectors stored rowwise: A is K-by-NQ.
	'orml2': { 'LDA': "side === 'left' ? M : N" },
	'ormlq': { 'LDA': "side === 'left' ? M : N" },
	'ormr2': { 'LDA': "side === 'left' ? M : N" },
	'ormr3': { 'LDA': "side === 'left' ? M : N" },
	'ormrq': { 'LDA': "side === 'left' ? M : N" },
	'ormhr': { 'LDA': "side === 'left' ? M : N" },
	'ormtr': { 'LDA': "side === 'left' ? M : N" },
	'orm22': { 'LDQ': "side === 'left' ? M : N" },
	'unml2': { 'LDA': "side === 'left' ? M : N" },
	'unmlq': { 'LDA': "side === 'left' ? M : N" },
	'unmr2': { 'LDA': "side === 'left' ? M : N" },
	'unmr3': { 'LDA': "side === 'left' ? M : N" },
	'unmrq': { 'LDA': "side === 'left' ? M : N" },
	'unmhr': { 'LDA': "side === 'left' ? M : N" },
	'unmtr': { 'LDA': "side === 'left' ? M : N" },
	'unm22': { 'LDQ': "side === 'left' ? M : N" },
	'gemlqt': { 'LDV': "side === 'left' ? M : N" },
	'lamswlq': { 'LDA': "side === 'left' ? M : N" },
	'tpmlqt': { 'LDA': "side === 'left' ? N : K" },
	'tpmqrt': { 'LDA': "side === 'left' ? N : K" },
	'gesvd': { 'LDU': "jobu === 'all-columns' ? M : min( M, N )" },
	// LAPACK documents T as (LDT,N); an LQ factorization of M rows has M
	// reflectors and the code addresses T(1:MB, 1:M).
	'gelqt3': { 'LDT': 'M' },
	'tplqt': { 'LDT': 'M' },
	// WORK( LDWORK, N+6 ) (real) / ( LDWORK, N+1 ) (complex); unused for N < 2.
	'dtrsna': { 'LDWORK': 'N < 2 ? N : N + 6' },
	'ztrsna': { 'LDWORK': 'N < 2 ? N : N + 1' },
	// VL/VR hold MM columns; M (columns used) is an output.
	'trsna': { 'LDVL': 'mm', 'LDVR': 'mm' },
	'tgsna': { 'LDVL': 'mm', 'LDVR': 'mm' },
	// Z( LDZ, max(1,M) ) where M (eigenvalues found) is an output: its largest value.
	'syevx': { 'LDZ': "range === 'index' ? iu - il + 1 : N" },
	'syevr': { 'LDZ': "range === 'index' ? iu - il + 1 : N" },
	'stevx': { 'LDZ': "range === 'index' ? iu - il + 1 : N" },
	'stevr': { 'LDZ': "range === 'index' ? iu - il + 1 : N" },
	'sbevx': { 'LDZ': "range === 'index' ? iu - il + 1 : N" },
	'spevx': { 'LDZ': "range === 'index' ? iu - il + 1 : N" },
	'spgvx': { 'LDZ': "range === 'index' ? iu - il + 1 : N" },
	'sygvx': { 'LDZ': "range === 'index' ? iu - il + 1 : N" },
	'sbgvx': { 'LDZ': "range === 'index' ? iu - il + 1 : N" },
	'heevx': { 'LDZ': "range === 'index' ? iu - il + 1 : N" },
	'heevr': { 'LDZ': "range === 'index' ? iu - il + 1 : N" },
	'hegvx': { 'LDZ': "range === 'index' ? iu - il + 1 : N" },
	'hbevx': { 'LDZ': "range === 'index' ? iu - il + 1 : N" },
	'hbgvx': { 'LDZ': "range === 'index' ? iu - il + 1 : N" },
	'hpevx': { 'LDZ': "range === 'index' ? iu - il + 1 : N" },
	'hpgvx': { 'LDZ': "range === 'index' ? iu - il + 1 : N" }
};

// Row-major forms of leading-dimension checks whose array's shape depends on
// an option in a way the column count alone can't express. Stem → LD → JS.
var ROW_MAJOR = {
	// A is (LDA, min(NQ,K)) when applying Q and (LDA, NQ) when applying P**T.
	'ormbr': { 'LDA': "lda < max( 1, vect === 'apply-Q' ? min( side === 'left' ? M : N, K ) : ( side === 'left' ? M : N ) )" },
	'unmbr': { 'LDA': "lda < max( 1, vect === 'apply-Q' ? min( side === 'left' ? M : N, K ) : ( side === 'left' ? M : N ) )" }
};


// FORTRAN TYPE FACTS //

function dtypeOf( type ) {
	var t = String( type || '' ).toUpperCase();
	// An EXTERNAL procedure argument (dgees's SELECT: "a LOGICAL FUNCTION of
	// two DOUBLE PRECISION arguments") is a JS callback.
	if ( /\bFUNCTION\b/.test( t ) ) {
		return 'function';
	}
	if ( /COMPLEX\s*\*\s*16|DOUBLE COMPLEX|COMPLEX\s*\(\s*(KIND\s*=\s*)?(DP|WP|8)\s*\)/.test( t ) ) {
		return 'complex128';
	}
	if ( /COMPLEX/.test( t ) ) {
		return 'complex64';
	}
	if ( /DOUBLE PRECISION|REAL\s*\*\s*8|REAL\s*\(\s*(KIND\s*=\s*)?(DP|WP|8)\s*\)/.test( t ) ) {
		return 'float64';
	}
	if ( /REAL/.test( t ) ) {
		return 'float32';
	}
	if ( /INTEGER/.test( t ) ) {
		return 'int32';
	}
	if ( /LOGICAL/.test( t ) ) {
		return 'bool';
	}
	if ( /CHARACTER/.test( t ) ) {
		return 'string';
	}
	return null;
}

function isArray( type ) {
	return /\barray\b|dimension/i.test( String( type || '' ) );
}

// Top-level comma split of a declared `dimension (...)`. The declaration is
// either `( d1, d2 )` or a bare expression (`(N+NB+1)*(NB+3)`); a doc typo's
// unbalanced trailing `)` is ignored. `L:U` bounds become the extent `U-L+1`.
function dimsOf( type ) {
	var m = /dimension\s*([\s\S]*)$/i.exec( String( type || '' ) );
	var text;
	var out = [];
	var depth = 0;
	var cur = '';
	var i;
	var ch;
	if ( !m ) {
		return null;
	}
	text = m[ 1 ].trim();
	if ( text.charAt( 0 ) === '(' ) {
		for ( i = 0; i < text.length; i++ ) {
			if ( text[ i ] === '(' ) {
				depth += 1;
			} else if ( text[ i ] === ')' ) {
				depth -= 1;
				if ( depth === 0 ) {
					break;
				}
			}
		}
		if ( i === text.length - 1 || /^\)+\s*$/.test( text.slice( i + 1 ) ) ) {
			text = text.slice( 1, i );
		}
	}
	depth = 0;
	for ( i = 0; i < text.length; i++ ) {
		ch = text[ i ];
		if ( ch === '(' ) {
			depth += 1;
		} else if ( ch === ')' ) {
			depth -= 1;
		}
		if ( ch === ',' && depth === 0 ) {
			out.push( cur );
			cur = '';
		} else {
			cur += ch;
		}
	}
	out.push( cur );
	return out.map( function norm( s ) {
		var b;
		s = s.replace( /\s+/g, '' ).toUpperCase();
		b = /^([^:]+):(.+)$/.exec( s );
		if ( b ) {
			return ( b[ 2 ] === '*' ) ? '*' : '(' + b[ 2 ] + ')-(' + b[ 1 ] + ')+1';
		}
		return s;
	});
}

function intentOf( s ) {
	var d = String( s || '' ).toLowerCase().replace( /\s+/g, '' );
	if ( d === 'in' ) {
		return 'in';
	}
	if ( d === 'out' ) {
		return 'out';
	}
	return 'inout';
}

// CONVENTIONS S7 + corpus casing: arrays upper-case except one-letter 1-D
// arrays (x, y, w, d, e); one-letter integers upper-case (M, N, K); every
// other scalar lower-case. Names compare case-insensitively (S7).
function jsName( fname, role, dims, taken, intent ) {
	if ( ALIASES[ fname ] && ( role === 'scalar' ) ) {
		return ALIASES[ fname ];
	}
	if ( role === 'matrix' || role === 'banded' || role === 'packed' || role === 'index' || role === 'workspace' ) {
		return ( fname.length === 1 && dims && dims.length === 1 && role !== 'packed' ) ? fname.toLowerCase() : fname;
	}
	if ( role === 'vector' && VECTOR_ALIASES[ fname ] && !( taken && taken[ VECTOR_ALIASES[ fname ].toUpperCase() ] ) ) {
		return VECTOR_ALIASES[ fname ];
	}
	if ( role === 'vector' ) {
		return ( fname.length === 1 ) ? fname.toLowerCase() : fname;
	}
	if ( role === 'info' ) {
		return ( intent === 'out' ) ? 'info' : 'infoIn';
	}
	if ( role === 'dim' && fname.length === 1 ) {
		return fname;
	}
	return fname.toLowerCase();
}


// OPTIONS //

function optionTable( options ) {
	var fams = options.families.map( function m( f ) {
		return {
			'params': f.params,
			're': f.routines ? new RegExp( f.routines ) : null,
			'values': f.values
		};
	});
	return function lookup( routine, param ) {
		var i;
		for ( i = 0; i < fams.length; i++ ) {
			if ( fams[ i ].params.indexOf( param ) >= 0 && ( !fams[ i ].re || fams[ i ].re.test( routine ) ) ) {
				return fams[ i ].values;
			}
		}
		return null;
	};
}


function hasLogic( ast ) {
	return /\.(AND|OR|NOT)\./.test( fexpr.fortran( ast ) );
}

// The argument list in SUBROUTINE-statement order. The signature cache is
// built from doc comments, which can list arguments out of order or omit one;
// an omitted argument takes its declared type, with intent 'in' if scalar.
function sourceArgs( sig, facts ) {
	var cached = {};
	( sig.arguments || [] ).forEach( function each( a ) {
		cached[ a.name.toUpperCase() ] = a;
	});
	if ( !facts || !facts.args ) {
		return sig.arguments || [];
	}
	return facts.args.map( function m( n ) {
		var t;
		if ( cached[ n ] ) {
			return cached[ n ];
		}
		t = ( facts.types && facts.types[ n ] ) || null;
		return {
			'name': n,
			'intent': ( n === 'INFO' ) ? 'out' : 'in',
			'type': ( facts.decl && facts.decl[ n ] ) ? t + ' array' : t,
			'undocumented': true
		};
	});
}

// AST helpers.
function safeParse( text ) {
	try {
		return fexpr.parse( text );
	} catch ( err ) {
		return null;
	}
}

// `X < R` (or `X .LT. R`) → R; else null.
function lessThan( ast, X ) {
	if ( ast && ast.type === 'bin' && ast.op === '<' && ast.l.type === 'id' && ast.l.name === X ) {
		return ast.r;
	}
	return null;
}

// `MAX(1, E)` → E.
function unmax( ast ) {
	if ( ast.type === 'call' && ast.name === 'MAX' && ast.args.length === 2 && ast.args[ 0 ].type === 'num' && ast.args[ 0 ].v === 1 ) {
		return ast.args[ 1 ];
	}
	return ast;
}

// A workspace-size check `LW < R` or `LW < R .AND. .NOT.LQUERY` → R.
function lworkMin( ast, LW ) {
	var r = lessThan( ast, LW );
	if ( r ) {
		return r;
	}
	if ( ast && ast.type === 'bin' && ast.op === '&&' && ast.r.type === 'not' && ast.r.e.type === 'id' && ast.r.e.name === 'LQUERY' ) {
		return lessThan( ast.l, LW );
	}
	return null;
}

// Restate `ld < ROWS` / `ld < max( 1, ROWS )` inside a check as the same
// bound on COLS. Returns null if the check has no such bound.
function substituteBound( js, ld, rows, cols ) {
	var flat = js.replace( /\s+/g, '' );
	var r = rows.replace( /\s+/g, '' );
	var hit = false;
	var pats = [ ld + '<max(1,' + r + ')', ld + '<max(1,(' + r + '))', ld + '<' + r, ld + '<(' + r + ')' ];
	pats.forEach( function each( pat ) {
		var i = 0;
		var j;
		while ( ( j = flat.indexOf( pat, i ) ) >= 0 ) {
			if ( ( j > 0 && /\w/.test( flat[ j - 1 ] ) ) || /\w/.test( flat[ j + pat.length ] || '' ) ) {
				i = j + 1;
				continue;
			}
			flat = flat.slice( 0, j ) + ld + '<max(1,' + cols.replace( /\s+/g, '' ) + ')' + flat.slice( j + pat.length );
			hit = true;
			i = j + 1;
		}
	});
	return hit ? flat : null;
}

// BUILD //

function build( routine, sig, facts, options ) {
	var lookupOption = optionTable( options );
	var args = sourceArgs( sig, facts );
	var names = {};
	var byName = {};
	var params = [];
	var notes = [];
	var untranslated = [];
	var code = routine.slice( 1, 3 );
	var doc = ( facts && facts.doc ) || {};
	var locals = ( facts && facts.locals ) || {};

	args.forEach( function each( a ) {
		names[ a.name.toUpperCase() ] = true;
	});
	function isArg( n ) {
		return names[ n ] === true;
	}

	// Pass 1: Fortran facts per argument.
	args.forEach( function each( a, idx ) {
		var F = a.name.toUpperCase();
		var p = {
			'fortran': F,
			'position': idx + 1,
			'dtype': dtypeOf( a.type ) || dtypeOf( facts && facts.types && facts.types[ F ] ),
			'intent': intentOf( a.intent )
		};
		var decl = facts && facts.decl && facts.decl[ F ];
		var docd = facts && facts.docDims && facts.docDims[ F ] && dimsOf( 'dimension ' + facts.docDims[ F ] );
		if ( decl || isArray( a.type ) ) {
			// Rank from the declaration (`A( LDA, * )`); extents from the doc
			// comment when it agrees on rank, else the declaration.
			p.dims = ( docd && ( !decl || docd.length === decl.length ) ) ? docd : ( decl ? decl.map( function u( d ) {
				return d.replace( /\s+/g, '' );
			}) : ( dimsOf( a.type ) || [ '*' ] ) );
		}
		if ( a.undocumented ) {
			notes.push( 'argument ' + F + ' is not in the doc comment; type from its declaration' + ( ( p.dims || F === 'INFO' ) ? '' : ', intent assumed in' ) );
		}
		byName[ F ] = p;
		params.push( p );
	});

	// Which LD/INC argument belongs to which array.
	function arrayWithLD( ld ) {
		var hit = null;
		params.forEach( function each( p ) {
			if ( p.dims && p.dims.length === 2 && p.dims[ 0 ] === ld && !hit ) {
				hit = p.fortran;
			}
		});
		if ( !hit && byName[ ld.slice( 2 ) ] && byName[ ld.slice( 2 ) ].dims ) {
			hit = ld.slice( 2 );
		}
		return hit;
	}
	// The 1-D array whose declared extent uses INCx; else the array argument
	// immediately before it (the reference's `X, INCX` adjacency).
	function arrayWithInc( inc ) {
		var hit = null;
		var re = new RegExp( '\\b' + inc + '\\b' );
		var prev;
		params.forEach( function each( p ) {
			if ( p.dims && p.dims.length === 1 && re.test( p.dims[ 0 ] ) && !hit ) {
				hit = p.fortran;
			}
		});
		prev = params[ byName[ inc ].position - 2 ];
		if ( !hit && prev && prev.dims && prev.dims.length === 1 ) {
			hit = prev.fortran;
		}
		return hit;
	}
	function inDims( F ) {
		var re = new RegExp( '\\b' + F + '\\b' );
		return params.some( function some( p ) {
			return p.dims && p.dims.some( function s( d ) {
				return re.test( d );
			});
		});
	}
	function checkedNonnegative( F ) {
		return ( ( facts && facts.checks ) || [] ).some( function some( c ) {
			return new RegExp( '^\\(?\\s*' + F + '\\s*(\\.LT\\.|<)\\s*0\\s*\\)?$' ).test( c.cond );
		}) || ( doc[ F ] || [] ).indexOf( '>= 0' ) >= 0 || ( ( facts && facts.quick ) || [] ).some( function some( q ) {
			// a quick return on `N <= 0` / `N.EQ.0` treats N as a size
			return new RegExp( '\\b' + F + '\\s*(\\.LE\\.|\\.EQ\\.|<=|==)\\s*0\\b' ).test( q.cond );
		});
	}

	// Pass 2: roles.
	params.forEach( function each( p ) {
		var F = p.fortran;
		var of;
		if ( p.dims ) {
			if ( WORKSPACE_RE.test( F ) ) {
				p.role = 'workspace';
			} else if ( p.dims.length >= 2 ) {
				p.role = ( BANDED_CODES[ code ] && LD_RE.test( p.dims[ 0 ] ) && !ldIsMaxForm( p.dims[ 0 ] ) ) ? 'banded' : 'matrix';
			} else if ( /\(?\w+\*\(\w+\+1\)\)?\/2/.test( p.dims[ 0 ] ) && ( /P$/.test( F ) || RFP_CODES[ code ] || F === 'ARF' ) ) {
				p.role = 'packed';
				p.format = ( RFP_CODES[ code ] || F === 'ARF' ) ? 'rfp' : 'packed';
			} else if ( p.dtype === 'int32' ) {
				p.role = 'index';
			} else {
				p.role = 'vector';
			}
			return;
		}
		if ( F === 'INFO' && p.dtype === 'int32' && p.intent !== 'in' ) {
			// An in/out INFO (ARPACK: on entry it selects the initial
			// residual) also needs an input parameter, `infoIn` (S11).
			p.role = 'info';
			return;
		}
		if ( WORKSIZE_RE.test( F ) && p.dtype === 'int32' && F !== 'LWORKL' ) {
			p.role = 'lwork';
			of = F.slice( 1 );
			if ( byName[ of ] ) {
				p.of = of;
			}
			return;
		}
		if ( LD_RE.test( F ) && p.dtype === 'int32' ) {
			of = arrayWithLD( F );
			if ( of ) {
				p.role = 'ld';
				p.of = of;
				return;
			}
		}
		if ( INC_RE.test( F ) && p.dtype === 'int32' ) {
			of = arrayWithInc( F );
			if ( of ) {
				p.role = 'inc';
				p.of = of;
				return;
			}
		}
		if ( p.dtype === 'string' ) {
			p.role = 'flag';
			return;
		}
		// INTEGER-coded options (the extended-precision la_* routines take
		// TRANS/UPLO as ILATRANS/ILAUPLO codes; laic1's JOB is 1 or 2). The JS
		// takes the canonical option string (N1).
		if ( p.dtype === 'int32' && ( ( /^la_/.test( routine.slice( 1 ) ) && /^(TRANS|TRANS_TYPE|UPLO)$/.test( F ) ) || ( routine.slice( 1 ) === 'laic1' && F === 'JOB' ) ) ) {
			p.role = 'flag';
			p.dtype = 'string';
			notes.push( 'option ' + F + ' is an INTEGER code in the reference; the JS takes the option string' );
			return;
		}
		if ( p.dtype === 'int32' && p.intent === 'in' && ( checkedNonnegative( F ) || inDims( F ) ) ) {
			p.role = 'dim';
			return;
		}
		p.role = 'scalar';
	});

	// Is the doc/check constraint of an LD argument `max(1, X)` (dense) rather
	// than a band width (`KL+KU+1`)?
	function ldIsMaxForm( ld ) {
		var cs = ( doc[ ld ] || [] ).concat( ( ( facts && facts.checks ) || [] ).filter( function f( c ) {
			return new RegExp( '^' + ld + '\\s*(\\.LT\\.|<)' ).test( c.cond );
		}).map( function m( c ) {
			return c.cond;
		}) );
		if ( !cs.length ) {
			return false;
		}
		return cs.every( function every( c ) {
			return /MAX\s*\(\s*1\s*,/.test( c );
		});
	}

	// JS names (needed before emitting expressions).
	params.forEach( function each( p ) {
		p.name = jsName( p.fortran, p.role, p.dims, byName, p.intent );
	});

	var ctx = {
		'name': function name( F ) {
			if ( byName[ F ] ) {
				return byName[ F ].name;
			}
			throw new Error( 'unknown identifier ' + F );
		},
		'dtype': function dtype( F ) {
			return byName[ F ] ? byName[ F ].dtype : null;
		},
		'option': function option( F, letter ) {
			var vals = lookupOption( routine, F );
			if ( !vals || !vals[ letter ] ) {
				throw new Error( 'no canonical value for ' + F + '=\'' + letter + '\'' );
			}
			return vals[ letter ];
		}
	};

	// Translate a Fortran expression (locals inlined). Returns { fortran, js }
	// with js null (and an `untranslated` note) when outside the grammar.
	function translate( text, what, covered ) {
		var out = { 'fortran': text };
		var ast;
		try {
			ast = fexpr.inline( fexpr.parse( text ), locals, isArg );
			if ( covered ) {
				ast = fexpr.assumeValid( ast, covered );
			}
			out.js = fexpr.emit( ast, ctx );
		} catch ( err ) {
			out.js = null;
			untranslated.push( what + ': ' + err.message );
		}
		return out;
	}

	// Pass 3: shapes.
	params.forEach( function each( p ) {
		var t;
		var m;
		if ( !p.dims ) {
			return;
		}
		if ( p.role === 'matrix' || p.role === 'banded' || ( p.role === 'workspace' && p.dims.length === 2 ) ) {
			p.ld = LD_RE.test( p.dims[ 0 ] ) && byName[ p.dims[ 0 ] ] ? p.dims[ 0 ] : null;
			t = rowsOf( p );
			if ( t ) {
				p.rows = translate( t, p.fortran + '.rows' );
			}
			if ( p.dims[ 1 ] && p.dims[ 1 ] !== '*' ) {
				p.cols = translate( p.dims[ 1 ], p.fortran + '.cols' );
			}
			return;
		}
		// 1-D: logical length. `1+(N-1)*ABS(INCX)` is a strided extent of N.
		t = p.dims[ 0 ];
		if ( conditionalLength( p ) ) {
			return;
		}
		m = /^\(?1\+\((.+)-1\)\*ABS\((INC\w*)\)\)?$/.exec( t );
		if ( m ) {
			p.length = translate( m[ 1 ], p.fortran + '.length' );
			return;
		}
		if ( t !== '*' && !/\bL\w*WORK\w*\b/.test( t ) ) {
			p.length = translate( t, p.fortran + '.length' );
		}
	});

	// A 1-D extent that depends on an option (`(N) if SIDE = 'L' or (M) if
	// SIDE = 'R'`; ticket 0062): its length is a JS conditional on the option's
	// canonical value. Returns false (first-alternative fallback) unless every
	// alternative is 1-D, translatable, and the option has canonical values.
	function conditionalLength( p ) {
		var c = facts && facts.docDimsCond && facts.docDimsCond[ p.fortran ];
		var flag;
		var vals;
		var parts = [];
		var letters;
		var ok = true;
		var js;
		if ( !c || !byName[ c.flag ] ) {
			return false;
		}
		flag = byName[ c.flag ];
		vals = lookupOption( routine, c.flag );
		letters = Object.keys( c.cases );
		letters.forEach( function each( L ) {
			var d = dimsOf( 'dimension ' + c.cases[ L ] );
			var mm;
			var tr;
			if ( !ok || !d || d.length !== 1 || !vals || ( L !== '*' && !vals[ L ] ) ) {
				ok = false;
				return;
			}
			mm = /^\(?1\+\((.+)-1\)\*ABS\((INC\w*)\)\)?$/i.exec( d[ 0 ] );
			tr = translate( mm ? mm[ 1 ] : d[ 0 ], p.fortran + '.length' );
			if ( !tr.js ) {
				ok = false;
				return;
			}
			parts.push( { 'value': vals[ L ], 'letter': L, 'fortran': tr.fortran, 'js': tr.js } );
		});
		// `otherwise` is the fallback: last.
		parts.sort( function s( a, b ) {
			return ( a.letter === '*' ) - ( b.letter === '*' );
		});
		if ( !ok || parts.length < 2 ) {
			return false;
		}
		// Branches with the same value as the fallback add nothing.
		js = parts[ parts.length - 1 ].js;
		for ( var i = parts.length - 2; i >= 0; i-- ) {
			if ( parts[ i ].js !== js ) {
				js = '( ' + flag.name + ' === \'' + parts[ i ].value + '\' ) ? ' + parts[ i ].js + ' : ' + js;
			}
		}
		if ( js === parts[ parts.length - 1 ].js && parts.every( function same( q ) {
			return q.js === js;
		}) ) {
			return false;
		}
		p.length = {
			'fortran': parts.map( function f( q ) {
				return '(' + q.fortran + ')' + ( ( q.letter === '*' ) ? ' otherwise' : ' if ' + c.flag + " = '" + q.letter + "'" );
			}).join( ' or ' ),
			'js': js
		};
		return true;
	}

	// Storage rows of a 2-D array: from its LD check, else its LD doc.
	function rowsOf( p ) {
		var ld = p.dims[ 0 ];
		var hit = null;
		if ( !LD_RE.test( ld ) || !byName[ ld ] ) {
			return ( ld !== '*' ) ? ld : null;
		}
		( ( facts && facts.checks ) || [] ).forEach( function each( c ) {
			var r = lessThan( safeParse( c.cond ), ld );
			if ( r && !hit && !c.guard ) {
				hit = fexpr.fortran( unmax( r ) );
			}
		});
		if ( !hit && doc[ ld ] ) {
			doc[ ld ].forEach( function each( d ) {
				var ast;
				if ( !hit && /^>= /.test( d ) && d !== '>= 1' ) {
					ast = safeParse( d.slice( 3 ) );
					if ( ast ) {
						hit = fexpr.fortran( unmax( ast ) );
					}
				}
			});
		}
		return hit;
	}

	// Pass 4: checks.
	var checks = [];
	var wsMin = {};
	( ( facts && facts.checks ) || [] ).forEach( function each( c ) {
		var pos = Math.abs( c.info );
		var p = params[ pos - 1 ];
		var rec = { 'info': c.info };
		var ast;
		var ids;
		var m;
		if ( !p ) {
			untranslated.push( 'check INFO=' + c.info + ': no argument at that position' );
			return;
		}
		// A check that doesn't mention the argument at |INFO| tests the first
		// argument it does mention (the reference misnumbers some INFO values,
		// e.g. DLA_GBAMV's LDAB/INCX/INCY checks).
		if ( !new RegExp( '\\b' + p.fortran + '\\b' ).test( c.cond ) ) {
			ids = ( c.cond.replace( /'[^']*'/g, '' ).toUpperCase().match( /\b[A-Z][A-Z0-9_]*\b/g ) || [] ).filter( isArg );
			if ( ids.length ) {
				notes.push( 'check INFO=' + c.info + ' tests ' + ids[ 0 ] + ', not argument ' + pos + ' (' + p.fortran + '): the reference misnumbers it' );
				p = byName[ ids[ 0 ] ];
			}
		}
		rec.param = p.fortran;
		ast = safeParse( c.cond );
		// Workspace size checks become the workspace's minimum length (W1/W3).
		if ( p.role === 'lwork' ) {
			m = c.guard ? null : lworkMin( ast, p.fortran );
			if ( m ) {
				wsMin[ p.fortran ] = fexpr.fortran( m );
			} else if ( !wsMin[ p.fortran ] ) {
				wsMin[ p.fortran ] = null;
				notes.push( 'workspace check for ' + p.fortran + ' not reducible to a minimum: ' + c.cond );
			}
			return;
		}
		rec.kind = 'expr';
		if ( !c.guard && ast ) {
			m = lessThan( ast, p.fortran );
			if ( m && m.type === 'num' && m.v === 0 ) {
				rec.kind = 'nonnegative';
			} else if ( m && p.role === 'ld' && !hasLogic( m ) ) {
				rec.kind = 'ld';
				rec.matrix = p.of;
				rec.min = translate( fexpr.fortran( m ), 'check ' + c.info + '.min' );
			} else if ( p.role === 'inc' && ast.type === 'bin' && ast.op === '===' && ast.l.type === 'id' && ast.l.name === p.fortran && ast.r.type === 'num' && ast.r.v === 0 ) {
				rec.kind = 'nonzero';
				rec.vector = p.of;
			} else if ( p.role === 'flag' ) {
				enumCheck( rec, p, ast );
			}
		} else if ( p.role === 'flag' && ast ) {
			enumCheck( rec, p, ast );
		}
		rec.fortran = c.cond;
		if ( c.guard ) {
			rec.guard = c.guard;
		}
		// An option an earlier check validated holds one of its values here.
		var tr = translate( c.guard ? '(' + c.guard + ') .AND. (' + c.cond + ')' : c.cond, 'check ' + c.info, function covered( F, letters ) {
			return checks.some( function v( e ) {
				var vals = lookupOption( routine, F );
				return e.kind === 'enum' && e.param === F && e.values && vals && e.fortranValues.split( '' ).every( function has( L ) {
					return letters.some( function eq( x ) {
						return vals[ x ] === vals[ L ];
					});
				});
			});
		});
		rec.js = tr.js;
		// An output argument's value on entry is meaningless (dhsein's
		// `MM.LT.M` tests the M it computed from SELECT; in JS M is an array).
		ids = ( ( c.guard || '' ) + ' ' + c.cond ).replace( /'[^']*'/g, '' ).toUpperCase().match( /\b[A-Z][A-Z0-9_]*\b/g ) || [];
		ids = ids.filter( function f( n ) {
			return isArg( n ) && byName[ n ].intent === 'out' && n !== 'INFO';
		});
		if ( rec.js && ids.length ) {
			rec.js = null;
			untranslated.push( 'check ' + c.info + ': tests the output argument ' + ids[ 0 ] + ' (its value is computed, not passed in)' );
		}
		checks.push( rec );
	});

	// An option inlined as a code (`ICOMPZ = 0/1/2`, else -1) is first checked
	// for validity (`ICOMPZ.LT.0`); every later check runs only for a valid
	// option, so its `: -1` arm can never be taken (dsteqr's LDZ check). Drop
	// that arm there: the innermost `(x === 'v' ? k : -1)` becomes `k`, which is
	// the same value for every option the validity check lets through.
	checks.forEach( function each( rec, i ) {
		var m;
		if ( !rec.js || !/<\s*0\s*$/.test( rec.js ) ) {
			return;
		}
		m = /\(\w+ === '[^']+' \? (-?\d+) : -1\)/.exec( rec.js );
		if ( !m ) {
			return;
		}
		checks.slice( i + 1 ).forEach( function later( r ) {
			if ( r.js && r.js.indexOf( m[ 0 ] ) >= 0 ) {
				r.js = r.js.split( m[ 0 ] ).join( m[ 1 ] );
			}
		});
	});

	// A check guarded by one option value (`fact === 'factored' && ( … )`)
	// runs only for that value, so an inlined local that tests the same option
	// inside it is decided: `( fact === 'not-factored' || fact === 'equilibrate'
	// ? false : e )` is `( e )` (zgesvx's EQUED check). Fold those, so the
	// generated prologue has no branch that no input can take.
	checks.forEach( function each( rec ) {
		var g;
		if ( !rec.js ) {
			return;
		}
		g = /^(\w+) === '([^']+)' && /.exec( rec.js );
		if ( !g ) {
			return;
		}
		rec.js = rec.js.replace( /\(((?:\w+ === '[^']+'(?: \|\| )?)+) \? (true|false) : ([^()]*)\)/g, function fold( whole, test, t, e ) {
			var terms = test.split( ' || ' ).map( function m( x ) {
				return /^(\w+) === '([^']+)'$/.exec( x );
			});
			if ( !terms.every( function ok( x ) {
				return x && x[ 1 ] === g[ 1 ];
			}) ) {
				return whole;
			}
			return ( terms.some( function hit( x ) {
				return x[ 2 ] === g[ 2 ];
			}) ) ? t : '(' + e + ')';
		});
	});

	// A boolean chain over one option, `( X === 'a' ? false : ( X === 'b' ?
	// true : false ) )` (an inlined LOGICAL local such as zgges's ILVSL), is
	// decided for every value X's own enum check accepts, so its final arm
	// is unreachable: no input could take that branch of the generated
	// prologue. Fold it to `( X === 'b' )` (or `true`/`false`).
	function foldOptionChains() {
		var accepted = {};
		checks.forEach( function each( rec ) {
			var p = byName[ rec.param ];
			if ( rec.kind === 'enum' && rec.values && p ) {
				accepted[ p.name ] = rec.values;
			}
		});
		var CHAIN = /^\((\w+) === '([^']+)' \? (true|false) : /;
		// Parse a chain at `i` (an opening parenthesis); null if not one.
		function chain( js, i ) {
			var m = CHAIN.exec( js.slice( i ) );
			var arms = [];
			var name;
			var rest;
			var end;
			if ( !m ) {
				return null;
			}
			name = m[ 1 ];
			arms.push( [ m[ 2 ], m[ 3 ] === 'true' ] );
			rest = i + m[ 0 ].length;
			if ( /^(true|false)\)/.test( js.slice( rest ) ) ) {
				end = rest + js.slice( rest ).indexOf( ')' ) + 1;
				return { 'name': name, 'arms': arms, 'otherwise': js.slice( rest ).startsWith( 'true' ), 'end': end };
			}
			var inner = chain( js, rest );
			if ( !inner || inner.name !== name || js.charAt( inner.end ) !== ')' ) {
				return null;
			}
			return { 'name': name, 'arms': arms.concat( inner.arms ), 'otherwise': inner.otherwise, 'end': inner.end + 1 };
		}
		checks.forEach( function each( rec ) {
			var i;
			var c;
			var vals;
			var yes;
			var rep;
			if ( !rec.js || rec.kind === 'enum' ) {
				return;
			}
			for ( i = 0; i < rec.js.length; i++ ) {
				if ( rec.js.charAt( i ) !== '(' ) {
					continue;
				}
				c = chain( rec.js, i );
				vals = c && accepted[ c.name ];
				if ( !vals ) {
					continue;
				}
				yes = vals.filter( function decided( v ) {
					var hit = c.arms.find( function f( a ) {
						return a[ 0 ] === v;
					});
					return hit ? hit[ 1 ] : c.otherwise;
				});
				if ( yes.length === vals.length ) {
					rep = 'true';
				} else if ( yes.length === 0 ) {
					rep = 'false';
				} else {
					rep = '(' + yes.map( function eq( v ) {
						return c.name + ' === \'' + v + '\'';
					}).join( ' || ' ) + ')';
				}
				rec.js = rec.js.slice( 0, i ) + rep + rec.js.slice( c.end );
			}
		});
	}

	// An option check whose verdict is definite for every letter (given the
	// routine's locals) is an enum; record the accepted set.
	function enumCheck( rec, p, ast ) {
		var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split( '' );
		var acc = [];
		var definite = true;
		var full;
		try {
			full = fexpr.inline( ast, locals, isArg );
		} catch ( err ) {
			return;
		}
		letters.forEach( function each( L ) {
			var v = fexpr.evaluate( full, {
				'value': function value( n ) {
					if ( n === p.fortran ) {
						return L;
					}
					return null;
				}
			});
			if ( v === null ) {
				definite = false;
			} else if ( v === false ) {
				acc.push( L );
			}
		});
		if ( !definite ) {
			return;
		}
		rec.kind = 'enum';
		rec.fortranValues = acc.join( '' );
		var vals = lookupOption( routine, p.fortran );
		// Letters that alias one value ('1' and 'O': one-norm) give it once.
		rec.values = vals ? acc.map( function m( L ) {
			return vals[ L ] || null;
		}).filter( function u( v, i, a ) {
			return v === null || a.indexOf( v ) === i;
		}) : null;
		if ( !vals || rec.values.indexOf( null ) >= 0 ) {
			notes.push( 'option ' + p.fortran + ' accepts \'' + rec.fortranValues + '\' but spec/options.json has no canonical value for ' + ( vals ? acc.filter( function f( L ) {
				return !vals[ L ];
			}).join( '' ) : 'this family' ) );
			rec.values = null;
		}
	}

	foldOptionChains();

	// Pass 4b: row-major leading-dimension bounds (CONVENTIONS V5). The
	// column-major bound is the reference check (on the rows); the row-major
	// bound is the same check on the array's column count. A check whose
	// array is square needs no `rowMajor`; `rowMajor: null` means the column
	// count is not established and only the column-major check exists.
	var stem = routine.replace( /^[sdcz]/, '' );
	var colsTable = Object.assign( {}, COLS[ stem ] || {}, COLS[ routine ] || {} );
	var bySpecName = {};
	params.forEach( function each( p ) {
		bySpecName[ p.name ] = p;
	});
	function refsOutput( js ) {
		return ( js.replace( /'[^']*'/g, '' ).match( /\b[A-Za-z_]\w*\b/g ) || [] ).some( function some( id ) {
			var q = bySpecName[ id ];
			return q && ( q.intent !== 'in' || q.dims );
		});
	}
	params.forEach( function each( p ) {
		if ( !p.ld ) {
			return;
		}
		if ( Object.prototype.hasOwnProperty.call( colsTable, p.ld ) ) {
			p.cols = { 'fortran': p.dims[ 1 ], 'js': colsTable[ p.ld ] };
			if ( p.cols.js === null ) {
				untranslated.push( p.fortran + '.cols: the row-major column count is not established' );
			}
			return;
		}
		if ( p.cols && p.cols.js && refsOutput( p.cols.js ) ) {
			untranslated.push( p.fortran + '.cols: ' + p.cols.fortran + ' names an output argument' );
			p.cols.js = null;
		}
	});
	checks.forEach( function each( c ) {
		var ldp = byName[ c.param ];
		var arr = ldp && ldp.role === 'ld' ? byName[ ldp.of ] : null;
		var rm = ROW_MAJOR[ stem ] && ROW_MAJOR[ stem ][ c.param ];
		var sub;
		if ( !arr || !c.js ) {
			return;
		}
		if ( rm ) {
			c.rowMajor = rm;
			return;
		}
		if ( !arr.cols || !arr.cols.js ) {
			c.rowMajor = null;
			untranslated.push( 'check ' + c.info + '.rowMajor: the column count of ' + arr.fortran + ' is not established' );
			return;
		}
		if ( arr.rows && arr.rows.js === arr.cols.js ) {
			return;
		}
		if ( c.kind === 'ld' ) {
			c.rowMajor = ldp.name + ' < max( 1, ' + arr.cols.js + ' )';
			return;
		}
		sub = arr.rows && arr.rows.js ? substituteBound( c.js, ldp.name, arr.rows.js, arr.cols.js ) : null;
		if ( sub === null ) {
			c.rowMajor = null;
			untranslated.push( 'check ' + c.info + '.rowMajor: no `' + ldp.name + ' < ' + ( arr.rows ? arr.rows.js : '?' ) + '` bound to restate on the columns' );
			return;
		}
		c.rowMajor = sub;
	});

	// Pass 5: workspace minimum lengths.
	params.forEach( function each( p ) {
		var lw;
		var t = null;
		var src = null;
		if ( p.role !== 'workspace' ) {
			return;
		}
		lw = byName[ 'L' + p.fortran ];
		if ( lw && lw.role === 'lwork' ) {
			if ( wsMin[ lw.fortran ] ) {
				t = wsMin[ lw.fortran ];
				src = 'check';
			} else if ( doc[ lw.fortran ] && /^>= /.test( doc[ lw.fortran ][ 0 ] ) && fexpr.parsePrefix( doc[ lw.fortran ][ 0 ].slice( 3 ) ) ) {
				// doc text can run on into prose ("MAX(1,N) IS SUFFICIENT")
				t = fexpr.fortran( fexpr.parsePrefix( doc[ lw.fortran ][ 0 ].slice( 3 ) ) );
				src = 'doc';
			}
		} else if ( p.dims.length === 1 && p.dims[ 0 ] !== '*' && !/\bL\w*WORK\w*\b/.test( p.dims[ 0 ] ) ) {
			t = p.dims[ 0 ];
			src = 'dimension';
		} else if ( p.dims.length === 2 ) {
			src = 'dimension';
		}
		// The reference picks its path from this workspace's length (ticket 0100).
		if ( lw && lw.role === 'lwork' && facts && facts.adaptive && facts.adaptive.indexOf( lw.fortran ) >= 0 ) {
			p.adaptive = true;
		}
		if ( t ) {
			p.minLength = translate( t, p.fortran + '.minLength' );
			p.minLength.source = src;
		} else if ( p.dims.length === 1 ) {
			p.minLength = null;
			notes.push( 'no derivable minimum length for workspace ' + p.fortran );
		}
	});

	// Quick returns.
	var quick = ( ( facts && facts.quick ) || [] ).map( function m( q, i ) {
		var tr = translate( q.cond, 'quickReturn ' + i );
		var out = { 'fortran': q.cond, 'js': tr.js };
		if ( q.body.length ) {
			out.sets = q.body;
		}
		return out;
	});

	// Synthetic parameters (no Fortran counterpart).
	var out = [];
	if ( byName.IDO ) {
		out.push( { 'name': 'state', 'fortran': null, 'role': 'state', 'dtype': 'object', 'intent': 'inout' } );
	}
	params.forEach( function each( p ) {
		out.push( order( p ) );
	});

	// Return value (CONVENTIONS S11).
	var returns;
	if ( ( sig.kind || ( facts && facts.kind ) ) === 'function' ) {
		returns = { 'kind': 'value', 'dtype': dtypeOf( sig.returns ) };
		// S1: a complex FUNCTION writes its result into `out, offsetOut`,
		// except the level-1 BLAS dot products, which return a Complex128
		// as stdlib's do (S1 carve-out, ruled 2026-11-19).
		if ( /^complex/.test( returns.dtype ) && !/^[cz]dot[cu]$/.test( routine ) ) {
			out.push( { 'name': 'out', 'fortran': null, 'role': 'result', 'dtype': returns.dtype, 'intent': 'out' } );
		}
	} else if ( byName.INFO && byName.INFO.role === 'info' ) {
		returns = { 'kind': 'info' };
	} else {
		var last = null;
		params.forEach( function each( p ) {
			if ( p.dims && p.role !== 'workspace' && p.intent !== 'in' ) {
				last = p.name;
			}
		});
		returns = last ? { 'kind': 'array', 'param': last } : { 'kind': 'none' };
	}

	var spec = {
		'routine': routine,
		'package': ( facts && facts.package ) || null,
		'kind': sig.kind || ( facts && facts.kind ) || null,
		'signature': sig.signature,
		'returns': returns,
		'params': out,
		'checks': checks,
		'quickReturn': quick
	};
	if ( !facts ) {
		notes.push( 'no Fortran source facts (signature-only routine): checks and quick returns unknown' );
	}
	if ( untranslated.length ) {
		spec.untranslated = untranslated;
	}
	if ( notes.length ) {
		spec.notes = notes;
	}
	return spec;
}

// Stable key order inside a param object.
var KEY_ORDER = [ 'name', 'fortran', 'position', 'role', 'format', 'dtype', 'intent', 'of', 'dims', 'ld', 'rows', 'cols', 'length', 'minLength' ];
function order( p ) {
	var o = {};
	KEY_ORDER.forEach( function each( k ) {
		if ( p[ k ] !== undefined ) {
			o[ k ] = p[ k ];
		}
	});
	Object.keys( p ).forEach( function each( k ) {
		if ( o[ k ] === undefined && p[ k ] !== undefined ) {
			o[ k ] = p[ k ];
		}
	});
	return o;
}

module.exports = {
	'build': build,
	'dtypeOf': dtypeOf,
	'dimsOf': dimsOf
};
