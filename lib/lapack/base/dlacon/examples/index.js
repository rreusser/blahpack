
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlacon from './../lib/index.js';

// 3x3 identity matrix (column-major):
var n = 3;
var v = new Float64Array( n );
var x = new Float64Array( n );
var ISGN = new Int32Array( n );
var EST = new Float64Array( 1 );
var KASE = new Int32Array( 1 );
var tmp;
var i;

// Reverse-communication loop:
KASE[ 0 ] = 0;
while ( true ) { // eslint-disable-line no-constant-condition
	dlacon.ndarray( n, v, 1, 0, x, 1, 0, ISGN, 1, 0, EST, KASE );
	if ( KASE[ 0 ] === 0 ) {
		break;
	}
	// For identity matrix, A*x = x and A^T*x = x, so x is unchanged.
	// (In a real application, you'd compute x = A*x or x = A^T*x here.)
	tmp = new Float64Array( n );
	for ( i = 0; i < n; i++ ) {
		tmp[ i ] = x[ i ]; // identity: A*x = x
	}
	x.set( tmp );
}

console.log( 'Estimated 1-norm of 3x3 identity: %d', EST[ 0 ] );
// => 'Estimated 1-norm of 3x3 identity: 1'
