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


a[ 0 ] = 4.0;
b[ 0 ] = 1.0;
c[ 0 ] = 2.0;
d[ 0 ] = 3.0;
dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
console.log( 'Real eigenvalue case:' ); // eslint-disable-line no-console
console.log( '  Schur form: A=' + result.a + ', B=' + result.b + ', C=' + result.c + ', D=' + result.d ); // eslint-disable-line no-console, max-len
console.log( '  Eigenvalues: (' + result.rt1r + ' + ' + result.rt1i + 'i), (' + result.rt2r + ' + ' + result.rt2i + 'i)' ); // eslint-disable-line no-console, max-len
console.log( '  Rotation: cs=' + result.cs + ', sn=' + result.sn ); // eslint-disable-line no-console, max-len

// Compute the Schur factorization of a 2x2 matrix with complex eigenvalues:
a[ 0 ] = 1.0;
b[ 0 ] = -5.0;
c[ 0 ] = 1.0;
d[ 0 ] = 1.0;
dlanv2( a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn );
console.log( '\nComplex eigenvalue case:' ); // eslint-disable-line no-console
console.log( '  Schur form: A=' + result.a + ', B=' + result.b + ', C=' + result.c + ', D=' + result.d ); // eslint-disable-line no-console, max-len
console.log( '  Eigenvalues: (' + result.rt1r + ' + ' + result.rt1i + 'i), (' + result.rt2r + ' + ' + result.rt2i + 'i)' ); // eslint-disable-line no-console, max-len
console.log( '  Rotation: cs=' + result.cs + ', sn=' + result.sn ); // eslint-disable-line no-console, max-len
