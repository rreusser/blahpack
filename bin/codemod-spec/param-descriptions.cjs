#!/usr/bin/env node
'use strict';

// Fills placeholder @param descriptions (lint rule jsdoc-param-description) on
// the exported function of base.js, ndarray.js and <routine>.js.
//
// Sources, in order:
//
//   1. Strides, offsets and leading dimensions: derived from the array they
//      address ("stride of the first dimension of `A`").
//   2. Workspace: the caller-owned minimum length from spec/<routine>.json
//      (Fortran's WORK(1)/LWORK prose does not apply; CONVENTIONS W*).
//   3. Everything else: the first sentence of the reference Fortran's
//      `\param` block (plus its first "On exit," sentence for in/out
//      arguments). Index arrays get "(0-based)" (CONVENTIONS S12), and so do
//      scalar indices the spec marks `base: 0` (S10).
//
// Only placeholder descriptions are touched; real ones are never rewritten.
// Developer-time only: reads the gitignored Fortran sources (CONVENTIONS T6).
//
// Usage: node bin/codemod-spec/param-descriptions.cjs [routine ...]

var fs = require( 'fs' );
var path = require( 'path' );
var H = require( '../../lint/lib/doc-health.cjs' );

var ROOT = path.join( __dirname, '..', '..' );
var FORTRAN_DIRS = [
	'data/lapack-3.12.0/SRC',
	'data/lapack-3.12.0/INSTALL',
	// LAPACK's bundled BLAS carries doxygen docs; some BLAS-3.12.0 copies have none.
	'data/lapack-3.12.0/BLAS/SRC',
	'data/BLAS-3.12.0',
	'data/BLAS-3.12.0/SRC'
];
var ORDINAL = { '1': 'first', '2': 'second' };
var OPTIONS = JSON.parse( fs.readFileSync( path.join( ROOT, 'spec', 'options.json' ), 'utf8' ) ).families;

// Fortran option letter → canonical JS string for argument P of a routine (spec/options.json).
function letterMap( routine, P ) {
	var i;
	var f;
	for ( i = 0; i < OPTIONS.length; i++ ) {
		f = OPTIONS[ i ];
		if ( f.params.indexOf( P ) >= 0 && ( !f.routines || new RegExp( f.routines ).test( routine ) ) ) {
			return f.values;
		}
	}
	return null;
}

// Fallback: the spec's own enum check pairs the accepted letters with the JS values, in order.
function specLetterMap( spec, P ) {
	var c = ( spec && spec.checks || [] ).filter( function f( x ) {
		return x.kind === 'enum' && x.param === P && x.fortranValues && x.values && x.fortranValues.length === x.values.length;
	})[ 0 ];
	var map = {};
	if ( !c ) {
		return null;
	}
	c.fortranValues.split( '' ).forEach( function e( L, i ) {
		map[ L ] = c.values[ i ];
	});
	return map;
}

function escapeRe( s ) {
	return s.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}

