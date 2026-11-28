'use strict';

// ESLint rule: spec-prologue
//
// The validation prologue of strided.js and <routine>.js is exactly the one
// generated from the spec's argument checks (lint/lib/prologue.cjs;
// CONVENTIONS V1, V3–V7): after any uninitialized `let` declarations, the
// function body starts with one `if ( <test> ) { throw new <Error>( … ); }`
// per generated check, in order, with the generated test and error class.
// (The message is checked by `spec-messages`.) Statements after the prologue —
// quick returns, workspace checks (W3, D5b), validation the generator could not
// translate — are not constrained here.
//
// Fix: `node bin/codemod-spec/prologue.cjs <routine>` rewrites the prologue and
// its imports.

var specTarget = require( '../../lib/spec-target.cjs' );
var P = require( '../../lib/prologue.cjs' );

// The single `throw new X( ... )` of an `if` consequent, or null.
function thrown( stmt ) {
	var c = stmt.consequent;
	var t;
	if ( stmt.alternate ) {
		return null;
	}
	if ( c.type === 'BlockStatement' ) {
		if ( c.body.length !== 1 ) {
			return null;
		}
		t = c.body[ 0 ];
	} else {
		t = c;
	}
	if ( t.type !== 'ThrowStatement' || t.argument.type !== 'NewExpression' || t.argument.callee.type !== 'Identifier' ) {
		return null;
	}
	return t.argument;
}

var rule = {
	'meta': {
		'type': 'problem',
		'docs': {
			'description': 'strided.js / <routine>.js validation prologue equals the one generated from the spec (CONVENTIONS V1, V3–V7)'
		},
		'schema': [],
		'messages': {
			'check': 'Validation prologue statement {{n}} must be the generated check (fix: `node bin/codemod-spec/prologue.cjs {{routine}}`):\n  if ( {{test}} ) { throw new {{ctor}}( … ); }'
		}
	},
	'create': function create( context ) {
		var source = context.sourceCode || context.getSourceCode();
		return {
			'Program:exit': function onExit( program ) {
				var r = specTarget.resolve( context, program );
				var checks;
				var body;
				var start;
				if ( !r || r.form === 'base' || !r.matches ) {
					return;
				}
				checks = P.prologue( r.spec, r.form, r.params );
				body = r.fn.body.body;
				start = specTarget.prologueStart( r.fn );
				checks.some( function some( c, i ) {
					var stmt = body[ start + i ];
					var nx = ( stmt && stmt.type === 'IfStatement' ) ? thrown( stmt ) : null;
					if ( nx && nx.callee.name === c.ctor && P.sameTokens( source.getText( stmt.test ), P.unwrap( c.test ) ) ) {
						return false;
					}
					context.report({
						'node': stmt || r.fn,
						'messageId': 'check',
						'data': { 'n': String( i + 1 ), 'routine': r.routine, 'test': P.unwrap( c.test ), 'ctor': c.ctor }
					});
					return true; // one report per file: later positions are shifted
				});
			}
		};
	},
	'thrown': thrown
};

module.exports = rule;
