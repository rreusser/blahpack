'use strict';

var path = require( 'path' );
var configDir = path.join( __dirname, '..', 'tools', 'eslint', 'config' );

// All files under lib/ are ES modules (lib/package.json: "type": "module").
var styleConfig = require( path.join( configDir, 'style.json' ) );

// ESM nodes banned by the root no-restricted-syntax but required here.
var ESM_NODES = new Set( [
	'ExportDefaultDeclaration',
	'ExportNamedDeclaration',
	'ExportAllDeclaration',
	'ExportSpecifier',
	'ImportDeclaration',
	'ImportSpecifier',
	'ImportDefaultSpecifier',
	'ImportNamespaceSpecifier'
] );

var rootRestrictedSyntax = styleConfig[ 'no-restricted-syntax' ];
var restrictedWithoutESM = [ rootRestrictedSyntax[ 0 ] ].concat(
	rootRestrictedSyntax.slice( 1 ).filter( function( entry ) {
		return !( typeof entry === 'string' && ESM_NODES.has( entry ) );
	})
);

module.exports = {
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2022
	},

	// benchmark, examples, and test files use `import ... with { type: 'json' }` (ES2025+),
	// which espree 9.x (ESLint 8) cannot parse. Tests are also generated scaffolding
	// with their own gate checks.
	ignorePatterns: [ '**/benchmark/**', '**/examples/**', '**/test/**' ],

	rules: {
		// Allow import/export; keep all other restricted-syntax bans.
		'no-restricted-syntax': restrictedWithoutESM,

		// Node.js 24 fully supports ESM; root config targets >=0.12 which predates it.
		'node/no-unsupported-features/es-syntax': [ 'error', {
			version: '>=18.0.0',
			ignores: [ 'modules' ]
		} ],
		// Builtins like Array.from, Float64Array etc. are fully supported on Node 18+.
		'node/no-unsupported-features/es-builtins': [ 'error', {
			version: '>=18.0.0'
		} ],

		// Relative imports within lib/ are monorepo siblings, not npm packages.
		'node/no-unpublished-import': 'off',

		// Float64Array, Int32Array etc. are valid globals in Node.js / modern JS.
		// stdlib's require-globals convention is for CJS portability; we use ESM.
		'stdlib/require-globals': 'off',

		// Fortran naming conventions (LWORK, LDA, INFO, UPLO) are intentional —
		// they preserve direct correspondence with the reference Fortran source.
		'camelcase': 'off',

		// Operator precedence is well-defined; requiring explicit parens everywhere
		// in arithmetic expressions adds noise without preventing any real bugs.
		'no-mixed-operators': 'off',

		// Requiring one array element per line makes fixture/matrix data unreadable.
		'array-element-newline': 'off',

		// Same verbosity problem for function calls with many arguments.
		'function-call-argument-newline': 'off',
		'function-paren-newline': 'off',
		'object-property-newline': 'off',
		'object-curly-newline': 'off',

		// Translated Fortran naturally declares variables mid-function; restructuring
		// every function body for style would obscure correspondence with the source.
		'vars-on-top': 'off',

		// stdlib-specific convention (sort vars by name length); not applicable here.
		'stdlib/vars-order': 'off',

		// This rule is deprecated since ESLint 8.53 and has known false positives.
		'valid-jsdoc': 'off',

		// Dense numerical kernels legitimately put multiple increments on one line
		// (e.g. `ia += sa; ib += sb;`); the one-statement rule adds no safety here.
		'max-statements-per-line': 'off',

		// Fortran translation often declares vars at their point of first use inside
		// loops/conditionals. Because `var` is hoisted, this is not a real bug —
		// just a style divergence from the "all vars at top" convention.
		'no-inner-declarations': 'off',
		'block-scoped-var': 'off',

		// LAPACK routines accept WORK/LWORK/IWORK/LIWORK parameters to match the
		// Fortran reference interface even when the JS translation pre-allocates
		// internally. Suppress unused-argument warnings; keep unused-variable check.
		'no-unused-vars': [ 'error', { 'vars': 'all', 'args': 'none' } ]
	}
};
