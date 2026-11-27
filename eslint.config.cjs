'use strict';

// Flat ESLint config for blahpack.
//
// Every project-specific rule lives in lint/ (one self-contained directory per
// rule: rule.cjs, README.md, pass/fail fixtures, test.cjs) and is registered
// under the `blahpack/` namespace by lint/plugin.cjs. There is no other rule
// source. stdlib's internal ESLint rules are not used: they are unpublished and
// only exist inside a stdlib checkout, so depending on them made linting
// unrunnable off one machine.
//
// Every configured rule is an error. There is no 'warn' level for project
// rules: a rule that is not clean across the corpus is not enabled here; its
// violations are tracked as a worklist instead (see lint/README.md).

var lintLibrary = require( './lint/plugin.cjs' );

// Rules for module source files (lib/**, excluding tests/benchmarks/examples).
var SOURCE_RULES = {
	// Spec ↔ code (exact, derived from spec/<routine>.json): signatures of
	// the three forms, the validation prologue and its messages, and JSDoc.
	'spec-signature': 'error',
	'spec-prologue': 'error',
	'spec-messages': 'error',
	'spec-jsdoc': 'error',
	'module-exports': 'error',

	// Layout wrappers throw only on LD bounds the spec states: its own checks,
	// or `max( 1, <rows|cols> )` of the array (V5, V11).
	'spec-ld-bounds': 'error',

	// Documentation health: the JSDoc the API reference (bin/docs) publishes.
	// Same predicates as the site's doc-health.json (lint/lib/doc-health.cjs).
	'jsdoc-summary': 'error',
	'jsdoc-param-description': 'error',
	'jsdoc-example-esm': 'error',

	// Scaffolding remnants and convention defects.
	'jsdoc-backtick-params': 'error',
	'no-dprefix-conjugate-transpose': 'error',
	'no-stub-wrappers': 'error',
	'no-draft-remnants': 'error',
	'no-todo-params': 'error',
	'no-nary-stdlib-minmax': 'error',
	'z-prefix-reinterpret': 'error',

	// Workspace strategy: base.js/ndarray.js never allocate a problem-sized
	// workspace (the caller owns it), and there is no workspace-length param
	// (a typed array carries its own `.length`).
	'no-internal-workspace-alloc': 'error',
	'no-lwork-param': 'error',

	// A layout wrapper whose routine takes a workspace calls ndarray.js, not
	// base.js, so a caller's workspace is checked against the minimum (D5d;
	// ticket 0077).
	'wrapper-calls-ndarray': 'error',

	// ndarray.js checks the length of every workspace whose minimum the spec
	// knows, after the zero-dimension quick returns (W3; ticket 0107).
	'workspace-length-guard': 'error',

	// base.js honors the declared offset of each caller-owned workspace it
	// uses (drivers sub-allocate one buffer among callees by offset).
	'workspace-addressing-honored': 'error',

	// base.js reads the length of each workspace the reference picks its
	// path from (block size, unblocked fallback), as the reference reads
	// LWORK (W6; ticket 0100).
	'workspace-adaptive': 'error',

	// base.js takes the reference's ILAENV/IPARMQ values from the ilaenv
	// module, not from copied constants (X3; ticket 0049).
	'tuning-from-ilaenv': 'error',

	// base.js honors every array's strides and offset: element indices use the
	// array's offset, and callees get the array's own strides (S13).
	'stride-provenance': 'error'
};

// Namespace a rule map, failing loudly on any rule the library does not
// provide. (Silently dropping an unknown rule would disable it unnoticed.)
function namespaced( map ) {
	var out = {};
	Object.keys( map ).forEach( function forEach( name ) {
		if ( !lintLibrary.rules[ name ] ) {
			throw new Error( 'eslint.config.cjs: rule "' + name + '" is not provided by lint/plugin.cjs' );
		}
		out[ 'blahpack/' + name ] = map[ name ];
	});
	return out;
}

var LANGUAGE = {
	ecmaVersion: 2022,
	sourceType: 'module'
};

// Test files import their fixtures with JSON import attributes
// (`import x from './f.json' with { type: 'json' }`, ES2025). ESLint 8.57's
// bundled espree 9 stops at ES2024, so tests are parsed by espree 10 (the same
// parser, one major newer; a devDependency pinned exactly). Scope analysis is
// unchanged: ESLint's own eslint-scope runs on the AST. `ecmaVersion` stays at
// 2024, the newest ESLint 8 has a global set for (Math, Float64Array, ...);
// only the parser is told 2025.
var TEST_LANGUAGE = {
	parser: require( 'espree' ),
	parserOptions: {
		ecmaVersion: 2025
	},
	ecmaVersion: 2024,
	sourceType: 'module',
	globals: {
		// The Node globals the tests use (ESLint 8 knows only the ES
		// built-ins). Add one here when a test needs it.
		'process': 'readonly',
		'URL': 'readonly'
	}
};

// Project rules for test files.
var TEST_RULES = {
	// A failure guarded by a comparison that is false on NaN never fires on a
	// NaN result (T2a; ticket 0081).
	'no-nan-blind-comparison': 'error'
};

module.exports = [
	{
		ignores: [
			'node_modules/**',
			'data/**',
			// Of test/, only the validation harness is linted (with the test
			// rules); its fixtures are verbatim copies of old module files.
			'test/*',
			'!test/harness',
			'test/harness/fixtures/**',
			'bench/**',
			'notebooks/**',
			'examples/**',
			'index.js',
			'lib/**/benchmark/**',
			'lib/**/examples/**'
		]
	},
	{
		files: [ 'lib/**/*.js' ],
		ignores: [ 'lib/**/test/**' ],
		languageOptions: LANGUAGE,
		plugins: {
			blahpack: lintLibrary
		},
		rules: Object.assign( {
			// Core correctness (programmer errors) — high signal, low noise.
			'no-cond-assign': 'error',
			'no-dupe-args': 'error',
			'no-dupe-keys': 'error',
			'no-duplicate-case': 'error',
			'no-func-assign': 'error',
			'no-unreachable': 'error',
			'use-isnan': 'error',
			'valid-typeof': 'error',
			'no-compare-neg-zero': 'error',
			'no-self-assign': 'error',
			'no-constant-condition': [ 'error', { 'checkLoops': false } ],
			'no-unused-vars': [ 'error', { 'args': 'none' } ],
			'no-undef': 'error'
		}, namespaced( SOURCE_RULES ) )
	},
	{
		// Module tests and the validation harness (ticket 0081; CONVENTIONS
		// T2a, T2b): a small set of correctness rules, not the source rules
		// above, which are about module form.
		files: [ 'lib/**/test/**/*.js', 'test/harness/**/*.js', 'test/harness/**/*.mjs' ],
		languageOptions: TEST_LANGUAGE,
		plugins: {
			blahpack: lintLibrary
		},
		rules: Object.assign( {
			'no-dupe-args': 'error',
			'no-dupe-keys': 'error',
			'no-duplicate-case': 'error',
			'no-func-assign': 'error',
			'no-unreachable': 'error',
			'no-self-compare': 'error',
			'use-isnan': 'error',
			'valid-typeof': 'error',
			'no-unused-vars': [ 'error', { 'args': 'none' } ],
			'no-undef': 'error'
		}, namespaced( TEST_RULES ) )
	}
];
