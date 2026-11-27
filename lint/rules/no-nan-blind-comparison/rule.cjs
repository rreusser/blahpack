'use strict';

// Disallow test failures guarded by a comparison that is false on NaN.
//
// Every ordered comparison with NaN (`<`, `<=`, `>`, `>=`) is false. A check
// written as "fail when the error is too big",
//
//     if ( Math.abs( actual - expected ) > tol ) { throw ... }
//
// therefore never fails when `actual` is NaN: the test passes on garbage
// (ticket 0093: zsyr's fixture tests passed on an all-NaN A). The safe form
// states the passing condition and fails unless it holds:
//
//     if ( !( Math.abs( actual - expected ) <= tol ) ) { throw ... }
//     assert.ok( Math.abs( actual - expected ) <= tol, ... );
//
// See README.md for exactly what is reported and accepted.

var path = require( 'path' );

var ORDERED = { '<': true, '<=': true, '>': true, '>=': true };

// Names that mark a computed, floating-point quantity (an error, a residual, a
// tolerance), as opposed to an integer guard such as `info > 0` or `i >= N`.
var FLOAT_NAME = /tol|eps|err|diff|resid|rel|dist|norm|delta|ulp|thresh|dev|gap|bound|scale|abs|res$/i;

// Math functions of a floating-point quantity (not min/max/floor of sizes).
var FLOAT_MATH = /^(abs|sqrt|hypot|log|log10|log2|exp|pow|cbrt)$/;

// Flags whose `= false` records a failure (`matchPos = false`).
var PASS_FLAG = /^(ok|allOk|pass(ed|es)?|good|valid|match\w*|equal|same|close|success)$/i;

// Containers whose `.push( ... )` records a failure.
var FAILURE_LIST = /^(errors?|errs|failures?|fails|failed|mismatch(es)?|bad|problems?|issues?|violations?)$/i;

function isTestFile( filename ) {
	return filename.split( path.sep ).join( '/' ).indexOf( '/test/' ) !== -1;
}

function isFloatExpr( node ) {
	var found = false;
	function visit( n ) {
		var k;
		if ( found || !n || typeof n.type !== 'string' ) {
			return;
		}
		if ( n.type === 'Literal' && typeof n.value === 'number' && !Number.isInteger( n.value ) ) {
			found = true;
			return;
		}
		if ( n.type === 'BinaryExpression' && n.operator === '/' ) {
			found = true;
			return;
		}
		if ( n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && n.callee.object.type === 'Identifier' && n.callee.object.name === 'Math' && FLOAT_MATH.test( n.callee.property.name ) ) {
			found = true;
			return;
		}
		if ( n.type === 'Identifier' && FLOAT_NAME.test( n.name ) ) {
			found = true;
			return;
		}
		if ( n.type === 'MemberExpression' && !n.computed && FLOAT_NAME.test( n.property.name ) ) {
			found = true;
			return;
		}
		for ( k in n ) {
			if ( k !== 'parent' && n[ k ] && typeof n[ k ] === 'object' ) {
				if ( Array.isArray( n[ k ] ) ) {
					n[ k ].forEach( visit );
				} else {
					visit( n[ k ] );
				}
			}
		}
	}
	visit( node );
	return found;
}

// The NaN-blind comparisons of a condition: the ordered comparisons whose
// falsity on NaN makes the whole condition false. Through `||` every disjunct
// counts; through `&&` only the last conjunct (earlier ones are usually size or
// index guards); a negation flips nothing we can see, so it ends the search.
function blindComparisons( test, out ) {
	if ( test.type === 'BinaryExpression' && ORDERED[ test.operator ] ) {
		if ( isFloatExpr( test ) ) {
			out.push( test );
		}
	} else if ( test.type === 'LogicalExpression' && test.operator === '||' ) {
		blindComparisons( test.left, out );
		blindComparisons( test.right, out );
	} else if ( test.type === 'LogicalExpression' && test.operator === '&&' ) {
		blindComparisons( test.right, out );
	}
	return out;
}

function isFalseLiteral( n ) {
	return n && n.type === 'Literal' && n.value === false;
}

function calleePath( c ) {
	if ( c.type === 'Identifier' ) {
		return c.name;
	}
	if ( c.type === 'MemberExpression' && !c.computed ) {
		return calleePath( c.object ) + '.' + c.property.name;
	}
	return '';
}

// Does a statement (the consequent of an `if`) record a failure?
function failsIn( stmt ) {
	var found = false;
	function visit( n ) {
		var name;
		var k;
		if ( found || !n || typeof n.type !== 'string' ) {
			return;
		}
		// A nested function's body is not this branch's control flow.
		if ( n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression' || n.type === 'FunctionDeclaration' ) {
			return;
		}
		if ( n.type === 'ThrowStatement' ) {
			found = true;
			return;
		}
		if ( n.type === 'AssignmentExpression' && n.operator === '=' && n.left.type === 'Identifier' && PASS_FLAG.test( n.left.name ) && isFalseLiteral( n.right ) ) {
			found = true;
			return;
		}
		if ( n.type === 'ReturnStatement' && isFalseLiteral( n.argument ) ) {
			found = true;
			return;
		}
		if ( n.type === 'CallExpression' ) {
			name = calleePath( n.callee );
			if ( /(^|\.)fail$/.test( name ) ) {
				found = true;
				return;
			}
			if ( ( name === 'assert' || /^assert\.(ok|equal|strictEqual)$/.test( name ) ) && isFalseLiteral( n.arguments[ 0 ] ) ) {
				found = true;
				return;
			}
			if ( /\.push$/.test( name ) && n.callee.object.type === 'Identifier' && FAILURE_LIST.test( n.callee.object.name ) ) {
				found = true;
				return;
			}
		}
		for ( k in n ) {
			if ( k !== 'parent' && n[ k ] && typeof n[ k ] === 'object' ) {
				if ( Array.isArray( n[ k ] ) ) {
					n[ k ].forEach( visit );
				} else {
					visit( n[ k ] );
				}
			}
		}
	}
	visit( stmt );
	return found;
}

