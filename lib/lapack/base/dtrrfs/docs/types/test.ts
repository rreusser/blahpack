/*
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

import dtrrfs = require( './index' );


// TESTS //

// The function returns a number...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dtrrfs( 10, 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( true, 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( null, 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( undefined, 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( [], 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( {}, 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dtrrfs( 'upper', 10, 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', true, 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', null, 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', undefined, 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', [], 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', {}, 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', null, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', undefined, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', [], 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', {}, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', false, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eleventh argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a twelfth argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a thirteenth argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourteenth argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifteenth argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixteenth argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventeenth argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], new Int32Array( 25 ), 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighteenth argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], 10 ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a nineteenth argument of invalid type...
{
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), '10' ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), true ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), false ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), null ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), undefined ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), [] ); // $ExpectError
	dtrrfs( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dtrrfs(); // $ExpectError
	dtrrfs( 'upper' ); // $ExpectError
}
