#!/usr/bin/env node
'use strict';

// Codemod: write the generated validation prologue (lint/lib/prologue.cjs)
// into strided.js and <routine>.js — the fix for the `spec-prologue` and
// `spec-messages` rules.
//
// 1. Every top-level argument check that a generated check replaces is
//    removed. An existing check is "an argument check" when it is
//    `if ( … ) { throw new TypeError|RangeError( format( 'invalid argument. … ) ) }`
//    and its message names an ordinal argument or a stride; it is replaced when
//    the generated prologue checks the same argument (its value argument) with
//    the same kind of constraint. Checks the generator has no counterpart for
//    (workspace length/stride, untranslated reference checks) stay where they
//    are.
// 2. The generated prologue is inserted at the top of the body (after any
//    uninitialized `let` declarations).
// 3. Imports: each helper the prologue uses is imported under its canonical
//    name (an existing import of the same package under another name, e.g.
//    `isMatrixTranspose`, is renamed throughout the file); validator/helper
//    imports left unused are removed.
//
//   node bin/codemod-spec/prologue.cjs [--dry] [routine ...]

var fs = require( 'fs' );
var lib = require( './lib.cjs' );
var specLib = require( '../../lint/lib/spec.cjs' );
var P = require( '../../lint/lib/prologue.cjs' );

var argv = process.argv.slice( 2 );
var DRY = argv.indexOf( '--dry' ) >= 0;
var only = argv.filter( function f( a ) {
	return a.charAt( 0 ) !== '-';
});

// Helpers a prologue may leave unused (and that are removed if unused).
var REMOVABLE = {
	'@stdlib/blas/base/assert/is-layout/lib/index.js': true,
	'@stdlib/blas/base/assert/is-transpose-operation/lib/index.js': true,
	'@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js': true,
	'@stdlib/blas/base/assert/is-operation-side/lib/index.js': true,
	'@stdlib/blas/base/assert/is-diagonal-type/lib/index.js': true,
	'@stdlib/string/format/lib/index.js': true,
	'@stdlib/math/base/special/fast/max/lib/index.js': true,
	'@stdlib/math/base/special/fast/min/lib/index.js': true
};

function thrownNew( stmt ) {
	var c = stmt.consequent;
	var t = c;
	if ( stmt.alternate ) {
		return null;
	}
	if ( c.type === 'BlockStatement' ) {
		if ( c.body.length !== 1 ) {
			return null;
		}
		t = c.body[ 0 ];
	}
	if ( t.type !== 'ThrowStatement' || t.argument.type !== 'NewExpression' || t.argument.callee.type !== 'Identifier' ) {
		return null;
	}
	if ( t.argument.callee.name !== 'TypeError' && t.argument.callee.name !== 'RangeError' ) {
		return null;
	}
	return t.argument;
}

// The option a test rejects, when the test is a chain `x !== 'a' && x !==
// 'b' …` over one identifier: a hand-written option check, whatever its
// message says (ticket 0092: dseupd's "`bmat` must be one of …", dlarrc's
// concatenated message).
function optionTest( t ) {
	var name = null;
	function walk( n ) {
		if ( n.type === 'LogicalExpression' && n.operator === '&&' ) {
			return walk( n.left ) && walk( n.right );
		}
		if ( n.type !== 'BinaryExpression' || n.operator !== '!==' || n.left.type !== 'Identifier' || n.right.type !== 'Literal' || typeof n.right.value !== 'string' ) {
			return false;
		}
		if ( name !== null && name !== n.left.name ) {
			return false;
		}
		name = n.left.name;
		return true;
	}
	return ( walk( t ) ) ? name : null;
}