// The value names of an expression: identifiers, but not property names,
// array indices (`A[ i ]` names `A`, not `i`) or the `Math`/`Number`
// namespaces, so a NaN check of `A[ i ]` does not vouch for `B[ i ]`.
function identifiers( node, out ) {
	var k;
	if ( !node || typeof node.type !== 'string' ) {
		return out;
	}
	if ( node.type === 'Identifier' && node.name !== 'Math' && node.name !== 'Number' ) {
		out[ node.name ] = true;
	}
	for ( k in node ) {
		if ( k !== 'parent' && node[ k ] && typeof node[ k ] === 'object' ) {
			if ( Array.isArray( node[ k ] ) ) {
				node[ k ].forEach( function f( x ) {
					identifiers( x, out );
				});
			} else if ( k !== 'property' ) {
				identifiers( node[ k ], out );
			}
		}
	}
	return out;
}

function isNaNCheck( n ) {
	var name;
	if ( n.type === 'CallExpression' ) {
		name = calleePath( n.callee );
		return /(^|\.)(isNaN|isFinite)$/.test( name );
	}
	// `x !== x` / `x === x`
	return n.type === 'BinaryExpression' && ( n.operator === '!==' || n.operator === '===' || n.operator === '!=' || n.operator === '==' ) &&
		n.left.type === 'Identifier' && n.right.type === 'Identifier' && n.left.name === n.right.name;
}

// Names checked for NaN anywhere in `scope` (the enclosing function body) or
// in the condition itself.
function nanCheckedNames( scope ) {
	var out = {};
	function visit( n ) {
		var k;
		if ( !n || typeof n.type !== 'string' ) {
			return;
		}
		if ( isNaNCheck( n ) ) {
			identifiers( n.type === 'CallExpression' ? n.arguments[ 0 ] : n.left, out );
		}
		for ( k in n ) {
			if ( k !== 'parent' && n[ k ] && typeof n[ k ] === 'object' ) {
				if ( Array.isArray( n[ k ] ) ) {
					n[ k ].forEach( visit );
				} else {
					visit( n[ k ] );
				}
			}
		}
	}
	visit( scope );
	return out;
}

var rule = {
	'meta': {
		'docs': {
			'description': 'disallow test failures guarded by a comparison that is false on NaN'
		},
		'messages': {
			'blindIf': 'This failure is guarded by `{{text}}`, which is false when a value is NaN, so a NaN result passes. State the passing condition and fail unless it holds: `if ( !( {{pass}} ) )`.',
			'blindAssert': '`{{text}}` is true when a value is NaN, so this assertion passes on NaN. Assert the passing condition directly: `{{pass}}`.'
		},
		'schema': [],
		'type': 'problem'
	},
	'create': function main( context ) {
		var filename = context.filename || context.getFilename();
		var source = context.sourceCode || context.getSourceCode();
		var INVERT = { '<': '>=', '<=': '>', '>': '<=', '>=': '<' };

		if ( !isTestFile( filename ) ) {
			return {};
		}

		function enclosingBody( node ) {
			var n = node.parent;
			while ( n && n.type !== 'FunctionDeclaration' && n.type !== 'FunctionExpression' && n.type !== 'ArrowFunctionExpression' ) {
				n = n.parent;
			}
			return n ? n.body : source.ast;
		}

		// True when the function also checks a name of the comparison for NaN.
		function accepted( cmp, checked ) {
			return Object.keys( identifiers( cmp, {} ) ).some( function some( k ) {
				return checked[ k ] === true;
			});
		}

		function inverted( cmp ) {
			return source.getText( cmp.left ) + ' ' + INVERT[ cmp.operator ] + ' ' + source.getText( cmp.right );
		}

		return {
			'IfStatement': function onIf( node ) {
				var cmps = blindComparisons( node.test, [] );
				var checked;
				if ( !cmps.length || !failsIn( node.consequent ) ) {
					return;
				}
				checked = nanCheckedNames( enclosingBody( node ) );
				cmps.forEach( function each( cmp ) {
					if ( accepted( cmp, checked ) ) {
						return;
					}
					context.report({
						'node': cmp,
						'messageId': 'blindIf',
						'data': { 'text': source.getText( cmp ), 'pass': inverted( cmp ) }
					});
				});
			},
			// assert.ok( !( err > tol ) ): the negation of a NaN-false comparison is NaN-true.
			'CallExpression': function onCall( node ) {
				var name = calleePath( node.callee );
				var arg = node.arguments[ 0 ];
				var cmps;
				if ( name !== 'assert' && name !== 'assert.ok' ) {
					return;
				}
				if ( !arg || arg.type !== 'UnaryExpression' || arg.operator !== '!' ) {
					return;
				}
				cmps = blindComparisons( arg.argument, [] );
				if ( !cmps.length || accepted( cmps[ 0 ], nanCheckedNames( enclosingBody( node ) ) ) ) {
					return;
				}
				context.report({
					'node': arg,
					'messageId': 'blindAssert',
					'data': { 'text': source.getText( arg ), 'pass': inverted( cmps[ 0 ] ) }
				});
			}
		};
	}
};

module.exports = rule;
