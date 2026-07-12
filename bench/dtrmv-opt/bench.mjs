// A/B benchmark: v0-reference vs v1-blocked, interleaved min-of-trials.
// A is near-identity so repeated in-place x := op(A)*x stays bounded.
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-blocked.js';

function nearIdentity( n, sa1, sa2 ) {
	const A = new Float64Array( n * n );
	for ( let i = 0; i < A.length; i++ ) A[ i ] = 1.0e-6 * ( ( 2.0 * Math.random() ) - 1.0 );
	for ( let i = 0; i < n; i++ ) A[ ( i * sa1 ) + ( i * sa2 ) ] = 1.0 + ( 1.0e-6 * Math.random() );
	return A;
}

function race( cases, trials = 13, targetMs = 30 ) {
	for ( const c of cases ) {
		c.fn();
		const t0 = performance.now();
		c.fn();
		c.batch = Math.max( 1, Math.round( targetMs / Math.max( performance.now() - t0, 1e-4 ) ) );
		c.best = Infinity;
	}
	for ( let t = 0; t < trials; t++ ) {
		for ( const c of cases ) {
			const t0 = performance.now();
			for ( let k = 0; k < c.batch; k++ ) c.fn();
			c.best = Math.min( c.best, ( performance.now() - t0 ) / c.batch );
		}
	}
	return cases;
}

console.log( 'case'.padEnd( 44 ) + 'v0'.padStart( 12 ) + 'v1'.padStart( 12 ) + 'speedup'.padStart( 10 ) );
const combos = [
	[ 'upper', 'no-transpose', 'col' ],
	[ 'upper', 'transpose', 'col' ],
	[ 'lower', 'no-transpose', 'col' ],
	[ 'lower', 'transpose', 'col' ],
	[ 'upper', 'no-transpose', 'row' ]
];
for ( const n of [ 500, 2000 ] ) {
	for ( const [ uplo, trans, layout ] of combos ) {
		const sa1 = layout === 'col' ? 1 : n;
		const sa2 = layout === 'col' ? n : 1;
		const A = nearIdentity( n, sa1, sa2 );
		const xa = new Float64Array( n );
		const xb = new Float64Array( n );
		for ( let i = 0; i < n; i++ ) { xa[ i ] = ( 2.0 * Math.random() ) - 1.0; xb[ i ] = xa[ i ]; }
		const [ a, b ] = race( [
			{ fn: () => v0( uplo, trans, 'non-unit', n, A, sa1, sa2, 0, xa, 1, 0 ) },
			{ fn: () => v1( uplo, trans, 'non-unit', n, A, sa1, sa2, 0, xb, 1, 0 ) }
		] );
		const gf = ( ms ) => ( n * n ) / ( ms * 1e6 );
		console.log(
			( n + ' ' + uplo + ' ' + ( trans === 'no-transpose' ? 'N' : 'T' ) + ' ' + layout ).padEnd( 44 ) +
			( gf( a.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
			( gf( b.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
			( ( a.best / b.best ).toFixed( 2 ) + 'x' ).padStart( 10 )
		);
	}
}
