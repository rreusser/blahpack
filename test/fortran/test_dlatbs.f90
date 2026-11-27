program test_dlatbs
  use test_utils
  implicit none
  ! For banded storage: AB(LDAB, N) where LDAB >= KD+1
  double precision :: ab3(3,10), ab2(2,10), ab1(1,10)
  double precision :: x(10), cnorm(10), scale
  integer :: info, n, kd
  ! Battery (ticket 0110): every UPLO x TRANS x DIAG x NORMIN over input
  ! families chosen to reach each scaling branch of the careful solve.
  integer :: iseed, fam, ic, iu, it, idg, inm, ik, irep, kdb
  character :: cu, ct, cdg, cnm
  integer, parameter :: kds(4) = (/ 0, 1, 3, 8 /)

  ! ========================================================================
  ! Test 1: Upper triangular banded, no transpose, non-unit, 4x4, KD=2
  ! ========================================================================
  n = 4
  kd = 2
  ab3 = 0.0d0
  ab3(3,1) = 4.0d0
  ab3(2,2) = 2.0d0; ab3(3,2) = 3.0d0
  ab3(1,3) = 1.0d0; ab3(2,3) = 1.0d0; ab3(3,3) = 5.0d0
  ab3(1,4) = 2.0d0; ab3(2,4) = 3.0d0; ab3(3,4) = 6.0d0

  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0; x(4) = 4.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatbs('U', 'N', 'N', 'N', n, kd, ab3, kd+1, x, scale, cnorm, info)
  call begin_test('upper_N_nonunit')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 2: Lower triangular banded, no transpose, non-unit, 4x4, KD=2
  ! ========================================================================
  n = 4
  kd = 2
  ab3 = 0.0d0
  ab3(1,1) = 4.0d0; ab3(2,1) = 2.0d0; ab3(3,1) = 1.0d0
  ab3(1,2) = 3.0d0; ab3(2,2) = 1.0d0; ab3(3,2) = 2.0d0
  ab3(1,3) = 5.0d0; ab3(2,3) = 3.0d0
  ab3(1,4) = 6.0d0

  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0; x(4) = 4.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatbs('L', 'N', 'N', 'N', n, kd, ab3, kd+1, x, scale, cnorm, info)
  call begin_test('lower_N_nonunit')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 3: Upper triangular banded, transpose, non-unit, 4x4, KD=2
  ! ========================================================================
  n = 4
  kd = 2
  ab3 = 0.0d0
  ab3(3,1) = 4.0d0
  ab3(2,2) = 2.0d0; ab3(3,2) = 3.0d0
  ab3(1,3) = 1.0d0; ab3(2,3) = 1.0d0; ab3(3,3) = 5.0d0
  ab3(1,4) = 2.0d0; ab3(2,4) = 3.0d0; ab3(3,4) = 6.0d0

  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0; x(4) = 4.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatbs('U', 'T', 'N', 'N', n, kd, ab3, kd+1, x, scale, cnorm, info)
  call begin_test('upper_T_nonunit')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 4: Lower triangular banded, transpose, non-unit, 4x4, KD=2
  ! ========================================================================
  n = 4
  kd = 2
  ab3 = 0.0d0
  ab3(1,1) = 4.0d0; ab3(2,1) = 2.0d0; ab3(3,1) = 1.0d0
  ab3(1,2) = 3.0d0; ab3(2,2) = 1.0d0; ab3(3,2) = 2.0d0
  ab3(1,3) = 5.0d0; ab3(2,3) = 3.0d0
  ab3(1,4) = 6.0d0

  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0; x(4) = 4.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatbs('L', 'T', 'N', 'N', n, kd, ab3, kd+1, x, scale, cnorm, info)
  call begin_test('lower_T_nonunit')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 5: Upper, unit diagonal, no transpose
  ! ========================================================================
  n = 4
  kd = 2
  ab3 = 0.0d0
  ab3(3,1) = 99.0d0
  ab3(2,2) = 2.0d0; ab3(3,2) = 99.0d0
  ab3(1,3) = 1.0d0; ab3(2,3) = 1.0d0; ab3(3,3) = 99.0d0
  ab3(1,4) = 2.0d0; ab3(2,4) = 3.0d0; ab3(3,4) = 99.0d0

  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0; x(4) = 4.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatbs('U', 'N', 'U', 'N', n, kd, ab3, kd+1, x, scale, cnorm, info)
  call begin_test('upper_N_unit')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 6: Lower, unit diagonal, no transpose
  ! ========================================================================
  n = 4
  kd = 2
  ab3 = 0.0d0
  ab3(1,1) = 99.0d0; ab3(2,1) = 2.0d0; ab3(3,1) = 1.0d0
  ab3(1,2) = 99.0d0; ab3(2,2) = 1.0d0; ab3(3,2) = 2.0d0
  ab3(1,3) = 99.0d0; ab3(2,3) = 3.0d0
  ab3(1,4) = 99.0d0

  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0; x(4) = 4.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatbs('L', 'N', 'U', 'N', n, kd, ab3, kd+1, x, scale, cnorm, info)
  call begin_test('lower_N_unit')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 7: N=0 (quick return)
  ! ========================================================================
  n = 0
  kd = 0
  scale = 0.0d0
  call dlatbs('U', 'N', 'N', 'N', n, kd, ab1, 1, x, scale, cnorm, info)
  call begin_test('n_zero')
  call print_scalar('scale', scale)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 8: N=1
  ! ========================================================================
  n = 1
  kd = 0
  ab1(1,1) = 5.0d0
  x(1) = 10.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatbs('U', 'N', 'N', 'N', n, kd, ab1, kd+1, x, scale, cnorm, info)
  call begin_test('n_one')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 9: Pre-computed CNORM (normin='Y')
  ! ========================================================================
  n = 4
  kd = 2
  ab3 = 0.0d0
  ab3(3,1) = 4.0d0
  ab3(2,2) = 2.0d0; ab3(3,2) = 3.0d0
  ab3(1,3) = 1.0d0; ab3(2,3) = 1.0d0; ab3(3,3) = 5.0d0
  ab3(1,4) = 2.0d0; ab3(2,4) = 3.0d0; ab3(3,4) = 6.0d0

  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0; x(4) = 4.0d0
  scale = 0.0d0
  cnorm(1) = 0.0d0; cnorm(2) = 2.0d0; cnorm(3) = 2.0d0; cnorm(4) = 5.0d0
  call dlatbs('U', 'N', 'N', 'Y', n, kd, ab3, kd+1, x, scale, cnorm, info)
  call begin_test('normin_Y')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 10: KD=1 (tridiagonal band), upper
  ! ========================================================================
  n = 4
  kd = 1
  ab2 = 0.0d0
  ab2(2,1) = 3.0d0
  ab2(1,2) = 1.0d0; ab2(2,2) = 4.0d0
  ab2(1,3) = 2.0d0; ab2(2,3) = 5.0d0
  ab2(1,4) = 1.0d0; ab2(2,4) = 6.0d0

  x(1) = 2.0d0; x(2) = 3.0d0; x(3) = 1.0d0; x(4) = 5.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatbs('U', 'N', 'N', 'N', n, kd, ab2, kd+1, x, scale, cnorm, info)
  call begin_test('upper_kd1')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 11: Upper, transpose, unit diagonal
  ! ========================================================================
  n = 4
  kd = 2
  ab3 = 0.0d0
  ab3(3,1) = 99.0d0
  ab3(2,2) = 2.0d0; ab3(3,2) = 99.0d0
  ab3(1,3) = 1.0d0; ab3(2,3) = 1.0d0; ab3(3,3) = 99.0d0
  ab3(1,4) = 2.0d0; ab3(2,4) = 3.0d0; ab3(3,4) = 99.0d0

  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0; x(4) = 4.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatbs('U', 'T', 'U', 'N', n, kd, ab3, kd+1, x, scale, cnorm, info)
  call begin_test('upper_T_unit')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 12: Lower, transpose, unit diagonal
  ! ========================================================================
  n = 4
  kd = 2
  ab3 = 0.0d0
  ab3(1,1) = 99.0d0; ab3(2,1) = 2.0d0; ab3(3,1) = 1.0d0
  ab3(1,2) = 99.0d0; ab3(2,2) = 1.0d0; ab3(3,2) = 2.0d0
  ab3(1,3) = 99.0d0; ab3(2,3) = 3.0d0
  ab3(1,4) = 99.0d0

  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0; x(4) = 4.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatbs('L', 'T', 'U', 'N', n, kd, ab3, kd+1, x, scale, cnorm, info)
  call begin_test('lower_T_unit')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 13: Lower, transpose, non-unit, normin='Y'
  ! ========================================================================
  n = 4
  kd = 2
  ab3 = 0.0d0
  ab3(1,1) = 4.0d0; ab3(2,1) = 2.0d0; ab3(3,1) = 1.0d0
  ab3(1,2) = 3.0d0; ab3(2,2) = 1.0d0; ab3(3,2) = 2.0d0
  ab3(1,3) = 5.0d0; ab3(2,3) = 3.0d0
  ab3(1,4) = 6.0d0

  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0; x(4) = 4.0d0
  scale = 0.0d0
  cnorm(1) = 3.0d0; cnorm(2) = 3.0d0; cnorm(3) = 3.0d0; cnorm(4) = 0.0d0
  call dlatbs('L', 'T', 'N', 'Y', n, kd, ab3, kd+1, x, scale, cnorm, info)
  call begin_test('lower_T_nonunit_normin_Y')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 14: Upper, transpose, non-unit, normin='Y'
  ! ========================================================================
  n = 4
  kd = 2
  ab3 = 0.0d0
  ab3(3,1) = 4.0d0
  ab3(2,2) = 2.0d0; ab3(3,2) = 3.0d0
  ab3(1,3) = 1.0d0; ab3(2,3) = 1.0d0; ab3(3,3) = 5.0d0
  ab3(1,4) = 2.0d0; ab3(2,4) = 3.0d0; ab3(3,4) = 6.0d0

  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0; x(4) = 4.0d0
  scale = 0.0d0
  cnorm(1) = 0.0d0; cnorm(2) = 2.0d0; cnorm(3) = 2.0d0; cnorm(4) = 5.0d0
  call dlatbs('U', 'T', 'N', 'Y', n, kd, ab3, kd+1, x, scale, cnorm, info)
  call begin_test('upper_T_nonunit_normin_Y')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 15: Lower, no-transpose, unit, normin='Y'
  ! ========================================================================
  n = 4
  kd = 2
  ab3 = 0.0d0
  ab3(1,1) = 99.0d0; ab3(2,1) = 2.0d0; ab3(3,1) = 1.0d0
  ab3(1,2) = 99.0d0; ab3(2,2) = 1.0d0; ab3(3,2) = 2.0d0
  ab3(1,3) = 99.0d0; ab3(2,3) = 3.0d0
  ab3(1,4) = 99.0d0

  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0; x(4) = 4.0d0
  scale = 0.0d0
  cnorm(1) = 3.0d0; cnorm(2) = 3.0d0; cnorm(3) = 3.0d0; cnorm(4) = 0.0d0
  call dlatbs('L', 'N', 'U', 'Y', n, kd, ab3, kd+1, x, scale, cnorm, info)
  call begin_test('lower_N_unit_normin_Y')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 16: Lower, KD=1, transpose, non-unit
  ! ========================================================================
  n = 4
  kd = 1
  ab2 = 0.0d0
  ab2(1,1) = 3.0d0; ab2(2,1) = 1.0d0
  ab2(1,2) = 4.0d0; ab2(2,2) = 2.0d0
  ab2(1,3) = 5.0d0; ab2(2,3) = 1.0d0
  ab2(1,4) = 6.0d0

  x(1) = 2.0d0; x(2) = 3.0d0; x(3) = 1.0d0; x(4) = 5.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatbs('L', 'T', 'N', 'N', n, kd, ab2, kd+1, x, scale, cnorm, info)
  call begin_test('lower_T_kd1')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 17: Singular matrix (zero diagonal), upper
  ! This triggers the careful-solve path with tjj=0
  ! ========================================================================
  n = 3
  kd = 1
  ab2 = 0.0d0
  ab2(2,1) = 2.0d0
  ab2(1,2) = 1.0d0; ab2(2,2) = 0.0d0  ! zero diagonal
  ab2(1,3) = 1.0d0; ab2(2,3) = 3.0d0

  x(1) = 1.0d0; x(2) = 1.0d0; x(3) = 1.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatbs('U', 'N', 'N', 'N', n, kd, ab2, kd+1, x, scale, cnorm, info)
  call begin_test('singular_upper')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Test 18: Very small diagonal (near-singular), triggers careful-solve
  ! ========================================================================
  n = 3
  kd = 1
  ab2 = 0.0d0
  ab2(2,1) = 1.0d0
  ab2(1,2) = 1.0d0; ab2(2,2) = 1.0d-300  ! very small diagonal
  ab2(1,3) = 1.0d0; ab2(2,3) = 1.0d0

  x(1) = 1.0d0; x(2) = 1.0d0; x(3) = 1.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatbs('U', 'N', 'N', 'N', n, kd, ab2, kd+1, x, scale, cnorm, info)
  call begin_test('near_singular_upper')
  call print_array('x', x, n)
  call print_scalar('scale', scale)
  call print_array('cnorm', cnorm, n)
  call print_int('info', info)
  call end_test()

  ! ========================================================================
  ! Battery (ticket 0110): inputs are printed with the outputs, unused band
  ! slots are 0 here and poisoned by the JS test. Families (entry/xentry):
  ! 1 well conditioned; 2 one diagonal below SMLNUM; 3 one small diagonal
  ! and a huge right-hand side; 4 one column norm above BIGNUM; 5 one column
  ! norm and its diagonal above BIGNUM; 6 one zero diagonal; 7 log-uniform
  ! over the whole range; 8 large off-diagonals (growth); 9 one column of
  ! off-diagonals near BIGNUM / KD; 10 log-uniform over half the range.
  ! The special column is the first, middle or last (REP = 1, 2, 3).
  ! ========================================================================
  iseed = 20261127
  ic = 0
  do fam = 1, 10
    do iu = 1, 2
      do it = 1, 2
        do idg = 1, 2
          do inm = 1, 2
            cu = 'U'; if (iu == 2) cu = 'L'
            ct = 'N'; if (it == 2) ct = 'T'
            cdg = 'N'; if (idg == 2) cdg = 'U'
            cnm = 'N'; if (inm == 2) cnm = 'Y'
            if (fam == 1) then
              do ik = 1, 4
                call run_case(fam, 1, cu, ct, cdg, cnm, 7, kds(ik))
              end do
            else if (fam == 7) then
              do irep = 1, 2
                call run_case(fam, irep, cu, ct, cdg, cnm, 6, 2 + irep)
              end do
            else if (fam == 8) then
              do irep = 1, 3
                kdb = 1 + irep
                call run_case(fam, irep, cu, ct, cdg, cnm, 5, kdb)
              end do
            else
              do irep = 1, 3
                call run_case(fam, irep, cu, ct, cdg, cnm, 5, 2)
              end do
            end if
          end do
        end do
      end do
    end do
  end do

  ! Cases found by mutating base.js (ticket 0110): each one separates the
  ! named mutant from the code. Tags give base.js line, occurrence, mutant.
  call run_given('148-1-grow_1_0_Math_max_xbnd', 'U', 'N', 'N', 'Y', 5, 1, &
    (/ 0.0d0, 1.2432591394722736d0, 0.9879124890956621d0, -1.6737534565263212d0, &
      -0.20623354111157055d0, -1.061178683331785d0, 0.6152762973752228d0, &
      1.1524320543522164d0, 0.0174477496265657d0, -1.2101268885704348d0 /), &
    (/ -0.0d0, 0.0d0, -6.490371073168535d+32, 0.17316422293575673d0, 0.0d0 /))
  call run_given('149-1-xbnd_grow', 'U', 'N', 'N', 'N', 3, 0, &
    (/ -1.633954579305814d0, 1.6441000335123857d0, -1.347319460635688d0 /), &
    (/ 0.0d0, -0.0d0, 0.0d0 /))
  call run_given('156-1-', 'U', 'N', 'N', 'N', 5, 0, &
    (/ -2.0d0, -1.0d0, 0.2908601245334652d0, -1.0020841800044864d-292, &
      -0.13095907360825643d0 /), &
    (/ -0.008007362022999343d0, -0.0d0, -0.571157366768996d0, 0.6037435473891644d0, 0.0d0 /))
  call run_given('159-1-grow_0_0', 'U', 'N', 'N', 'Y', 3, 1, &
    (/ 0.0d0, 0.6093941310464377d0, -0.7717262682373291d0, 0.2198196394461298d0, 0.0d0, &
      -1.0d-300 /), &
    (/ 0.0d0, -0.0d0, 0.0d0 /))
  call run_given('218-1-', 'L', 'N', 'N', 'N', 4, 3, &
    (/ -1.9224018212046483d0, -0.7543270000043917d0, 0.8463364671200218d0, &
      0.28750847060582996d0, 1.9119954979568698d0, -0.25550837314478514d0, &
      0.674341911298382d0, 0.0d0, -1.1525731920975135d0, -0.14306004957438445d0, 0.0d0, &
      0.0d0, -1.937261698738328d0, 0.0d0, 0.0d0, 0.0d0 /), &
    (/ -1.491706071512132d-265, -9.9792015476736d+291, 0.26907310973344045d0, &
      -818301008.3177401d0 /))
  call run_given('244-1-', 'U', 'N', 'U', 'N', 2, 2, &
    (/ 0.0d0, 0.0d0, -0.09768695528511273d0, 0.0d0, 0.0d0, 0.07740145226819517d0 /), &
    (/ 5.397605346934028d-79, -9.9792015476736d+291 /))
  call run_given('249-1-', 'L', 'N', 'U', 'Y', 3, 0, &
    (/ 1.5609861209806921d0, -1.2095651399388747d0, -1.0859534759474703d0 /), &
    (/ 0.9649674491793697d0, -9.9792015476736d+291, 0.0d0 /))
  call run_given('250-1-dscal_N', 'U', 'N', 'U', 'Y', 4, 1, &
    (/ 0.0d0, 0.6926986862405662d0, -0.20474102590453858d0, -1.3489742800446456d-82, &
      0.9252560743714013d0, 0.111487560287069d0, 0.22506431267832605d0, &
      -2.800295065835506d-71 /), &
    (/ 9.9792015476736d+291, 0.3650894925767041d0, 4.8988833106573424d+201, &
      7.854549544476363d-90 /))
  call run_given('250-1-dscal_N_HALF_x_sx_offs', 'U', 'N', 'U', 'Y', 4, 1, &
    (/ 0.0d0, 0.6926986862405662d0, -0.20474102590453858d0, -1.3489742800446456d-82, &
      0.9252560743714013d0, 0.111487560287069d0, 0.22506431267832605d0, &
      -2.800295065835506d-71 /), &
    (/ 9.9792015476736d+291, 0.3650894925767041d0, 4.8988833106573424d+201, &
      7.854549544476363d-90 /))
  call run_given('251-1-scale_0_HALF', 'U', 'N', 'U', 'Y', 4, 1, &
    (/ 0.0d0, 0.6926986862405662d0, -0.20474102590453858d0, -1.3489742800446456d-82, &
      0.9252560743714013d0, 0.111487560287069d0, 0.22506431267832605d0, &
      -2.800295065835506d-71 /), &
    (/ 9.9792015476736d+291, 0.3650894925767041d0, 4.8988833106573424d+201, &
      7.854549544476363d-90 /))
  call run_given('259-1-idamax_j', 'U', 'N', 'U', 'N', 3, 2, &
    (/ 0.0d0, 0.0d0, 1.5054805588468354d0, 0.0d0, 0.44983791254918915d0, &
      1.6784862292364642d0, 0.09328256598360962d0, 0.05357904036230354d0, &
      1.883761384004616d0 /), &
    (/ 0.0d0, 9.9792015476736d+291, 0.0d0 /))
  call run_given('267-1-N_-_j_-_1', 'L', 'N', 'U', 'N', 5, 3, &
    (/ 0.09972218475291605d0, 0.0d0, -0.43428898203852073d0, -0.3392876718841902d0, &
      0.4018830914990432d0, -0.24161186313331684d0, 0.0d0, 0.649057492450372d0, &
      -3.718279207404938d+238, 0.19587827808963065d0, -0.6229403669121398d0, 0.0d0, &
      2.8240139587082175d+219, 0.0d0, 0.0d0, 0.0d0, -5.016456510113119d+204, 0.0d0, &
      0.0d0, 0.0d0 /), &
    (/ -0.0d0, 0.0d0, -1.6279332111523082d+237, 2.4616411914925366d+118, 1.0d+300 /))
  call run_given('267-1-j_1', 'L', 'N', 'U', 'N', 5, 3, &
    (/ 0.09972218475291605d0, 0.0d0, -0.43428898203852073d0, -0.3392876718841902d0, &
      0.4018830914990432d0, -0.24161186313331684d0, 0.0d0, 0.649057492450372d0, &
      -3.718279207404938d+238, 0.19587827808963065d0, -0.6229403669121398d0, 0.0d0, &
      2.8240139587082175d+219, 0.0d0, 0.0d0, 0.0d0, -5.016456510113119d+204, 0.0d0, &
      0.0d0, 0.0d0 /), &
    (/ -0.0d0, 0.0d0, -1.6279332111523082d+237, 2.4616411914925366d+118, 1.0d+300 /))
  call run_given('267-2-j_1', 'L', 'N', 'U', 'N', 5, 3, &
    (/ 0.09972218475291605d0, 0.0d0, -0.43428898203852073d0, -0.3392876718841902d0, &
      0.4018830914990432d0, -0.24161186313331684d0, 0.0d0, 0.649057492450372d0, &
      -3.718279207404938d+238, 0.19587827808963065d0, -0.6229403669121398d0, 0.0d0, &
      2.8240139587082175d+219, 0.0d0, 0.0d0, 0.0d0, -5.016456510113119d+204, 0.0d0, &
      0.0d0, 0.0d0 /), &
    (/ -0.0d0, 0.0d0, -1.6279332111523082d+237, 2.4616411914925366d+118, 1.0d+300 /))
  call run_given('274-1-', 'U', 'N', 'N', 'N', 4, 2, &
    (/ 0.0d0, 0.0d0, 4.060706939705039d-115, 0.0d0, 0.8253134851461805d0, &
      0.21972513441914931d0, -0.5948325496142881d0, -0.5656009044338022d0, &
      -1.0020841800044864d-292, 0.0d0, 0.28183143179948966d0, -1.1918311438976598d-38 /), &
    (/ -0.3767059489044855d0, -0.30434496016443946d0, 1.0d0, 1.5166747640403524d+117 /))
  call run_given('276-1-', 'U', 'N', 'N', 'Y', 1, 0, &
    (/ 0.5d0 /), &
    (/ 4.9896007738368d+291 /))
  call run_given('280-1-xmax_rec', 'L', 'N', 'N', 'Y', 5, 3, &
    (/ 0.8681299816202979d0, 0.04966481637659714d0, -0.6274814650544345d0, &
      0.9158638231064491d0, -4.225145870447851d-156, 0.0d0, 0.24166638275686014d0, &
      -0.35582661598726484d0, -4.9896007738368d+291, 0.11728953249626306d0, 0.0d0, 0.0d0, &
      9.989595361011175d+145, -0.7326468134916606d0, 0.0d0, 0.0d0, &
      1.731115519625348d+274, 0.0d0, 0.0d0, 0.0d0 /), &
    (/ 0.0d0, -1.5280123299159642d+206, 5.922386521532856d+225, -1.0d+300, -0.0d0 /))
  call run_given('286-1-', 'L', 'N', 'N', 'Y', 3, 2, &
    (/ 0.3356264472639312d0, -1.3967014978599092d-250, 9.588073174409622d-94, &
      -1.0020841800044864d-292, -9.989595361011175d+145, 0.0d0, 0.7943335910301346d0, &
      0.0d0, 0.0d0 /), &
    (/ -0.0d0, 1.0d0, 0.5d0 /))
  call run_given('293-1-xmax_rec', 'L', 'N', 'N', 'N', 4, 2, &
    (/ 3.273390607896142d+150, -0.9129760497775748d0, -0.9919568533040383d0, -1.0d-300, &
      0.0d0, -0.7612092149263291d0, -2.3307314785000646d-156, 0.6044976122698269d0, &
      0.0d0, 2.0d0, 0.0d0, 0.0d0 /), &
    (/ -0.0d0, -9.9792015476736d+291, -1.1767186841322676d-184, -1.0d+300 /))
  call run_given('303-1-xj_1_0', 'U', 'N', 'N', 'N', 2, 1, &
    (/ 0.0d0, 0.03503510217882466d0, -3.8933015827398975d+267, 0.0d0 /), &
    (/ -3.0d0, 8.872543021186608d+130 /))
  call run_given('305-1-xmax_0_0', 'U', 'N', 'N', 'Y', 4, 2, &
    (/ 0.0d0, 0.0d0, 0.67501624751604d0, 0.0d0, -3.986877980439027d-205, -1.0d0, 2.0d0, &
      2.203928984243098d+142, -7.639878464880714d+170, -1.0020841800044864d-292, &
      -1.3639663065038175d-253, -0.0d0 /), &
    (/ 2.442942347708797d-136, -1.0d+300, -2.367724345375879d+117, -0.0d0 /))
  call run_given('311-1-', 'U', 'N', 'N', 'N', 3, 0, &
    (/ -1.0d0, -3.273390607896142d+150, 1.8367099231598242d-40 /), &
    (/ 0.8037420584837636d0, 9.9792015476736d+291, -0.0d0 /))
  call run_given('316-1-', 'U', 'N', 'N', 'N', 3, 0, &
    (/ -1.0d0, -3.273390607896142d+150, 1.8367099231598242d-40 /), &
    (/ 0.8037420584837636d0, 9.9792015476736d+291, -0.0d0 /))
  call run_given('317-1-dscal_N', 'U', 'N', 'N', 'N', 5, 2, &
    (/ 0.0d0, 0.0d0, 1.0787710361549496d0, 0.0d0, 1.3014653281067016d-269, &
      -1.8902306882153408d0, 0.35786047920485053d0, 1.0d0, -1.4372788502077007d0, -1.0d0, &
      0.15447434277947725d0, -1.7061270790668797d0, -1.0856872300050765d-9, &
      -0.7504660774723002d0, 1.1972258725190656d0 /), &
    (/ 1.0020841800044864d-292, 9.9792015476736d+291, -0.33361915374808904d0, 1.0d0, &
      -0.7907313824588114d0 /))
  call run_given('317-1-dscal_N_HALF_x_sx_offs', 'L', 'N', 'N', 'N', 4, 3, &
    (/ -1.9224018212046483d0, -0.7543270000043917d0, 0.8463364671200218d0, &
      0.28750847060582996d0, 1.9119954979568698d0, -0.25550837314478514d0, &
      0.674341911298382d0, 0.0d0, -1.1525731920975135d0, -0.14306004957438445d0, 0.0d0, &
      0.0d0, -1.937261698738328d0, 0.0d0, 0.0d0, 0.0d0 /), &
    (/ -1.491706071512132d-265, -9.9792015476736d+291, 0.26907310973344045d0, &
      -818301008.3177401d0 /))
  call run_given('318-1-scale_0_HALF', 'L', 'N', 'N', 'N', 4, 3, &
    (/ -1.9224018212046483d0, -0.7543270000043917d0, 0.8463364671200218d0, &
      0.28750847060582996d0, 1.9119954979568698d0, -0.25550837314478514d0, &
      0.674341911298382d0, 0.0d0, -1.1525731920975135d0, -0.14306004957438445d0, 0.0d0, &
      0.0d0, -1.937261698738328d0, 0.0d0, 0.0d0, 0.0d0 /), &
    (/ -1.491706071512132d-265, -9.9792015476736d+291, 0.26907310973344045d0, &
      -818301008.3177401d0 /))
  call run_given('330-1-idamax_j', 'U', 'N', 'N', 'N', 4, 4, &
    (/ 0.0d0, 0.0d0, 0.0d0, 0.0d0, 0.9285620106051499d0, 0.0d0, 0.0d0, 0.0d0, &
      -9.078594170428617d-89, -5.527028390894566d+258, 0.0d0, 0.0d0, &
      -3.974446316289815d+233, -3.667028974044051d+240, -2.113616504099195d+227, 0.0d0, &
      -6.097165137335922d+141, -5.053968264940244d-175, -0.5116461205816112d0, &
      0.9119180794395125d0 /), &
    (/ -0.0d0, 9.9792015476736d+291, -0.0d0, 0.0d0 /))
  call run_given('331-1-xmax_Math_abs_x_offset', 'U', 'N', 'N', 'N', 5, 2, &
    (/ 0.0d0, 0.0d0, 1.0d0, 0.0d0, -0.7418933565457786d0, 3.059292921631217d-187, &
      0.6683007235025524d0, -0.7217363378599921d0, 3.273390607896142d+150, &
      -0.25111404585238273d0, -0.629549217237881d0, 0.10297446656179354d0, &
      -0.31636960958892923d0, -0.24466558324390353d0, -9.989595361011175d+145 /), &
    (/ -4.9896007738368d+291, 0.9484612224383564d0, -1.0d+300, 1.6345088595666106d+264, &
      0.0d0 /))
  call run_given('340-1-N_-_j_-_1', 'L', 'N', 'N', 'Y', 5, 5, &
    (/ 1.9808296924367685d0, 0.19533921461335346d0, 0.0d0, 0.0d0, -0.40787657974654645d0, &
      0.0d0, 1.2874129611474523d0, 0.5319077836032526d0, -0.38163306442165423d0, &
      -0.8991398233450669d0, 0.0d0, 0.0d0, 1.757393107636549d0, 0.34103601395200744d0, &
      0.9590607993114091d0, 0.0d0, 0.0d0, 0.0d0, 1.5458146634259329d0, &
      0.9181832046798353d0, 0.0d0, 0.0d0, 0.0d0, 0.0d0, -1.1847772091556235d0, 0.0d0, &
      0.0d0, 0.0d0, 0.0d0, 0.0d0 /), &
    (/ -0.0d0, 0.0d0, 4.7477838728798994d-66, 0.5734991391997315d0, 1.0d+300 /))
  call run_given('340-2-j_1', 'L', 'N', 'N', 'N', 5, 4, &
    (/ -1.0d-300, 0.0d0, 0.1652163198055776d0, -0.9240558510292581d0, 0.0d0, &
      -0.12870286550778098d0, -0.11150998487673236d0, -0.7440412006080342d0, &
      0.5919865749739048d0, 0.0d0, 0.8295890743981996d0, -0.1322410065365215d0, &
      0.750585465575841d0, 0.0d0, 0.0d0, 0.2843166167309119d0, 0.0d0, 0.0d0, 0.0d0, &
      0.0d0, -8.680078613937609d-147, 0.0d0, 0.0d0, 0.0d0, 0.0d0 /), &
    (/ 0.33114946788696087d0, 0.3975867607619552d0, -0.7546632819597904d0, &
      -0.4827490018134699d0, -0.4917613675313822d0 /))
  call run_given('350-1-', 'L', 'T', 'U', 'N', 2, 2, &
    (/ 1.8906601350245347d0, -9.9792015476736d+291, 0.0d0, -1.0765758064000754d0, 0.0d0, &
      0.0d0 /), &
    (/ 0.6902326399880614d0, 0.8485549836645625d0 /))
  call run_given('418-1-', 'U', 'T', 'N', 'Y', 4, 1, &
    (/ 0.0d0, -0.5664045501343927d0, -0.5d0, -0.9852805677732828d0, 1.2129047596099289d+229, &
      -1.3575229585495172d-15, 9.9792015476736d+291, -0.5d0 /), &
    (/ -0.0d0, 9.343878384890256d+195, -2.004168360008973d-292, -7.299904988195512d+193 /))
  call run_given('431-1-xmax_rec', 'U', 'T', 'N', 'Y', 5, 5, &
    (/ 0.0d0, 0.0d0, 0.0d0, 0.0d0, 0.0d0, 1.0d-300, 0.0d0, 0.0d0, 0.0d0, 0.0d0, &
      0.1457264195874921d0, -0.6588553384220486d0, 0.0d0, 0.0d0, 0.0d0, &
      0.9869767501889619d0, -0.7331621692204672d0, 1.0020841800044864d-292, 0.0d0, 0.0d0, &
      0.056692364186371025d0, -0.3100561934104451d0, -0.4376076373446768d0, &
      0.3232392870463614d0, 0.0d0, -0.7222462518709927d0, 0.0d0, 0.6775572913128685d0, &
      0.5753680316616632d0, 1024.0d0 /), &
    (/ -0.13489207398839853d0, -9.9792015476736d+291, -0.5d0, -2.3866690339840662d-153, &
      -0.3618556639933287d0 /))
  call run_given('441-1-xmax_0_0', 'L', 'T', 'N', 'Y', 2, 1, &
    (/ 2.13598703592091d+96, 1.3656093558537942d+244, -0.0d0, 0.0d0 /), &
    (/ -9.989595361011175d+145, -3.0d0 /))
  call run_given('274_ge', 'U', 'N', 'N', 'N', 2, 1, &
    (/ 0.0d0, 1.0d0, 2.0d0, 1.0020841800044864d-292 /), &
    (/ 0.0d0, 5.0d0 /))
  call run_given('418_ge', 'U', 'T', 'N', 'N', 1, 0, &
    (/ 0.5d0 /), &
    (/ 4.9896007738368d+291 /))
  call run_given('358_ge', 'U', 'T', 'N', 'N', 2, 1, &
    (/ 0.0d0, 1.0d0, 4.9896007738368d+291, -1.0d0 /), &
    (/ 2.0d0, 9.9792015476736d+291 /))
  call run_given('267_overread', 'L', 'N', 'U', 'N', 3, 1, &
    (/ 7.0d0, 0.0d0, 7.0d0, 9.9792015476736d+291, 7.0d0, 0.0d0 /), &
    (/ 0.0d0, 1.0d0, 0.0d0 /))


