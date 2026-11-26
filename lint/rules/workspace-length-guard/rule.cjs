'use strict';

// ESLint rule: workspace-length-guard
//
// `ndarray.js` checks the length of every workspace whose minimum the spec
// knows (CONVENTIONS W3; ticket 0107). For each spec param of role
// `workspace` with a non-null `minLength.js`, the exported function has a
// top-level guard
//
//   if ( !RWORK || ( RWORK.length - offsetRWork ) < minRWork ) {
//       throw new RangeError( ... );
//   }
//
// that is: an `if` statement in the function whose test reads `<NAME>.length`
// and whose consequent throws `RangeError`. Names compare case-insensitively
// (S7). The guard may sit inside a zero-dimension condition (`if ( N > 0 )`).
// Whether it demands the right length, on every path, is the behavioral
// check's job (`ci:workspace-minimum`, the replay's `short-work`).
//
// Early-return order: a `return` in a top-level statement after the one
// holding the first such guard, other than the final statement (the call of
// base.js), is reported. A
// zero-dimension quick return comes before the workspace checks: an empty
// problem needs no workspace, and the JS may accept less there, never demand
// more (W3).
//
// Why: a short IWORK/RWORK/BWORK that is not checked runs silently; typed-array
// writes past the end are dropped and reads give `undefined`, so the result is
// wrong or NaN.

var specTarget = require( '../../lib/spec-target.cjs' );

function guarded( spec ) {
	return spec.params.filter( function f( p ) {
		return p.role === 'workspace' && p.minLength && typeof p.minLength.js === 'string' && p.minLength.js !== '';
	});
}

// Whether `node`'s subtree satisfies `pred` (not descending into functions).
function some( node, pred ) {
	var found = false;
	( function walk( n ) {
		var k;
		var v;
		if ( found || !n || typeof n.type !== 'string' ) {
			return;
		}
		if ( pred( n ) ) {
			found = true;
			return;
		}
		if ( n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression' || n.type === 'FunctionDeclaration' ) {
			return;
		}
		for ( k in n ) {
			if ( k === 'parent' || !Object.prototype.hasOwnProperty.call( n, k ) ) {
				continue;
			}
			v = n[ k ];
			if ( Array.isArray( v ) ) {
				v.forEach( walk );
			} else if ( v && typeof v.type === 'string' ) {
				walk( v );
			}
		}
	})( node );
	return found;
}

function readsLength( test, lname ) {
	return some( test, function pred( n ) {
		return n.type === 'MemberExpression' && !n.computed && n.property.type === 'Identifier' && n.property.name === 'length' && n.object.type === 'Identifier' && n.object.name.toLowerCase() === lname;
	});
}

function throwsRange( stmt ) {
	return some( stmt, function pred( n ) {
		return n.type === 'ThrowStatement' && n.argument && n.argument.type === 'NewExpression' && n.argument.callee.type === 'Identifier' && n.argument.callee.name === 'RangeError';
	});
}

// The workspace names (lower case) guarded within the statement `stmt`: an
// `if` whose test reads `<name>.length` and whose consequent throws RangeError.
function guardsOf( stmt, names ) {
	return names.filter( function f( lname ) {
		return some( stmt, function pred( n ) {
			return n.type === 'IfStatement' && readsLength( n.test, lname ) && throwsRange( n.consequent );
		});
	});
}

var rule = {
	'meta': {
		'type': 'problem',
		'docs': {
			'description': 'ndarray.js checks the length of every workspace whose minimum the spec knows, after the zero-dimension quick returns (CONVENTIONS W3)'
		},
		'schema': [],
		'messages': {
			'missing': '{{name}} has no length guard: the spec gives its minimum (`{{js}}`), so `ndarray.js` must throw RangeError when `{{name}}.length - offset < {{js}}` (CONVENTIONS W3; ticket 0107). Fix: `node bin/codemod-workspace-guard.mjs {{routine}}`.',
			'order': 'This return follows the {{name}} length guard. A zero-dimension quick return comes before the workspace checks: an empty problem needs no workspace (CONVENTIONS W3).'
		}
	},
	'create': function create( context ) {
		return {
			'Program:exit': function onExit( program ) {
				var r = specTarget.resolve( context, program );
				var body;
				var ws;
				var names;
				var seen = {};
				var first = null;
				if ( !r || r.form !== 'ndarray' || !r.spec ) {
					return;
				}
				ws = guarded( r.spec );
				if ( ws.length === 0 ) {
					return;
				}
				names = ws.map( function m( p ) {
					return p.name.toLowerCase();
				});
				body = r.fn.body.body;
				body.forEach( function each( stmt, i ) {
					var g = guardsOf( stmt, names );
					g.forEach( function mark( n ) {
						seen[ n ] = true;
					});
					if ( g.length && first === null ) {
						first = { 'name': ws[ names.indexOf( g[ 0 ] ) ].name };
						return;
					}
					if ( first !== null && i < body.length - 1 && some( stmt, function pred( n ) {
						return n.type === 'ReturnStatement';
					}) ) {
						context.report( { 'node': stmt, 'messageId': 'order', 'data': first } );
					}
				});
				ws.forEach( function each( p, i ) {
					if ( !seen[ names[ i ] ] ) {
						context.report( { 'node': r.fn.id || r.fn, 'messageId': 'missing', 'data': { 'name': p.name, 'js': p.minLength.js, 'routine': r.routine } } );
					}
				});
			}
		};
	}
};

module.exports = rule;
