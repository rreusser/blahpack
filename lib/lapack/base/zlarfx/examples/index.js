import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfx from './../lib/index.js';

var view;
var WORK;
var tau;
var v;
var C;

// Apply a 2x2 reflector from the left to a 2x3 matrix:
v = new Complex128Array([
	1.0,
	0.0,
	0.5,
	0.3
]);
tau = new Complex128( 1.6, -0.2 );
C = new Complex128Array([
	1.0,
	2.0,
	4.0,
	-1.0,
	2.0,
	0.5,
	5.0,
	3.0,
	3.0,
	-1.0,
	6.0,
	0.0
]);
WORK = new Complex128Array( 10 );

zlarfx.ndarray( 'left', 2, 3, v, 1, 0, tau, C, 1, 2, 0, WORK, 1, 0 );

view = reinterpret( C, 0 );
console.log( 'C after left reflector application:' ); // eslint-disable-line no-console
console.log( Array.prototype.slice.call( view ) ); // eslint-disable-line no-console, no-restricted-syntax
