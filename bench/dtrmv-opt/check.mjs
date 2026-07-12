// Correctness gate: v1-blocked vs v0-reference over a case matrix spanning
// uplo/trans/diag, layouts (col, row, general, negative), x strides, and
// sizes with all remainder classes. The blocked kernel reorders summation,
// so the gate is the backward-error tier (docs/optimization-policy.md):
// elementwise comparison at a tolerance scaled to the reduction length.
// The unread triangle — and the diagonal when diag='unit' — is filled with
// huge garbage so any read outside the stored triangle is caught.
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-blocked.js';

function rand() {
	return ( 2.0 * Math.random() ) - 1.0;
}

// Fills the stored triangle of an A buffer otherwise poisoned with garbage.
function makeA( uplo, diag, N, sa1, sa2, oa, size ) {
	const A = new Float64Array( size );
	for ( let k = 0; k < size; k++ ) A[ k ] = 1.0e8 * ( 1.0 + Math.random() );
	for ( let i = 0; i < N; i++ ) {
		const j0 = ( uplo === 'upper' ) ? i : 0;
		const j1 = ( uplo === 'upper' ) ? N : i + 1;
		for ( let j = j0; j < j1; j++ ) {
			if ( i === j && diag === 'unit' ) continue; // must never be read
			A[ oa + ( i * sa1 ) + ( j * sa2 ) ] = rand();
		}
	}
	return A;
}

let ncases = 0;
let failures = 0;

const sizes = [ 0, 1, 2, 3, 4, 5, 7, 8, 17, 33, 64 ];

for ( const N of sizes ) {
	const lda = N + 3;
	const layouts = [
		{ sa1: 1, sa2: lda, tag: 'col' },
		{ sa1: lda, sa2: 1, tag: 'row' },
		{ sa1: 2, sa2: ( 2 * lda ) + 3, tag: 'gen' },
		{ sa1: -1, sa2: lda, tag: 'neg' }
	];
	for ( const uplo of [ 'upper', 'lower' ] ) {
		for ( const trans of [ 'no-transpose', 'transpose' ] ) {
			for ( const diag of [ 'unit', 'non-unit' ] ) {
				for ( const lo of layouts ) {
					for ( const sx of [ 1, 2, -1 ] ) {
						for ( let trial = 0; trial < 3; trial++ ) {
							const span = Math.max( N - 1, 0 );
							const oa = ( lo.sa1 < 0 ? -lo.sa1 * span : 0 ) + ( lo.sa2 < 0 ? -lo.sa2 * span : 0 );
							const size = ( Math.abs( lo.sa1 ) * span ) + ( Math.abs( lo.sa2 ) * span ) + 5;
							const A = makeA( uplo, diag, N, lo.sa1, lo.sa2, oa, size );
							const ox = ( sx < 0 ? span * -sx : 0 ) + 1;
							const x = new Float64Array( ( span * Math.abs( sx ) ) + 3 );
							for ( let k = 0; k < x.length; k++ ) x[ k ] = rand();
							const x0 = x.slice();
							const x1 = x.slice();
							v0( uplo, trans, diag, N, A, lo.sa1, lo.sa2, oa, x0, sx, ox );
							v1( uplo, trans, diag, N, A, lo.sa1, lo.sa2, oa, x1, sx, ox );
							ncases += 1;
							const tol = 1.0e-13 * Math.max( 4, N );
							let bad = -1;
							for ( let k = 0; k < x0.length; k++ ) {
								if ( !( Math.abs( x0[ k ] - x1[ k ] ) <= tol * Math.max( 1.0, Math.abs( x0[ k ] ) ) ) ) { bad = k; break; }
							}
							if ( bad >= 0 ) {
								failures += 1;
								console.log( `FAIL ${uplo} ${trans} ${diag} N=${N} ${lo.tag} sx=${sx}: x[${bad}] v0=${x0[ bad ]} v1=${x1[ bad ]}` );
							}
						}
					}
				}
			}
		}
	}
}

console.log( ( failures === 0 ? 'PASS' : 'FAIL' ) + ': ' + ncases + ' cases, ' + failures + ' failures' );
process.exit( failures === 0 ? 0 : 1 );
