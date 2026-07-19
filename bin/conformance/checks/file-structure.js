'use strict';

var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'file-structure';

// Required files for a complete module
var REQUIRED = [
	'package.json',
	'lib/index.js',
	'lib/main.js',
	'lib/base.js',
	'lib/ndarray.js',
	'test/test.js',
	'test/test.ndarray.js',
	'README.md',
	'docs/types/index.d.ts',
	'docs/types/test.ts',
	'docs/repl.txt',
	'examples/index.js',
	'benchmark/benchmark.ndarray.js'
];

// The routine-specific wrapper file: lib/<routine>.js
function routineFile( mod ) {
	return 'lib/' + mod.routine + '.js';
}

// LEARNINGS file can be either name
function learningsFile( mod ) {
	if ( util.fileExists( path.join( mod.dir, 'LEARNINGS.md' ) ) ) {
		return 'LEARNINGS.md';
	}
	if ( util.fileExists( path.join( mod.dir, 'LEARNINGS.integrated.md' ) ) ) {
		return 'LEARNINGS.integrated.md';
	}
	return 'LEARNINGS.md'; // will fail existence check
}

function check( mod ) {
	var results = [];
	var missing = [];
	var files;
	var rf;
	var fp;
	var i;

	rf = routineFile( mod );
	var testRoutineFile = 'test/test.' + mod.routine + '.js';
	var benchmarkFile = 'benchmark/benchmark.js';
	files = REQUIRED.concat([ rf, testRoutineFile, benchmarkFile, learningsFile( mod ) ]);

	for ( i = 0; i < files.length; i++ ) {
		fp = path.join( mod.dir, files[ i ] );
		if ( !util.fileExists( fp ) ) {
			missing.push( files[ i ] );
		}
	}

	if ( missing.length === 0 ) {
		results.push( util.pass( ID + '.all-files', 'All required files exist' ) );
	} else {
		results.push( util.fail(
			ID + '.all-files',
			'Required files exist',
			missing.length,
			missing,
			'Missing: ' + missing.join( ', ' )
		));
	}

	// Check package.json has required fields
	var pkgPath = path.join( mod.dir, 'package.json' );
	var pkgContent = util.readFile( pkgPath );
	if ( pkgContent ) {
		try {
			var pkg = JSON.parse( pkgContent );
			var pkgMissing = [];
			if ( !pkg.name ) pkgMissing.push( 'name' );
			if ( !pkg.description ) pkgMissing.push( 'description' );
			if ( !pkg.license ) pkgMissing.push( 'license' );
			if ( !pkg.keywords || !Array.isArray( pkg.keywords ) || pkg.keywords.length === 0 ) pkgMissing.push( 'keywords' );
			if ( pkgMissing.length > 0 ) {
				results.push( util.fail(
					ID + '.package-fields',
					'package.json has required fields',
					pkgMissing.length,
					pkgMissing.map( function( f ) { return 'package.json:' + f; }),
					'Missing fields: ' + pkgMissing.join( ', ' )
				));
			} else {
				results.push( util.pass( ID + '.package-fields', 'package.json has required fields' ) );
			}
		} catch ( e ) {
			results.push( util.fail( ID + '.package-fields', 'package.json is valid JSON', 1, [ 'package.json' ], 'Parse error' ) );
		}
	}

	return results;
}

module.exports = check;
