'use strict';

// Flat ESLint config for blahpack.
//
// Runs the blahpack-specific rules (which enforce the Fortran→JS translation
// conventions) plus a core set of correctness rules, over the ESM module
// sources. It intentionally does NOT depend on stdlib's internal ESLint rule
// set: those rules are not published to npm and only exist inside a stdlib
// source checkout, so relying on them made linting unrunnable off the
// author's machine. The blahpack rules here are the ones that actually
// enforce this project's conventions; generic stdlib style rules are out of
// scope. (Set STDLIB_ESLINT_DIR and extend this config if you have a stdlib
// checkout and want the full stdlib rule set.)

// The blahpack rule set is assembled from two sources, both under the
// `blahpack/` namespace:
//   * the new self-contained rule library in lint/ (one directory per rule),
//   * the legacy rules under tools/eslint/rules (being migrated into lint/).
// Merging them keeps a single namespace while the migration proceeds; lint/
// rules win on any name overlap.
var legacyPlugin = require( './tools/eslint/plugin.cjs' );
var lintLibrary = require( './lint/plugin.cjs' );
var localPlugin = {
	'rules': Object.assign( {}, legacyPlugin.rules, lintLibrary.rules )
};

// The blahpack-specific rules, keyed under the `blahpack/` namespace.
// Only reference rules the plugin actually loaded — a rule that failed to
// load (e.g. vars-order, which requires stdlib internals) is dropped so
// ESLint does not error on an undefined rule.
var DESIRED_RULES = {
	// Signature rules (lint/rules/). Signatures must faithfully expand the
	// reference Fortran signature and stay consistent across every file of a
	// module. All three are clean across the entire corpus
	// (node lint/verify-corpus.cjs), so they block:
	//   * fortran-signature — base.js AND ndarray.js (the offset form) vs the
	//     Fortran-derived model. Replaces the old heuristic signature-conformance
	//     rule (which also no longer ran on ESLint 10 — removed getFilename API).
	//   * wrapper-signature — stride/array naming discipline in the strided
	//     <routine>.js wrapper.
	//   * module-exports — index.js/main.js expose the default + ndarray surface.
	'fortran-signature': 'error',
	'wrapper-signature': 'error',
	'module-exports': 'error',

	// These catch definite scaffolding/correctness defects and are clean
	// across the tree, so they block.
	'jsdoc-backtick-params': 'error',
	'no-dprefix-conjugate-transpose': 'error',
	'no-scaffold-assertions': 'error',
	'no-stub-wrappers': 'error',
	'no-todo-params': 'error',
	'z-prefix-reinterpret': 'error',

	// Structural enforcement of the workspace strategy: base.js and ndarray.js must
	// never allocate a problem-sized workspace buffer (the caller owns it; the
	// ndarray layer reuses one buffer across same-size batches). Allocation is
	// allowed only in the <routine>.js wrapper on a null work argument.
	'no-internal-workspace-alloc': 'error',

	// The workspace-LENGTH integer (lwork/liwork/lrwork) is vestigial in JS: a
	// typed array carries its own `.length`, so the caller-owned WORK array fully
	// determines the available workspace. A separate length parameter is redundant
	// and a source of signature-drift bugs — forbid it; derive from WORK.length.
	'no-lwork-param': 'error',
	'vars-order': 'warn'
};
var BLAHPACK_RULES = {};
Object.keys( DESIRED_RULES ).forEach( function ( name ) {
	if ( localPlugin.rules[ name ] ) {
		BLAHPACK_RULES[ 'blahpack/' + name ] = DESIRED_RULES[ name ];
	}
});

module.exports = [
	{
		ignores: [
			'node_modules/**',
			'data/**',
			'test/**',
			'bench/**',
			'notebooks/**',
			'examples/**',
			'archive/**',
			'index.js',
			'lib/**/test/**',
			'lib/**/benchmark/**',
			'lib/**/examples/**'
		]
	},
	{
		files: [ 'lib/**/*.js' ],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module'
		},
		plugins: {
			blahpack: localPlugin
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
			'no-unused-vars': [ 'warn', { 'args': 'none' } ]
		}, BLAHPACK_RULES )
	}
];
