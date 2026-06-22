
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsprfs from './zsprfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsprfs, 'ndarray', ndarray );


// EXPORTS //

export default zsprfs;
