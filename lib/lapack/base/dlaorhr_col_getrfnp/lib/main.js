/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaorhr_col_getrfnp from './dlaorhr_col_getrfnp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaorhr_col_getrfnp, 'ndarray', ndarray );


// EXPORTS //

export default dlaorhr_col_getrfnp;
