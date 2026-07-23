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

import dlasy2 = require( './index' );


// TESTS //

// The function returns a number...
{
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dlasy2( '10', true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( 10, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( null, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( undefined, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( [], true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( {}, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dlasy2( true, '10', 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, null, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, undefined, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, [], 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, {}, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dlasy2( true, true, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, null, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, undefined, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, [], 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, {}, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dlasy2( true, true, 'no-transpose', '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', false, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dlasy2( true, true, 'no-transpose', 10, '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dlasy2( true, true, 'no-transpose', 10, 10, '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, '10', 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, true, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, null, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, undefined, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, [], 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, {}, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a eleventh argument of invalid type...
{
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a twelfth argument of invalid type...
{
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, false, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], new Float64Array( 25 ), 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, new Float64Array( 25 ), 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a thirteenth argument of invalid type...
{
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, '10', 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, true, 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, null, 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, undefined, 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, [], 10, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, {}, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourteenth argument of invalid type...
{
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), '10', 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), true, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), false, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), null, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), undefined, 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), [], 10 ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifteenth argument of invalid type...
{
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, '10' ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, true ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, false ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, null ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, undefined ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, [] ); // $ExpectError
	dlasy2( true, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dlasy2(); // $ExpectError
	dlasy2( true ); // $ExpectError
}
