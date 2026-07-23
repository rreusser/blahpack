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

import dpftrf = require( './index' );


// TESTS //

// The function returns a number...
{
	dpftrf( 'no-transpose', 'upper', 10, new Float64Array( 25 ) ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dpftrf( 10, 'upper', 10, new Float64Array( 25 ) ); // $ExpectError
	dpftrf( true, 'upper', 10, new Float64Array( 25 ) ); // $ExpectError
	dpftrf( null, 'upper', 10, new Float64Array( 25 ) ); // $ExpectError
	dpftrf( undefined, 'upper', 10, new Float64Array( 25 ) ); // $ExpectError
	dpftrf( [], 'upper', 10, new Float64Array( 25 ) ); // $ExpectError
	dpftrf( {}, 'upper', 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dpftrf( 'no-transpose', 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dpftrf( 'no-transpose', true, 10, new Float64Array( 25 ) ); // $ExpectError
	dpftrf( 'no-transpose', null, 10, new Float64Array( 25 ) ); // $ExpectError
	dpftrf( 'no-transpose', undefined, 10, new Float64Array( 25 ) ); // $ExpectError
	dpftrf( 'no-transpose', [], 10, new Float64Array( 25 ) ); // $ExpectError
	dpftrf( 'no-transpose', {}, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dpftrf( 'no-transpose', 'upper', '10', new Float64Array( 25 ) ); // $ExpectError
	dpftrf( 'no-transpose', 'upper', true, new Float64Array( 25 ) ); // $ExpectError
	dpftrf( 'no-transpose', 'upper', false, new Float64Array( 25 ) ); // $ExpectError
	dpftrf( 'no-transpose', 'upper', null, new Float64Array( 25 ) ); // $ExpectError
	dpftrf( 'no-transpose', 'upper', undefined, new Float64Array( 25 ) ); // $ExpectError
	dpftrf( 'no-transpose', 'upper', [], new Float64Array( 25 ) ); // $ExpectError
	dpftrf( 'no-transpose', 'upper', {}, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dpftrf( 'no-transpose', 'upper', 10, '10' ); // $ExpectError
	dpftrf( 'no-transpose', 'upper', 10, 10 ); // $ExpectError
	dpftrf( 'no-transpose', 'upper', 10, true ); // $ExpectError
	dpftrf( 'no-transpose', 'upper', 10, null ); // $ExpectError
	dpftrf( 'no-transpose', 'upper', 10, undefined ); // $ExpectError
	dpftrf( 'no-transpose', 'upper', 10, [] ); // $ExpectError
	dpftrf( 'no-transpose', 'upper', 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dpftrf(); // $ExpectError
	dpftrf( 'no-transpose' ); // $ExpectError
}
