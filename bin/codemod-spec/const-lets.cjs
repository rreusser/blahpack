#!/usr/bin/env node
'use strict';

// Codemod (benchmarks, examples): turn `let x;` + a single later `x = <expr>;`
// into `const x = <expr>;` (ticket 0094).
//
// A `let` declared without an initializer and captured by a closure (the
// benchmark function returned by createBenchmark) has no type `tsc` can
// determine, so it is `any`, and every call that passes it goes unchecked:
// dsytri_3's benchmark passed the number N as IPIV that way. Declared at its
// one assignment, the variable gets that expression's type.
//
// A name is rewritten only when, in the enclosing function:
// - it is declared without an initializer in a `let` statement of the
//   function's own body;
// - it is assigned exactly once (no other `=`, compound assignment, `++`/`--`
//   or destructuring), by an expression statement in that same body;
// - nothing reads it before that statement, and no nested scope redeclares it.
//
//   node bin/codemod-spec/const-lets.cjs [--dry] <file ...>

var fs = require( 'fs' );
var acorn = require( 'acorn' );

var argv = process.argv.slice( 2 );
var DRY = argv.indexOf( '--dry' ) >= 0;

function isFn( n ) {
	return n && ( n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression' );
}

function children( n ) {
	var out = [];
	var k;
	for ( k in n ) {
		if ( k === 'parent' || !n[ k ] || typeof n[ k ] !== 'object' ) {
			continue;
		}
		if ( Array.isArray( n[ k ] ) ) {
			n[ k ].forEach( function e( c ) {
				if ( c && typeof c.type === 'string' ) {
					out.push( c );
				}
			});
		} else if ( typeof n[ k ].type === 'string' ) {
			out.push( n[ k ] );
		}
	}
	return out;
}

// Every function node in the tree.
function functions( root ) {
	var out = [];
	( function walk( n ) {
		if ( isFn( n ) ) {
			out.push( n );
		}
		children( n ).forEach( walk );
	})( root );
	return out;
}

// Facts about `name` inside function `fn` (nested functions included).
function usage( fn, name ) {
	var u = { 'writes': [], 'reads': [], 'redeclared': false };
	( function walk( n, parent, inner ) {
		var kids;
		if ( n !== fn && isFn( n ) ) {
			n.params.forEach( function p( q ) {
				if ( q.type === 'Identifier' && q.name === name ) {
					u.redeclared = true;
				}
			});
			inner = true;
		}
		if ( n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.id.name === name && inner ) {
			u.redeclared = true;
		}
		if ( n.type === 'AssignmentExpression' && n.left.type === 'Identifier' && n.left.name === name ) {
			u.writes.push( { 'node': n, 'parent': parent, 'op': n.operator } );
			walk( n.right, n, inner );
			return;
		}
		if ( n.type === 'UpdateExpression' && n.argument.type === 'Identifier' && n.argument.name === name ) {
			u.writes.push( { 'node': n, 'parent': parent, 'op': '++' } );
			return;
		}
		if ( ( n.type === 'ObjectPattern' || n.type === 'ArrayPattern' ) && JSON.stringify( n ).indexOf( '"name":"' + name + '"' ) >= 0 ) {
			u.writes.push( { 'node': n, 'parent': parent, 'op': 'pattern' } );
		}
		if ( n.type === 'Identifier' && n.name === name ) {
			if ( !( parent && parent.type === 'VariableDeclarator' && parent.id === n ) && !( parent && parent.type === 'MemberExpression' && parent.property === n && !parent.computed ) && !( parent && parent.type === 'Property' && parent.key === n && !parent.shorthand ) ) {
				u.reads.push( n );
			}
		}
		kids = children( n );
		kids.forEach( function e( c ) {
			walk( c, n, inner );
		});
	})( fn.body, fn, false );
	return u;
}

function rewrite( src ) {
	var ast = acorn.parse( src, { 'ecmaVersion': 'latest', 'sourceType': 'module', 'ranges': true } );
	var edits = [];
	var n = 0;
	functions( ast ).forEach( function each( fn ) {
		var body = fn.body;
		if ( !body || body.type !== 'BlockStatement' ) {
			return;
		}
		body.body.forEach( function each( stmt ) {
			var keep;
			var moved;
			if ( stmt.type !== 'VariableDeclaration' || stmt.kind !== 'let' ) {
				return;
			}
			keep = [];
			moved = [];
			stmt.declarations.forEach( function d( dec ) {
				var name;
				var u;
				var w;
				var at;
				if ( dec.init || dec.id.type !== 'Identifier' ) {
					keep.push( dec );
					return;
				}
				name = dec.id.name;
				u = usage( fn, name );
				w = u.writes[ 0 ];
				if ( u.redeclared || u.writes.length !== 1 || w.op !== '=' || w.parent.type !== 'ExpressionStatement' || body.body.indexOf( w.parent ) < 0 ) {
					keep.push( dec );
					return;
				}
				at = w.parent.range[ 0 ];
				if ( u.reads.some( function r( x ) {
					return x.range[ 0 ] < at;
				}) ) {
					keep.push( dec );
					return;
				}
				moved.push( { 'name': name, 'stmt': w.parent } );
			});
			if ( !moved.length ) {
				return;
			}
			n += moved.length;
			if ( keep.length ) {
				edits.push( [ stmt.range[ 0 ], stmt.range[ 1 ], 'let ' + keep.map( function m( k ) {
					return src.slice( k.range[ 0 ], k.range[ 1 ] );
				}).join( ', ' ) + ';' ] );
			} else {
				// Remove the declaration and its line.
				var s = stmt.range[ 0 ];
				var e = stmt.range[ 1 ];
				while ( s > 0 && src[ s - 1 ] !== '\n' ) {
					s -= 1;
				}
				if ( src[ e ] === '\n' ) {
					e += 1;
				}
				if ( src[ e ] === '\n' && ( s === 0 || src[ s - 1 ] === '\n' ) && src.slice( s - 2, s ) === '{\n' ) {
					e += 1; // drop the blank line that followed a leading declaration
				}
				edits.push( [ s, e, '' ] );
			}
			moved.forEach( function m( mv ) {
				edits.push( [ mv.stmt.range[ 0 ], mv.stmt.range[ 0 ], 'const ' ] );
			});
		});
	});
	edits.sort( function s( a, b ) {
		return b[ 0 ] - a[ 0 ];
	});
	edits.forEach( function e( ed ) {
		src = src.slice( 0, ed[ 0 ] ) + ed[ 2 ] + src.slice( ed[ 1 ] );
	});
	return { 'src': src, 'n': n };
}

var files = 0;
var total = 0;
argv.filter( function f( a ) {
	return a.charAt( 0 ) !== '-';
}).forEach( function each( f ) {
	var src = fs.readFileSync( f, 'utf8' );
	var r;
	try {
		r = rewrite( src );
	} catch ( err ) {
		console.error( f + ': ' + err.message );
		return;
	}
	if ( r.n ) {
		files += 1;
		total += r.n;
		if ( !DRY ) {
			fs.writeFileSync( f, r.src );
		}
	}
});
console.log( ( DRY ? 'would rewrite ' : 'rewrote ' ) + total + ' variables in ' + files + ' files' );
