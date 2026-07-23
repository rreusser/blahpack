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

import dlartgp = require( './index' );


// TESTS //

// The function returns a Float64Array...
{
	dlartgp( 10, 10 ); // $ExpectType Float64Array
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dlartgp( '10', 10 ); // $ExpectError
	dlartgp( true, 10 ); // $ExpectError
	dlartgp( false, 10 ); // $ExpectError
	dlartgp( null, 10 ); // $ExpectError
	dlartgp( undefined, 10 ); // $ExpectError
	dlartgp( [], 10 ); // $ExpectError
	dlartgp( {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dlartgp( 10, '10' ); // $ExpectError
	dlartgp( 10, true ); // $ExpectError
	dlartgp( 10, false ); // $ExpectError
	dlartgp( 10, null ); // $ExpectError
	dlartgp( 10, undefined ); // $ExpectError
	dlartgp( 10, [] ); // $ExpectError
	dlartgp( 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dlartgp(); // $ExpectError
	dlartgp( 10 ); // $ExpectError
}
