/**
* Tests of the documentation extractor (bin/docs/extract.js): every routine's
* page shows both public signatures, under the names a caller uses.
*
* Regression (ticket 0124): the extractor looked for the layout wrapper with
* `export default <ident>;`, which never matched the typed
* `export default /** @type {…} *\/ ( <ident> );` every module uses, so no page
* had a layout signature and the offset form was shown as the default call.
*/

import test from 'node:test';
import assert from 'node:assert/strict';
import { extractAll } from '../docs/extract.js';

const routines = extractAll();

test( 'every routine has a layout signature called by its name and an offset signature called by name.ndarray', () => {
	const bad = [];
	for ( const r of routines ) {
		const kinds = Object.fromEntries( ( r.signatures || [] ).map( ( s ) => [ s.kind, s.call ] ) );
		const name = r.name || r.routine;
		if ( kinds.layout !== name || kinds.ndarray !== `${name}.ndarray` ) {
			bad.push( `${name}: ${JSON.stringify( kinds )}` );
		}
	}
	assert.deepEqual( bad.slice( 0, 10 ), [], `${bad.length} routine(s) with wrong signatures` );
});

test( 'no module summary is taken from the default export\'s type cast', () => {
	const bad = routines.filter( ( r ) => /@type|typeof .* & \{ ndarray/.test( r.summary || '' ) ).map( ( r ) => r.name || r.routine );
	assert.deepEqual( bad, [] );
});
