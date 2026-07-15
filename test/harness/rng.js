/**
* Seeded, reproducible pseudo-random number generation for the validation
* harness.
*
* Every generator in the harness draws from an `RNG` instance created with an
* explicit integer seed, so a failing case can always be reproduced exactly by
* re-running with the same seed. Derive independent sub-streams with `fork()`
* when a test needs several uncorrelated sources.
*/

import mt19937 from '@stdlib/random/base/mt19937/lib/index.js';

// MAIN //

class RNG {
	/**
	* @param {number} seed - non-negative integer seed
	*/
	constructor( seed ) {
		this._seed = seed >>> 0;
		this._rand = mt19937.factory({ 'seed': this._seed });
	}

	/**
	* Uniform in [0, 1).
	*
	* @returns {number}
	*/
	uniform() {
		return this._rand.normalized();
	}

	/**
	* Uniform in [lo, hi).
	*
	* @param {number} lo
	* @param {number} hi
	* @returns {number}
	*/
	between( lo, hi ) {
		return lo + ( ( hi - lo ) * this.uniform() );
	}

	/**
	* Standard normal via Box-Muller. Well-conditioned matrix entries are
	* typically drawn from a normal, so structure (symmetry, positive
	* definiteness) is imposed on top of Gaussian noise.
	*
	* @returns {number}
	*/
	normal() {
		// Guard against log(0):
		var u1 = 1.0 - this.uniform();
		var u2 = this.uniform();
		return Math.sqrt( -2.0 * Math.log( u1 ) ) * Math.cos( 2.0 * Math.PI * u2 );
	}

	/**
	* Integer in [lo, hi] inclusive.
	*
	* @param {number} lo
	* @param {number} hi
	* @returns {number}
	*/
	int( lo, hi ) {
		return lo + Math.floor( this.uniform() * ( hi - lo + 1 ) );
	}

	/**
	* Uniformly pick one element of an array.
	*
	* @param {Array} arr
	* @returns {*}
	*/
	pick( arr ) {
		return arr[ this.int( 0, arr.length - 1 ) ];
	}

	/**
	* Sign in {-1, +1}.
	*
	* @returns {number}
	*/
	sign() {
		return ( this.uniform() < 0.5 ) ? -1 : 1;
	}

	/**
	* Derive an independent child RNG. Deterministic given this stream's
	* state, so forking is itself reproducible.
	*
	* @returns {RNG}
	*/
	fork() {
		return new RNG( this.int( 0, 0x7fffffff ) );
	}

	/**
	* The seed this stream was created with (for reporting failures).
	*
	* @returns {number}
	*/
	seed() {
		return this._seed;
	}
}

// EXPORTS //

export default RNG;
