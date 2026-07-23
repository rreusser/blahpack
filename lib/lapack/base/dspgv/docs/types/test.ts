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

import dspgv = require( './index' );


// TESTS //

// The function returns a number...
{
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dspgv( 10, 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( true, 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( null, 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( undefined, 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( [], 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( {}, 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dspgv( 'row-major', '10', 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', true, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', false, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', null, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', undefined, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', [], 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', {}, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dspgv( 'row-major', 10, 10, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, true, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, null, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, undefined, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, [], 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, {}, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dspgv( 'row-major', 10, 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', true, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', null, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', undefined, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', [], 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', {}, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dspgv( 'row-major', 10, 'no-transpose', 'upper', '10', new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', true, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', false, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', null, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', undefined, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', [], new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', {}, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, '10', new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, true, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, null, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, undefined, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, [], new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, {}, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), true, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), null, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), [], new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), '10', 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), true, 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), null, 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), undefined, 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), [], 10, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), {}, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), '10', new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), true, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), false, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), null, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), undefined, new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), [], new Float64Array( 25 ) ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), {}, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a eleventh argument of invalid type...
{
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, '10' ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, true ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, null ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, undefined ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, [] ); // $ExpectError
	dspgv( 'row-major', 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dspgv(); // $ExpectError
	dspgv( 'row-major' ); // $ExpectError
}
