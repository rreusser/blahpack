import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqsp from './../lib/index.js';

// 3x3 complex symmetric matrix (upper packed):
// AP = [A(1,1), A(1,2), A(2,2), A(1,3), A(2,3), A(3,3)]
// Each element is complex: (real, imag)
var AP = new Complex128Array( [
	4.0, 1.0,
	1.0, 0.5, 9.0, 2.0,
	0.5, 0.25, 2.0, 1.0, 16.0, 3.0
] );
var S = new Float64Array( [ 0.5, 1.0/3.0, 0.25 ] );

// Poor scond triggers equilibration:
var equed = zlaqsp( 'upper', 3, AP, S, 1, 0.05, 16.0 );

console.log( 'equed:', equed );
// => 'yes'

console.log( 'AP (Float64 view):', reinterpret( AP, 0 ) );
