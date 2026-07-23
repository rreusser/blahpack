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

import dlatps = require( './index' );


// TESTS //

// The function returns a number...
{
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dlatps( 10, 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( true, 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( null, 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( undefined, 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( [], 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( {}, 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dlatps( 'upper', 10, 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', true, 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', null, 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', undefined, 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', [], 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', {}, 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dlatps( 'upper', 'no-transpose', 10, 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', true, 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', null, 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', undefined, 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', [], 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', {}, 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dlatps( 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', true, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', null, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', undefined, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', [], 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', {}, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', '10', new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', true, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', false, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', null, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', undefined, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', [], new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', {}, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, '10', new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, true, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, null, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, undefined, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, [], new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, {}, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), '10', 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), true, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), null, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), undefined, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), [], 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), {}, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), false, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, '10', new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, true, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, false, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, null, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, [], new Float64Array( 25 ), 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, '10', 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, 10, 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, true, 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, null, 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, undefined, 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, [], 10 ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a eleventh argument of invalid type...
{
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), '10' ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), true ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), false ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), null ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), undefined ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), [] ); // $ExpectError
	dlatps( 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dlatps(); // $ExpectError
	dlatps( 'upper' ); // $ExpectError
}
