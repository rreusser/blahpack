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

import ztftri = require( './index' );


// TESTS //

// The function returns a number...
{
	ztftri( 'no-transpose', 'upper', 'unit', 10, new Float64Array( 25 ) ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	ztftri( 10, 'upper', 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
	ztftri( true, 'upper', 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
	ztftri( null, 'upper', 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
	ztftri( undefined, 'upper', 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
	ztftri( [], 'upper', 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
	ztftri( {}, 'upper', 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	ztftri( 'no-transpose', 10, 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', true, 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', null, 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', undefined, 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', [], 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', {}, 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	ztftri( 'no-transpose', 'upper', 10, 10, new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', 'upper', true, 10, new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', 'upper', null, 10, new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', 'upper', undefined, 10, new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', 'upper', [], 10, new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', 'upper', {}, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	ztftri( 'no-transpose', 'upper', 'unit', '10', new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', 'upper', 'unit', true, new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', 'upper', 'unit', false, new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', 'upper', 'unit', null, new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', 'upper', 'unit', undefined, new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', 'upper', 'unit', [], new Float64Array( 25 ) ); // $ExpectError
	ztftri( 'no-transpose', 'upper', 'unit', {}, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	ztftri( 'no-transpose', 'upper', 'unit', 10, '10' ); // $ExpectError
	ztftri( 'no-transpose', 'upper', 'unit', 10, 10 ); // $ExpectError
	ztftri( 'no-transpose', 'upper', 'unit', 10, true ); // $ExpectError
	ztftri( 'no-transpose', 'upper', 'unit', 10, null ); // $ExpectError
	ztftri( 'no-transpose', 'upper', 'unit', 10, undefined ); // $ExpectError
	ztftri( 'no-transpose', 'upper', 'unit', 10, [] ); // $ExpectError
	ztftri( 'no-transpose', 'upper', 'unit', 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	ztftri(); // $ExpectError
	ztftri( 'no-transpose' ); // $ExpectError
}
