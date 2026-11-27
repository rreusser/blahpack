program test_zhetrf
  use test_utils
  implicit none

  integer, parameter :: NMAX = 6, LWMAX = 256
  complex*16 :: A(NMAX, NMAX), WORK(LWMAX)
  double precision :: A_r(2*NMAX*NMAX)
  equivalence (A, A_r)
  integer :: IPIV(NMAX), INFO, n, LWORK
  ! Blocked path (N > NB = 64), upper: the row-max search covers row K
  ! (ticket 0108 found the JS zlahef skipping it). Seeded LCG input so the
  ! JS test regenerates it exactly.
  integer, parameter :: NB2 = 66
  complex*16 :: B(NB2, NB2), WORK2(NB2*64)
  double precision :: B_r(2*NB2*NB2)
  equivalence (B, B_r)
  integer :: IPIV2(NB2), i, j, k
  double precision :: x, re, im

  ! Test 1: Upper, 4x4 Hermitian matrix
  n = 4
  LWORK = LWMAX
  A = (0.0d0, 0.0d0)
  A(1,1) = (4.0d0, 0.0d0)
  A(1,2) = (1.0d0, 2.0d0)
  A(1,3) = (3.0d0, -1.0d0)
  A(1,4) = (0.5d0, 0.5d0)
  A(2,2) = (5.0d0, 0.0d0)
  A(2,3) = (2.0d0, 1.0d0)
  A(2,4) = (1.0d0, -2.0d0)
  A(3,3) = (7.0d0, 0.0d0)
  A(3,4) = (3.0d0, 0.0d0)
  A(4,4) = (6.0d0, 0.0d0)
  call ZHETRF('U', n, A, NMAX, IPIV, WORK, LWORK, INFO)
  call begin_test('upper_4x4')
  call print_int('n', n)
  call print_int('info', INFO)
  call print_array('A', A_r, 2*NMAX*n)
  call print_int_array('ipiv', IPIV, n)
  call end_test()

  ! Test 2: Lower, 4x4 Hermitian matrix
  n = 4
  A = (0.0d0, 0.0d0)
  A(1,1) = (4.0d0, 0.0d0)
  A(2,1) = (1.0d0, -2.0d0)
  A(2,2) = (5.0d0, 0.0d0)
  A(3,1) = (3.0d0, 1.0d0)
  A(3,2) = (2.0d0, -1.0d0)
  A(3,3) = (7.0d0, 0.0d0)
  A(4,1) = (0.5d0, -0.5d0)
  A(4,2) = (1.0d0, 2.0d0)
  A(4,3) = (3.0d0, 0.0d0)
  A(4,4) = (6.0d0, 0.0d0)
  call ZHETRF('L', n, A, NMAX, IPIV, WORK, LWORK, INFO)
  call begin_test('lower_4x4')
  call print_int('n', n)
  call print_int('info', INFO)
  call print_array('A', A_r, 2*NMAX*n)
  call print_int_array('ipiv', IPIV, n)
  call end_test()

  ! Test 3: N=0
  call ZHETRF('U', 0, A, NMAX, IPIV, WORK, LWORK, INFO)
  call begin_test('n0')
  call print_int('info', INFO)
  call end_test()

  ! Test 4: Lower, 6x6 (forces blocked path with NB=2 internal)
  n = 6
  A = (0.0d0, 0.0d0)
  A(1,1) = (0.01d0, 0.0d0)
  A(2,1) = (5.0d0, -1.0d0)
  A(2,2) = (0.02d0, 0.0d0)
  A(3,1) = (1.0d0, 1.0d0)
  A(3,2) = (2.0d0, -1.0d0)
  A(3,3) = (8.0d0, 0.0d0)
  A(4,1) = (0.5d0, -0.5d0)
  A(4,2) = (1.0d0, 1.0d0)
  A(4,3) = (3.0d0, 0.0d0)
  A(4,4) = (7.0d0, 0.0d0)
  A(5,1) = (2.0d0, 0.0d0)
  A(5,2) = (1.5d0, -0.5d0)
  A(5,3) = (0.0d0, 2.0d0)
  A(5,4) = (1.0d0, 0.5d0)
  A(5,5) = (6.0d0, 0.0d0)
  A(6,1) = (1.0d0, -1.0d0)
  A(6,2) = (0.0d0, -3.0d0)
  A(6,3) = (1.0d0, 0.0d0)
  A(6,4) = (2.0d0, -2.0d0)
  A(6,5) = (0.5d0, 1.0d0)
  A(6,6) = (5.0d0, 0.0d0)
  call ZHETRF('L', n, A, NMAX, IPIV, WORK, LWORK, INFO)
  call begin_test('lower_6x6')
  call print_int('n', n)
  call print_int('info', INFO)
  call print_array('A', A_r, 2*NMAX*n)
  call print_int_array('ipiv', IPIV, n)
  call end_test()

  ! Tests 5-6: Upper, N = 66, LCG seed 1, full and two-column WORK (NB = 64, 2)
  do k = 1, 2
    x = 1.0d0
    B = (0.0d0, 0.0d0)
    do j = 1, NB2
      do i = 1, j
        x = mod(x*16807.0d0, 2147483647.0d0)
        re = x/2147483647.0d0 - 0.5d0
        x = mod(x*16807.0d0, 2147483647.0d0)
        im = x/2147483647.0d0 - 0.5d0
        if (i == j) im = 0.0d0
        B(i,j) = dcmplx(re, im)
      end do
    end do
    if (k == 1) then
      LWORK = NB2*64
    else
      LWORK = NB2*2
    end if
    call ZHETRF('U', NB2, B, NB2, IPIV2, WORK2, LWORK, INFO)
    if (k == 1) then
      call begin_test('upper_66_blocked_nb64')
    else
      call begin_test('upper_66_blocked_nb2')
    end if
    call print_int('n', NB2)
    call print_int('info', INFO)
    call print_array('A', B_r, 2*NB2*NB2)
    call print_int_array('ipiv', IPIV2, NB2)
    call end_test()
  end do

end program
