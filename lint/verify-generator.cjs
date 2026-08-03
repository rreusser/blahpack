'use strict';

// Assert the wrapper generator agrees with the lint projection — no wiggle room.
//
// The strided <routine>.js form has ONE convention, expressed in two places:
//   * bin/gen_wrapper.py          — generates wrappers from base.js
//   * lint/lib/strided-projection.cjs — checks wrappers against the convention
//
// If they ever diverge, generated wrappers would fail the lint rule (or vice
// versa). This test runs the generator over every blas/lapack routine and
// requires its signature to equal the projection of the same base.js, exactly.
//
// Usage:  node lint/verify-generator.cjs
//         node --test lint/verify-generator.cjs   (as a test)

var path = require( 'path' );
var fs = require( 'fs' );
var child = require( 'child_process' );
var projection = require( './lib/strided-projection.cjs' );

var ROOT = path.join( __dirname, '..' );

function baseParams( routine, pkg ) {
	var file = path.join( ROOT, 'lib', pkg, 'base', routine, 'lib', 'base.js' );
	var src = fs.readFileSync( file, 'utf8' );
	var m = new RegExp( 'function\\s+' + routine + '\\s*\\(([^)]*)\\)' ).exec( src );
	return m ? m[ 1 ].split( ',' ).map( function map( x ) { return x.trim(); } ).filter( Boolean ) : null;
}

function run() {
	// Ask the generator to emit every wrapper signature it would produce.
	var raw = child.execFileSync( 'python', [ path.join( ROOT, 'bin', 'gen_wrapper.py' ), '--emit-signatures' ], {
		'cwd': ROOT,
		'encoding': 'utf8',
		'maxBuffer': 64 * 1024 * 1024
	});
	var gen = JSON.parse( raw );

	var disagree = [];
	var agree = 0;
	Object.keys( gen ).forEach( function forEach( routine ) {
		var pkg = fs.existsSync( path.join( ROOT, 'lib', 'blas', 'base', routine ) ) ? 'blas' : 'lapack';
		var base = baseParams( routine, pkg );
		if ( !base ) {
			return;
		}
		var proj = projection.project( base, { 'routine': routine } ).params;
		var g = gen[ routine ];
		var eq = proj.length === g.length && proj.every( function every( x, i ) {
			return x.toLowerCase() === g[ i ].toLowerCase();
		});
		if ( eq ) {
			agree += 1;
		} else {
			disagree.push( { routine: routine, gen: g, proj: proj } );
		}
	});
	return { agree: agree, disagree: disagree };
}

// Run as a node:test when invoked with --test; otherwise print + exit code.
if ( process.env.NODE_TEST_CONTEXT || /(^|\/)node$/.test( process.argv[ 0 ] ) && process.argv[ 1 ] && /--test/.test( process.argv.join( ' ' ) ) ) {
	var test = require( 'node:test' );
	var assert = require( 'node:assert' );
	test( 'gen_wrapper.py agrees with strided-projection.cjs on every routine', function t() {
		var r = run();
		assert.strictEqual( r.disagree.length, 0, 'generator/checker disagree on: ' + r.disagree.map( function m( d ) {
			return d.routine;
		}).join( ', ' ) );
	});
} else {
	var res = run();
	console.log( 'generator vs checker: ' + res.agree + ' agree, ' + res.disagree.length + ' disagree' );
	res.disagree.slice( 0, 20 ).forEach( function forEach( d ) {
		console.log( '  ' + d.routine + '\n     gen : ' + d.gen.join( ', ' ) + '\n     proj: ' + d.proj.join( ', ' ) );
	});
	process.exit( res.disagree.length > 0 ? 1 : 0 );
}
