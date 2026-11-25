/**
* Module load hook behind `importWithConstants` and `importWithDependencies`
* (constants.js). It serves
* `<module>.js?constants=<json>` as the module's source with the named
* `const` declarations replaced.
*
* The source comes from the NEXT hook in the chain, not from disk. When
* `bin/break-mutants.mjs` serves a mutant through its own hook, the
* override applies to that mutant, so a test written with
* `importWithConstants` still kills mutants (ticket 0051).
*/

const MARK = '?constants=';
const DEPS = '?deps=';

// `<module>.js?deps=<json>`: each named import specifier resolves to a
// module whose default export is the test's function (importWithDependencies).
// The specifier is redirected in `resolve`, not rewritten in the source: node
// records coverage by character offset, and a longer specifier shifted every
// later hit onto the wrong line of the file on disk.
function depsOf( url ) {
	const i = ( url || '' ).indexOf( DEPS );
	return ( i < 0 ) ? null : JSON.parse( decodeURIComponent( url.slice( i + DEPS.length ) ) );
}

export async function resolve( specifier, context, nextResolve ) {
	const ids = depsOf( context.parentURL );
	if ( ids && Object.prototype.hasOwnProperty.call( ids, specifier ) ) {
		return { 'url': 'data:text/javascript,export default globalThis.__harnessDeps[' + Number( ids[ specifier ] ) + '];', 'shortCircuit': true };
	}
	return nextResolve( specifier, context );
}

async function loadWithDeps( url, context, nextLoad ) {
	const i = url.indexOf( DEPS );
	const base = url.slice( 0, i );
	const ids = depsOf( url );
	// The source comes from the next hook for the bare URL, so a mutant
	// served by bin/break-mutants.mjs applies to this copy too.
	const res = await nextLoad( base, { ...context, 'format': 'module' } );
	const src = String( res.source );
	for ( const spec of Object.keys( ids ) ) {
		// Import declarations only: a JSDoc `import( '…' )` type names the
		// same path without importing it.
		const n = src.split( "from '" + spec + "'" ).length - 1;
		if ( n !== 1 ) {
			throw new Error( 'importWithDependencies: expected exactly one import of `' + spec + '` in ' + base + ', found ' + n );
		}
	}
	return { 'format': 'module', 'source': src, 'shortCircuit': true };
}

export async function load( url, context, nextLoad ) {
	if ( url.indexOf( DEPS ) >= 0 && !url.startsWith( 'data:' ) ) {
		return loadWithDeps( url, context, nextLoad );
	}
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
		// Same length as the original, so coverage offsets stay on their
		// lines: pad a shorter value; refuse a longer one.
		const orig = hits[ 0 ];
		let rep = 'const ' + name + ' = ' + JSON.stringify( value ) + ';';
		if ( rep.length > orig.length ) {
			throw new Error( 'importWithConstants: `' + rep + '` is longer than `' + orig + '`; coverage would be attributed to the wrong lines. Use a value no longer than the original expression.' );
		}
		rep = rep.slice( 0, -1 ) + ' '.repeat( orig.length - rep.length ) + ';';
		src = src.replace( re, rep );
	}
	return { 'format': 'module', 'source': src, 'shortCircuit': true };
}
