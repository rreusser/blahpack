'use strict';

var path = require( 'path' );
var childProcess = require( 'child_process' );
var util = require( '../util.js' );

var ID = 'tests';

function check( mod, opts ) {
	var results = [];
	var testDir = path.join( mod.dir, 'test' );
	var testJsPath = path.join( testDir, 'test.js' );
	var testJsContent = util.readFile( testJsPath );

	// Aggregate assertions across all test/*.js files. The export-shape file
	// `test.js` conventionally only has 2 assertions ("exports a function",
	// "has .ndarray"); the substantive routine tests live in
	// `test.<routine>.js` and `test.ndarray.js`. Treating just `test.js`
	// caused ~665 fully-implemented modules to misclassify as `scaffold`.
	var fs = require( 'fs' );
	var assertCalls = 0;
	var ASSERT_PAT = /assert\.(strictEqual|deepStrictEqual|ok|equal|notEqual|notStrictEqual|throws|doesNotThrow|rejects|doesNotReject|match|doesNotMatch)\s*\(/g;
	if ( fs.existsSync( testDir ) ) {
		var entries = fs.readdirSync( testDir );
		var i;
		for ( i = 0; i < entries.length; i++ ) {
			if ( !/^test(\..+)?\.js$/.test( entries[ i ] ) ) {
				continue;
			}
			var content = util.readFile( path.join( testDir, entries[ i ] ) );
			if ( !content ) continue;
			assertCalls += ( content.match( ASSERT_PAT ) || [] ).length;
		}
	}

	if ( !testJsContent && assertCalls === 0 ) {
		results.push( util.skip( ID + '.assertion-count', 'No test files' ) );
		results.push( util.skip( ID + '.no-scaffold-markers', 'No test.js' ) );
		if ( opts && opts.coverage ) {
			results.push( util.skip( ID + '.coverage-line', 'No test.js' ) );
			results.push( util.skip( ID + '.coverage-branch', 'No test.js' ) );
		}
		return results;
	}

	// 1. Test files have >2 substantive assertions (counted across the whole
	// test/ directory, not just test.js).
	if ( assertCalls > 2 ) {
		results.push( util.pass( ID + '.assertion-count', 'Tests have >2 assertions (' + assertCalls + ')' ) );
	} else {
		results.push( util.fail(
			ID + '.assertion-count',
			'Tests have >2 assertions',
			1, [ 'test/' ],
			'Only ' + assertCalls + ' assertion(s) across test/*.js — likely scaffold'
		));
	}

	if ( !testJsContent ) {
		results.push( util.skip( ID + '.no-scaffold-markers', 'No test.js' ) );
		if ( opts && opts.coverage ) {
			results.push( util.skip( ID + '.coverage-line', 'No test.js' ) );
			results.push( util.skip( ID + '.coverage-branch', 'No test.js' ) );
		}
		return results;
	}
	var testContent = testJsContent;
	var testPath = testJsPath;

	// 2. No scaffold markers
	var scaffoldHits = util.grepFile( testPath, /assert\.fail\s*\(\s*['"]TODO/ );
	if ( scaffoldHits.length === 0 ) {
		results.push( util.pass( ID + '.no-scaffold-markers', 'No scaffold assertion markers' ) );
	} else {
		var locs = [];
		var i;
		for ( i = 0; i < scaffoldHits.length; i++ ) {
			locs.push( 'test.js:' + scaffoldHits[ i ].line );
		}
		results.push( util.fail( ID + '.no-scaffold-markers', 'No scaffold assertion markers', scaffoldHits.length, locs ) );
	}

	// 3. Coverage (opt-in, expensive). Measured by bin/coverage.mjs over ALL
	// of the module's tests, per file in lib/ (wrapper and ndarray included;
	// ticket 0064). It used to run only test/test.js (two export-shape tests)
	// and read only the base.js row, so it never measured anything real.
	if ( opts && opts.coverage ) {
		var cov = childProcess.spawnSync( process.execPath, [ path.join( util.ROOT, 'bin', 'coverage.mjs' ), '--json', path.basename( mod.dir ) ], {
			cwd: util.ROOT,
			encoding: 'utf8',
			timeout: 600000
		});
		var measured = null;
		try {
			measured = JSON.parse( cov.stdout )[ 0 ];
		} catch ( e ) {
			measured = null;
		}
		if ( !measured || measured.error ) {
			results.push( util.warn( ID + '.coverage-line', 'Per-file line coverage', 1, [], 'Coverage run failed' + ( measured && measured.error ? ': ' + measured.error : '' ) ) );
			results.push( util.warn( ID + '.coverage-branch', 'Per-file branch coverage', 1, [], 'Coverage run failed' ) );
		} else {
			var lowLines = measured.files.filter( function low( f ) {
				return f.lines < f.min.lines;
			});
			var lowBranches = measured.files.filter( function low( f ) {
				return f.branches < f.min.branches;
			});
			if ( lowLines.length === 0 ) {
				results.push( util.pass( ID + '.coverage-line', 'Per-file line coverage at threshold' ) );
			} else {
				results.push( util.fail( ID + '.coverage-line', 'Per-file line coverage at threshold', lowLines.length, lowLines.map( function loc( f ) {
					return path.basename( f.file ) + ' (' + f.lines.toFixed( 1 ) + '% < ' + f.min.lines + '%; uncovered ' + f.uncovered.join( ',' ) + ')';
				})));
			}
			if ( lowBranches.length === 0 ) {
				results.push( util.pass( ID + '.coverage-branch', 'Per-file branch coverage at threshold' ) );
			} else {
				results.push( util.fail( ID + '.coverage-branch', 'Per-file branch coverage at threshold', lowBranches.length, lowBranches.map( function loc( f ) {
					return path.basename( f.file ) + ' (' + f.branches.toFixed( 1 ) + '% < ' + f.min.branches + '%)';
				})));
			}
		}
	}

	return results;
}

module.exports = check;
