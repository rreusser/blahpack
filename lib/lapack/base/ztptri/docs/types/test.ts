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

import ztptri = require( './index' );


// TESTS //

// The function returns a number...
{
	ztptri( 'upper', 'unit', 10, 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	ztptri( 10, 'unit', 10, 10 ); // $ExpectError
	ztptri( true, 'unit', 10, 10 ); // $ExpectError
	ztptri( null, 'unit', 10, 10 ); // $ExpectError
	ztptri( undefined, 'unit', 10, 10 ); // $ExpectError
	ztptri( [], 'unit', 10, 10 ); // $ExpectError
	ztptri( {}, 'unit', 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	ztptri( 'upper', 10, 10, 10 ); // $ExpectError
	ztptri( 'upper', true, 10, 10 ); // $ExpectError
	ztptri( 'upper', null, 10, 10 ); // $ExpectError
	ztptri( 'upper', undefined, 10, 10 ); // $ExpectError
	ztptri( 'upper', [], 10, 10 ); // $ExpectError
	ztptri( 'upper', {}, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	ztptri( 'upper', 'unit', '10', 10 ); // $ExpectError
	ztptri( 'upper', 'unit', true, 10 ); // $ExpectError
	ztptri( 'upper', 'unit', false, 10 ); // $ExpectError
	ztptri( 'upper', 'unit', null, 10 ); // $ExpectError
	ztptri( 'upper', 'unit', undefined, 10 ); // $ExpectError
	ztptri( 'upper', 'unit', [], 10 ); // $ExpectError
	ztptri( 'upper', 'unit', {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	ztptri( 'upper', 'unit', 10, '10' ); // $ExpectError
	ztptri( 'upper', 'unit', 10, true ); // $ExpectError
	ztptri( 'upper', 'unit', 10, false ); // $ExpectError
	ztptri( 'upper', 'unit', 10, null ); // $ExpectError
	ztptri( 'upper', 'unit', 10, undefined ); // $ExpectError
	ztptri( 'upper', 'unit', 10, [] ); // $ExpectError
	ztptri( 'upper', 'unit', 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	ztptri(); // $ExpectError
	ztptri( 'upper' ); // $ExpectError
}
