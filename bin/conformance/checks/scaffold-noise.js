'use strict';

var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'scaffold-noise';

// Trailing ",." (comma + period) in JSDoc descriptions / first-line summaries.
// Real scaffold emission: "...real M-by-N matrix A,." Catches comma+period
// at end of line, before `*/`, or before a newline within a doc/markdown line.
var COMMA_PERIOD = /,\.\s*(\*\/|$)/;

// `@returns {*}` placeholder left from the scaffold (real return type is
// `{integer} info` or `{Float64Array}` etc.).
var STAR_RETURN = /@returns\s*\{\*\}/;

// Stray translator-attribution LINE comment (e.g.
// `// Copyright (c) 2025 Ricky Reusser. Apache-2.0 License.`) left over
// from scaffolding. The legitimate copyright line lives inside the
// block `/** ... */` license header (prefixed with `*`), so match only
// `//` line comments here.
var STRAY_COPYRIGHT = /^\s*\/\/.*Ricky Reusser/;

// test.ndarray.js requiring lib/base.js bypasses the validator. The public
// ndarray surface is the layer being tested; bypassing it has hidden silent
// correctness bugs (validator strings disagreeing with base dispatch keys).
var NDARRAY_TEST_REQ_BASE = /require\(\s*['"]\.\.?\/(?:\.\.\/)?lib\/base\.js['"]\s*\)/;

// Single-char Fortran flags in user-facing example/benchmark string args
// (not in comments, not in @param backticks, not in object-property keys
// like `'M': 0`). We look only at `'X'` literals where X is a likely
// Fortran flag letter. Comments and require lines are excluded by the same
// rule the strings check uses.
var SINGLE_CHAR_FLAG = /'[A-Z]'/;
var COMMENT_OR_REQUIRE = /\/\/|^\s*\*|eslint|require/;
// Skip lines whose only single-char literals are in object-key position.
var OBJECT_KEY_ONLY = /^[^']*'[A-Z]'\s*:[^']*(?:'[A-Z]'\s*:[^']*)*$/;

// `*_MAP` translation tables in lib/*.js (NOT test fixtures) — banished.
// Wrappers must accept the same canonical strings base.js dispatches on,
// not translate between vocabularies. Real test fixture maps (translating
// Fortran chars from JSON fixtures to long-form) live in test/ — those
// are fine.
var WRAPPER_MAP_VAR = /^\s*var\s+[A-Z]+_MAP\s*=/;

function checkSingleCharFlagsInFile( filePath, locs, label ) {
	var hits = util.grepFile( filePath, SINGLE_CHAR_FLAG );
	for ( var i = 0; i < hits.length; i++ ) {
		if ( COMMENT_OR_REQUIRE.test( hits[ i ].text ) ) continue;
		if ( OBJECT_KEY_ONLY.test( hits[ i ].text ) ) continue;
		locs.push( label + ':' + hits[ i ].line );
	}
}

function check( mod ) {
	var results = [];
	var routine = mod.routine;
	var libDir = path.join( mod.dir, 'lib' );
	var docsDir = path.join( mod.dir, 'docs' );
	var libFiles = [
		[ path.join( libDir, 'base.js' ), 'base.js' ],
		[ path.join( libDir, 'ndarray.js' ), 'ndarray.js' ],
		[ path.join( libDir, routine + '.js' ), routine + '.js' ],
		[ path.join( libDir, 'main.js' ), 'main.js' ],
		[ path.join( libDir, 'index.js' ), 'index.js' ]
	];
	var docFiles = [
		[ path.join( mod.dir, 'README.md' ), 'README.md' ],
		[ path.join( docsDir, 'repl.txt' ), 'docs/repl.txt' ],
		[ path.join( docsDir, 'types', 'index.d.ts' ), 'docs/types/index.d.ts' ]
	];
	var exampleFiles = [
		[ path.join( mod.dir, 'examples', 'index.js' ), 'examples/index.js' ],
		[ path.join( mod.dir, 'benchmark', 'benchmark.js' ), 'benchmark/benchmark.js' ],
		[ path.join( mod.dir, 'benchmark', 'benchmark.ndarray.js' ), 'benchmark/benchmark.ndarray.js' ]
	];
	var ndarrayTestPath = path.join( mod.dir, 'test', 'test.ndarray.js' );
	var allDocAndLib = libFiles.concat( docFiles );
	var locs;
	var i;
	var hits;
	var j;

	// 1. Trailing ",." typo in descriptions / docstrings.
	locs = [];
	for ( i = 0; i < allDocAndLib.length; i++ ) {
		hits = util.grepFile( allDocAndLib[ i ][ 0 ], COMMA_PERIOD );
		for ( j = 0; j < hits.length; j++ ) {
			locs.push( allDocAndLib[ i ][ 1 ] + ':' + hits[ j ].line );
		}
	}
	if ( locs.length === 0 ) {
		results.push( util.pass( ID + '.no-comma-period-typo', 'No `,.` typo in descriptions' ) );
	} else {
		results.push( util.fail( ID + '.no-comma-period-typo', 'No `,.` typo in descriptions', locs.length, locs ) );
	}

	// 2. `@returns {*}` placeholder in any lib/*.js or docs/types/index.d.ts.
	locs = [];
	for ( i = 0; i < allDocAndLib.length; i++ ) {
		hits = util.grepFile( allDocAndLib[ i ][ 0 ], STAR_RETURN );
		for ( j = 0; j < hits.length; j++ ) {
			locs.push( allDocAndLib[ i ][ 1 ] + ':' + hits[ j ].line );
		}
	}
	if ( locs.length === 0 ) {
		results.push( util.pass( ID + '.no-star-return', 'No `@returns {*}` placeholders' ) );
	} else {
		results.push( util.fail(
			ID + '.no-star-return',
			'No `@returns {*}` placeholders',
			locs.length, locs,
			'Replace `{*}` with the real return type (`{integer}` for info, etc.)'
		));
	}

	// 3. Stray "Ricky Reusser" comment beneath the Apache-2.0 header.
	locs = [];
	for ( i = 0; i < libFiles.length; i++ ) {
		hits = util.grepFile( libFiles[ i ][ 0 ], STRAY_COPYRIGHT );
		for ( j = 0; j < hits.length; j++ ) {
			// The proper Apache-2.0 header says "The Stdlib Authors", not Ricky Reusser.
			locs.push( libFiles[ i ][ 1 ] + ':' + hits[ j ].line );
		}
	}
	if ( locs.length === 0 ) {
		results.push( util.pass( ID + '.no-stray-copyright', 'No stray translator-attribution comments' ) );
	} else {
		results.push( util.fail(
			ID + '.no-stray-copyright',
			'No stray translator-attribution comments',
			locs.length, locs,
			'Remove `// Copyright (c) 2025 Ricky Reusser. Apache-2.0 License.` line'
		));
	}

	// 4. test.ndarray.js must require lib/ndarray.js, not lib/base.js. We
	// only enforce this when the module actually has an ndarray.js — some
	// BLAS Level-1 modules don't ship a separate ndarray wrapper, so their
	// tests legitimately have no choice but to require base.js.
	var ndarrayLibPath = path.join( mod.dir, 'lib', 'ndarray.js' );
	if ( !util.fileExists( ndarrayTestPath ) ) {
		results.push( util.skip( ID + '.ndarray-test-routes-through-validator', 'No test/test.ndarray.js' ) );
	} else if ( !util.fileExists( ndarrayLibPath ) ) {
		results.push( util.skip( ID + '.ndarray-test-routes-through-validator', 'No lib/ndarray.js (single-file module)' ) );
	} else {
		hits = util.grepFile( ndarrayTestPath, NDARRAY_TEST_REQ_BASE );
		if ( hits.length === 0 ) {
			results.push( util.pass( ID + '.ndarray-test-routes-through-validator', 'test.ndarray.js routes through ndarray.js' ) );
		} else {
			locs = [];
			for ( j = 0; j < hits.length; j++ ) {
				locs.push( 'test/test.ndarray.js:' + hits[ j ].line );
			}
			results.push( util.fail(
				ID + '.ndarray-test-routes-through-validator',
				'test.ndarray.js routes through ndarray.js',
				locs.length, locs,
				'test.ndarray.js bypasses the validator by requiring lib/base.js — change to lib/ndarray.js (move base-only tests to test.base.js if needed)'
			));
		}
	}

	// 5. No single-char Fortran flags in example/benchmark string args.
	locs = [];
	for ( i = 0; i < exampleFiles.length; i++ ) {
		checkSingleCharFlagsInFile( exampleFiles[ i ][ 0 ], locs, exampleFiles[ i ][ 1 ] );
	}
	if ( locs.length === 0 ) {
		results.push( util.pass( ID + '.no-single-char-in-examples', 'No single-char Fortran flags in examples/benchmarks' ) );
	} else {
		results.push( util.fail(
			ID + '.no-single-char-in-examples',
			'No single-char Fortran flags in examples/benchmarks',
			locs.length, locs,
			'Replace single-char flags (e.g. `\'A\'`, `\'N\'`) with long-form strings (e.g. `\'all\'`, `\'none\'`)'
		));
	}

	// 6. No `*_MAP` translation-table variables in lib/*.js. Wrappers must
	// pass the same string vocabulary base.js dispatches on; introducing a
	// translation table creates two vocabularies that drift out of sync.
	locs = [];
	for ( i = 0; i < libFiles.length; i++ ) {
		hits = util.grepFile( libFiles[ i ][ 0 ], WRAPPER_MAP_VAR );
		for ( j = 0; j < hits.length; j++ ) {
			locs.push( libFiles[ i ][ 1 ] + ':' + hits[ j ].line );
		}
	}
	if ( locs.length === 0 ) {
		results.push( util.pass( ID + '.no-wrapper-string-map', 'No string-translation `*_MAP` in lib/' ) );
	} else {
		results.push( util.fail(
			ID + '.no-wrapper-string-map',
			'No string-translation `*_MAP` in lib/',
			locs.length, locs,
			'Wrappers must pass the same canonical strings base.js dispatches on. Drop the MAP and align both sides on the canonical name.'
		));
	}

	return results;
}

module.exports = check;
