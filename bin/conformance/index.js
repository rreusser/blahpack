'use strict';

var path = require( 'path' );
var util = require( './util.js' );
var classify = require( './classify.js' );

// Check modules
var checkFileStructure = require( './checks/file-structure.js' );
var checkScaffolding = require( './checks/scaffolding.js' );
var checkImplementation = require( './checks/implementation.js' );
var checkStrings = require( './checks/strings.js' );
var checkComplex = require( './checks/complex.js' );
var checkTests = require( './checks/tests.js' );
var checkLint = require( './checks/lint.js' );
var checkJSDoc = require( './checks/jsdoc.js' );
var checkConventions = require( './checks/conventions.js' );
var checkScaffoldNoise = require( './checks/scaffold-noise.js' );
var checkWorkspace = require( './checks/workspace.js' );
var checkWorkAssert = require( './checks/work-assert.js' );
var checkWorkAutoalloc = require( './checks/work-autoalloc.js' );
var checkSyntax = require( './checks/syntax.js' );
var checkBaseArity = require( './checks/base-arity.js' );

var ALL_CHECKS = [
	{ name: 'file-structure', fn: checkFileStructure },
	{ name: 'scaffolding', fn: checkScaffolding },
	{ name: 'implementation', fn: checkImplementation },
	{ name: 'strings', fn: checkStrings },
	{ name: 'complex', fn: checkComplex },
	{ name: 'tests', fn: checkTests },
	{ name: 'jsdoc', fn: checkJSDoc },
	{ name: 'conventions', fn: checkConventions },
	{ name: 'scaffold-noise', fn: checkScaffoldNoise },
	{ name: 'workspace', fn: checkWorkspace },
	{ name: 'work-assert', fn: checkWorkAssert },
	{ name: 'work-autoalloc', fn: checkWorkAutoalloc },
	{ name: 'syntax', fn: checkSyntax },
	{ name: 'base-arity', fn: checkBaseArity },
	{ name: 'lint', fn: checkLint }
];

/**
 * Run all checks for a single module.
 *
 * There is deliberately no per-module exception/skip mechanism: a failing check
 * is fixed in the code (or the check itself is corrected) — never suppressed.
 *
 * @param {Object} mod - { dir, pkg, routine }
 * @param {Object} opts - { coverage: bool, lint: bool, check: string|null }
 * @returns {Object} module result
 */
function checkModule( mod, opts ) {
	opts = opts || {};
	var results = [];
	var moduleKey = path.relative( util.ROOT, mod.dir );
	var i;
	var checkResults;

	util.clearCache();

	for ( i = 0; i < ALL_CHECKS.length; i++ ) {
		// If filtering to a specific check category, skip others
		if ( opts.check && ALL_CHECKS[ i ].name !== opts.check ) {
			continue;
		}
		checkResults = ALL_CHECKS[ i ].fn( mod, opts );
		results = results.concat( checkResults );
	}

	var category = classify( results );

	var summary = { pass: 0, fail: 0, warn: 0, skip: 0 };
	for ( i = 0; i < results.length; i++ ) {
		summary[ results[ i ].status ] = ( summary[ results[ i ].status ] || 0 ) + 1;
	}

	return {
		module: moduleKey,
		pkg: mod.pkg,
		routine: mod.routine,
		category: category,
		checks: results,
		summary: summary
	};
}

/**
 * Run conformance checks across all modules (or a subset).
 *
 * @param {Object} opts - { all, coverage, lint, fast, check, category, failing }
 * @returns {Array} array of module results
 */
function runConformance( modules, opts ) {
	opts = opts || {};
	var allResults = [];
	var i;
	var result;

	for ( i = 0; i < modules.length; i++ ) {
		result = checkModule( modules[ i ], opts );
		allResults.push( result );
	}

	// Filter by category if requested
	if ( opts.category ) {
		allResults = allResults.filter( function( r ) {
			return r.category === opts.category;
		});
	}

	return allResults;
}

module.exports = {
	checkModule: checkModule,
	runConformance: runConformance
};
