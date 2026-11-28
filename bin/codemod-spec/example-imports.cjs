#!/usr/bin/env node
'use strict';

// Makes each JSDoc @example self-contained: it must import the routine it calls.
//
// - An example that calls `<routine>(` or `<routine>.strided(` without
//   importing `<routine>` gets `import <routine> from '<public path>';`.
// - In strided.js and base.js, an example documents the wrapper form, so its
//   bare `<routine>(` calls become `<routine>.strided(`.
// - `import { strided as <routine> } from '<path>';` (only valid for modules
//   that export `strided` by name, see lint/rules/module-exports) becomes a
//   default import plus `.strided(` calls, which works for every module.
//
// Usage: node bin/codemod-spec/example-imports.cjs [routine ...]

var fs = require( 'fs' );
var path = require( 'path' );

var ROOT = path.join( __dirname, '..', '..' );
var PKG = JSON.parse( fs.readFileSync( path.join( ROOT, 'package.json' ), 'utf8' ) );

function fixExample( lines, routine, pub, wrapper ) {
	var body = lines.join( '\n' );
	var callRe = new RegExp( '(^|[^\\w$.])' + routine + '\\s*\\(', 'g' );
	var namedRe = new RegExp( '^(\\s*\\*\\s*)import \\{ strided as ' + routine + ' \\} from (\'[^\']+\');$' );
	var declared;
	var lastImport;
	var i;
	for ( i = 0; i < lines.length; i++ ) {
		if ( namedRe.test( lines[ i ] ) ) {
			lines[ i ] = lines[ i ].replace( namedRe, '$1import ' + routine + ' from $2;' );
			wrapper = true;
		}
	}
	body = lines.join( '\n' );
	if ( !new RegExp( '(^|[^\\w$.])' + routine + '(\\s*\\(|\\.strided)' ).test( body ) ) {
		return lines;
	}
	if ( wrapper ) {
		body = body.replace( callRe, '$1' + routine + '.strided(' );
	}
	lines = body.split( '\n' );
	declared = new RegExp( '(import\\s+' + routine + '\\s+from|(var|const|let)\\s+' + routine + '\\b)' ).test( body );
	if ( !declared ) {
		// After any existing imports; otherwise first, followed by a blank line.
		lastImport = -1;
		for ( i = 0; i < lines.length; i++ ) {
			if ( /^\s*\*\s*import\s/.test( lines[ i ] ) ) {
				lastImport = i;
			}
		}
		if ( lastImport >= 0 ) {
			lines.splice( lastImport + 1, 0, lines[ lastImport ].replace( /\*.*$/, '* import ' + routine + ' from \'' + pub + '\';' ) );
		} else {
			lines.splice( 0, 0, lines[ 0 ].replace( /\*.*$/, '* import ' + routine + ' from \'' + pub + '\';' ), lines[ 0 ].replace( /\*.*$/, '*' ) );
		}
	}
	return lines;
}

function rewrite( file, routine, pub, wrapper ) {
	var src = fs.readFileSync( file, 'utf8' );
	var lines = src.split( '\n' );
	var out = [];
	var ex = null;
	var i;
	function flush() {
		var fixed;
		if ( ex ) {
			// Drop leading blank comment lines so the import is first.
			while ( ex.length && /^\s*\*\s*$/.test( ex[ 0 ] ) ) {
				out.push( ex.shift() );
			}
			fixed = ex.length ? fixExample( ex, routine, pub, wrapper ) : ex;
			out.push.apply( out, fixed );
			ex = null;
		}
	}
	for ( i = 0; i < lines.length; i++ ) {
		if ( ex && ( /^\s*\*\s*@/.test( lines[ i ] ) || /\*\//.test( lines[ i ] ) ) ) {
			flush();
		}
		if ( ex ) {
			ex.push( lines[ i ] );
			continue;
		}
		out.push( lines[ i ] );
		if ( /^\s*\*\s*@example\s*$/.test( lines[ i ] ) ) {
			ex = [];
		}
	}
	flush();
	if ( out.join( '\n' ) !== src ) {
		fs.writeFileSync( file, out.join( '\n' ) );
		return true;
	}
	return false;
}

function main() {
	var only = process.argv.slice( 2 );
	var n = 0;
	[ 'blas', 'lapack', 'arpack' ].forEach( function each( pkg ) {
		var base = path.join( ROOT, 'lib', pkg );
		fs.readdirSync( base ).forEach( function f( routine ) {
			var dir = path.join( base, routine, 'lib' );
			var pub = PKG.name + '/' + pkg + '/' + routine;
			if ( only.length && only.indexOf( routine ) < 0 ) {
				return;
			}
			fs.readdirSync( dir ).filter( function g( x ) {
				return x.endsWith( '.js' ) && x !== 'main.js';
			}).forEach( function g( x ) {
				var wrapper = ( x === 'strided.js' || x === 'base.js' );
				if ( rewrite( path.join( dir, x ), routine, pub, wrapper ) ) {
					n += 1;
				}
			});
		});
	});
	console.log( 'example-imports: rewrote ' + n + ' files' );
}

main();
