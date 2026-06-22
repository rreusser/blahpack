// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgebal from './zgebal.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgebal, 'ndarray', ndarray );


// EXPORTS //

export default zgebal;
