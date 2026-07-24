'use strict';

// Tests for the fortran-signature rule, driven by the fixture files.
//
// Every file in fixtures/pass/ must lint clean; every file in fixtures/fail/
// must produce at least the violation named in its `// expect: <messageId>`
// header. The routine each fixture speaks for is encoded in its filename
// (`<routine>--<label>.js`), which the harness turns into a synthetic
// `.../base/<routine>/lib/base.js` path so the rule resolves the same Fortran
// data it uses on the real corpus.
//
// Run:  node --test lint/rules/fortran-signature/test.cjs

var path = require( 'path' );
var fs = require( 'fs' );
var test = require( 'node:test' );
var assert = require( 'node:assert' );
var { Linter } = require( '../../lib/require-eslint.cjs' );

var rule = require( './rule.cjs' );

var FIXTURES = path.join( __dirname, 'fixtures' );
var ROOT = path.join( __dirname, '..', '..', '..' );
var RULE_ID = 'blahpack/fortran-signature';

var linter = new Linter( { 'configType': 'flat', 'cwd': ROOT } );
var config = {
	'plugins': { 'blahpack': { 'rules': { 'fortran-signature': rule } } },
	'languageOptions': { 'ecmaVersion': 2022, 'sourceType': 'module' },
	'rules': {}
};
config.rules[ RULE_ID ] = 'error';

function routineOf( file ) {
	return path.basename( file, '.js' ).split( '--' )[ 0 ];
}

function lintFixture( file ) {
	var code = fs.readFileSync( file, 'utf8' );
	var routine = routineOf( file );
	// The virtual path must live under the project root: ESLint flat config only
	// applies a `files`-less config to files within the base path. The file need
	// not exist — verify() lints the provided source.
	var virtual = path.join( ROOT, 'lib', 'lapack', 'base', routine, 'lib', 'base.js' );
	return linter.verify( code, config, { 'filename': virtual } ).filter( function filter( m ) {
		return m.ruleId === RULE_ID;
	});
}

function expectedMessageId( code ) {
	var m = /\/\/\s*expect:\s*([A-Za-z]+)/.exec( code );
	return m ? m[ 1 ] : null;
}

test( 'pass fixtures lint clean', function pass( t ) {
	var dir = path.join( FIXTURES, 'pass' );
	fs.readdirSync( dir ).filter( function f( n ) {
		return n.endsWith( '.js' );
	}).forEach( function forEach( name ) {
		var file = path.join( dir, name );
		var messages = lintFixture( file );
		assert.strictEqual( messages.length, 0, name + ' should be clean, got: ' + JSON.stringify( messages.map( function map( m ) {
			return m.messageId + ': ' + m.message;
		}) ) );
	});
});

test( 'fail fixtures produce the expected violation', function fail( t ) {
	var dir = path.join( FIXTURES, 'fail' );
	fs.readdirSync( dir ).filter( function f( n ) {
		return n.endsWith( '.js' );
	}).forEach( function forEach( name ) {
		var file = path.join( dir, name );
		var code = fs.readFileSync( file, 'utf8' );
		var want = expectedMessageId( code );
		assert.ok( want, name + ' must declare an `// expect:` messageId' );
		var messages = lintFixture( file );
		assert.ok( messages.length > 0, name + ' should produce a violation but was clean' );
		var ids = messages.map( function map( m ) {
			return m.messageId;
		});
		assert.ok( ids.indexOf( want ) !== -1, name + ' should report "' + want + '", got: ' + ids.join( ', ' ) );
	});
});
