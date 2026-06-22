
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarrk from './../lib/index.js';

// 3x3 symmetric tridiagonal matrix with D=[2,2,2], E=[1,1], E2=[1,1]

// Eigenvalues: 2-sqrt(2), 2, 2+sqrt(2)
var d = new Float64Array( [ 2.0, 2.0, 2.0 ] );
var e2 = new Float64Array( [ 1.0, 1.0 ] );
var w = new Float64Array( 1 );
var werr = new Float64Array( 1 );

var info = dlarrk( 3, 1, 0.0, 4.0, d, 1, e2, 1, 1.0e-18, 1.0e-12, w, werr );
console.log( 'First eigenvalue: %d (error: %d, info: %d)', w[ 0 ], werr[ 0 ], info ); // eslint-disable-line no-console

info = dlarrk( 3, 2, 0.0, 4.0, d, 1, e2, 1, 1.0e-18, 1.0e-12, w, werr );
console.log( 'Second eigenvalue: %d (error: %d, info: %d)', w[ 0 ], werr[ 0 ], info ); // eslint-disable-line no-console

info = dlarrk( 3, 3, 0.0, 4.0, d, 1, e2, 1, 1.0e-18, 1.0e-12, w, werr );
console.log( 'Third eigenvalue: %d (error: %d, info: %d)', w[ 0 ], werr[ 0 ], info ); // eslint-disable-line no-console
