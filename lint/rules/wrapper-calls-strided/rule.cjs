'use strict';

// ESLint rule: wrapper-calls-ndarray
//
// A layout wrapper (lib/<pkg>/<routine>/lib/<routine>.js) whose routine
// takes a workspace (a spec param of role `workspace`) calls the default
// export of `./ndarray.js`, not of `./base.js` (CONVENTIONS D5c; ticket 0077).
//
// Why: ndarray.js is where a workspace is checked against the reference's
// minimum (W3) and against the stride rules (D5b). A wrapper that calls
// base.js hands a caller's undersized WORK straight to the algorithm, where
// typed-array writes past the end are dropped and reads give `undefined`: the
// result is silently NaN or wrong. Calling ndarray.js keeps the validation in
// one layer instead of hand-copying it into two.
//
// Named helpers base.js exports (`computeOptimalWorkSize`, used to size the
// wrapper's `null` allocation) may still be imported; only the default import
// (the algorithm) is rejected.

var specTarget = require( '../../lib/spec-target.cjs' );
var specLib = require( '../../lib/spec.cjs' );

function hasWorkspace( spec ) {
	return !!spec && spec.params.some( function some( p ) {
		return p.role === 'workspace';
	});
}

var rule = {
	'meta': {
		'type': 'problem',
		'docs': {
			'description': 'A layout wrapper whose routine takes a workspace calls ndarray.js, not base.js (CONVENTIONS D5c)'
		},
		'schema': [],
		'messages': {
			'base': 'The wrapper imports the default export of `./base.js`; a routine with a workspace ({{ws}}) must call `./ndarray.js`, so a caller\'s workspace is checked against the minimum (CONVENTIONS D5c, W3). Fix: `node bin/codemod-wrapper-ndarray.mjs {{routine}}`.',
			'nocall': 'The wrapper never calls the default export of `./ndarray.js`; a routine with a workspace ({{ws}}) must, so a caller\'s workspace is checked against the minimum (CONVENTIONS D5c, W3).'
		}
	},
	'create': function create( context ) {
		var t = specTarget.target( context.filename || context.getFilename() );
		var spec;
		var ws;
		if ( !t || t.form !== 'strided' ) {
			return {};
		}
		spec = specLib.load( t.routine );
		if ( !hasWorkspace( spec ) ) {
			return {};
		}
		ws = spec.params.filter( function f( p ) {
			return p.role === 'workspace';
		}).map( function m( p ) {
			return p.name;
		}).join( ', ' );
		return {
			'Program:exit': function onExit( program ) {
				var ndLocal = null;
				var called = false;
				program.body.forEach( function each( n ) {
					if ( n.type !== 'ImportDeclaration' ) {
						return;
					}
					n.specifiers.forEach( function eachSpec( s ) {
						if ( s.type === 'ImportNamespaceSpecifier' || s.type === 'ImportDefaultSpecifier' || ( s.type === 'ImportSpecifier' && s.imported.name === 'default' ) ) {
							if ( n.source.value === './base.js' ) {
								context.report( { 'node': s, 'messageId': 'base', 'data': { 'ws': ws, 'routine': t.routine } } );
							} else if ( n.source.value === './ndarray.js' && s.type !== 'ImportNamespaceSpecifier' ) {
								ndLocal = s.local.name;
							}
						}
					});
				});
				if ( ndLocal ) {
					( function walk( node ) {
						var k;
						var v;
						if ( called || !node || typeof node.type !== 'string' ) {
							return;
						}
						if ( node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === ndLocal ) {
							called = true;
							return;
						}
						for ( k in node ) {
							if ( k === 'parent' || !Object.prototype.hasOwnProperty.call( node, k ) ) {
								continue;
							}
							v = node[ k ];
							if ( Array.isArray( v ) ) {
								v.forEach( walk );
							} else if ( v && typeof v.type === 'string' ) {
								walk( v );
							}
						}
					})( program );
				}
				if ( !called ) {
					context.report( { 'node': program, 'messageId': 'nocall', 'data': { 'ws': ws } } );
				}
			}
		};
	}
};

module.exports = rule;
