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

import dlags2 from './../lib/index.js';

// Using the standard interface:
const csu = new Float64Array( 1 );
const snu = new Float64Array( 1 );
const csv = new Float64Array( 1 );
const snv = new Float64Array( 1 );
const csq = new Float64Array( 1 );
const snq = new Float64Array( 1 );

dlags2( 1, 1, 1, 1, 1, 1, 1, csu, snu, csv, snv, csq, snq );
let out = {
	'csu': csu[ 0 ],
	'snu': snu[ 0 ],
	'csv': csv[ 0 ],
	'snv': snv[ 0 ],
	'csq': csq[ 0 ],
	'snq': snq[ 0 ]
};
console.log( out );

// Using the ndarray interface:
dlags2.ndarray( 1, 1, 1, 1, 1, 1, 1, csu, snu, csv, snv, csq, snq, 1, 1, 1, 1, 1, 1 );
out = {
	'csu': csu[ 0 ],
	'snu': snu[ 0 ],
	'csv': csv[ 0 ],
	'snv': snv[ 0 ],
	'csq': csq[ 0 ],
	'snq': snq[ 0 ]
};
console.log( out );
