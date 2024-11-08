// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cart from './components/Pages/Cart';
import Form from './components/Pages/Form';
import Purchase from './components/Pages/Purchase';
import Pay from './components/Pages/Pay';
import Dashboard from './components/Pages/Dashboard';
import ComingSoon from './components/ComingSoon';
import UserSelection from './components/Pages/SelectFaction';
import Preloader from './components/Preloader';
import ForgotPasswordForm from './components/ForgotPW';
import ProtectedRoute from './components/ProtectedRoute';
import Orders from './components/Pages/Orders';
import Admin from './components/Admin/Admin';
import NotFoundPage from './components/Error';

function App() {
  let [cart, setCart] = useState([]);
  let [apivalues, setApiValues] = useState({
    Roll_Number: '',
    Name: '',
    Phone: '',
    Section: '',
    Hostel: '',
  });

  useEffect(() => {
    async function getData() {
      let cartTemp = await JSON.parse(localStorage.getItem("cart"));
      await setCart(cartTemp === null ? [] : cartTemp);
    }
    getData();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Dashboard />} />
        {/* <Route path="/forgot-password" element={<ForgotPasswordForm />} /> */}
        {/* <Route path="/select" element={<UserSelection />} /> */}
        <Route path="/form" element={<Form cart={cart} apivalues={apivalues} setApiValues={setApiValues} />} />
        <Route path="*" element={<NotFoundPage />} />

        {/* Protected Routes */}
        <Route
          path="/form"
          element={
            <ProtectedRoute>
              <Cart cart={cart} setCart={setCart} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart cart={cart} setCart={setCart} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pay"
          element={
            <ProtectedRoute>
              <Pay/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase"
          element={
            <ProtectedRoute>
              <Purchase />
            </ProtectedRoute>
          }
        />
         <Route
          path="/order"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;