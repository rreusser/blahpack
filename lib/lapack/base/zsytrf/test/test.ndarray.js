import __imp0 from './fixtures/upper_4x4.json' with { type: 'json' };
import __imp1 from './fixtures/lower_4x4.json' with { type: 'json' };
import __imp2 from './fixtures/lower_6x6.json' with { type: 'json' };
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsytrf from '../lib/ndarray.js';
var fixtures = {
	'upper_4x4': __imp0,
	'lower_4x4': __imp1,
	'lower_6x6': __imp2
};
function assertClose( actual, expected, tol ) { for ( var ii = 0; ii < expected.length; ii++ ) { if ( Math.abs( actual[ii] - expected[ii] ) > tol * ( 1.0 + Math.abs( expected[ii] ) ) ) { assert.fail( 'at ' + ii + ': ' + actual[ii] + ' vs ' + expected[ii] ); } } }
function convertIPIV( f ) { var r = new Int32Array(f.length); for ( var ii = 0; ii < f.length; ii++ ) { r[ii] = f[ii] > 0 ? f[ii] - 1 : ~(-f[ii]-1); } return r; }
function buildMatrix( n, LDA, vals ) { var A = new Complex128Array(LDA*n); var Av = reinterpret(A,0); for(var k=0;k<vals.length;k++){var v=vals[k];Av[2*v.i+2*LDA*v.j]=v.re;Av[2*v.i+2*LDA*v.j+1]=v.im;} return A; }
function extractA( A, n, LDA ) { var Av = reinterpret(A,0); var r=[]; for(var j=0;j<n;j++)for(var idx=0;idx<2*LDA;idx++)r.push(Av[j*2*LDA+idx]); return r; }
test( 'zsytrf: upper 4x4', function t() { var fix = fixtures.upper_4x4; var n = fix.n; var LDA = 6; var A = buildMatrix(n,LDA,[{i:0,j:0,re:2,im:1},{i:0,j:1,re:1,im:2},{i:0,j:2,re:3,im:-1},{i:0,j:3,re:0.5,im:0.5},{i:1,j:1,re:5,im:-1},{i:1,j:2,re:2,im:1},{i:1,j:3,re:1,im:-2},{i:2,j:2,re:4,im:2},{i:2,j:3,re:3,im:0},{i:3,j:3,re:6,im:-3}]); var IPIV = new Int32Array(n); assert.equal(zsytrf('upper',n,A,1,LDA,0,IPIV,1,0),fix.info); assertClose(extractA(A,n,LDA),fix.A,1e-13); var e = convertIPIV(fix.ipiv); for(var k=0;k<n;k++) assert.equal(IPIV[k],e[k]); });
test( 'zsytrf: lower 4x4', function t() { var fix = fixtures.lower_4x4; var n = fix.n; var LDA = 6; var A = buildMatrix(n,LDA,[{i:0,j:0,re:2,im:1},{i:1,j:0,re:1,im:2},{i:1,j:1,re:5,im:-1},{i:2,j:0,re:3,im:-1},{i:2,j:1,re:2,im:1},{i:2,j:2,re:4,im:2},{i:3,j:0,re:0.5,im:0.5},{i:3,j:1,re:1,im:-2},{i:3,j:2,re:3,im:0},{i:3,j:3,re:6,im:-3}]); var IPIV = new Int32Array(n); assert.equal(zsytrf('lower',n,A,1,LDA,0,IPIV,1,0),fix.info); assertClose(extractA(A,n,LDA),fix.A,1e-13); var e = convertIPIV(fix.ipiv); for(var k=0;k<n;k++) assert.equal(IPIV[k],e[k]); });
test( 'zsytrf: N=0', function t() { assert.equal(zsytrf('upper',0,new Complex128Array(1),1,1,0,new Int32Array(1),1,0),0); });
test( 'zsytrf: lower 6x6', function t() { var fix = fixtures.lower_6x6; var n = fix.n; var LDA = 6; var A = buildMatrix(n,LDA,[{i:0,j:0,re:0.01,im:0},{i:1,j:0,re:5,im:1},{i:1,j:1,re:0.02,im:0},{i:2,j:0,re:1,im:-1},{i:2,j:1,re:2,im:1},{i:2,j:2,re:8,im:-2},{i:3,j:0,re:0.5,im:0.5},{i:3,j:1,re:1,im:-1},{i:3,j:2,re:3,im:0},{i:3,j:3,re:7,im:1},{i:4,j:0,re:2,im:0},{i:4,j:1,re:1.5,im:0.5},{i:4,j:2,re:0,im:2},{i:4,j:3,re:1,im:-0.5},{i:4,j:4,re:6,im:0},{i:5,j:0,re:1,im:1},{i:5,j:1,re:0,im:3},{i:5,j:2,re:1,im:0},{i:5,j:3,re:2,im:2},{i:5,j:4,re:0.5,im:-1},{i:5,j:5,re:5,im:-1}]); var IPIV = new Int32Array(n); assert.equal(zsytrf('lower',n,A,1,LDA,0,IPIV,1,0),fix.info); assertClose(extractA(A,n,LDA),fix.A,1e-13); var e = convertIPIV(fix.ipiv); for(var k=0;k<n;k++) assert.equal(IPIV[k],e[k]); });
