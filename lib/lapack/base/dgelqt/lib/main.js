
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgelqt from './dgelqt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgelqt, 'ndarray', ndarray );


// EXPORTS //

export default dgelqt;
