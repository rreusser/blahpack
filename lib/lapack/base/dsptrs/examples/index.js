import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsptrf from '../../dsptrf/lib/index.js';
import dsptrs from './../lib/index.js';

// 3x3 SPD matrix in lower packed storage:
// A = [ 4  2  1 ]
//     [ 2  5  3 ]
//     [ 1  3  6 ]
var AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
var IPIV = new Int32Array( 3 );

// Factor: A = L * D * L^T
var info = dsptrf( 'lower', 3, AP, IPIV );
console.log( 'dsptrf info:', info );
console.log( 'AP (factored):', AP );
console.log( 'IPIV:', IPIV );

// Solve A * x = b where b = A * [1,1,1]^T = [7,10,10]^T
var B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
info = dsptrs( 'lower', 3, 1, AP, IPIV, B, 3 );
console.log( 'dsptrs info:', info );
console.log( 'solution:', B );
// expected: [ 1.0, 1.0, 1.0 ]
