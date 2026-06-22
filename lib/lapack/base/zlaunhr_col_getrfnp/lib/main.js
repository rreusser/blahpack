/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaunhr_col_getrfnp from './zlaunhr_col_getrfnp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaunhr_col_getrfnp, 'ndarray', ndarray );


// EXPORTS //

export default zlaunhr_col_getrfnp;
