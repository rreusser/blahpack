/**
* Module loader hook for bin/break-mutants.mjs: serves a mutant's source in place
* of one file, in memory, so mutation never touches the working tree and
* concurrent runs cannot see each other's mutants.
*
* Activated via NODE_OPTIONS="--import <this file>" with
* BREAK_MUTANT_TARGET (file URL to replace) and BREAK_MUTANT_SOURCE (path to the
* mutant's source text).
*/

import { register } from 'node:module';

if ( process.env.BREAK_MUTANT_TARGET ) {
	register( new URL( import.meta.url ), {
		'data': {
			'target': process.env.BREAK_MUTANT_TARGET,
			'source': process.env.BREAK_MUTANT_SOURCE
		}
	});
}

let target = null;
let sourcePath = null;

export async function initialize( data ) {
	target = data.target;
	sourcePath = data.source;
}

export async function load( url, context, nextLoad ) {
	if ( target && url === target ) {
		const fs = await import( 'node:fs' );
		return { 'format': 'module', 'source': fs.readFileSync( sourcePath, 'utf8' ), 'shortCircuit': true };
	}
	return nextLoad( url, context );
}
