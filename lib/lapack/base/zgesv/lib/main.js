// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgesv from './zgesv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgesv, 'ndarray', ndarray );


// EXPORTS //

export default zgesv;
