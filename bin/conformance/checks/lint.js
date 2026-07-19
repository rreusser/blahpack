'use strict';

var path = require( 'path' );
var fs = require( 'fs' );
var childProcess = require( 'child_process' );
var util = require( '../util.js' );

var ID = 'lint';

// Whitelisted eslint-disable rules — these are legitimate for BLAS/LAPACK code
var ALLOWED_RULES = new Set([
	// Complexity/size — BLAS/LAPACK routines are inherently large
	'max-len',
	'max-params',
	'max-statements',
	'max-lines',
	'max-depth',
	'max-lines-per-function',
	'max-statements-per-line',

	// Style — legitimate for translated numerical code
	'no-var',                // CommonJS files use var
	'no-constant-condition', // while(true) for reverse-communication (dlacn2 etc.)
	'no-mixed-operators',    // complex arithmetic expressions
	'no-continue',           // Fortran loop continue translation
	'no-lonely-if',          // Fortran nested IF-ELSE branching translation
	'no-labels',             // Fortran GOTO translation
	'no-extra-parens',       // clarity in arithmetic
	'camelcase',             // Fortran-style variable names
	'no-underscore-dangle',  // internal naming conventions
	'new-cap',               // Fortran-style uppercase helpers (e.g. Z() in dlasq*)
	'no-shadow',             // nested helpers inside translated routines reuse names from outer scope (e.g. abs1 helper alongside main routine)
	'no-unmodified-loop-condition', // ESLint can't trace `i--` inside conditional branches in translated GOTO loops (e.g. zlahqr's QZ iteration)
	'@cspell/spellchecker',  // Fortran routine names and acronyms (DLABAD, DLARRJ, GERSCHGORIN) routinely trigger spellchecker false positives

	// Context-specific
	'no-console',            // examples only
	'node/no-sync',          // tests only
	'no-unused-vars',        // function signature compatibility
	'no-self-assign',        // intentional in-place updates

	// stdlib-specific
	'stdlib/require-globals',
	'stdlib/first-unit-test',
	'stdlib/jsdoc-private-annotation',
	'stdlib/require-file-extensions',
	'no-restricted-syntax',
	'id-length',

	// Formatting — sometimes necessary for readability
	'object-curly-newline',
	'object-property-newline',
	'function-call-argument-newline',
	'function-paren-newline',
	'require-jsdoc'
]);

// Rules legitimate to disable ONLY in test files. Test code translated from
// Fortran often declares fixtures and locals interleaved with code rather
// than all-at-the-top, which mirrors the original Fortran block structure
// and keeps related setup/use close together. Keep this list narrow: any
// rule here should make sense for tests but not for shipped library code.
var TEST_ONLY_RULES = new Set([
	'vars-on-top',
	'stdlib/vars-order',
	'stdlib/empty-line-before-comment',
	'stdlib/line-closing-bracket-spacing',
	'stdlib/capitalized-comments'
]);

// Pattern to extract rule names from eslint-disable directives
var DISABLE_PATTERN = /eslint-disable(?:-next-line|-line)?\s+(.+?)(?:\s*--|$|\s*\*\/)/;
var BLANKET_DISABLE = /\/\*\s*eslint-disable\s*\*\//;

function extractDisabledRules( line ) {
	var match = line.match( DISABLE_PATTERN );
	if ( !match ) {
		return [];
	}
	return match[ 1 ].split( /\s*,\s*/ ).map( function trim( r ) {
		return r.trim();
	});
}

function checkEslintDisables( mod ) {
	var results = [];
	var libDir = path.join( mod.dir, 'lib' );
	var testDir = path.join( mod.dir, 'test' );
	var examplesDir = path.join( mod.dir, 'examples' );
	var violations = [];
	var dirs = [];
	var i;

	if ( fs.existsSync( libDir ) ) dirs.push({ dir: libDir, context: 'lib' });
	if ( fs.existsSync( testDir ) ) dirs.push({ dir: testDir, context: 'test' });
	if ( fs.existsSync( examplesDir ) ) dirs.push({ dir: examplesDir, context: 'examples' });

	for ( i = 0; i < dirs.length; i++ ) {
		scanDir( dirs[ i ].dir, dirs[ i ].context, violations );
	}

	if ( violations.length === 0 ) {
		results.push( util.pass( ID + '.eslint-disable-whitelist', 'eslint-disable rules are whitelisted' ) );
	} else {
		results.push( util.fail(
			ID + '.eslint-disable-whitelist',
			'eslint-disable rules are whitelisted',
			violations.length,
			violations.map( function fmt( v ) { return v.file + ':' + v.line + ' (' + v.rule + ')'; }),
			violations.length + ' non-whitelisted eslint-disable directive(s)'
		));
	}

	return results;
}

