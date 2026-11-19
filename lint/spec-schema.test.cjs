'use strict';

// Every committed spec validates against spec/schema.json, and every
// spec/options.json value appears in CONVENTIONS.md Appendix A (one source).
//
// Run:  node --test lint/spec-schema.test.cjs

var path = require( 'path' );
var fs = require( 'fs' );
var test = require( 'node:test' );
var assert = require( 'node:assert' );
var Ajv = require( 'ajv' );

var ROOT = path.join( __dirname, '..' );
var SPEC = path.join( ROOT, 'spec' );
var RESERVED = { 'options.json': true, 'schema.json': true };

test( 'every spec validates against spec/schema.json', function t() {
	var ajv = new Ajv( { 'allErrors': true } );
	var validate = ajv.compile( JSON.parse( fs.readFileSync( path.join( SPEC, 'schema.json' ), 'utf8' ) ) );
	var bad = [];
	var n = 0;
	fs.readdirSync( SPEC ).filter( function f( x ) {
		return /\.json$/.test( x ) && !RESERVED[ x ];
	}).forEach( function each( x ) {
		n += 1;
		if ( !validate( JSON.parse( fs.readFileSync( path.join( SPEC, x ), 'utf8' ) ) ) ) {
			bad.push( x + ': ' + ajv.errorsText( validate.errors ) );
		}
	});
	assert.ok( n > 0, 'no specs found' );
	assert.deepStrictEqual( bad, [] );
});

test( 'spec/options.json values all appear in CONVENTIONS.md Appendix A', function t() {
	var conv = fs.readFileSync( path.join( ROOT, 'CONVENTIONS.md' ), 'utf8' );
	var appendix = conv.slice( conv.indexOf( '## Appendix A' ), conv.indexOf( '## Rulings log' ) );
	var missing = [];
	JSON.parse( fs.readFileSync( path.join( SPEC, 'options.json' ), 'utf8' ) ).families.forEach( function each( f ) {
		Object.keys( f.values ).forEach( function eachL( L ) {
			if ( appendix.indexOf( '\'' + f.values[ L ] + '\'' ) === -1 ) {
				missing.push( f.params.join( '/' ) + ': ' + f.values[ L ] );
			}
		});
	});
	assert.deepStrictEqual( missing, [] );
});
