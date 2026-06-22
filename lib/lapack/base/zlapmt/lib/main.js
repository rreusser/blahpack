// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlapmt from './zlapmt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlapmt, 'ndarray', ndarray );


// EXPORTS //

export default zlapmt;
