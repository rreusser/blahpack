'use strict';

// base.js picks its path from the workspace it is given wherever the reference
// picks it from LWORK (CONVENTIONS W6; ticket 0100).
//
// The reference's blocked routines (DGEQRF, DORMQR, DGEHRD, DSYTRF_RK, ...)
// take NB from ILAENV, then shrink it or fall back to unblocked code when LWORK
// is short; drivers (DGESVD, DSYSV, DTREVC3) choose an algorithm by the space
// they have. That is what lets their callers document small minimums (DGEEV:
// 4N). A base.js that hard-codes NB and partitions WORK on it, whatever WORK's
// length, overruns a workspace of the reference's minimum once the problem
// passes the blocking threshold: a typed array drops the writes past its end
// and reads `undefined` (NaN). The JS LWORK is the workspace's length minus
// its offset (CONVENTIONS W1).
//
// Reported in base.js: a workspace the spec marks `adaptive` (generated from
// the reference: its LWORK is tested after the argument checks, other than to
// reject or to answer a query) whose `.length` the file never reads.

var specTarget = require( '../../lib/spec-target.cjs' );
var specLib = require( '../../lib/spec.cjs' );

var rule = {
	'meta': {
		'docs': {
			'description': 'base.js reads the length of each workspace the reference picks its path from (spec `adaptive`)'
		},
		'schema': [],
		'type': 'problem'
	},
	'create': function main( context ) {
		var t = specTarget.target( context.filename || context.getFilename() );
		var spec;
		var names;
		var read = {};
		if ( !t || t.form !== 'base' ) {
			return {};
		}
		spec = specLib.load( t.routine );
		names = ( ( spec && spec.params ) || [] ).filter( function f( p ) {
			return p.role === 'workspace' && p.adaptive === true;
		}).map( function m( p ) {
			return p.name;
		});
		if ( !names.length ) {
			return {};
		}
		return {
			'MemberExpression': function onMember( n ) {
				if ( !n.computed && n.property.name === 'length' && n.object.type === 'Identifier' ) {
					read[ n.object.name ] = true;
				}
			},
			'Program:exit': function onExit( program ) {
				var fn = specTarget.exportedFunction( program );
				names.forEach( function each( w ) {
					if ( read[ w ] ) {
						return;
					}
					context.report({
						'node': fn || program,
						'message': 'The reference picks its path from L' + w + ' (spec `adaptive`), but base.js never reads `' + w + '.length`. Derive the JS LWORK from the workspace given (`' + w + '.length` minus its offset, over its stride) and shrink the block size or fall back to the unblocked path when it is short, as the reference does (CONVENTIONS W6; ticket 0100).'
					});
				});
			}
		};
	}
};

module.exports = rule;
