
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgeqlf from './zgeqlf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgeqlf, 'ndarray', ndarray );


// EXPORTS //

export default zgeqlf;
