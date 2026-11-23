/**
* Preloaded (`--import`) by `test/harness/replay-run.mjs`. Rewrites ONE
* wrapper (`REPLAY_WRAPPER`) so that each `stride2offset( n, stride )` call
* reports the length `n` it used and the source text of its stride argument
* (`globalThis.__replayLens`). The wrapper's negative-stride offsets are then
* checked against the length the call actually touches (ticket 0068).
*/

import { register } from 'node:module';
import { isMainThread } from 'node:worker_threads';
import * as espree from 'espree';

globalThis.__replayLens = [];
globalThis.__replayS2O = function replayS2O( fn, n, stride, src ) {
	globalThis.__replayLens.push( { 'stride': src, 'n': n } );
	return fn( n, stride );
};

if ( isMainThread && process.env.REPLAY_WRAPPER ) {
	register( new URL( import.meta.url ), { 'data': { 'target': process.env.REPLAY_WRAPPER } } );
}

let target = null;

export async function initialize( data ) {
	target = data && data.target;
}

function transform( src ) {
	const ast = espree.parse( src, { 'ecmaVersion': 2022, 'sourceType': 'module', 'range': true } );
	const edits = [];
	( function walk( n ) {
		if ( !n || typeof n.type !== 'string' ) {
			return;
		}
		if ( n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'stride2offset' && n.arguments.length === 2 ) {
			const a0 = src.slice( n.arguments[ 0 ].range[ 0 ], n.arguments[ 0 ].range[ 1 ] );
			const a1 = src.slice( n.arguments[ 1 ].range[ 0 ], n.arguments[ 1 ].range[ 1 ] );
			edits.push( [ n.range[ 0 ], n.range[ 1 ], 'globalThis.__replayS2O( stride2offset, ' + a0 + ', ' + a1 + ', ' + JSON.stringify( a1 ) + ' )' ] );
			return;
		}
		for ( const k of Object.keys( n ) ) {
			const v = n[ k ];
			if ( Array.isArray( v ) ) {
				v.forEach( walk );
			} else if ( v && typeof v.type === 'string' ) {
				walk( v );
			}
		}
	})( ast );
	edits.sort( ( a, b ) => b[ 0 ] - a[ 0 ] );
	let out = src;
	for ( const e of edits ) {
		out = out.slice( 0, e[ 0 ] ) + e[ 2 ] + out.slice( e[ 1 ] );
	}
	return out;
}

export async function load( url, context, nextLoad ) {
	if ( target && url === target ) {
		const res = await nextLoad( url, context );
		return { 'format': 'module', 'source': transform( String( res.source ) ), 'shortCircuit': true };
	}
	return nextLoad( url, context );
}
