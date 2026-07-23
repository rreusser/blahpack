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

import dlantp = require( './index' );


// TESTS //

// The function returns a number...
{
	dlantp( 'no-transpose', 'upper', 'unit', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dlantp( 10, 'upper', 'unit', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( true, 'upper', 'unit', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( null, 'upper', 'unit', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( undefined, 'upper', 'unit', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( [], 'upper', 'unit', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( {}, 'upper', 'unit', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dlantp( 'no-transpose', 10, 'unit', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', true, 'unit', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', null, 'unit', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', undefined, 'unit', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', [], 'unit', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', {}, 'unit', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dlantp( 'no-transpose', 'upper', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', true, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', null, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', undefined, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', [], 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', {}, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dlantp( 'no-transpose', 'upper', 'unit', '10', new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', true, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', false, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', null, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', undefined, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', [], new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', {}, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dlantp( 'no-transpose', 'upper', 'unit', 10, '10', new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', 10, true, new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', 10, null, new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', 10, undefined, new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', 10, [], new Float64Array( 25 ) ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', 10, {}, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dlantp( 'no-transpose', 'upper', 'unit', 10, new Float64Array( 25 ), '10' ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', 10, new Float64Array( 25 ), true ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', 10, new Float64Array( 25 ), null ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', 10, new Float64Array( 25 ), undefined ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', 10, new Float64Array( 25 ), [] ); // $ExpectError
	dlantp( 'no-transpose', 'upper', 'unit', 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dlantp(); // $ExpectError
	dlantp( 'no-transpose' ); // $ExpectError
}
