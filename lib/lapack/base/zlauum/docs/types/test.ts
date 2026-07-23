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

import zlauum = require( './index' );


// TESTS //

// The function returns a number...
{
	zlauum( 'row-major', 'upper', 10, new Float64Array( 25 ), 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	zlauum( 10, 'upper', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( true, 'upper', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( null, 'upper', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( undefined, 'upper', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( [], 'upper', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( {}, 'upper', 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	zlauum( 'row-major', 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( 'row-major', true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( 'row-major', null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( 'row-major', undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( 'row-major', [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( 'row-major', {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	zlauum( 'row-major', 'upper', '10', new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( 'row-major', 'upper', true, new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( 'row-major', 'upper', false, new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( 'row-major', 'upper', null, new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( 'row-major', 'upper', undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( 'row-major', 'upper', [], new Float64Array( 25 ), 10 ); // $ExpectError
	zlauum( 'row-major', 'upper', {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	zlauum( 'row-major', 'upper', 10, '10', 10 ); // $ExpectError
	zlauum( 'row-major', 'upper', 10, 10, 10 ); // $ExpectError
	zlauum( 'row-major', 'upper', 10, true, 10 ); // $ExpectError
	zlauum( 'row-major', 'upper', 10, null, 10 ); // $ExpectError
	zlauum( 'row-major', 'upper', 10, undefined, 10 ); // $ExpectError
	zlauum( 'row-major', 'upper', 10, [], 10 ); // $ExpectError
	zlauum( 'row-major', 'upper', 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	zlauum( 'row-major', 'upper', 10, new Float64Array( 25 ), '10' ); // $ExpectError
	zlauum( 'row-major', 'upper', 10, new Float64Array( 25 ), true ); // $ExpectError
	zlauum( 'row-major', 'upper', 10, new Float64Array( 25 ), false ); // $ExpectError
	zlauum( 'row-major', 'upper', 10, new Float64Array( 25 ), null ); // $ExpectError
	zlauum( 'row-major', 'upper', 10, new Float64Array( 25 ), undefined ); // $ExpectError
	zlauum( 'row-major', 'upper', 10, new Float64Array( 25 ), [] ); // $ExpectError
	zlauum( 'row-major', 'upper', 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	zlauum(); // $ExpectError
	zlauum( 'row-major' ); // $ExpectError
}
