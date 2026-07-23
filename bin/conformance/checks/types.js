'use strict';

var path = require( 'path' );
var fs = require( 'fs' );
var util = require( '../util.js' );
var typecheck = require( '../../typecheck.js' );

var ID = 'types';

// Cache of module-key -> type-check result, populated in one batched pass the
// first time a `--all` run asks for a result. Type-checking builds a TS program
// (parsing lib + @stdlib/types), which is expensive to repeat per module; a
// single shared program over the whole corpus is dramatically faster.
var batchCache = null;

function runBatch() {
	var dirs = util.discoverModules( 'all' ).map( function toDir( m ) { return m.dir; } );
	var results = typecheck.checkModules( dirs );
	var byKey = {};
	results.forEach( function index( r ) {
		byKey[ r.module ] = r;
	});
	return byKey;
}

function check( mod, opts ) {
	opts = opts || {};

	// File checks (`--fast`) skip compilation-based checks, mirroring lint.
	if ( opts.fast ) {
		return [ util.skip( ID + '.type-check', 'public type declarations type-check', 'skipped in --fast mode' ) ];
	}

	var dtsPath = path.join( mod.dir, 'docs', 'types', 'index.d.ts' );
	var testPath = path.join( mod.dir, 'docs', 'types', 'test.ts' );
	if ( !fs.existsSync( dtsPath ) || !fs.existsSync( testPath ) ) {
		return [ util.fail( ID + '.type-check', 'public type declarations type-check', 1, [ mod.dir ], 'missing docs/types/index.d.ts or test.ts' ) ];
	}

	var moduleKey = path.relative( util.ROOT, mod.dir );
	var res;
	if ( opts.all ) {
		if ( !batchCache ) {
			batchCache = runBatch();
		}
		res = batchCache[ moduleKey ];
	} else {
		res = typecheck.checkModules( [ mod.dir ] )[ 0 ];
	}

	if ( !res || res.ok ) {
		return [ util.pass( ID + '.type-check', 'public type declarations type-check' ) ];
	}
	return [ util.fail(
		ID + '.type-check',
		'public type declarations type-check',
		res.errors.length,
		res.errors.map( function fmt( e ) { return 'test.ts:' + e.line + ' ' + e.message; } ),
		res.errors.length + ' type error(s)'
	) ];
}

module.exports = check;
