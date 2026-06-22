'use strict';

var fs = require( 'fs' );
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
	{ name: 'lint', fn: checkLint }
];

/**
 * Load exception config from gate.config.json.
 */
function loadConfig() {
	var configPath = path.join( util.ROOT, 'gate.config.json' );
	try {
		return JSON.parse( fs.readFileSync( configPath, 'utf8' ) );
	} catch ( e ) {
		return {};
	}
}

/**
 * Apply exceptions from gate.config.json.
 * Converts matching 'fail' results to 'skip' with reason.
 */
function applyExceptions( moduleKey, results, config ) {
	var entry = config[ moduleKey ];
	if ( !entry || !entry.skip ) {
		return results;
	}
	var skipSet = new Set( entry.skip );
	var reason = entry.reason || 'exception in gate.config.json';
	var i;

	for ( i = 0; i < results.length; i++ ) {
		if ( skipSet.has( results[ i ].id ) && ( results[ i ].status === 'fail' || results[ i ].status === 'warn' ) ) {
			results[ i ] = util.skip( results[ i ].id, results[ i ].name + ' [EXCEPTION: ' + reason + ']' );
		}
	}
	return results;
}

/**
 * Run all checks for a single module.
 *
 * @param {Object} mod - { dir, pkg, routine }
 * @param {Object} opts - { coverage: bool, lint: bool, check: string|null }
 * @returns {Object} module result
 */
function checkModule( mod, opts ) {
	opts = opts || {};
	var config = loadConfig();
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

	// Apply exceptions
	results = applyExceptions( moduleKey, results, config );

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
 * Run gate checks across all modules (or a subset).
 *
 * @param {Object} opts - { all, coverage, lint, fast, check, category, failing }
 * @returns {Array} array of module results
 */
function runGate( modules, opts ) {
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
	runGate: runGate
};
