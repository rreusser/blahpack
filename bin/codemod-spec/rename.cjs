#!/usr/bin/env node
'use strict';

// Codemod: rename parameters to the spec's names (CONVENTIONS S2, S7).
//
// For each of base.js / ndarray.js / <routine>.js whose parameter list has the
// spec projection's length, every position whose name differs (other than in
// case: names compare case-insensitively) is renamed — the parameter, every
// reference to it (scope-aware), and its JSDoc `@param`. Parameters are
// positional, so this changes no caller. A rename that would shadow or collide
// with another binding in the function is reported and skipped.
//
//   node bin/codemod-spec/rename.cjs [--dry] [routine ...]

var fs = require( 'fs' );
var lib = require( './lib.cjs' );
var specLib = require( '../../lint/lib/spec.cjs' );

var argv = process.argv.slice( 2 );
var DRY = argv.indexOf( '--dry' ) >= 0;
var only = argv.filter( function f( a ) {
	return a.charAt( 0 ) !== '-';
});

function want( spec, form ) {
	return ( form === 'strided' ) ? specLib.strided( spec ) : specLib.base( spec );
}

function renameFile( file, target, report ) {
	var src;
	var ast;
	var fn;
	var have;
	var sm;
	var scope;
	var edits = [];
	var doc;
	var renames = [];
	if ( !fs.existsSync( file ) ) {
		return;
	}
	src = fs.readFileSync( file, 'utf8' );
	ast = lib.parse( src );
	fn = lib.exported( ast );
	if ( !fn ) {
		report.push( file + ': no exported function' );
		return;
	}
	have = lib.params( fn );
	if ( have.length !== target.length ) {
		return;
	}
	have.forEach( function each( h, i ) {
		if ( h && h.toLowerCase() !== target[ i ].toLowerCase() ) {
			renames.push( { 'from': h, 'to': target[ i ] } );
		}
	});
	if ( !renames.length ) {
		return;
	}
	// A target that is already another parameter means the lists differ in
	// order, not in naming: not a rename.
	if ( renames.some( function some( r ) {
		return have.some( function s( h ) {
			return h && h.toLowerCase() === r.to.toLowerCase();
		});
	}) ) {
		report.push( file.replace( lib.ROOT + '/', '' ) + ': parameters differ in order, not only in name; skipped' );
		return;
	}
	sm = lib.scopeManager( ast );
	scope = sm.acquire( fn );
	var ok = renames.every( function every( r ) {
		var clash = false;
		( function walk( s ) {
			s.variables.forEach( function each( v ) {
				if ( v.name === r.to && !renames.some( function some( q ) {
					return q.from === r.to;
				}) ) {
					clash = true;
				}
			});
			s.through.forEach( function each( ref ) {
				if ( ref.identifier.name === r.to ) {
					clash = true;
				}
			});
			s.childScopes.forEach( walk );
		})( scope );
		if ( clash ) {
			report.push( file + ': rename ' + r.from + ' → ' + r.to + ' collides with an existing binding; skipped' );
		}
		return !clash;
	});
	if ( !ok ) {
		return;
	}
	renames.forEach( function each( r ) {
		var v = scope.set.get( r.from );
		v.defs.forEach( function each( d ) {
			edits.push( { 'start': d.name.range[ 0 ], 'end': d.name.range[ 1 ], 'text': r.to } );
		});
		v.references.forEach( function each( ref ) {
			var id = ref.identifier;
			if ( id.range[ 0 ] === v.defs[ 0 ].name.range[ 0 ] ) {
				return;
			}
			edits.push( { 'start': id.range[ 0 ], 'end': id.range[ 1 ], 'text': r.to } );
		});
	});
	// Shorthand properties `{ x }` would change meaning; refuse them.
	var shorthand = false;
	( function walk( n ) {
		var k;
		if ( !n || typeof n.type !== 'string' ) {
			return;
		}
		if ( n.type === 'Property' && n.shorthand && renames.some( function some( r ) {
			return n.key.name === r.from;
		}) ) {
			shorthand = true;
		}
		for ( k in n ) {
			if ( k !== 'parent' && n[ k ] && typeof n[ k ] === 'object' ) {
				if ( Array.isArray( n[ k ] ) ) {
					n[ k ].forEach( walk );
				} else {
					walk( n[ k ] );
				}
			}
		}
	})( fn );
	if ( shorthand ) {
		report.push( file + ': a renamed parameter is used as a shorthand property; skipped' );
		return;
	}
	doc = lib.leadingJSDoc( ast, fn );
	if ( doc ) {
		renames.forEach( function each( r ) {
			var re = new RegExp( '(@param\\s+\\{[^}]*\\}\\s+\\[?)' + r.from.replace( /[$]/g, '\\$' ) + '\\b' );
			var text = src.slice( doc.range[ 0 ], doc.range[ 1 ] );
			var m = re.exec( text );
			if ( m ) {
				edits.push( { 'start': doc.range[ 0 ] + m.index + m[ 1 ].length, 'end': doc.range[ 0 ] + m.index + m[ 1 ].length + r.from.length, 'text': r.to } );
			}
		});
	}
	report.push( file.replace( lib.ROOT + '/', '' ) + ': ' + renames.map( function m( r ) {
		return r.from + '→' + r.to;
	}).join( ', ' ) );
	if ( !DRY ) {
		fs.writeFileSync( file, lib.applyEdits( src, edits ) );
	}
}

function main() {
	var report = [];
	lib.modules( only ).forEach( function each( mod ) {
		var spec = specLib.load( mod.routine );
		if ( !spec ) {
			return;
		}
		renameFile( mod.files.base, want( spec, 'base' ), report );
		renameFile( mod.files.ndarray, want( spec, 'ndarray' ), report );
		renameFile( mod.files.strided, want( spec, 'strided' ), report );
	});
	console.log( report.join( '\n' ) );
}

main();
