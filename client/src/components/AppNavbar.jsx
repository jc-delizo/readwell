import { useContext, useState } from 'react';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { FaArrowRightFromBracket, FaBagShopping, FaUser } from 'react-icons/fa6';
import { NavLink, useNavigate } from 'react-router-dom';
import UserContext from '../UserContext';
import readwell from '../assets/readwell.svg';
import './AppNavbar.css';

export default function AppNavbar() {
  const { user, signOut } = useContext(UserContext);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const close = () => setExpanded(false);

  const logout = () => {
    signOut();
    close();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" expanded={expanded} onToggle={setExpanded} className="site-nav" sticky="top">
      <Container>
        <Navbar.Brand as={NavLink} to="/" onClick={close} aria-label="ReadWell home">
          <img src={readwell} alt="ReadWell" className="site-nav__logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="site-navigation" />
        <Navbar.Collapse id="site-navigation">
          <Nav className="ms-auto align-items-lg-center" onClick={close}>
            <Nav.Link as={NavLink} to="/">Home</Nav.Link>
            <Nav.Link as={NavLink} to="/books">Browse books</Nav.Link>

            {user.id && !user.isAdmin && (
              <>
                <Nav.Link as={NavLink} to="/cart"><FaBagShopping aria-hidden="true" /> Cart</Nav.Link>
                <Nav.Link as={NavLink} to="/orders">My orders</Nav.Link>
              </>
            )}

            {user.isAdmin && (
              <>
                <Nav.Link as={NavLink} to="/book-archives">Catalog</Nav.Link>
                <Nav.Link as={NavLink} to="/view-orders">Orders</Nav.Link>
                <Nav.Link as={NavLink} to="/view-users">Customers</Nav.Link>
              </>
            )}

            {user.id ? (
              <Button variant="link" className="site-nav__logout" onClick={logout}>
                <FaArrowRightFromBracket aria-hidden="true" /> Sign out
              </Button>
            ) : (
              <Nav.Link as={NavLink} to="/login" className="site-nav__account">
                <FaUser aria-hidden="true" /> Sign in
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
