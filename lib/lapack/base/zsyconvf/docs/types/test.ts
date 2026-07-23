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

import zsyconvf = require( './index' );


// TESTS //

// The function returns a number...
{
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	zsyconvf( 10, 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( true, 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( null, 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( undefined, 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( [], 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( {}, 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	zsyconvf( 'row-major', 10, 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', true, 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', null, 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', undefined, 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', [], 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', {}, 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	zsyconvf( 'row-major', 'upper', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	zsyconvf( 'row-major', 'upper', 'no-transpose', '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, '10', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, true, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, null, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, undefined, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, [], 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, {}, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, '10', 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, true, 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, null, 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, undefined, 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, [], 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, {}, 10, new Int32Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], new Int32Array( 25 ), 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, new Int32Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], 10, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), '10', 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), true, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), false, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), null, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), undefined, 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), [], 10 ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a eleventh argument of invalid type...
{
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, '10' ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, true ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, false ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, null ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, undefined ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, [] ); // $ExpectError
	zsyconvf( 'row-major', 'upper', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	zsyconvf(); // $ExpectError
	zsyconvf( 'row-major' ); // $ExpectError
}
