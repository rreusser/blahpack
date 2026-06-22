
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgemlqt from './zgemlqt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgemlqt, 'ndarray', ndarray );


// EXPORTS //

export default zgemlqt;
