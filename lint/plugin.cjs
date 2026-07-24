'use strict';

// The blahpack lint library, assembled as an ESLint plugin.
//
// Every rule is a self-contained directory under lint/rules/<name>/ holding its
// own implementation (rule.cjs), specification (README.md), and worked
// pass/fail examples (fixtures/). This file is the only place that knows the
// full roster: it loads each rule.cjs and exposes it under the `blahpack/`
// namespace. Adding a rule means dropping in a directory — no central registry
// to edit beyond this list, and no configuration file that can silence rules
// en masse.

var path = require( 'path' );
var fs = require( 'fs' );

var RULES_DIR = path.join( __dirname, 'rules' );

var rules = {};
fs.readdirSync( RULES_DIR ).forEach( function forEach( name ) {
	var rulePath = path.join( RULES_DIR, name, 'rule.cjs' );
	if ( fs.existsSync( rulePath ) ) {
		rules[ name ] = require( rulePath );
	}
});

module.exports = {
	'meta': { 'name': 'blahpack-lint' },
	'rules': rules
};
