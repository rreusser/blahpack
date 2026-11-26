program test_dlatrs3
  use test_utils
  implicit none
  double precision :: a(400), x(400), cnorm(20), scale(20), work(1000)
  integer :: info, n, nrhs, lwork, i, j
  ! N > NB = MIN( 64, MAX( 8, ILAENV( 1, 'DLATRS' ) ) ) = 32 for several block rows.
  integer, parameter :: NBG = 70, RBG = 40, LWBG = 4000
  double precision :: ab(NBG*NBG), xb(NBG*RBG), cnb(NBG), scb(RBG), workb(LWBG)
  character(len=1) :: ul, tr

  ! Test 1: NRHS=1 falls back to unblocked dlatrs path
  ! Upper triangular, no transpose, non-unit, 3x3
  n = 3
  nrhs = 1
  lwork = 1000
  a = 0.0d0
  a(1) = 2.0d0; a(4) = 1.0d0; a(7) = 1.0d0
  a(5) = 3.0d0; a(8) = 2.0d0
  a(9) = 4.0d0
  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatrs3('U', 'N', 'N', 'N', n, nrhs, a, n, x, n, scale, cnorm, work, lwork, info)
  call begin_test('nrhs1_upper_N_nonunit')
  call print_array('x', x, n*nrhs)
  call print_array('scale', scale, nrhs)
  call print_int('info', info)
  call end_test()

  ! Test 2: NRHS=2 triggers blocked path
  ! Upper triangular, no transpose, non-unit
  n = 3
  nrhs = 2
  a = 0.0d0
  a(1) = 2.0d0; a(4) = 1.0d0; a(7) = 1.0d0
  a(5) = 3.0d0; a(8) = 2.0d0
  a(9) = 4.0d0
  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0
  x(4) = 4.0d0; x(5) = 5.0d0; x(6) = 6.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatrs3('U', 'N', 'N', 'N', n, nrhs, a, n, x, n, scale, cnorm, work, lwork, info)
  call begin_test('nrhs2_upper_N_nonunit')
  call print_array('x', x, n*nrhs)
  call print_array('scale', scale, nrhs)
  call print_int('info', info)
  call end_test()

  ! Test 3: NRHS=3, lower triangular, no transpose
  n = 3
  nrhs = 3
  a = 0.0d0
  a(1) = 2.0d0
  a(2) = 1.0d0; a(5) = 3.0d0
  a(3) = 1.0d0; a(6) = 2.0d0; a(9) = 4.0d0
  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0
  x(4) = 1.0d0; x(5) = 0.0d0; x(6) = -1.0d0
  x(7) = 4.0d0; x(8) = 5.0d0; x(9) = 6.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatrs3('L', 'N', 'N', 'N', n, nrhs, a, n, x, n, scale, cnorm, work, lwork, info)
  call begin_test('nrhs3_lower_N_nonunit')
  call print_array('x', x, n*nrhs)
  call print_array('scale', scale, nrhs)
  call print_int('info', info)
  call end_test()

  ! Test 4: NRHS=2, upper, transpose
  n = 3
  nrhs = 2
  a = 0.0d0
  a(1) = 2.0d0; a(4) = 1.0d0; a(7) = 1.0d0
  a(5) = 3.0d0; a(8) = 2.0d0
  a(9) = 4.0d0
  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0
  x(4) = 4.0d0; x(5) = 5.0d0; x(6) = 6.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatrs3('U', 'T', 'N', 'N', n, nrhs, a, n, x, n, scale, cnorm, work, lwork, info)
  call begin_test('nrhs2_upper_T_nonunit')
  call print_array('x', x, n*nrhs)
  call print_array('scale', scale, nrhs)
  call print_int('info', info)
  call end_test()

  ! Test 5: NRHS=2, lower, transpose
  n = 3
  nrhs = 2
  a = 0.0d0
  a(1) = 2.0d0
  a(2) = 1.0d0; a(5) = 3.0d0
  a(3) = 1.0d0; a(6) = 2.0d0; a(9) = 4.0d0
  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0
  x(4) = 6.0d0; x(5) = 7.0d0; x(6) = 8.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatrs3('L', 'T', 'N', 'N', n, nrhs, a, n, x, n, scale, cnorm, work, lwork, info)
  call begin_test('nrhs2_lower_T_nonunit')
  call print_array('x', x, n*nrhs)
  call print_array('scale', scale, nrhs)
  call print_int('info', info)
  call end_test()

  ! Test 6: NRHS=2, upper, no transpose, unit diagonal
  n = 3
  nrhs = 2
  a = 0.0d0
  a(1) = 99.0d0; a(4) = 1.0d0; a(7) = 1.0d0
  a(5) = 99.0d0; a(8) = 2.0d0
  a(9) = 99.0d0
  x(1) = 1.0d0; x(2) = 2.0d0; x(3) = 3.0d0
  x(4) = 4.0d0; x(5) = 5.0d0; x(6) = 6.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatrs3('U', 'N', 'U', 'N', n, nrhs, a, n, x, n, scale, cnorm, work, lwork, info)
  call begin_test('nrhs2_upper_N_unit')
  call print_array('x', x, n*nrhs)
  call print_array('scale', scale, nrhs)
  call print_int('info', info)
  call end_test()

  ! Test 7: NRHS=2, lower, transpose, unit diagonal
  n = 3
  nrhs = 2
  a = 0.0d0
  a(1) = 99.0d0
  a(2) = 1.0d0; a(5) = 99.0d0
  a(3) = 2.0d0; a(6) = 3.0d0; a(9) = 99.0d0
  x(1) = 6.0d0; x(2) = 5.0d0; x(3) = 4.0d0
  x(4) = 3.0d0; x(5) = 2.0d0; x(6) = 1.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatrs3('L', 'T', 'U', 'N', n, nrhs, a, n, x, n, scale, cnorm, work, lwork, info)
  call begin_test('nrhs2_lower_T_unit')
  call print_array('x', x, n*nrhs)
  call print_array('scale', scale, nrhs)
  call print_int('info', info)
  call end_test()

  ! Test 8: N=0 quick return
  n = 0
  nrhs = 2
  scale = 99.0d0  ! sentinel - dlatrs3 only initializes SCALE(1:NRHS) if N=0 still inits
  call dlatrs3('U', 'N', 'N', 'N', n, nrhs, a, 1, x, 1, scale, cnorm, work, lwork, info)
  call begin_test('n_zero')
  call print_array('scale', scale, nrhs)
  call print_int('info', info)
  call end_test()

  ! Test 9: NRHS=0 quick return
  n = 3
  nrhs = 0
  a = 0.0d0
  a(1) = 2.0d0; a(5) = 3.0d0; a(9) = 4.0d0
  scale = 99.0d0
  call dlatrs3('U', 'N', 'N', 'N', n, nrhs, a, n, x, n, scale, cnorm, work, lwork, info)
  call begin_test('nrhs_zero')
  call print_int('info', info)
  call end_test()

  ! Test 10: N=10 < NB = 32, so one block row (NBA=1).
  ! Upper triangular, no transpose, NRHS=4
  n = 10
  nrhs = 4
  a = 0.0d0
  ! Fill upper-triangular A with simple values
  do j = 1, n
    do i = 1, j
      if ( i == j ) then
        a((j-1)*n + i) = dble(j+1)
      else
        a((j-1)*n + i) = dble(i + j) * 0.1d0
      end if
    end do
  end do
  do j = 1, nrhs
    do i = 1, n
      x((j-1)*n + i) = dble(i) + 0.5d0*dble(j)
    end do
  end do
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatrs3('U', 'N', 'N', 'N', n, nrhs, a, n, x, n, scale, cnorm, work, lwork, info)
  call begin_test('blocked_upper_N_n10_nrhs4')
  call print_array('x', x, n*nrhs)
  call print_array('scale', scale, nrhs)
  call print_int('info', info)
  call end_test()

  ! Test 11: Larger blocked path, lower triangular transpose
  n = 10
  nrhs = 3
  a = 0.0d0
  do j = 1, n
    do i = j, n
      if ( i == j ) then
        a((j-1)*n + i) = dble(j+1)
      else
        a((j-1)*n + i) = dble(i + j) * 0.1d0
      end if
    end do
  end do
  do j = 1, nrhs
    do i = 1, n
      x((j-1)*n + i) = dble(i) + 0.5d0*dble(j)
    end do
  end do
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatrs3('L', 'T', 'N', 'N', n, nrhs, a, n, x, n, scale, cnorm, work, lwork, info)
  call begin_test('blocked_lower_T_n10_nrhs3')
  call print_array('x', x, n*nrhs)
  call print_array('scale', scale, nrhs)
  call print_int('info', info)
  call end_test()

  ! Test 12: N=1 with NRHS=3
  n = 1
  nrhs = 3
  a(1) = 5.0d0
  x(1) = 10.0d0
  x(2) = 20.0d0
  x(3) = 30.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatrs3('U', 'N', 'N', 'N', n, nrhs, a, 1, x, 1, scale, cnorm, work, lwork, info)
  call begin_test('n_one_nrhs3')
  call print_array('x', x, n*nrhs)
  call print_array('scale', scale, nrhs)
  call print_int('info', info)
  call end_test()

  ! Test 13: Identity matrix (upper)
  n = 3
  nrhs = 2
  a = 0.0d0
  a(1) = 1.0d0
  a(5) = 1.0d0
  a(9) = 1.0d0
  x(1) = 7.0d0; x(2) = 8.0d0; x(3) = 9.0d0
  x(4) = 1.0d0; x(5) = 2.0d0; x(6) = 3.0d0
  scale = 0.0d0
  cnorm = 0.0d0
  call dlatrs3('U', 'N', 'N', 'N', n, nrhs, a, n, x, n, scale, cnorm, work, lwork, info)
  call begin_test('identity')
  call print_array('x', x, n*nrhs)
  call print_array('scale', scale, nrhs)
  call print_int('info', info)
  call end_test()

  ! Test 14: NRHS=4 with NORMIN='Y' (precomputed norms)
  n = 4
  nrhs = 4
  a = 0.0d0
  a(1) = 3.0d0; a(5) = 1.0d0; a(9) = 2.0d0; a(13) = 1.0d0
  a(6) = 4.0d0; a(10) = 1.0d0; a(14) = 2.0d0
  a(11) = 2.0d0; a(15) = 1.0d0
  a(16) = 5.0d0
  do j = 1, nrhs
    do i = 1, n
      x((j-1)*n + i) = dble(i + j)
    end do
  end do
  ! Pre-compute infinity-norms of off-diagonal columns
  cnorm(1) = 0.0d0
  cnorm(2) = 1.0d0
  cnorm(3) = 3.0d0
  cnorm(4) = 4.0d0
  scale = 0.0d0
  call dlatrs3('U', 'N', 'N', 'Y', n, nrhs, a, n, x, n, scale, cnorm, work, lwork, info)
  call begin_test('normin_Y_upper_N')
  call print_array('x', x, n*nrhs)
  call print_array('scale', scale, nrhs)
  call print_int('info', info)
  call end_test()


  ! Multi-block cases (NBA = 3 at N = 70), printing the reference's local scale factors and
  ! block-norm bounds WORK(1:LSCALE+LANRM) as well.
  ul = 'U'; tr = 'N'; n = 70; nrhs = 4
  call gen(n, nrhs, ul, 0)
  call dlatrs3(ul, tr, 'N', 'N', n, nrhs, ab, n, xb, n, scb, cnb, workb, LWBG, info)
  call begin_test('blocked_upper_N_n70_nrhs4')
  call print_array('x', xb, n*nrhs)
  call print_array('scale', scb, nrhs)
  call print_int('info', info)
  call print_int('lwork_used', nbaw(n) * max(nbaw(n), min(nrhs, 32)) + nbaw(n)**2)
  call print_array('work', workb, nbaw(n) * max(nbaw(n), min(nrhs, 32)) + nbaw(n)**2)
  call end_test()

  ul = 'L'; tr = 'T'; n = 70; nrhs = 4
  call gen(n, nrhs, ul, 0)
  call dlatrs3(ul, tr, 'N', 'N', n, nrhs, ab, n, xb, n, scb, cnb, workb, LWBG, info)
  call begin_test('blocked_lower_T_n70_nrhs4')
  call print_array('x', xb, n*nrhs)
  call print_array('scale', scb, nrhs)
  call print_int('info', info)
  call print_int('lwork_used', nbaw(n) * max(nbaw(n), min(nrhs, 32)) + nbaw(n)**2)
  call print_array('work', workb, nbaw(n) * max(nbaw(n), min(nrhs, 32)) + nbaw(n)**2)
  call end_test()

  ul = 'U'; tr = 'T'; n = 70; nrhs = 35
  call gen(n, nrhs, ul, 0)
  call dlatrs3(ul, tr, 'N', 'N', n, nrhs, ab, n, xb, n, scb, cnb, workb, LWBG, info)
  call begin_test('blocked_upper_T_n70_nrhs35')
  call print_array('x', xb, n*nrhs)
  call print_array('scale', scb, nrhs)
  call print_int('info', info)
  call print_int('lwork_used', nbaw(n) * max(nbaw(n), min(nrhs, 32)) + nbaw(n)**2)
  call print_array('work', workb, nbaw(n) * max(nbaw(n), min(nrhs, 32)) + nbaw(n)**2)
  call end_test()

  ul = 'L'; tr = 'N'; n = 70; nrhs = 3
  call gen(n, nrhs, ul, 0)
  call dlatrs3(ul, tr, 'N', 'N', n, nrhs, ab, n, xb, n, scb, cnb, workb, LWBG, info)
  call begin_test('blocked_lower_N_n70_nrhs3')
  call print_array('x', xb, n*nrhs)
  call print_array('scale', scb, nrhs)
  call print_int('info', info)
  call print_int('lwork_used', nbaw(n) * max(nbaw(n), min(nrhs, 32)) + nbaw(n)**2)
  call print_array('work', workb, nbaw(n) * max(nbaw(n), min(nrhs, 32)) + nbaw(n)**2)
  call end_test()

  ul = 'U'; tr = 'N'; n = 70; nrhs = 3
  call gen(n, nrhs, ul, 1)
  call dlatrs3(ul, tr, 'N', 'N', n, nrhs, ab, n, xb, n, scb, cnb, workb, LWBG, info)
  call begin_test('blocked_upper_N_n70_scaled')
  call print_array('x', xb, n*nrhs)
  call print_array('scale', scb, nrhs)
  call print_int('info', info)
  call print_int('lwork_used', nbaw(n) * max(nbaw(n), min(nrhs, 32)) + nbaw(n)**2)
  call print_array('work', workb, nbaw(n) * max(nbaw(n), min(nrhs, 32)) + nbaw(n)**2)
  call end_test()

  ul = 'U'; tr = 'N'; n = 10; nrhs = 4
  call gen(n, nrhs, ul, 0)
  call dlatrs3(ul, tr, 'N', 'N', n, nrhs, ab, n, xb, n, scb, cnb, workb, LWBG, info)
  call begin_test('blocked_upper_N_n10_work')
  call print_array('x', xb, n*nrhs)
  call print_array('scale', scb, nrhs)
  call print_int('info', info)
  call print_int('lwork_used', nbaw(n) * max(nbaw(n), min(nrhs, 32)) + nbaw(n)**2)
  call print_array('work', workb, nbaw(n) * max(nbaw(n), min(nrhs, 32)) + nbaw(n)**2)
  call end_test()

