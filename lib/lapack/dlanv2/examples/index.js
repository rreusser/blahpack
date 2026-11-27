/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import dlanv2 from './../lib/base.js';

// Compute the Schur factorization of a 2x2 matrix with real eigenvalues:
const a = new Float64Array( 1 );
const b = new Float64Array( 1 );
const c = new Float64Array( 1 );
const d = new Float64Array( 1 );
const rt1r = new Float64Array( 1 );
const rt1i = new Float64Array( 1 );
const rt2r = new Float64Array( 1 );
const rt2i = new Float64Array( 1 );
const cs = new Float64Array( 1 );
const sn = new Float64Array( 1 );

a[ 0 ] = 4.0;
b[ 0 ] = 1.0;
c[ 0 ] = 2.0;
d[ 0 ] = 3.0;
dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
console.log( 'Real eigenvalue case:' ); // eslint-disable-line no-console
console.log( '  Schur form: A=' + a[ 0 ] + ', B=' + b[ 0 ] + ', C=' + c[ 0 ] + ', D=' + d[ 0 ] ); // eslint-disable-line no-console, max-len
console.log( '  Eigenvalues: (' + rt1r[ 0 ] + ' + ' + rt1i[ 0 ] + 'i), (' + rt2r[ 0 ] + ' + ' + rt2i[ 0 ] + 'i)' ); // eslint-disable-line no-console, max-len
console.log( '  Rotation: cs=' + cs[ 0 ] + ', sn=' + sn[ 0 ] ); // eslint-disable-line no-console, max-len

// Compute the Schur factorization of a 2x2 matrix with complex eigenvalues:
a[ 0 ] = 1.0;
b[ 0 ] = -5.0;
c[ 0 ] = 1.0;
d[ 0 ] = 1.0;
dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
console.log( '\nComplex eigenvalue case:' ); // eslint-disable-line no-console
console.log( '  Schur form: A=' + a[ 0 ] + ', B=' + b[ 0 ] + ', C=' + c[ 0 ] + ', D=' + d[ 0 ] ); // eslint-disable-line no-console, max-len
console.log( '  Eigenvalues: (' + rt1r[ 0 ] + ' + ' + rt1i[ 0 ] + 'i), (' + rt2r[ 0 ] + ' + ' + rt2i[ 0 ] + 'i)' ); // eslint-disable-line no-console, max-len
console.log( '  Rotation: cs=' + cs[ 0 ] + ', sn=' + sn[ 0 ] ); // eslint-disable-line no-console, max-len
