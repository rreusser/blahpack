/**
* Preloaded (`--import`) by `test/harness/replay.js` in a child test process.
* Wraps the default export of ONE module's `ndarray.js` (`REPLAY_TARGET`) so
* that every call returning normally is recorded with a copy of its
* arguments as they were on entry. Records are written with `v8.serialize`
* to `REPLAY_OUT/<pid>.bin` at exit (ticket 0065).
*/

import fs from 'node:fs';
import path from 'node:path';
import v8 from 'node:v8';
import { register } from 'node:module';
import { isMainThread } from 'node:worker_threads';

const MAX = Number( process.env.REPLAY_MAX || 400 );
const records = [];

// Encode one argument; returns undefined when it cannot be replayed.
function encode( x ) {
	if ( x === null || x === void 0 || typeof x === 'number' || typeof x === 'string' || typeof x === 'boolean' ) {
		return { 'v': x };
	}
	if ( typeof x === 'function' ) {
		// A callback (dgees's `select`, zgges's `selctg`) is recorded as its
		// source and rebuilt on replay. One that needs its closure throws
		// when called there, and the replay skips calls ndarray.js rejects.
		return { 'f': x.toString() };
	}
	const name = x.constructor && x.constructor.name;
	if ( name === 'Complex128Array' || name === 'Complex64Array' ) {
		const F = ( name === 'Complex128Array' ) ? Float64Array : Float32Array;
		return { 'c': name, 'd': new F( x.buffer, x.byteOffset, x.length * 2 ).slice() };
	}
	if ( name === 'Complex128' || name === 'Complex64' ) {
		return { 'z': name, 're': x.re, 'im': x.im };
	}
	if ( ArrayBuffer.isView( x ) ) {
		return { 't': x.slice() };
	}
	if ( Array.isArray( x ) ) {
		const out = x.map( encode );
		return ( out.some( ( e ) => e === void 0 ) ) ? void 0 : { 'a': out };
	}
	// A plain object (ARPACK's reverse-communication state): its own
	// enumerable properties, each encoded like an argument.
	if ( Object.getPrototypeOf( x ) === Object.prototype ) {
		const o = {};
		for ( const k of Object.keys( x ) ) {
			const e = encode( x[ k ] );
			if ( e === void 0 ) {
				return void 0;
			}
			o[ k ] = e;
		}
		return { 'o': o };
	}
	return void 0;
}

globalThis.__replayRecord = function replayRecord( fn ) {
	return function recorded( ...args ) {
		const enc = ( records.length < MAX ) ? args.map( encode ) : null;
		const out = fn.apply( this, args );
		if ( enc && !enc.some( ( e ) => e === void 0 ) ) {
			records.push( enc );
		}
		return out;
	};
};

process.on( 'exit', function onExit() {
	const dir = process.env.REPLAY_OUT;
	if ( dir && records.length ) {
		// Named after the test file (not the pid), so the replay reads records in
		// a deterministic order and samples the same calls on every machine.
		const file = process.argv.find( ( a ) => /test[^/]*\.js$/.test( a ) );
		const name = ( file ? path.basename( file ) : 'unknown' ) + '.' + process.pid;
		fs.writeFileSync( path.join( dir, name + '.bin' ), v8.serialize( records ) );
	}
});

if ( isMainThread && process.env.REPLAY_TARGET ) {
	register( new URL( import.meta.url ), { 'data': { 'target': process.env.REPLAY_TARGET } } );
}

let target = null;

export async function initialize( data ) {
	target = data && data.target;
}

export async function load( url, context, nextLoad ) {
	if ( target && url === target ) {
		const res = await nextLoad( url, context );
		const src = String( res.source ).replace( /export default (\w+);\s*$/, 'export default globalThis.__replayRecord( $1 );\n' );
		return { 'format': 'module', 'source': src, 'shortCircuit': true };
	}
	return nextLoad( url, context );
}
