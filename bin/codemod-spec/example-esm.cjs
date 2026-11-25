#!/usr/bin/env node
'use strict';

// Rewrites CommonJS `require` lines inside JSDoc @example blocks to ESM
// imports (lint rule jsdoc-example-esm).
//
//   var Float64Array = require( '@stdlib/array/float64' );
//     → import Float64Array from '@stdlib/array/float64/lib/index.js';
//   var dgesv = require( '@stdlib/lapack/base/dgesv' );        (a routine of ours)
//   var dgesv = require( './../lib' );
//     → import dgesv from '@rreusser/blahpack/lapack/base/dgesv';
//   var f = require( '@stdlib/lapack/base/dtpmqrt' ).ndarray;
//     → import { ndarray as f } from '@rreusser/blahpack/lapack/base/dtpmqrt';
//
// Our routines resolve by name to the package that actually holds them. A
// require it cannot map is left alone and reported, so the lint gate still
// catches it.
//
// Usage: node bin/codemod-spec/example-esm.cjs [routine ...]

var fs = require( 'fs' );
var path = require( 'path' );

var ROOT = path.join( __dirname, '..', '..' );
var PKG = JSON.parse( fs.readFileSync( path.join( ROOT, 'package.json' ), 'utf8' ) );
var PKGS = [ 'blas', 'lapack', 'arpack' ];

var where = {};
PKGS.forEach( function each( pkg ) {
	var dir = path.join( ROOT, 'lib', pkg, 'base' );
	fs.readdirSync( dir ).forEach( function f( name ) {
		where[ name ] = pkg;
	});
});

function publicPath( name ) {
	return PKG.name + '/' + where[ name ] + '/base/' + name;
}

// Returns the import specifier for a require target, or null.
function target( spec, routine ) {
	var m;
	if ( /^\.\.?\//.test( spec ) ) {
		return publicPath( routine );
	}
	// stdlib spells multi-part names with hyphens (dla-wwaddw); our directories use underscores.
	m = /^@(?:stdlib|rreusser\/blahpack)\/(?:blas|lapack|arpack)\/base\/([a-z0-9_-]+)$/.exec( spec );
	if ( m && where[ m[ 1 ].replace( /-/g, '_' ) ] ) {
		return publicPath( m[ 1 ].replace( /-/g, '_' ) );
	}
	if ( /^@stdlib\//.test( spec ) && fs.existsSync( path.join( ROOT, 'node_modules', spec, 'lib', 'index.js' ) ) ) {
		return spec + '/lib/index.js';
	}
	return null;
}

var LINE = /^(\s*\*\s*)(?:var|const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*require\(\s*'([^']+)'\s*\)(\.ndarray)?\s*;(\s*\/\/.*)?$/;

function rewriteFile( file, routine, unresolved ) {
	var src = fs.readFileSync( file, 'utf8' );
	var inExample = false;
	var changed = false;
	var out = src.split( '\n' ).map( function map( line ) {
		var m;
		var spec;
		// A stale stdlib @module name becomes the real package path.
		m = /^(\s*\*\s*@module\s+)@stdlib\/(?:blas|lapack|arpack)\/base\/([a-z0-9_]+)\s*$/.exec( line );
		if ( m && where[ m[ 2 ] ] ) {
			changed = true;
			return m[ 1 ] + publicPath( m[ 2 ] );
		}
		if ( /^\s*\*\s*@example/.test( line ) ) {
			inExample = true;
			return line;
		}
		if ( /^\s*\*\s*@/.test( line ) || /\*\//.test( line ) ) {
			inExample = false;
			return line;
		}
		if ( !inExample || !/require\s*\(/.test( line ) ) {
			return line;
		}
		m = LINE.exec( line );
		spec = m ? target( m[ 3 ], routine ) : null;
		if ( !spec ) {
			unresolved.push( path.relative( ROOT, file ) + ': ' + line.trim() );
			return line;
		}
		changed = true;
		if ( m[ 4 ] ) {
			return m[ 1 ] + 'import { ndarray as ' + m[ 2 ] + ' } from \'' + spec + '\';';
		}
		return m[ 1 ] + 'import ' + m[ 2 ] + ' from \'' + spec + '\';';
	}).join( '\n' );
	if ( changed ) {
		fs.writeFileSync( file, out );
	}
	return changed;
}

function main() {
	var only = process.argv.slice( 2 );
	var unresolved = [];
	var n = 0;
	Object.keys( where ).sort().forEach( function each( routine ) {
		var dir;
		if ( only.length && only.indexOf( routine ) < 0 ) {
			return;
		}
		dir = path.join( ROOT, 'lib', where[ routine ], 'base', routine, 'lib' );
		fs.readdirSync( dir ).filter( function f( x ) {
			return x.endsWith( '.js' );
		}).forEach( function f( x ) {
			if ( rewriteFile( path.join( dir, x ), routine, unresolved ) ) {
				n += 1;
			}
		});
	});
	console.log( 'example-esm: rewrote ' + n + ' files' );
	if ( unresolved.length ) {
		console.log( 'Unresolved (left as-is):\n  ' + unresolved.join( '\n  ' ) );
		process.exitCode = 1;
	}
}

main();
