'use strict';

var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'scaffolding';

function check( mod ) {
	var results = [];
	var basePath = path.join( mod.dir, 'lib', 'base.js' );
	var testPath = path.join( mod.dir, 'test', 'test.js' );
	var indexPath = path.join( mod.dir, 'lib', 'index.js' );
	var readmePath = path.join( mod.dir, 'README.md' );
	var examplesPath = path.join( mod.dir, 'examples', 'index.js' );
	var hits;
	var locs;
	var learningsPath;
	var i;

	// 1. No TODO in base.js
	hits = util.grepFile( basePath, /TODO/ );
	if ( hits.length === 0 ) {
		results.push( util.pass( ID + '.no-todo-base', 'No TODO in base.js' ) );
	} else {
		locs = [];
		for ( i = 0; i < hits.length; i++ ) {
			locs.push( 'base.js:' + hits[ i ].line );
		}
		results.push( util.fail( ID + '.no-todo-base', 'No TODO in base.js', hits.length, locs ) );
	}

	// 2. No assert.fail in test.js
	if ( util.fileExists( testPath ) ) {
		hits = util.grepFile( testPath, /assert\.fail/ );
		if ( hits.length === 0 ) {
			results.push( util.pass( ID + '.no-assert-fail', 'No assert.fail in tests' ) );
		} else {
			locs = [];
			for ( i = 0; i < hits.length; i++ ) {
				locs.push( 'test.js:' + hits[ i ].line );
			}
			results.push( util.fail( ID + '.no-assert-fail', 'No assert.fail in tests', hits.length, locs ) );
		}
	} else {
		results.push( util.skip( ID + '.no-assert-fail', 'No test.js' ) );
	}

	// 3. No "not yet implemented" in wrapper files
	var wrapperFiles = [ 'index.js', 'main.js', 'ndarray.js', mod.routine + '.js' ];
	var stubCount = 0;
	var stubLocs = [];
	var wf;
	var wfPath;
	for ( i = 0; i < wrapperFiles.length; i++ ) {
		wf = wrapperFiles[ i ];
		wfPath = path.join( mod.dir, 'lib', wf );
		hits = util.grepFile( wfPath, /not yet implemented/ );
		if ( hits.length > 0 ) {
			stubCount += hits.length;
			stubLocs.push( wf );
		}
	}
	if ( stubCount === 0 ) {
		results.push( util.pass( ID + '.no-stub-wrappers', 'No stub wrappers' ) );
	} else {
		results.push( util.fail( ID + '.no-stub-wrappers', 'No stub wrappers', stubCount, stubLocs ) );
	}

	// 4. LEARNINGS.md filled in
	if ( util.fileExists( path.join( mod.dir, 'LEARNINGS.md' ) ) ) {
		learningsPath = path.join( mod.dir, 'LEARNINGS.md' );
	} else if ( util.fileExists( path.join( mod.dir, 'LEARNINGS.integrated.md' ) ) ) {
		learningsPath = path.join( mod.dir, 'LEARNINGS.integrated.md' );
	} else {
		learningsPath = null;
	}
	if ( learningsPath ) {
		hits = util.grepFile( learningsPath, /TODO: Fill in/ );
		if ( hits.length === 0 ) {
			results.push( util.pass( ID + '.learnings-filled', 'LEARNINGS.md filled in' ) );
		} else {
			results.push( util.fail( ID + '.learnings-filled', 'LEARNINGS.md filled in', hits.length, [ path.basename( learningsPath ) ] ) );
		}
	} else {
		results.push( util.skip( ID + '.learnings-filled', 'No LEARNINGS.md' ) );
	}

	// 5. README.md no TODOs
	if ( util.fileExists( readmePath ) ) {
		hits = util.grepFile( readmePath, /TODO/ );
		if ( hits.length === 0 ) {
			results.push( util.pass( ID + '.no-todo-readme', 'No TODO in README.md' ) );
		} else {
			locs = [];
			for ( i = 0; i < hits.length; i++ ) {
				locs.push( 'README.md:' + hits[ i ].line );
			}
			results.push( util.fail( ID + '.no-todo-readme', 'No TODO in README.md', hits.length, locs ) );
		}
	} else {
		results.push( util.skip( ID + '.no-todo-readme', 'No README.md' ) );
	}

	// 6. index.js @example filled in
	if ( util.fileExists( indexPath ) ) {
		hits = util.grepFile( indexPath, /TODO:?\s*(Add|add)\s*example/i );
		if ( hits.length === 0 ) {
			results.push( util.pass( ID + '.index-example', 'index.js @example filled in' ) );
		} else {
			results.push( util.fail( ID + '.index-example', 'index.js @example filled in', hits.length, [ 'index.js' ] ) );
		}
	} else {
		results.push( util.skip( ID + '.index-example', 'No index.js' ) );
	}

	// 7. examples/index.js is not a stub
	if ( util.fileExists( examplesPath ) ) {
		hits = util.grepFile( examplesPath, /TODO/i );
		if ( hits.length === 0 ) {
			results.push( util.pass( ID + '.examples-filled', 'examples/index.js not a stub' ) );
		} else {
			results.push( util.fail( ID + '.examples-filled', 'examples/index.js not a stub', hits.length, [ 'examples/index.js' ] ) );
		}
	} else {
		results.push( util.skip( ID + '.examples-filled', 'No examples/index.js' ) );
	}

	return results;
}

module.exports = check;
