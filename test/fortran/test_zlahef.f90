program test_zlahef
  use test_utils
  implicit none

  integer, parameter :: NMAX = 6
  complex*16 :: A(NMAX, NMAX), W(NMAX, 3)
  double precision :: A_r(2*NMAX*NMAX)
  equivalence (A, A_r)
  integer :: IPIV(NMAX), INFO, n, nb, kb
  integer, parameter :: NU = 66
  complex*16 :: B(NU, NU), W2(NU, 64)
  double precision :: B_r(2*NU*NU)
  equivalence (B, B_r)
  integer :: IPIV2(NU), i, j, t
  double precision :: x, re, im

  ! Test 1: Lower, 6x6 Hermitian, NB=3
  n = 6
  nb = 3
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
  call ZLAHEF('L', n, nb, kb, A, NMAX, IPIV, W, NMAX, INFO)
  call begin_test('lower_6x6_nb3')
  call print_int('n', n)
  call print_int('nb', nb)
  call print_int('kb', kb)
  call print_int('info', INFO)
  call print_array('A', A_r, 2*NMAX*n)
  call print_int_array('ipiv', IPIV, n)
  call end_test()

  ! Tests 2-3: Upper, N = 66, NB = 64 and 8, the LCG Hermitian matrix of
  ! test_zhetrf.f90 (seed 1). The upper row max covers rows IMAX+1..K
  ! (ticket 0108): these pin the pivots zlahef chooses there.
  do t = 1, 2
    x = 1.0d0
    B = (0.0d0, 0.0d0)
    do j = 1, NU
      do i = 1, j
        x = mod(x*16807.0d0, 2147483647.0d0)
        re = x/2147483647.0d0 - 0.5d0
        x = mod(x*16807.0d0, 2147483647.0d0)
        im = x/2147483647.0d0 - 0.5d0
        if (i == j) im = 0.0d0
        B(i,j) = dcmplx(re, im)
      end do
    end do
    if (t == 1) then
      nb = 64
    else
      nb = 8
    end if
    IPIV2 = 0
    call ZLAHEF('U', NU, nb, kb, B, NU, IPIV2, W2, NU, INFO)
    if (t == 1) then
      call begin_test('upper_66_nb64')
    else
      call begin_test('upper_66_nb8')
    end if
    call print_int('n', NU)
    call print_int('nb', nb)
    call print_int('kb', kb)
    call print_int('info', INFO)
    call print_array('A', B_r, 2*NU*NU)
    call print_int_array('ipiv', IPIV2, NU)
    call end_test()
  end do

end program
