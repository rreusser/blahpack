// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpocon from './zpocon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpocon, 'ndarray', ndarray );


// EXPORTS //

export default zpocon;
