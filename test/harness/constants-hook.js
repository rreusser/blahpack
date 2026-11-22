/**
* Module load hook behind `importWithConstants` (constants.js). It serves
* `<module>.js?constants=<json>` as the module's source with the named
* `const` declarations replaced.
*
* The source comes from the NEXT hook in the chain, not from disk. When
* `bin/break-mutants.mjs` serves a mutant through its own hook, the
* override applies to that mutant, so a test written with
* `importWithConstants` still kills mutants (ticket 0051).
*/

const MARK = '?constants=';

export async function load( url, context, nextLoad ) {
	const i = url.indexOf( MARK );
	if ( i < 0 ) {
		return nextLoad( url, context );
	}
	const base = url.slice( 0, i );
	const overrides = JSON.parse( decodeURIComponent( url.slice( i + MARK.length ) ) );
	const res = await nextLoad( base, { ...context, 'format': 'module' } );
	let src = String( res.source );
	for ( const [ name, value ] of Object.entries( overrides ) ) {
		const re = new RegExp( '\\bconst\\s+' + name + '\\s*=\\s*[^;]+;', 'g' );
		const hits = src.match( re ) || [];
		if ( hits.length !== 1 ) {
			throw new Error( 'importWithConstants: expected exactly one `const ' + name + ' = …;` in ' + base + ', found ' + hits.length );
		}
		src = src.replace( re, 'const ' + name + ' = ' + JSON.stringify( value ) + ';' );
	}
	return { 'format': 'module', 'source': src, 'shortCircuit': true };
}
