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

import dlarrc = require( './index' );


// TESTS //

// The function is callable with the documented arguments...
{
	dlarrc( 'no-transpose', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 );
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dlarrc( 10, 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( true, 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( null, 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( undefined, 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( [], 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( {}, 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dlarrc( 'no-transpose', '10', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', true, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', false, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', null, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', undefined, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', [], 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', {}, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dlarrc( 'no-transpose', 10, '10', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, true, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, false, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, null, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, undefined, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, [], 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, {}, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dlarrc( 'no-transpose', 10, 10, '10', new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, true, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, false, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, null, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, undefined, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, [], new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, {}, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dlarrc( 'no-transpose', 10, 10, 10, '10', new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, true, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, null, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, [], new Float64Array( 25 ), 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dlarrc( 'no-transpose', 10, 10, 10, new Float64Array( 25 ), '10', 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, new Float64Array( 25 ), true, 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, new Float64Array( 25 ), null, 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, new Float64Array( 25 ), undefined, 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, new Float64Array( 25 ), [], 10 ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, new Float64Array( 25 ), {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dlarrc( 'no-transpose', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), '10' ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), true ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), false ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), null ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), undefined ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), [] ); // $ExpectError
	dlarrc( 'no-transpose', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dlarrc(); // $ExpectError
	dlarrc( 'no-transpose' ); // $ExpectError
}
