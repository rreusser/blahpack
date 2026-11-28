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

import dlasv2 from './../lib/index.js';

// Using the standard interface:
const ssmin = new Float64Array( 1 );
const ssmax = new Float64Array( 1 );
const snr = new Float64Array( 1 );
const csr = new Float64Array( 1 );
const snl = new Float64Array( 1 );
const csl = new Float64Array( 1 );

dlasv2( 1, 1, 1, ssmin, ssmax, snr, csr, snl, csl );
let out = {
	'ssmin': ssmin[ 0 ],
	'ssmax': ssmax[ 0 ],
	'snr': snr[ 0 ],
	'csr': csr[ 0 ],
	'snl': snl[ 0 ],
	'csl': csl[ 0 ]
};
console.log( out );

// Using the strided interface:
dlasv2.strided( 1, 1, 1, ssmin, ssmax, snr, csr, snl, csl );
out = {
	'ssmin': ssmin[ 0 ],
	'ssmax': ssmax[ 0 ],
	'snr': snr[ 0 ],
	'csr': csr[ 0 ],
	'snl': snl[ 0 ],
	'csl': csl[ 0 ]
};
console.log( out );