contains

  integer function nbaw(nn)
    integer, intent(in) :: nn
    nbaw = max(1, (nn + 32 - 1) / 32)
  end function nbaw

  ! Triangular A (diag 2+j, small off-diagonal) and X; sc = 1 makes one diagonal entry tiny
  ! and one right-hand side huge, so the solve must scale.
  subroutine gen(nn, rr, uu, sc)
    integer, intent(in) :: nn, rr, sc
    character(len=1), intent(in) :: uu
    integer :: ii, jj
    ab = 0.0d0
    do jj = 1, nn
      do ii = 1, nn
        if (ii == jj) then
          ab((jj-1)*nn + ii) = 2.0d0 + dble(jj)
        else if ((uu == 'U' .and. ii < jj) .or. (uu == 'L' .and. ii > jj)) then
          ab((jj-1)*nn + ii) = 0.1d0*sin(dble(ii + 2*jj))
        end if
      end do
    end do
    do jj = 1, rr
      do ii = 1, nn
        xb((jj-1)*nn + ii) = dble(ii) + 0.5d0*dble(jj)
      end do
    end do
    if (sc == 1) then
      ab((40-1)*nn + 40) = 1.0d-300
      xb(50) = 1.0d300
    end if
    scb = 0.0d0
    cnb = 0.0d0
    workb = 0.0d0
  end subroutine gen

end program
