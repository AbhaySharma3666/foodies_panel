import React, { useContext, useMemo, Suspense, lazy } from 'react'
import Menubar from './components/Menubar/Menubar'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { StoreContext } from './context/StoreContext'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home/Home'))
const ExploreFood = lazy(() => import('./pages/ExploreFood/ExploreFood'))
const Contact = lazy(() => import('./pages/Contact/Contact'))
const FoodDetails = lazy(() => import('./pages/FoodDetails/FoodDetails'))
const Cart = lazy(() => import('./pages/Cart/Cart'))
const PlaceOrder = lazy(() => import('./pages/PlaceOrder/PlaceOrder'))
const MyOrders = lazy(() => import('./pages/MyOrders/MyOrders'))
const Login = lazy(() => import('./components/Login/Login'))
const Register = lazy(() => import('./components/Register/Register'))

const LoadingFallback = () => <div className="container mt-5 text-center">Loading...</div>

const App = () => {
  const { token } = useContext(StoreContext);

  // Memoize the routes to prevent unnecessary re-renders
  const routes = useMemo(() => (
    <Routes>
      <Route path='/' element={<Suspense fallback={<LoadingFallback />}><Home /></Suspense>} />
      <Route path='/explore-food' element={<Suspense fallback={<LoadingFallback />}><ExploreFood /></Suspense>} />
      <Route path='/contact' element={<Suspense fallback={<LoadingFallback />}><Contact /></Suspense>} />
      <Route path='/food/:id' element={<Suspense fallback={<LoadingFallback />}><FoodDetails /></Suspense>} />
      <Route path='/cart' element={<Suspense fallback={<LoadingFallback />}><Cart /></Suspense>} />
      <Route path='/order' element={token ? <Suspense fallback={<LoadingFallback />}><PlaceOrder /></Suspense> : <Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />
      <Route path='/login' element={token ? <Suspense fallback={<LoadingFallback />}><Home /></Suspense> : <Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />
      <Route path='/register' element={token ? <Suspense fallback={<LoadingFallback />}><Home /></Suspense> : <Suspense fallback={<LoadingFallback />}><Register /></Suspense>} />
      <Route path='/myorders' element={token ? <Suspense fallback={<LoadingFallback />}><MyOrders /></Suspense> : <Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />
    </Routes>
  ), [token])

  return (
    <ErrorBoundary>
      <Menubar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {routes}
    </ErrorBoundary>
  )
}

export default App