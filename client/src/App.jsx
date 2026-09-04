import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { UserProvider } from './UserContext';
import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import BookArchives from './pages/BookArchives';
import BookPage from './pages/BookPage';
import Books from './pages/Books';
import Cart from './pages/Cart';
import ErrorPage from './pages/ErrorPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Orders from './pages/Orders';
import Register from './pages/Register';
import ViewUsers from './pages/Users';
import ViewOrders from './pages/ViewOrders';

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <AppNavbar />
        <main id="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/bookpage/:id" element={<BookPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
            </Route>

            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/book-archives" element={<BookArchives />} />
              <Route path="/view-orders" element={<ViewOrders />} />
              <Route path="/view-users" element={<ViewUsers />} />
            </Route>

            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </main>
      </UserProvider>
    </BrowserRouter>
  );
}
