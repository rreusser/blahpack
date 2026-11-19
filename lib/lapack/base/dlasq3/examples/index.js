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

import dlasq3 from './../lib/index.js';

// Using the standard interface:
const n0 = new Int32Array( 1 );
const pp = new Int32Array( 1 );
const dmin = new Float64Array( 1 );
const sigma = new Float64Array( 1 );
const desig = new Float64Array( 1 );
const qmax = new Float64Array( 1 );
const nfail = new Int32Array( 1 );
const iter = new Int32Array( 1 );
const ndiv = new Int32Array( 1 );
const ttype = new Int32Array( 1 );
const dmin1 = new Float64Array( 1 );
const dmin2 = new Float64Array( 1 );
const dn = new Float64Array( 1 );
const dn1 = new Float64Array( 1 );
const dn2 = new Float64Array( 1 );
const g = new Float64Array( 1 );
const tau = new Float64Array( 1 );

n0[ 0 ] = 1;
pp[ 0 ] = 1;
dmin[ 0 ] = 1;
sigma[ 0 ] = 1.0;
desig[ 0 ] = 1;
qmax[ 0 ] = 1;
nfail[ 0 ] = 1;
iter[ 0 ] = 1;
ndiv[ 0 ] = 1;
ttype[ 0 ] = 1;
dmin1[ 0 ] = 1;
dmin2[ 0 ] = 1;
dn[ 0 ] = 1;
dn1[ 0 ] = 1;
dn2[ 0 ] = 1;
g[ 0 ] = 1;
tau[ 0 ] = 1.0;
dlasq3( 1, n0, 1, 1, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, 1, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau );
let out = {
	'n0': n0[ 0 ],
	'pp': pp[ 0 ],
	'dmin': dmin[ 0 ],
	'sigma': sigma[ 0 ],
	'desig': desig[ 0 ],
	'qmax': qmax[ 0 ],
	'nfail': nfail[ 0 ],
	'iter': iter[ 0 ],
	'ndiv': ndiv[ 0 ],
	'ttype': ttype[ 0 ],
	'dmin1': dmin1[ 0 ],
	'dmin2': dmin2[ 0 ],
	'dn': dn[ 0 ],
	'dn1': dn1[ 0 ],
	'dn2': dn2[ 0 ],
	'g': g[ 0 ],
	'tau': tau[ 0 ]
};
console.log( out );

// Using the ndarray interface:
n0[ 0 ] = 1;
pp[ 0 ] = 1;
dmin[ 0 ] = 1;
sigma[ 0 ] = 1.0;
desig[ 0 ] = 1;
qmax[ 0 ] = 1;
nfail[ 0 ] = 1;
iter[ 0 ] = 1;
ndiv[ 0 ] = 1;
ttype[ 0 ] = 1;
dmin1[ 0 ] = 1;
dmin2[ 0 ] = 1;
dn[ 0 ] = 1;
dn1[ 0 ] = 1;
dn2[ 0 ] = 1;
g[ 0 ] = 1;
tau[ 0 ] = 1.0;
dlasq3.ndarray( 1, n0, 1, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, 1, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau );
out = {
	'n0': n0[ 0 ],
	'pp': pp[ 0 ],
	'dmin': dmin[ 0 ],
	'sigma': sigma[ 0 ],
	'desig': desig[ 0 ],
	'qmax': qmax[ 0 ],
	'nfail': nfail[ 0 ],
	'iter': iter[ 0 ],
	'ndiv': ndiv[ 0 ],
	'ttype': ttype[ 0 ],
	'dmin1': dmin1[ 0 ],
	'dmin2': dmin2[ 0 ],
	'dn': dn[ 0 ],
	'dn1': dn1[ 0 ],
	'dn2': dn2[ 0 ],
	'g': g[ 0 ],
	'tau': tau[ 0 ]
};
console.log( out );
