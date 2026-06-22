// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgeequ from './dgeequ.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgeequ, 'ndarray', ndarray );


// EXPORTS //

export default dgeequ;