// Rewrites Fortran idioms into their JS meaning: option letters, logicals.
function translate( text, routine, spec, self ) {
	var out = text.replace( /\.TRUE\./gi, '`true`' ).replace( /\.FALSE\./gi, '`false`' );
	( spec ? spec.params : [] ).forEach( function each( p ) {
		var map = ( p.role === 'flag' && p.fortran ) ? ( letterMap( routine, p.fortran.toUpperCase() ) || specLetterMap( spec, p.fortran.toUpperCase() ) ) : null;
		if ( !map ) {
			return;
		}
		// "P = 'A' or 'B'" (either value) → "`p === 'a'` or `p === 'b'`".
		out = out.replace( new RegExp( '\\b' + p.fortran + '\\s*=\\s*\'([A-Za-z0-9])\'\\s*or\\s*\'([A-Za-z0-9])\'(?!\\s*:)', 'gi' ), function alt( s, a, b ) {
			var va = map[ a.toUpperCase() ];
			var vb = map[ b.toUpperCase() ];
			if ( !va || !vb ) {
				return s;
			}
			return '`' + p.name + ' === \'' + va + '\'`' + ( ( va === vb ) ? '' : ' or `' + p.name + ' === \'' + vb + '\'`' );
		});
		// "P is not 'N'", "P .ne. 'N'" → "`p !== 'none'`"; "P is 'N'" → "`p === 'none'`".
		out = out.replace( new RegExp( '\\b' + p.fortran + '\\s*(is\\s+not|\\.ne\\.|\\/=|is)\\s*\'([A-Za-z0-9])\'', 'gi' ), function neg( s, op, a ) {
			var v = map[ a.toUpperCase() ];
			if ( !v ) {
				return s;
			}
			return '`' + p.name + ( /^is$/i.test( op ) ? ' === ' : ' !== ' ) + '\'' + v + '\'`';
		});
		// "= '1' or 'O':" (two letters for one enumeration entry).
		if ( self === p ) {
			out = out.replace( /=\s*'([A-Za-z0-9])'\s*or\s*'([A-Za-z0-9])'\s*:/g, function alt( s, a, b ) {
				var va = map[ a.toUpperCase() ];
				var vb = map[ b.toUpperCase() ];
				if ( !va || !vb ) {
					return s;
				}
				return ( ( va === vb ) ? '`\'' + va + '\'`' : '`\'' + va + '\'` or `\'' + vb + '\'`' ) + ':';
			});
		}
		Object.keys( map ).forEach( function k( L ) {
			var lit = '\'' + escapeRe( L ) + '\'(?:\\s*or\\s*\'' + escapeRe( L.toLowerCase() ) + '\')?';
			out = out.replace( new RegExp( '\\b' + p.fortran + '\\s*=\\s*' + lit, 'gi' ), '`' + p.name + ' === \'' + map[ L ] + '\'`' );
			if ( self === p ) {
				// An enumeration entry "= 'N': …" (not "OTHER = 'N'", which names another argument).
				out = out.replace( new RegExp( '(^|[^\\w\\s]\\s*|[^\\w]\\s)=\\s*' + lit + '\\s*:?', 'g' ), '$1`\'' + map[ L ] + '\'`:' );
				// "… + beta * B = 'T': Transpose" — a trailing colon always marks an entry.
				out = out.replace( new RegExp( '\\s=\\s*' + lit + '\\s*:', 'g' ), ' `\'' + map[ L ] + '\'`:' );
			}
		});
	});
	// A trailing alternate after a translated value: "`norm === 'one-norm'` or 'O'".
	( spec ? spec.params : [] ).forEach( function each( p ) {
		var map = ( p.role === 'flag' && p.fortran ) ? ( letterMap( routine, p.fortran.toUpperCase() ) || specLetterMap( spec, p.fortran.toUpperCase() ) ) : null;
		if ( !map ) {
			return;
		}
		out = out.replace( new RegExp( '(`' + p.name + ' === \'([^\']*)\'`)\\s*or\\s*\'([A-Za-z0-9])\'', 'g' ), function alt( s, lhs, v, L ) {
			var w = map[ L.toUpperCase() ];
			if ( !w ) {
				return s;
			}
			return ( w === v ) ? lhs : lhs + ' or `' + p.name + ' === \'' + w + '\'`';
		});
	});
	return out;
}

function fortranSource( routine ) {
	var i;
	var ext;
	var p;
	for ( i = 0; i < FORTRAN_DIRS.length; i++ ) {
		for ( ext of [ '.f', '.f90' ] ) {
			p = path.join( ROOT, FORTRAN_DIRS[ i ], routine + ext );
			if ( fs.existsSync( p ) ) {
				return fs.readFileSync( p, 'utf8' );
			}
		}
	}
	return null;
}

