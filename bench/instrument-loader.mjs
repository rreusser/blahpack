/**
* Module loader hook for bench/instrument.js: rewrites the default export of
* every lib/{blas,lapack}/<routine>/lib/base.js so that it passes through
* the profiler's wrapper. Registered by `instrument.install()`.
*/

const ROUTINE = /\/lib\/(?:blas|lapack)\/([^/]+)\/lib\/base\.js$/;
const EXPORT = /^export default ([A-Za-z_$][\w$]*);[ \t]*$/m;

export async function load( url, context, nextLoad ) {
	const result = await nextLoad( url, context );
	const match = ROUTINE.exec( url );
	if ( !match || result.format !== 'module' || !result.source ) {
		return result;
	}
	const source = result.source.toString();
	if ( !EXPORT.test( source ) ) {
		return result;
	}
	return {
		...result,
		'source': source.replace( EXPORT, 'export default globalThis.__blahpackInstrument( ' + JSON.stringify( match[ 1 ] ) + ', $1 );' )
	};
}
