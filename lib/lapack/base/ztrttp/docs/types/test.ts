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

import ztrttp = require( './index' );


// TESTS //

// The function returns a number...
{
	ztrttp( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	ztrttp( 10, 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( true, 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( null, 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( undefined, 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( [], 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( {}, 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	ztrttp( 'row-major', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	ztrttp( 'row-major', 'upper', '10', new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', true, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', false, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', null, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', [], new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', {}, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	ztrttp( 'row-major', 'upper', 10, '10', 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, 10, 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, true, 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, null, 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, undefined, 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, [], 10, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, {}, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	ztrttp( 'row-major', 'upper', 10, new Float64Array( 25 ), '10', new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, new Float64Array( 25 ), true, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, new Float64Array( 25 ), false, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, new Float64Array( 25 ), null, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, new Float64Array( 25 ), [], new Float64Array( 25 ) ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, new Float64Array( 25 ), {}, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	ztrttp( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, '10' ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, true ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, null ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, undefined ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, [] ); // $ExpectError
	ztrttp( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	ztrttp(); // $ExpectError
	ztrttp( 'row-major' ); // $ExpectError
}
