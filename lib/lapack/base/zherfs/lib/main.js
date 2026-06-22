// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zherfs from './zherfs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zherfs, 'ndarray', ndarray );


// EXPORTS //

export default zherfs;