// Map of Fortran argument name (upper case) → description text (type line removed).
function fortranParamDocs( src ) {
	var out = {};
	// Each verbatim block documents every \param named since the previous block
	// (LAPACK groups some, e.g. "\param[out] PL" + "\param[out] PR").
	var re = /\\param\[[a-z,]+\]\s+(\w+)|\\verbatim\s*\n([\s\S]*?)\\endverbatim/gi;
	var pending = [];
	var prev;
	var m;
	var lines;
	var body;
	while ( ( m = re.exec( src ) ) !== null ) {
		if ( m[ 1 ] ) {
			pending.push( m[ 1 ].toUpperCase() );
			continue;
		}
		if ( !pending.length ) {
			continue;
		}
		lines = m[ 2 ].split( '\n' ).map( function strip( l ) {
			return l.replace( /^[*!cC]>?\s?/, '' ).replace( /^\s*>\s?/, '' ).trim();
		}).filter( Boolean );
		// Drop the "<NAME> is <TYPE>[, dimension …]" line and its continuations
		// (BLAS: "( 1 + ( n - 1 )*abs( INCX ) ) when …", "and at least …").
		if ( lines.length && /^[\w, ]+\s+(is|are)\b/i.test( lines[ 0 ] ) && pending.some( function p( n ) {
			return new RegExp( '\\b' + n + '\\b', 'i' ).test( lines[ 0 ] );
		}) ) {
			prev = lines.shift();
			while ( lines.length && ( /^\(/.test( lines[ 0 ] ) || /^and at least\b/.test( lines[ 0 ] ) || /(dimension|at least|,)$/i.test( prev ) ) ) {
				prev = lines.shift();
			}
		}
		body = lines.join( ' ' ).replace( /\s+/g, ' ' ).trim();
		if ( !body ) {
			// Type-only block ("ILO is INTEGER"): the prose follows in the next block.
			continue;
		}
		pending.forEach( function each( n ) {
			if ( body && !out[ n ] ) {
				out[ n ] = body;
			}
		});
		pending = [];
	}
	return out;
}

// Splits prose into sentences without breaking on "i.e.", "e.g.", "etc." or decimals.
function sentences( text ) {
	var protectedText = text.replace( /\b(i\.e|e\.g|w\.r\.t|etc|resp|approx|cf|vs)\./gi, function p( s ) {
		return s.replace( /\./g, '\u0000' );
	});
	return protectedText.split( /(?<=[.;])\s+(?=[A-Z(])/ ).map( function r( s ) {
		return s.replace( /\u0000/g, '.' ).trim();
	}).filter( Boolean );
}

function fromFortran( text, sp ) {
	var ss;
	var first;
	var exit;
	// BLAS opener: "On entry, M specifies the number of rows …" → "the number of rows …"
	text = text.replace( /^On entry,\s+\w+\s+specifies\s+/i, '' );
	ss = sentences( text );
	first = ( sp && sp.role === 'flag' ) ? ss.join( ' ' ) : ss[ 0 ];
	if ( !first ) {
		return null;
	}
	if ( /^(on|before) entry\b/i.test( first ) ) {
		exit = ss.filter( function f( s ) {
			return /^on exit\b/i.test( s );
		})[ 0 ];
		if ( exit ) {
			first += ' ' + exit;
		}
	}
	first = first.replace( /[;,:]$/, '.' );
	if ( !/[.!?)]$/.test( first ) ) {
		first += '.';
	}
	if ( sp && ( sp.role === 'index' || sp.base === 0 ) ) {
		first = first.replace( /\.$/, ' (0-based).' );
	}
	// JSDoc descriptions in this codebase start lower-case.
	return first.charAt( 0 ).toLowerCase() + first.slice( 1 );
}

// Description for a stride/offset/LD of an array param of the same function.
function auxDescription( name, arrays ) {
	var rules = [
		[ /^stride(.+)()$/i, 'stride' ],
		[ /^stride(.+?)([12])$/i, 'stride' ],
		[ /^offset(.+)$/i, 'offset' ],
		[ /^ld(.+)$/i, 'ld' ]
	];
	var i;
	var m;
	var a;
	for ( i = 0; i < rules.length; i++ ) {
		m = rules[ i ][ 0 ].exec( name );
		a = m && arrays[ m[ 1 ].toLowerCase() ];
		if ( a ) {
			switch ( rules[ i ][ 1 ] ) {
			case 'stride':
				return m[ 2 ] ? 'stride of the ' + ORDINAL[ m[ 2 ] ] + ' dimension of `' + a + '`' : 'stride length for `' + a + '`';
			case 'offset':
				return 'starting index for `' + a + '`';
			default:
				return 'leading dimension of `' + a + '`';
			}
		}
	}
	return null;
}

function workspaceDescription( sp ) {
	var n = sp.minLength && ( sp.minLength.js || sp.minLength.fortran );
	return 'caller-provided workspace' + ( n ? ' of at least `' + n + '` elements' : '' );
}

function processFile( file, routine, spec, docs, report ) {
	var src = fs.readFileSync( file, 'utf8' );
	var fnName = ( /export\s+default\s+(\w+)\s*;/.exec( src ) || [] )[ 1 ];
	var fnRe;
	var m;
	var comment;
	var params;
	var types = {};
	var arrays = {};
	var bySpec = {};
	var replaced;
	if ( !fnName ) {
		return false;
	}
	fnRe = new RegExp( '(\\/\\*\\*(?:(?!\\*\\/)[\\s\\S])*\\*\\/)(\\s*function\\s+' + fnName + '\\s*\\(([^)]*)\\))' );
	m = fnRe.exec( src );
	if ( !m ) {
		return false;
	}
	comment = m[ 1 ];
	params = m[ 3 ].split( ',' ).map( function t( s ) {
		return s.trim();
	}).filter( Boolean );
	( spec ? spec.params : [] ).forEach( function e( p ) {
		bySpec[ p.name.toLowerCase() ] = p;
	});
	comment.replace( /@param\s+\{([^}]*)\}\s+\[?(\w+)/g, function t( _, type, name ) {
		types[ name ] = type;
		return _;
	});
	params.forEach( function e( p ) {
		var sp = bySpec[ p.toLowerCase() ];
		if ( /Array/.test( types[ p ] || '' ) || ( sp && /matrix|banded|packed|vector|workspace|index/.test( sp.role ) ) ) {
			arrays[ p.toLowerCase() ] = p;
		}
	});
	replaced = comment.replace( /^(\s*\*\s*@param\s+\{[^}]*\}\s+)(\[?(\w+)[^\s\]]*\]?)([ \t]*(?:-[ \t]*)?)([^\n]*)$/gm, function r( line, head, token, name, sep, desc ) {
		var sp = bySpec[ name.toLowerCase() ];
		var text = null;
		if ( !H.isPlaceholderParam( name, desc ) ) {
			return line;
		}
		if ( !arrays[ name.toLowerCase() ] ) {
			text = auxDescription( name, arrays );
		}
		if ( !text && sp && sp.role === 'workspace' ) {
			text = workspaceDescription( sp );
		}
		if ( !text && sp && sp.fortran && docs[ sp.fortran.toUpperCase() ] ) {
			text = fromFortran( translate( docs[ sp.fortran.toUpperCase() ], routine, spec, sp ), sp );
		}
		if ( !text ) {
			report.push( path.relative( ROOT, file ) + ': `' + name + '`' + ( sp ? '' : ' (not in spec)' ) );
			return line;
		}
		return head + token + ' - ' + text;
	});
	if ( replaced === comment ) {
		return false;
	}
	fs.writeFileSync( file, src.replace( comment, function k() {
		return replaced;
	}) );
	return true;
}