// { param, cat } of an existing argument check, or null.
function classify( stmt ) {
	var nx = ( stmt.type === 'IfStatement' ) ? thrownNew( stmt ) : null;
	var call;
	var msg;
	var last;
	var cat;
	var opt;
	if ( !nx || nx.arguments.length !== 1 ) {
		return null;
	}
	opt = optionTest( stmt.test );
	if ( opt && nx.callee.name === 'TypeError' ) {
		return { 'param': opt, 'cat': 'enum', 'layout': null };
	}
	call = nx.arguments[ 0 ];
	if ( call.type !== 'CallExpression' || call.callee.name !== 'format' || !call.arguments.length || call.arguments[ 0 ].type !== 'Literal' ) {
		return null;
	}
	msg = String( call.arguments[ 0 ].value );
	if ( !/^invalid argument\. (\w+(-\w+)? argument|`\w+` stride)/.test( msg ) ) {
		return null;
	}
	last = call.arguments[ call.arguments.length - 1 ];
	if ( last.type === 'MemberExpression' && last.object.type === 'Identifier' ) {
		last = last.object; // `ifst[ 0 ]`: an output scalar's value (S10)
	}
	if ( last.type === 'BinaryExpression' && last.left.type === 'Identifier' ) {
		last = last.left; // `( ilo + 1 )`
	}
	if ( last.type !== 'Identifier' ) {
		return null;
	}
	if ( /valid order/.test( msg ) ) {
		cat = 'order';
	} else if ( /nonnegative integer\. Value|nonnegative integer$/.test( msg ) ) {
		cat = 'nonnegative';
	} else if ( /non-?zero/.test( msg ) ) {
		cat = 'nonzero';
	} else if ( /leading-dimension|greater than or equal to max\(|greater than or equal to %d|must be greater than or equal to/.test( msg ) ) {
		cat = 'ld';
	} else if ( nx.callee.name === 'TypeError' ) {
		cat = 'enum';
	} else {
		cat = 'other';
	}
	return { 'param': last.name, 'cat': cat, 'layout': layoutOf( stmt, msg ) };
}

// Is an existing check (param, cat) replaced by the generated checks?
// The layout an existing check is limited to: `order === '…'` in its test
// (or a "row-major"/"column-major" message), else null (both).
var SRC = '';
function layoutOf( stmt, msg ) {
	var t = SRC.slice( stmt.test.range[ 0 ], stmt.test.range[ 1 ] );
	var m = /order\s*===\s*'(row-major|column-major)'/.exec( t ) || /\((row-major|column-major)[:)]/.exec( msg );
	return m ? m[ 1 ] : null;
}

// The argument a generated check reports (`ifst[ 0 ]` → `ifst`).
function argName( c ) {
	return /^\(?\s*([\w$]+)/.exec( c.args[ c.args.length - 1 ] )[ 1 ];
}

function replaced( ex, gen ) {
	var ld = gen.filter( function f( c ) {
		return c.layout !== undefined && argName( c ) === ex.param;
	});
	if ( ld.length && ( ex.cat === 'ld' || ex.cat === 'other' ) ) {
		// A leading-dimension check is replaced only by generated checks
		// that cover its layout(s); otherwise it stays (the row-major bound
		// of an array whose column count the spec doesn't establish).
		return ld.some( function some( c ) {
			return c.layout === null || c.layout === ex.layout;
		}) || ( ex.layout === null && ld.some( function some( c ) {
			return c.layout === 'column-major';
		}) && ld.some( function some( c ) {
			return c.layout === 'row-major';
		}) );
	}
	return gen.some( function some( c ) {
		var v = argName( c );
		var gcat = c.kind;
		if ( v !== ex.param ) {
			return false;
		}
		if ( ex.cat === gcat ) {
			return true;
		}
		// A leading-dimension argument has one kind of check per layout,
		// whatever the reference wrote (ld or expr).
		if ( c.layout !== undefined || ( gcat === 'ld' ) || ( gcat === 'expr' && ex.cat === 'ld' ) ) {
			return ex.cat === 'ld' || ex.cat === 'other';
		}
		// An `expr` reference check replaces any hand check on that argument.
		if ( gcat === 'expr' ) {
			return true;
		}
		// An enum's TypeError and a hand-rolled RangeError on a flag.
		return gcat === 'enum' && ex.cat === 'other';
	});
}

function lineStart( src, i ) {
	while ( i > 0 && src[ i - 1 ] !== '\n' ) {
		i -= 1;
	}
	return i;
}

function lineEnd( src, i ) {
	while ( i < src.length && src[ i ] !== '\n' ) {
		i += 1;
	}
	return ( i < src.length ) ? i + 1 : i;
}

function rewriteBody( src, spec, form ) {
	var ast = lib.parse( src );
	SRC = src;
	var fn = lib.exported( ast );
	var actual;
	var gen;
	var body;
	var start;
	var edits = [];
	var text;
	var at;
	if ( !fn ) {
		return null;
	}
	actual = lib.params( fn );
	if ( !sameNames( actual, ( form === 'wrapper' ) ? specLib.wrapper( spec ) : specLib.base( spec ) ) ) {
		return null;
	}
	gen = P.prologue( spec, form, actual );
	body = fn.body.body;
	start = 0;
	while ( start < body.length && body[ start ].type === 'VariableDeclaration' && body[ start ].declarations.every( function every( d ) {
		return d.init === null;
	}) ) {
		start += 1;
	}
	body.forEach( function each( stmt, i ) {
		var ex = classify( stmt );
		if ( i < start || !ex || !replaced( ex, gen ) ) {
			return;
		}
		edits.push( { 'start': lineStart( src, stmt.range[ 0 ] ), 'end': lineEnd( src, stmt.range[ 1 ] ), 'text': '' } );
	});
	text = gen.map( function m( c ) {
		return '\t' + P.render( c ) + '\n';
	}).join( '' );
	if ( start < body.length ) {
		at = lineStart( src, body[ start ].range[ 0 ] );
	} else {
		at = lineStart( src, fn.body.range[ 1 ] - 1 );
	}
	// Merge an insertion with a removal at the same spot.
	edits.push( { 'start': at, 'end': at, 'text': text } );
	edits.sort( function s( a, b ) {
		return ( b.start - a.start ) || ( b.end - b.start ) - ( a.end - a.start );
	});
	edits.forEach( function each( e ) {
		src = src.slice( 0, e.start ) + e.text + src.slice( e.end );
	});
	return { 'src': src, 'needs': P.imports( gen ) };
}

function sameNames( a, b ) {
	return a.length === b.length && a.every( function every( x, i ) {
		return x && x.toLowerCase() === b[ i ].toLowerCase();
	});
}

function fixImports( src, needs ) {
	var ast = lib.parse( src );
	var imports = ast.body.filter( function f( n ) {
		return n.type === 'ImportDeclaration';
	});
	var byPath = {};
	var byLocal = {};
	var lastStdlib = null;
	imports.forEach( function each( n ) {
		var s = n.specifiers[ 0 ];
		if ( s && s.type === 'ImportDefaultSpecifier' ) {
			byPath[ n.source.value ] = { 'node': n, 'local': s.local.name };
			byLocal[ s.local.name ] = n.source.value;
		}
		if ( /^@stdlib\//.test( n.source.value ) ) {
			lastStdlib = n;
		}
	});
	var renames = [];
	var adds = [];
	needs.forEach( function each( id ) {
		var p = P.IMPORTS[ id ];
		var have = byPath[ p ];
		if ( have && have.local === id ) {
			return;
		}
		if ( have && !byLocal[ id ] ) {
			renames.push( { 'from': have.local, 'to': id } );
			return;
		}
		if ( byLocal[ id ] && byLocal[ id ] !== p ) {
			throw new Error( 'local name ' + id + ' already imported from ' + byLocal[ id ] );
		}
		adds.push( 'import ' + id + ' from \'' + p + '\';\n' );
	});
	renames.forEach( function each( r ) {
		src = src.replace( new RegExp( '\\b' + r.from + '\\b', 'g' ), r.to );
	});
	if ( adds.length ) {
		ast = lib.parse( src );
		var anchor = null;
		ast.body.forEach( function each( n ) {
			if ( n.type === 'ImportDeclaration' && /^@stdlib\//.test( n.source.value ) ) {
				anchor = n;
			}
		});
		if ( !anchor ) {
			ast.body.forEach( function each( n ) {
				if ( n.type === 'ImportDeclaration' && !anchor ) {
					anchor = n;
				}
			});
			var at0 = lineStart( src, anchor.range[ 0 ] );
			src = src.slice( 0, at0 ) + adds.join( '' ) + src.slice( at0 );
		} else {
			var at = lineEnd( src, anchor.range[ 1 ] );
			src = src.slice( 0, at ) + adds.join( '' ) + src.slice( at );
		}
	}
	// Drop removable imports that are no longer used.
	ast = lib.parse( src );
	var drops = [];
	ast.body.forEach( function each( n ) {
		var s = n.specifiers && n.specifiers[ 0 ];
		var rest;
		if ( n.type !== 'ImportDeclaration' || !REMOVABLE[ n.source.value ] || !s ) {
			return;
		}
		rest = src.slice( 0, n.range[ 0 ] ) + src.slice( n.range[ 1 ] );
		if ( !new RegExp( '\\b' + s.local.name + '\\b' ).test( rest.replace( /\/\*[\s\S]*?\*\//g, '' ).replace( /\/\/[^\n]*/g, '' ) ) ) {
			drops.push( { 'start': lineStart( src, n.range[ 0 ] ), 'end': lineEnd( src, n.range[ 1 ] ), 'text': '' } );
		}
	});
	return lib.applyEdits( src, drops );
}

function main() {
	var report = { 'written': 0, 'skipped': [] };
	lib.modules( only ).forEach( function each( mod ) {
		var spec = specLib.load( mod.routine );
		if ( !spec ) {
			return;
		}
		[ 'strided', 'wrapper' ].forEach( function each( form ) {
			var file = mod.files[ form ];
			var src;
			var r;
			var out;
			if ( !fs.existsSync( file ) ) {
				return;
			}
			src = fs.readFileSync( file, 'utf8' );
			try {
				r = rewriteBody( src, spec, form );
				if ( !r ) {
					report.skipped.push( mod.routine + ' ' + form + ' (signature differs from the spec)' );
					return;
				}
				out = fixImports( r.src, r.needs );
			} catch ( err ) {
				report.skipped.push( mod.routine + ' ' + form + ': ' + err.message );
				return;
			}
			if ( out !== src ) {
				report.written += 1;
				if ( DRY ) {
					console.log( 'would write: ' + file );
				}
				if ( !DRY ) {
					fs.writeFileSync( file, out );
				}
			}
		});
	});
	console.log( 'written: ' + report.written );
	report.skipped.forEach( function each( s ) {
		console.log( 'skipped: ' + s );
	});
}

main();
