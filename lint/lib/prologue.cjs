'use strict';

// The generated validation prologue of the public entry points (CONVENTIONS
// V1, V3–V8), derived from the spec's argument checks and nothing else.
//
//   prologue( spec, form, actual )  → [ check, ... ]
//
// `form` is 'ndarray' (ndarray.js) or 'strided' (<routine>.js). `actual` is the
// code's parameter list for that form; it is used only to spell each name the
// way the code spells it (names compare case-insensitively, S7). Each check is
//
//   { param, ctor, test, format, args, doc }
//
// and renders to exactly one statement:
//
//   if ( <test> ) {
//       throw new <ctor>( format( '<format>', <args> ) );
//   }
//
// The order is: the layout flag `order` (strided form, D1/V6), then the spec's
// checks in reference order (|INFO|). A leading-dimension check whose bound
// differs between layouts becomes two statements (column-major: the reference
// bound on the rows; row-major: the column count, V5). A check that names an
// argument the form does not have (an LD in ndarray.js, or a workspace length)
// is not part of that form. A check the generator could not translate
// (`js: null` in the spec) is not generated.

var espree = require( 'espree' );
var specLib = require( './spec.cjs' );

var ORDINALS = [ 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth' ];
var TENS = [ '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety' ];
var UNITS = [ '', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth' ];
var TENS_ORD = [ '', '', 'Twentieth', 'Thirtieth', 'Fortieth', 'Fiftieth', 'Sixtieth', 'Seventieth', 'Eightieth', 'Ninetieth' ];

// Canonical validators (V9) for the option families stdlib has one for, keyed
// by the sorted accepted-value set.
var VALIDATORS = {
	'conjugate-transpose,no-transpose,transpose': { 'fn': 'isTransposeOperation', 'what': 'a valid transpose operation' },
	'lower,upper': { 'fn': 'isMatrixTriangle', 'what': 'a valid matrix triangle' },
	'left,right': { 'fn': 'isOperationSide', 'what': 'a valid operation side' },
	'non-unit,unit': { 'fn': 'isDiagonalType', 'what': 'a valid diagonal type' }
};

// Import path for every identifier a generated prologue may reference.
var IMPORTS = {
	'format': '@stdlib/string/format/lib/index.js',
	'isLayout': '@stdlib/blas/base/assert/is-layout/lib/index.js',
	'isTransposeOperation': '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js',
	'isMatrixTriangle': '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js',
	'isOperationSide': '@stdlib/blas/base/assert/is-operation-side/lib/index.js',
	'isDiagonalType': '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js',
	'max': '@stdlib/math/base/special/fast/max/lib/index.js',
	'min': '@stdlib/math/base/special/fast/min/lib/index.js',
	'abs': '@stdlib/math/base/special/abs/lib/index.js',
	'trunc': '@stdlib/math/base/special/trunc/lib/index.js',
	'real': '@stdlib/complex/float64/real/lib/index.js',
	'imag': '@stdlib/complex/float64/imag/lib/index.js'
};

var HELPERS = { 'max': true, 'min': true, 'abs': true, 'trunc': true, 'real': true, 'imag': true };

function ordinal( n ) {
	if ( n <= 20 ) {
		return ORDINALS[ n - 1 ];
	}
	if ( n % 10 === 0 ) {
		return TENS_ORD[ n / 10 ];
	}
	return TENS[ Math.floor( n / 10 ) ] + '-' + UNITS[ n % 10 ];
}

function lc( s ) {
	return String( s ).toLowerCase();
}

// The spec param a check names (`check.param` is the Fortran name).
function specParam( spec, fortranName ) {
	var i;
	for ( i = 0; i < spec.params.length; i++ ) {
		if ( lc( spec.params[ i ].fortran ) === lc( fortranName ) ) {
			return spec.params[ i ];
		}
	}
	return null;
}

function findArray( spec, name ) {
	var i;
	for ( i = 0; i < spec.params.length; i++ ) {
		if ( lc( spec.params[ i ].fortran ) === lc( name ) || lc( spec.params[ i ].name ) === lc( name ) ) {
			return spec.params[ i ];
		}
	}
	return null;
}

// Map: lower-cased spec param name → the form's parameter name (as the code
// spells it), for every spec param that has a name in this form.
function nameMap( spec, form, actual ) {
	var groups = specLib.baseGroups( spec );
	var names = ( form === 'strided' ) ? specLib.strided( spec ) : specLib.base( spec );
	var spell = {};
	var map = {};
	var byParam = {};
	names.forEach( function each( n, i ) {
		spell[ lc( n ) ] = ( actual && actual[ i ] && lc( actual[ i ] ) === lc( n ) ) ? actual[ i ] : n;
	});
	groups.forEach( function each( g ) {
		byParam[ lc( g.param.fortran ) ] = g;
	});
	function has( n ) {
		return Object.prototype.hasOwnProperty.call( spell, lc( n ) );
	}
	groups.forEach( function each( g ) {
		var p = g.param;
		var arr;
		var ag;
		var n;
		if ( p.role === 'ld' ) {
			arr = findArray( spec, p.of );
			n = arr ? 'LD' + arr.name.toUpperCase() : null;
		} else if ( p.role === 'inc' ) {
			arr = findArray( spec, p.of );
			ag = arr ? byParam[ lc( arr.fortran ) ] : null;
			n = ( ag && ag.names.length === 3 ) ? ag.names[ 1 ] : null;
		} else {
			n = g.names.length ? g.names[ 0 ] : null;
		}
		if ( n && has( n ) ) {
			map[ lc( p.name ) ] = spell[ lc( n ) ];
		}
	});
	if ( has( 'order' ) && form === 'strided' && specLib.takesOrder( spec ) ) {
		map.order = spell.order;
	}
	// How a check reads each argument's value: an output scalar is a
	// length-1 array (S10), or an element `x[ offsetX ]`; a scalar index the
	// JS takes 0-based (`base: 0` in the spec) is restated 1-based.
	var expr = {};
	Object.keys( map ).forEach( function each( k ) {
		expr[ k ] = map[ k ];
	});
	groups.forEach( function each( g ) {
		var p = g.param;
		var n = map[ lc( p.name ) ];
		if ( !n || p.role !== 'scalar' ) {
			return;
		}
		if ( p.intent !== 'in' || p.element === true ) {
			expr[ lc( p.name ) ] = ( g.names.length === 2 && form !== 'strided' ) ? n + '[ ' + spell[ lc( g.names[ 1 ] ) ] + ' ]' : n + '[ 0 ]';
		} else if ( p.base === 0 ) {
			expr[ lc( p.name ) ] = '( ' + n + ' + 1 )';
		}
	});
	return { 'map': map, 'expr': expr, 'names': names.map( function m( n ) {
		return spell[ lc( n ) ];
	}) };
}

// Rename the identifiers of a spec JS expression into this form. Returns null
// if the expression names something the form does not have.
function rename( js, map ) {
	var ast;
	var out = '';
	var last = 0;
	var ok = true;
	var ids = [];
	try {
		ast = espree.parse( '(' + js + ')', { 'ecmaVersion': 2022, 'range': true } );
	} catch ( e ) {
		return null;
	}
	( function walk( node, parent ) {
		var k;
		if ( !node || typeof node.type !== 'string' ) {
			return;
		}
		if ( node.type === 'Identifier' ) {
			if ( !( parent && parent.type === 'MemberExpression' && parent.property === node && !parent.computed ) ) {
				ids.push( node );
			}
			return;
		}
		for ( k in node ) {
			if ( k === 'parent' || k === 'range' ) {
				continue;
			}
			if ( Array.isArray( node[ k ] ) ) {
				node[ k ].forEach( function w( c ) {
					walk( c, node );
				});
			} else if ( node[ k ] && typeof node[ k ] === 'object' ) {
				walk( node[ k ], node );
			}
		}
	})( ast, null );
	ids.sort( function s( a, b ) {
		return a.range[ 0 ] - b.range[ 0 ];
	});
	var src = '(' + js + ')';
	ids.forEach( function each( id ) {
		var to;
		if ( HELPERS[ id.name ] ) {
			to = id.name;
		} else if ( Object.prototype.hasOwnProperty.call( map, lc( id.name ) ) ) {
			to = map[ lc( id.name ) ];
		} else {
			ok = false;
			return;
		}
		out += src.slice( last, id.range[ 0 ] ) + to;
		last = id.range[ 1 ];
	});
	if ( !ok ) {
		return null;
	}
	out += src.slice( last );
	return tidy( out.slice( 1, -1 ) );
}

// Canonical spacing (stdlib style: spaces inside parens and brackets).
function tidy( js ) {
	var toks = espree.tokenize( js, { 'ecmaVersion': 2022 } );
	var out = '';
	toks.forEach( function each( t, i ) {
		var prev = toks[ i - 1 ];
		var v = ( t.type === 'String' ) ? '\'' + t.value.slice( 1, -1 ).replace( /\\?'/g, '\\\'' ) + '\'' : t.value;
		if ( i > 0 ) {
			if ( v === ')' ) {
				out += ( prev.value === '(' ) ? '' : ' ';
			} else if ( v === ',' ) {
				out += '';
			} else if ( prev.value === '(' ) {
				out += ' ';
			} else if ( v === '(' && ( prev.type === 'Identifier' ) ) {
				out += '';
			} else if ( prev.value === '!' ) {
				out += '';
			} else {
				out += ' ';
			}
		}
		out += v;
	});
	return out;
}

// Strip one pair of redundant outer parens.
function unwrap( js ) {
	var depth = 0;
	var i;
	if ( js.charAt( 0 ) !== '(' || js.charAt( js.length - 1 ) !== ')' ) {
		return js;
	}
	for ( i = 0; i < js.length; i++ ) {
		if ( js[ i ] === '(' ) {
			depth += 1;
		} else if ( js[ i ] === ')' ) {
			depth -= 1;
			if ( depth === 0 && i < js.length - 1 ) {
				return js;
			}
		}
	}
	return js.slice( 1, -1 ).trim();
}

function paren( js ) {
	return /^[\w.]+$/.test( js ) ? js : '( ' + unwrap( js ) + ' )';
}

function valueFmt( p ) {
	return ( p && p.dtype === 'int32' ) ? '%d' : '%s';
}

function quoteMsg( s ) {
	return s.replace( /'/g, '"' );
}

// `max( 1, X )` → X; anything else → null.
function maxOneArg( js ) {
	var m = /^max\( 1, (.*) \)$/.exec( js );
	return m ? m[ 1 ] : null;
}

// A check on a leading-dimension argument (kind `ld`, or an `expr` such as
// `ldvl < 1 || ( wantvl && ldvl < N )`). Strided form only: the column-major
// statement is the reference check, the row-major one is `check.rowMajor`
// (absent: one statement for both layouts; null: column-major only).
function ldParamCheck( spec, c, p, nm, out ) {
	var ld = nm.map[ lc( p.name ) ];
	var pos;
	var col;
	var row;
	if ( !ld ) {
		return;
	}
	pos = nm.names.indexOf( ld ) + 1;
	col = rename( c.js, nm.expr );
	if ( !col ) {
		return;
	}
	if ( !Object.prototype.hasOwnProperty.call( c, 'rowMajor' ) ) {
		out.push( ldStatement( c, p, ld, pos, null, col ) );
		return;
	}
	out.push( ldStatement( c, p, ld, pos, 'column-major', col ) );
	row = ( c.rowMajor === null ) ? null : rename( c.rowMajor, nm.expr );
	if ( row ) {
		out.push( ldStatement( c, p, ld, pos, 'row-major', row ) );
	}
}

function ldStatement( c, p, ld, pos, layout, test ) {
	var m = new RegExp( '^' + ld + ' < (.*)$' ).exec( test );
	var bound = m ? m[ 1 ] : null;
	var inner = bound ? maxOneArg( bound ) : null;
	var where = layout ? layout + ': ' : '';
	var s = {
		'param': c.param,
		'kind': c.kind,
		'layout': layout,
		'ctor': 'RangeError',
		'test': ( layout ) ? 'order === \'' + layout + '\' && ' + paren( test ) : test
	};
	if ( c.kind === 'ld' && bound ) {
		s.format = 'invalid argument. ' + ordinal( pos ) + ' argument must be greater than or equal to ' + ( ( inner !== null ) ? 'max(1,%d)' : '%d' ) + '. Value: `%d`.';
		s.args = [ ( inner !== null ) ? inner : bound, ld ];
		s.doc = ordinal( pos ).toLowerCase() + ' argument must be greater than or equal to `' + bound + '`' + ( layout ? ' (' + layout + ')' : '' );
		return s;
	}
	s.format = 'invalid argument. ' + ordinal( pos ) + ' argument is invalid (' + where + 'rejected when `' + quoteMsg( unwrap( test ) ) + '`). Value: `%d`.';
	s.args = [ ld ];
	s.doc = ordinal( pos ).toLowerCase() + ' argument is invalid (' + where + 'rejected when `' + quoteMsg( unwrap( test ) ) + '`)';
	return s;
}

function prologue( spec, form, actual ) {
	var nm = nameMap( spec, form, actual );
	var out = [];
	var checks;
	if ( form === 'strided' && nm.map.order && specLib.takesOrder( spec ) ) {
		out.push({
			'param': 'order',
			'kind': 'order',
			'ctor': 'TypeError',
			'test': '!isLayout( ' + nm.map.order + ' )',
			'format': 'invalid argument. First argument must be a valid order. Value: `%s`.',
			'args': [ nm.map.order ],
			'doc': 'first argument must be a valid order'
		});
	}
	checks = spec.checks.slice().sort( function s( a, b ) {
		return Math.abs( a.info ) - Math.abs( b.info );
	});
	checks.forEach( function each( c ) {
		var p = specParam( spec, c.param );
		var name;
		var pos;
		var key;
		var v;
		var test;
		if ( !c.js || !p ) {
			return;
		}
		if ( p.role === 'ld' ) {
			if ( form === 'strided' ) {
				ldParamCheck( spec, c, p, nm, out );
			}
			return;
		}
		name = nm.map[ lc( p.name ) ];
		if ( !name ) {
			return;
		}
		pos = nm.names.indexOf( name ) + 1;
		name = nm.expr[ lc( p.name ) ];
		if ( c.kind === 'enum' ) {
			key = c.values.slice().sort().join( ',' );
			v = VALIDATORS[ key ];
			out.push({
				'param': c.param,
				'kind': 'enum',
				'ctor': 'TypeError',
				'test': v ? '!' + v.fn + '( ' + name + ' )' : rename( c.values.map( function m( x ) {
					return p.name + ' !== \'' + x + '\'';
				}).join( ' && ' ), nm.expr ),
				'format': 'invalid argument. ' + ordinal( pos ) + ' argument must be ' + ( v ? v.what : 'one of the following: ' + c.values.map( function m( x ) {
					return '"' + x + '"';
				}).join( ', ' ) ) + '. Value: `%s`.',
				'args': [ name ],
				'doc': ordinal( pos ).toLowerCase() + ' argument must be ' + ( v ? v.what : 'one of the following: ' + c.values.map( function m( x ) {
					return '"' + x + '"';
				}).join( ', ' ) )
			});
			return;
		}
		test = rename( c.js, nm.expr );
		if ( !test ) {
			return;
		}
		if ( c.kind === 'nonnegative' ) {
			out.push({
				'param': c.param,
				'kind': c.kind,
				'ctor': 'RangeError',
				'test': test,
				'format': 'invalid argument. ' + ordinal( pos ) + ' argument must be a nonnegative integer. Value: `%d`.',
				'args': [ name ],
				'doc': ordinal( pos ).toLowerCase() + ' argument must be a nonnegative integer'
			});
			return;
		}
		if ( c.kind === 'nonzero' ) {
			out.push({
				'param': c.param,
				'kind': c.kind,
				'ctor': 'RangeError',
				'test': test,
				'format': 'invalid argument. ' + ordinal( pos ) + ' argument must be non-zero. Value: `%d`.',
				'args': [ name ],
				'doc': ordinal( pos ).toLowerCase() + ' argument must be non-zero'
			});
			return;
		}
		// expr
		out.push({
			'param': c.param,
			'kind': c.kind,
			'ctor': ( p.dtype === 'string' ) ? 'TypeError' : 'RangeError',
			'test': test,
			'format': 'invalid argument. ' + ordinal( pos ) + ' argument is invalid (rejected when `' + quoteMsg( unwrap( test ) ) + '`). Value: `' + valueFmt( p ) + '`.',
			'args': [ name ],
			'doc': ordinal( pos ).toLowerCase() + ' argument is invalid (rejected when `' + quoteMsg( unwrap( test ) ) + '`)'
		});
	});
	return out;
}

// Source text of one check (tab-indented one level, as in a function body).
function render( c ) {
	return 'if ( ' + unwrap( c.test ) + ' ) {\n\t\tthrow new ' + c.ctor + '( format( \'' + c.format.replace( /\\/g, '\\\\' ).replace( /'/g, '\\\'' ) + '\', ' + c.args.join( ', ' ) + ' ) );\n\t}';
}

// Identifiers a prologue references that must be imported.
function imports( checks ) {
	var need = {};
	checks.forEach( function each( c ) {
		var src = c.test + ' ' + c.args.join( ' ' );
		need.format = true;
		Object.keys( IMPORTS ).forEach( function f( id ) {
			if ( new RegExp( '\\b' + id + '\\(' ).test( src ) ) {
				need[ id ] = true;
			}
		});
	});
	return Object.keys( need );
}

module.exports = {
	'prologue': prologue,
	'render': render,
	'imports': imports,
	'IMPORTS': IMPORTS,
	'nameMap': nameMap,
	'ordinal': ordinal,
	'tidy': tidy
};

// Do two pieces of source text have the same tokens (formatting aside)?
function tokens( src ) {
	try {
		return espree.tokenize( src, { 'ecmaVersion': 2022 } ).map( function m( t ) {
			return ( t.type === 'String' ) ? 'S:' + JSON.stringify( espree.parse( '(' + t.value + ')', { 'ecmaVersion': 2022 } ).body[ 0 ].expression.value ) : t.value;
		});
	} catch ( e ) {
		return null;
	}
}

function sameTokens( a, b ) {
	var x = tokens( a );
	var y = tokens( b );
	return !!x && !!y && x.length === y.length && x.every( function every( t, i ) {
		return t === y[ i ];
	});
}

module.exports.sameTokens = sameTokens;
module.exports.unwrap = unwrap;
