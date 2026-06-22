// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgerqf from './zgerqf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgerqf, 'ndarray', ndarray );


// EXPORTS //

export default zgerqf;
