
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhetf2rk from './zhetf2_rk.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhetf2rk, 'ndarray', ndarray );


// EXPORTS //

export default zhetf2rk;
