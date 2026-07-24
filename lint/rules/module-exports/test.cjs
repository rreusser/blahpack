'use strict';

// Tests for the module-exports rule, driven by fixtures. Each fixture is linted
// under a virtual `main.js` or `index.js` path (chosen by the fixture name) so
// the rule selects it.
//
// Run:  node --test lint/rules/module-exports/test.cjs

var path = require( 'path' );
var fs = require( 'fs' );
var test = require( 'node:test' );
var assert = require( 'node:assert' );
var { Linter } = require( '../../lib/require-eslint.cjs' );

var rule = require( './rule.cjs' );

var FIXTURES = path.join( __dirname, 'fixtures' );
var ROOT = path.join( __dirname, '..', '..', '..' );
var RULE_ID = 'blahpack/module-exports';

var linter = new Linter( { 'configType': 'flat', 'cwd': ROOT } );
var config = {
	'plugins': { 'blahpack': { 'rules': { 'module-exports': rule } } },
	'languageOptions': { 'ecmaVersion': 2022, 'sourceType': 'module' },
	'rules': {}
};
config.rules[ RULE_ID ] = 'error';

// A fixture whose name starts with "main" stands in for main.js; otherwise it
// stands in for index.js.
function targetBasename( fixtureName ) {
	return ( /^main/.test( fixtureName ) ) ? 'main.js' : 'index.js';
}

function lintFixture( file ) {
	var code = fs.readFileSync( file, 'utf8' );
	var base = targetBasename( path.basename( file ) );
	var virtual = path.join( ROOT, 'lib', 'lapack', 'base', 'ddot', 'lib', base );
	return linter.verify( code, config, { 'filename': virtual } ).filter( function filter( m ) {
		return m.ruleId === RULE_ID;
	});
}

test( 'pass fixtures lint clean', function pass() {
	var dir = path.join( FIXTURES, 'pass' );
	fs.readdirSync( dir ).filter( function f( n ) {
		return n.endsWith( '.js' );
	}).forEach( function forEach( name ) {
		var messages = lintFixture( path.join( dir, name ) );
		assert.strictEqual( messages.length, 0, name + ' should be clean, got: ' + JSON.stringify( messages.map( function map( m ) {
			return m.messageId;
		}) ) );
	});
});

test( 'fail fixtures produce the expected violation', function fail() {
	var dir = path.join( FIXTURES, 'fail' );
	fs.readdirSync( dir ).filter( function f( n ) {
		return n.endsWith( '.js' );
	}).forEach( function forEach( name ) {
		var file = path.join( dir, name );
		var code = fs.readFileSync( file, 'utf8' );
		var m = /\/\/\s*expect:\s*([A-Za-z]+)/.exec( code );
		assert.ok( m, name + ' must declare an `// expect:` messageId' );
		var ids = lintFixture( file ).map( function map( x ) {
			return x.messageId;
		});
		assert.ok( ids.indexOf( m[ 1 ] ) !== -1, name + ' should report "' + m[ 1 ] + '", got: ' + ids.join( ', ' ) );
	});
});
