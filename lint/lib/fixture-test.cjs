'use strict';

// Shared fixture-driven test runner for lint/ rules.
//
// A rule's test.cjs is just:
//
//   require( '../../lib/fixture-test.cjs' )( 'my-rule', require( './rule.cjs' ), __dirname );
//
// Fixtures live in <rule>/fixtures/{pass,fail}/*.js. Each fixture declares, in a
// line comment near the top:
//
//   // target: lib/lapack/base/dgetrf/lib/base.js
//       The repo-relative path the rule should believe it is linting. Rules
//       select files and derive the routine name from this path. Required.
//
//   // expect: <messageId or message substring>
//       Fail fixtures only: a report whose messageId equals this, or whose
//       message contains it, must be produced. Required for fail fixtures.
//
// Pass fixtures must produce no report from the rule under test.

var path = require( 'path' );
var fs = require( 'fs' );
var test = require( 'node:test' );
var assert = require( 'node:assert' );
var { Linter } = require( './require-eslint.cjs' );

var ROOT = path.join( __dirname, '..', '..' );

function header( code, key ) {
	var m = new RegExp( '^\\s*\\/\\/\\s*' + key + ':\\s*(.+?)\\s*$', 'm' ).exec( code );
	return ( m ) ? m[ 1 ] : null;
}

function fixtures( dir ) {
	if ( !fs.existsSync( dir ) ) {
		return [];
	}
	return fs.readdirSync( dir ).filter( function f( n ) {
		return n.endsWith( '.js' );
	}).map( function map( n ) {
		return path.join( dir, n );
	});
}

function runFixtureTests( name, rule, ruleDir ) {
	var ruleId = 'blahpack/' + name;
	var linter = new Linter( { 'configType': 'flat', 'cwd': ROOT } );
	var config = {
		'plugins': { 'blahpack': { 'rules': {} } },
		'languageOptions': { 'ecmaVersion': 2022, 'sourceType': 'module' },
		'rules': {}
	};
	config.plugins.blahpack.rules[ name ] = rule;
	config.rules[ ruleId ] = 'error';

	function lint( file ) {
		var code = fs.readFileSync( file, 'utf8' );
		var target = header( code, 'target' );
		assert.ok( target, path.basename( file ) + ' must declare a `// target:` path' );
		return {
			'code': code,
			'messages': linter.verify( code, config, { 'filename': path.join( ROOT, target ) } ).filter( function filter( m ) {
				return m.ruleId === ruleId || m.fatal;
			})
		};
	}

	test( name + ': pass fixtures lint clean', function pass() {
		var files = fixtures( path.join( ruleDir, 'fixtures', 'pass' ) );
		assert.ok( files.length > 0, 'at least one pass fixture is required' );
		files.forEach( function forEach( file ) {
			var r = lint( file );
			assert.strictEqual( r.messages.length, 0, path.basename( file ) + ' should be clean, got: ' + JSON.stringify( r.messages.map( function map( m ) {
				return m.message;
			}) ) );
		});
	});

	test( name + ': fail fixtures produce the expected violation', function fail() {
		var files = fixtures( path.join( ruleDir, 'fixtures', 'fail' ) );
		assert.ok( files.length > 0, 'at least one fail fixture is required' );
		files.forEach( function forEach( file ) {
			var r = lint( file );
			var expect = header( r.code, 'expect' );
			assert.ok( expect, path.basename( file ) + ' must declare an `// expect:` messageId or message substring' );
			assert.ok( r.messages.some( function some( m ) {
				return m.messageId === expect || String( m.message ).indexOf( expect ) !== -1;
			}), path.basename( file ) + ' should report "' + expect + '", got: ' + JSON.stringify( r.messages.map( function map( m ) {
				return m.message;
			}) ) );
		});
	});
}

module.exports = runFixtureTests;
