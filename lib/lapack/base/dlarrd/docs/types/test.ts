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

import dlarrd = require( './index' );


// TESTS //

// The function is callable with the documented arguments...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 );
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dlarrd( 10, 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( true, 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( null, 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( undefined, 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( [], 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( {}, 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dlarrd( 'no-transpose', 10, 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', true, 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', null, 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', undefined, 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', [], 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', {}, 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', '10', 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', true, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', false, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', null, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', undefined, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', [], 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', {}, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, '10', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, true, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, false, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, null, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, undefined, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, [], 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, {}, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, '10', 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, true, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, false, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, null, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, undefined, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, [], 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, {}, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, '10', 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, true, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, false, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, null, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, undefined, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, [], 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, {}, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, '10', new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, true, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, false, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, null, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, undefined, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, [], new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, {}, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, '10', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, null, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, undefined, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, [], 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, {}, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), false, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eleventh argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, '10', 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, true, 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, null, 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, undefined, 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, [], 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, {}, 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a twelfth argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a thirteenth argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, '10', 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, true, 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, null, 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, undefined, 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, [], 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, {}, 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourteenth argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifteenth argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, false, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixteenth argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, '10', 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, true, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, false, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, null, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, undefined, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, [], 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, {}, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventeenth argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, '10', 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, true, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, false, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, null, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, undefined, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, [], 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, {}, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighteenth argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, '10', new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, true, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, false, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, null, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, undefined, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, [], new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, {}, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a nineteenth argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a twentieth argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a 21th argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, '10', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, true, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, null, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, undefined, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, [], 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, {}, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a 22th argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a 23th argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, '10', 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, true, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, null, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, [], 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, {}, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a 24th argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a 25th argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a 26th argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), '10', new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), true, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), false, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), null, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), [], new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a 27th argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, '10', 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, true, 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, null, 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, undefined, 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, [], 10 ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a 28th argument of invalid type...
{
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), '10' ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), true ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), false ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), null ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), undefined ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), [] ); // $ExpectError
	dlarrd( 'no-transpose', 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dlarrd(); // $ExpectError
	dlarrd( 'no-transpose' ); // $ExpectError
}