function main() {
	var only = process.argv.slice( 2 );
	var report = [];
	var n = 0;
	[ 'blas', 'lapack', 'arpack' ].forEach( function each( pkg ) {
		var base = path.join( ROOT, 'lib', pkg, 'base' );
		fs.readdirSync( base ).forEach( function f( routine ) {
			var dir = path.join( base, routine, 'lib' );
			var specFile = path.join( ROOT, 'spec', routine + '.json' );
			var spec = fs.existsSync( specFile ) ? JSON.parse( fs.readFileSync( specFile, 'utf8' ) ) : null;
			var src;
			var docs;
			if ( only.length && only.indexOf( routine ) < 0 ) {
				return;
			}
			src = fortranSource( routine );
			docs = src ? fortranParamDocs( src ) : {};
			[ 'base.js', 'ndarray.js', routine + '.js' ].forEach( function g( x ) {
				var file = path.join( dir, x );
				if ( fs.existsSync( file ) && processFile( file, routine, spec, docs, report ) ) {
					n += 1;
				}
			});
		});
	});
	console.log( 'param-descriptions: rewrote ' + n + ' files' );
	if ( report.length ) {
		console.log( 'No source for ' + report.length + ' placeholder(s):\n  ' + report.slice( 0, 40 ).join( '\n  ' ) + ( report.length > 40 ? '\n  …' : '' ) );
		process.exitCode = 1;
	}
}

main();