function scanDir( dir, context, violations ) {
	var entries;
	var entry;
	var entryPath;
	var i;

	try {
		entries = fs.readdirSync( dir );
	} catch ( e ) {
		return;
	}
	for ( i = 0; i < entries.length; i++ ) {
		entry = entries[ i ];
		entryPath = path.join( dir, entry );
		if ( fs.statSync( entryPath ).isDirectory() ) {
			scanDir( entryPath, context, violations );
			continue;
		}
		if ( !entry.endsWith( '.js' ) ) {
			continue;
		}
		scanFile( entryPath, context, violations );
	}
}

function scanFile( filePath, context, violations ) {
	var content = util.readFile( filePath );
	if ( !content ) {
		return;
	}
	var lines = content.split( '\n' );
	var fileName = path.basename( filePath );
	var i;
	var j;
	var rules;
	var rule;

	for ( i = 0; i < lines.length; i++ ) {
		// Check for blanket eslint-disable (no rules specified)
		if ( BLANKET_DISABLE.test( lines[ i ] ) ) {
			violations.push({
				file: fileName,
				line: i + 1,
				rule: '(blanket disable)'
			});
			continue;
		}

		if ( !/eslint-disable/.test( lines[ i ] ) ) {
			continue;
		}

		rules = extractDisabledRules( lines[ i ] );
		for ( j = 0; j < rules.length; j++ ) {
			rule = rules[ j ];
			if ( !rule ) continue;

			// Context-aware: no-console only allowed in examples, node/no-sync only in tests
			if ( rule === 'no-console' && context !== 'examples' ) {
				violations.push({ file: fileName, line: i + 1, rule: rule + ' (not in examples)' });
			} else if ( rule === 'node/no-sync' && context !== 'test' ) {
				violations.push({ file: fileName, line: i + 1, rule: rule + ' (not in test)' });
			} else if ( TEST_ONLY_RULES.has( rule ) && context !== 'test' ) {
				violations.push({ file: fileName, line: i + 1, rule: rule + ' (not in test)' });
			} else if ( !ALLOWED_RULES.has( rule ) && !TEST_ONLY_RULES.has( rule ) ) {
				violations.push({ file: fileName, line: i + 1, rule: rule });
			}
		}
	}
}

function check( mod, opts ) {
	var results = [];

	// 1. eslint-disable whitelist enforcement (always runs, fast)
	results = results.concat( checkEslintDisables( mod ) );

	// 2. ESLint pass (opt-in for --all, always for single module)
	if ( opts && opts.lint !== false ) {
		try {
			childProcess.execSync(
				'bash bin/lint.sh ' + JSON.stringify( mod.dir ),
				{
					cwd: util.ROOT,
					encoding: 'utf8',
					timeout: 60000,
					stdio: [ 'pipe', 'pipe', 'pipe' ]
				}
			);
			results.push( util.pass( ID + '.eslint-pass', 'ESLint passes with zero errors' ) );
		} catch ( e ) {
			var output = ( e.stdout || '' ) + ( e.stderr || '' );
			// Try to extract error count
			var errorMatch = output.match( /(\d+)\s+error/);
			var errorCount = errorMatch ? parseInt( errorMatch[ 1 ], 10 ) : 1;
			results.push( util.fail(
				ID + '.eslint-pass',
				'ESLint passes with zero errors',
				errorCount, [ mod.dir ],
				errorCount + ' ESLint error(s)'
			));
		}
	}

	return results;
}

module.exports = check;
