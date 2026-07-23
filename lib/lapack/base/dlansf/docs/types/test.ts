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

import dlansf = require( './index' );


// TESTS //

// The function returns a number...
{
	dlansf( 'no-transpose', 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dlansf( 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( true, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( null, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( undefined, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( [], 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( {}, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dlansf( 'no-transpose', 10, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', true, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', null, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', undefined, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', [], 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', {}, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dlansf( 'no-transpose', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', true, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', null, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', undefined, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', [], 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', {}, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dlansf( 'no-transpose', 'no-transpose', 'upper', '10', new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', true, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', false, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', null, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', undefined, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', [], new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', {}, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dlansf( 'no-transpose', 'no-transpose', 'upper', 10, '10', new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', 10, true, new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', 10, null, new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', 10, undefined, new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', 10, [], new Float64Array( 25 ) ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', 10, {}, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dlansf( 'no-transpose', 'no-transpose', 'upper', 10, new Float64Array( 25 ), '10' ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', 10, new Float64Array( 25 ), true ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', 10, new Float64Array( 25 ), null ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', 10, new Float64Array( 25 ), undefined ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', 10, new Float64Array( 25 ), [] ); // $ExpectError
	dlansf( 'no-transpose', 'no-transpose', 'upper', 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dlansf(); // $ExpectError
	dlansf( 'no-transpose' ); // $ExpectError
}
