import React, { useState } from "react";
import {
  Navbar,
  Container,
  Nav,
  Form,
  FormControl,
  Button,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "./navigation-bar.scss";

export const NavigationBar = ({ user, onLoggedOut, handleFilterChange }) => {
  const [filterKeyword, setFilterKeyword] = useState("");

  const handleInputChange = (e) => {
    const inputText = e.target.value;
    setFilterKeyword(inputText);
    handleFilterChange(inputText);
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          PopcornPixie
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!user && (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/signup">
                  Signup
                </Nav.Link>
              </>
            )}
            {user && (
              <>
                <Nav.Link as={Link} to="/">
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/profile">
                  Profile
                </Nav.Link>
                <Nav.Link onClick={onLoggedOut}>Logout</Nav.Link>
              </>
            )}
          </Nav>
          <Form className="d-flex">
            <FormControl
              type="text"
              placeholder="Search movies..."
              value={filterKeyword}
              onChange={handleInputChange}
              className="custom-search-box"
            />
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