contains

  double precision function urand()
    ! Park-Miller minimal standard LCG, uniform in (0, 1).
    iseed = int( mod( int(iseed, 8) * 16807_8, 2147483647_8 ) )
    urand = dble(iseed) / 2147483647.0d0
  end function

  double precision function sgnrand(lo, hi)
    ! Random sign times 10**U(lo, hi).
    double precision, intent(in) :: lo, hi
    double precision :: e
    e = lo + (hi - lo) * urand()
    sgnrand = 10.0d0**e
    if (urand() < 0.5d0) sgnrand = -sgnrand
  end function

  double precision function moder(isdiag)
    logical, intent(in) :: isdiag
    if (isdiag) then
      moder = sign(1.0d0 + urand(), urand() - 0.5d0)
    else
      moder = 2.0d0 * urand() - 1.0d0
    end if
  end function

  double precision function entry(f, isdiag, sp)
    ! sp: this entry is in the family's special column.
    integer, intent(in) :: f
    logical, intent(in) :: isdiag, sp
    entry = moder(isdiag)
    select case (f)
    case (2)
      if (isdiag .and. sp) entry = sign(1.0d-300 * (1.0d0 + urand()), urand() - 0.5d0)
    case (3)
      if (isdiag .and. sp) entry = sign(1.0d-200 * (1.0d0 + urand()), urand() - 0.5d0)
    case (4)
      if (.not. isdiag .and. sp) entry = sgnrand(299.0d0, 300.0d0)
    case (5)
      if (sp) entry = sgnrand(299.0d0, 300.0d0)
    case (6)
      if (isdiag .and. sp) entry = 0.0d0
    case (7)
      if (isdiag) then
        entry = sgnrand(-300.0d0, 300.0d0)
      else
        entry = sgnrand(-5.0d0, 295.0d0)
      end if
    case (8)
      if (.not. isdiag) entry = sgnrand(40.0d0, 120.0d0)
    case (9)
      if (.not. isdiag .and. sp) entry = sgnrand(290.0d0, 291.3d0)
    case (10)
      if (isdiag) then
        entry = sgnrand(-150.0d0, 150.0d0)
      else
        entry = sgnrand(-5.0d0, 150.0d0)
      end if
    end select
  end function

  double precision function xentry(f)
    integer, intent(in) :: f
    select case (f)
    case (3)
      xentry = sgnrand(149.0d0, 151.0d0)
    case (5, 9)
      xentry = sgnrand(-1.0d0, 300.0d0)
    case (7)
      xentry = sgnrand(-5.0d0, 300.0d0)
    case (10)
      xentry = sgnrand(-5.0d0, 150.0d0)
    case default
      xentry = 2.0d0 * urand() - 1.0d0
    end select
  end function

  subroutine run_case(f, rep, cu, ct, cdg, cnm, n, kd)
    integer, intent(in) :: f, rep, n, kd
    character, intent(in) :: cu, ct, cdg, cnm
    double precision :: ab(9, 9), x0(9)
    integer :: i, j, jsp
    character(len=64) :: nm
    jsp = 1
    if (rep == 2) jsp = (n + 1) / 2
    if (rep == 3) jsp = n
    ab = 0.0d0
    do j = 1, n
      do i = 1, n
        if (cu == 'U' .and. i <= j .and. j - i <= kd) then
          ab(kd + 1 + i - j, j) = entry(f, i == j, j == jsp)
        else if (cu == 'L' .and. i >= j .and. i - j <= kd) then
          ab(1 + i - j, j) = entry(f, i == j, j == jsp)
        end if
      end do
    end do
    do i = 1, n
      x0(i) = xentry(f)
    end do
    write(nm, '(A,I0,A,I0,A,A,A,A,A)') '_f', f, 'r', rep, '_', cu, ct, cdg, cnm
    call finish(nm, cu, ct, cdg, cnm, n, kd, ab, x0)
  end subroutine

  subroutine finish(tag, cu, ct, cdg, cnm, n, kd, ab, x0)
    ! Column norms (NORMIN = 'Y') or a stale CNORM (NORMIN = 'N'), solve, print.
    character(*), intent(in) :: tag
    integer, intent(in) :: n, kd
    character, intent(in) :: cu, ct, cdg, cnm
    double precision, intent(in) :: ab(9, 9), x0(9)
    double precision :: abp(81), xb(9), cn0(9), cn(9), sc
    double precision :: dasum
    external :: dasum
    integer :: i, j, ldab, inf, jl
    character(len=80) :: nm
    ldab = kd + 1
    if (cnm == 'Y') then
      do j = 1, n
        if (cu == 'U') then
          jl = min(kd, j - 1)
          cn0(j) = dasum(jl, ab(kd + 1 - jl, j), 1)
        else
          jl = min(kd, n - j)
          cn0(j) = 0.0d0
          if (jl > 0) cn0(j) = dasum(jl, ab(2, j), 1)
        end if
      end do
    else
      cn0 = 3.0d0
    end if
    do j = 1, n
      do i = 1, ldab
        abp(i + (j - 1) * ldab) = ab(i, j)
      end do
    end do
    xb = x0
    cn = cn0
    sc = -1.0d0
    call dlatbs(cu, ct, cdg, cnm, n, kd, abp, ldab, xb, sc, cn, inf)
    ic = ic + 1
    write(nm, '(A,I0,A)') 'battery_', ic, trim(tag)
    call begin_test(nm)
    call print_char('uplo', cu)
    call print_char('trans', ct)
    call print_char('diag', cdg)
    call print_char('normin', cnm)
    call print_int('N', n)
    call print_int('kd', kd)
    call print_array('AB', abp, ldab * n)
    call print_array('x0', x0, n)
    call print_array('cnorm0', cn0, n)
    call print_array('x', xb, n)
    call print_scalar('scale', sc)
    call print_array('cnorm', cn, n)
    call print_int('info', inf)
    call end_test()
  end subroutine

  subroutine run_given(tag, cu, ct, cdg, cnm, n, kd, abv, xv)
    ! A case found by mutating base.js (ticket 0110): AB as LDAB*N, column-major.
    character(*), intent(in) :: tag
    integer, intent(in) :: n, kd
    character, intent(in) :: cu, ct, cdg, cnm
    double precision, intent(in) :: abv(*), xv(*)
    double precision :: ab(9, 9), x0(9)
    integer :: i, j
    ab = 0.0d0
    x0 = 0.0d0
    do j = 1, n
      do i = 1, kd + 1
        ab(i, j) = abv(i + (j - 1) * (kd + 1))
      end do
      x0(j) = xv(j)
    end do
    call finish('_' // tag // '_' // cu // ct // cdg // cnm, cu, ct, cdg, cnm, n, kd, ab, x0)
  end subroutine

end program
