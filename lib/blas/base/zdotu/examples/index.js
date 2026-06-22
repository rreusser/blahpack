import Float64Array from '@stdlib/array/float64/lib/index.js';
import zdotu from './../lib/base.js';

// Compute unconjugated dot product of complex vectors:
var x = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var y = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );

var result = zdotu( 2, x, 1, 0, y, 1, 0 );
console.log( result ); // eslint-disable-line no-console
