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

import dpbequ = require( './index' );


// TESTS //

// The function is callable with the documented arguments...
{
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 );
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dpbequ( 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( null, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( undefined, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( [], 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( {}, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dpbequ( 'upper', '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', false, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dpbequ( 'upper', 10, '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dpbequ( 'upper', 10, 10, '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), 10, '10', 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), 10, true, 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), 10, null, 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), 10, undefined, 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), 10, [], 10 ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10' ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [] ); // $ExpectError
	dpbequ( 'upper', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dpbequ(); // $ExpectError
	dpbequ( 'upper' ); // $ExpectError
}
