program test_dlaqr3
  use test_utils
  implicit none

  integer, parameter :: MAXN = 10
  double precision :: H(MAXN, MAXN), Z(MAXN, MAXN), SR(MAXN), SI(MAXN)
  double precision :: V(MAXN, MAXN), T(MAXN, MAXN), WV(MAXN, MAXN)
  double precision :: WORK(200)
  integer :: N, KTOP, KBOT, NW, NS, ND, ILOZ, IHIZ, NH, NV, LWORK
  logical :: WANTT, WANTZ
  integer :: i, j
  ! Test 6: a 50x50 matrix with a 40-wide window (between the old JS crossover 12 and ILAENV(12) = 75)
  integer, parameter :: NB6 = 50
  double precision :: H6(NB6, NB6), Z6(NB6, NB6), SR6(NB6), SI6(NB6)
  double precision :: V6(NB6, NB6), T6(NB6, NB6), WV6(NB6, NB6), WORK6(10000)
  integer(8) :: seed

  ! ---- Test 1: 6x6 upper Hessenberg, NW=3, expect deflation ----
  N = 6
  KTOP = 1
  KBOT = 6
  NW = 3
  WANTT = .true.
  WANTZ = .true.
  ILOZ = 1
  IHIZ = 6
  NH = 6
  NV = 6
  LWORK = 200

  ! Build an upper Hessenberg matrix with known eigenvalues
  H = 0.0d0
  H(1,1) = 4.0d0; H(1,2) = 1.0d0; H(1,3) = 0.5d0; H(1,4) = 0.1d0; H(1,5) = 0.2d0; H(1,6) = 0.3d0
  H(2,1) = 1.0d0; H(2,2) = 3.0d0; H(2,3) = 0.8d0; H(2,4) = 0.2d0; H(2,5) = 0.1d0; H(2,6) = 0.4d0
  H(3,2) = 0.5d0; H(3,3) = 2.0d0; H(3,4) = 0.7d0; H(3,5) = 0.3d0; H(3,6) = 0.2d0
  H(4,3) = 0.3d0; H(4,4) = 1.5d0; H(4,5) = 0.9d0; H(4,6) = 0.1d0
  H(5,4) = 0.2d0; H(5,5) = 1.0d0; H(5,6) = 0.6d0
  H(6,5) = 0.1d0; H(6,6) = 0.5d0

  ! Initialize Z = I
  Z = 0.0d0
  do i = 1, N
    Z(i,i) = 1.0d0
  end do

  call DLAQR3(WANTT, WANTZ, N, KTOP, KBOT, NW, H, MAXN, ILOZ, IHIZ, &
              Z, MAXN, NS, ND, SR, SI, V, MAXN, NH, T, MAXN, NV, WV, MAXN, WORK, LWORK)

  call begin_test('6x6 hessenberg NW=3')
  call print_int('ns', NS)
  call print_int('nd', ND)
  call print_array('H', H, MAXN*N)
  call print_array('Z', Z, MAXN*N)
  call print_array('SR', SR, N)
  call print_array('SI', SI, N)
  call end_test()

  ! ---- Test 2: 4x4 upper Hessenberg, NW=2 ----
  SR = 0.0d0; SI = 0.0d0
  N = 4
  KTOP = 1
  KBOT = 4
  NW = 2
  WANTT = .true.
  WANTZ = .true.
  ILOZ = 1
  IHIZ = 4
  NH = 4
  NV = 4
  LWORK = 200

  H = 0.0d0
  H(1,1) = 5.0d0; H(1,2) = 2.0d0; H(1,3) = 0.3d0; H(1,4) = 0.1d0
  H(2,1) = 1.0d0; H(2,2) = 4.0d0; H(2,3) = 1.5d0; H(2,4) = 0.2d0
  H(3,2) = 0.8d0; H(3,3) = 3.0d0; H(3,4) = 1.0d0
  H(4,3) = 0.5d0; H(4,4) = 2.0d0

  Z = 0.0d0
  do i = 1, N
    Z(i,i) = 1.0d0
  end do

  call DLAQR3(WANTT, WANTZ, N, KTOP, KBOT, NW, H, MAXN, ILOZ, IHIZ, &
              Z, MAXN, NS, ND, SR, SI, V, MAXN, NH, T, MAXN, NV, WV, MAXN, WORK, LWORK)

  call begin_test('4x4 hessenberg NW=2')
  call print_int('ns', NS)
  call print_int('nd', ND)
  call print_array('H', H, MAXN*N)
  call print_array('Z', Z, MAXN*N)
  call print_array('SR', SR, N)
  call print_array('SI', SI, N)
  call end_test()

  ! ---- Test 3: NW=1 (1-by-1 deflation window) ----
  SR = 0.0d0; SI = 0.0d0
  N = 4
  KTOP = 1
  KBOT = 4
  NW = 1
  WANTT = .true.
  WANTZ = .false.
  ILOZ = 1
  IHIZ = 4
  NH = 4
  NV = 4

  H = 0.0d0
  H(1,1) = 5.0d0; H(1,2) = 2.0d0; H(1,3) = 0.3d0; H(1,4) = 0.1d0
  H(2,1) = 1.0d0; H(2,2) = 4.0d0; H(2,3) = 1.5d0; H(2,4) = 0.2d0
  H(3,2) = 0.8d0; H(3,3) = 3.0d0; H(3,4) = 1.0d0
  H(4,3) = 0.5d0; H(4,4) = 2.0d0

  call DLAQR3(WANTT, WANTZ, N, KTOP, KBOT, NW, H, MAXN, ILOZ, IHIZ, &
              Z, MAXN, NS, ND, SR, SI, V, MAXN, NH, T, MAXN, NV, WV, MAXN, WORK, LWORK)

  call begin_test('4x4 hessenberg NW=1')
  call print_int('ns', NS)
  call print_int('nd', ND)
  call print_array('H', H, MAXN*N)
  call print_array('SR', SR, N)
  call print_array('SI', SI, N)
  call end_test()

  ! ---- Test 4: KTOP > KBOT (empty active block, quick return) ----
  SR = 0.0d0; SI = 0.0d0
  N = 4
  KTOP = 3
  KBOT = 2
  NW = 2

  call DLAQR3(WANTT, WANTZ, N, KTOP, KBOT, NW, H, MAXN, ILOZ, IHIZ, &
              Z, MAXN, NS, ND, SR, SI, V, MAXN, NH, T, MAXN, NV, WV, MAXN, WORK, LWORK)

  call begin_test('empty active block')
  call print_int('ns', NS)
  call print_int('nd', ND)
  call end_test()

  ! ---- Test 5: NW < 1 (empty deflation window, quick return) ----
  SR = 0.0d0; SI = 0.0d0
  N = 4
  KTOP = 1
  KBOT = 4
  NW = 0

  call DLAQR3(WANTT, WANTZ, N, KTOP, KBOT, NW, H, MAXN, ILOZ, IHIZ, &
              Z, MAXN, NS, ND, SR, SI, V, MAXN, NH, T, MAXN, NV, WV, MAXN, WORK, LWORK)

  call begin_test('empty deflation window')
  call print_int('ns', NS)
  call print_int('nd', ND)
  call end_test()

  ! ---- Test 6: JW = 40, so DLAQR3 solves the window with DLAHQR (JW <= NMIN = 75) ----
  seed = 1
  H6 = 0.0d0
  do j = 1, NB6
    do i = 1, min(j + 1, NB6)
      seed = mod(seed * 1103515245_8 + 12345_8, 2147483648_8)
      H6(i, j) = dble(seed) / 2147483648.0d0 - 0.5d0
    end do
  end do
  Z6 = 0.0d0
  do i = 1, NB6
    Z6(i, i) = 1.0d0
  end do
  SR6 = 0.0d0; SI6 = 0.0d0

  call DLAQR3(.true., .true., NB6, 1, NB6, 40, H6, NB6, 1, NB6, &
              Z6, NB6, NS, ND, SR6, SI6, V6, NB6, NB6, T6, NB6, NB6, WV6, NB6, WORK6, 10000)

  call begin_test('50x50 window 40')
  call print_int('ns', NS)
  call print_int('nd', ND)
  call print_array('H', H6, NB6*NB6)
  call print_array('Z', Z6, NB6*NB6)
  call print_array('SR', SR6, NB6)
  call print_array('SI', SI6, NB6)
  call end_test()

end program
