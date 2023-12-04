import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./signup-view.scss";
import { useNavigate } from "react-router-dom";

export const SignupView = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usernameTakenError, setUsernameTakenError] = useState("");
  const [emailExistsError, setEmailExistsError] = useState("");

  const validateUsername = () => {
    if (username.length < 8) {
      setUsernameError("Username must be at least 8 characters long");
      return;
    }

    // API call to check if username exists
    fetch(`http://localhost:8080/users/check-username/${username}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Username already exists");
        }
        return response.json();
      })
      .then(() => setUsernameError(""))
      .catch((error) => setUsernameError(error.message));
  };

  const validateEmail = () => {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      return;
    }

    // API call to check if email exists
    fetch(`http://localhost:8080/users/check-email/${email}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Email already exists");
        }
        return response.json();
      })
      .then(() => setEmailError(""))
      .catch((error) => setEmailError(error.message));
  };

  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setPasswordError("Password must include special characters");
      return;
    }

    setPasswordError("");
  };

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setPasswordError("Password must include special characters.");
      return;
    }

    const data = {
      username: username,
      password: password,
      email: email,
      birthday: birthday,
    };

    fetch("http://localhost:8080/users", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          // If the response is not ok, parse the error message
          return response.json().then((data) => {
            throw new Error(data.error || "Signup failed");
          });
        }
        return response.json();
      })
      .then((data) => {
        // Handle successful response
        alert("Signup successful");
        navigate("/"); // Redirect to the home page
      })
      .catch((error) => {
        console.error(error);
        // Here, we set the appropriate error message
        if (error.message.includes("Username already exists")) {
          setUsernameError("Username is already taken.");
        } else if (error.message.includes("Email already exists")) {
          setEmailError("A user with this email already exists.");
        } else {
          alert(error.message);
        }
      });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formUsername">
        <Form.Label>Username:</Form.Label>
        <Form.Control
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            validateUsername(); // Call validation on username change
          }}
          onBlur={validateUsername}
          required
          minLength="8"
        />
        {usernameError && <div className="error-message">{usernameError}</div>}
      </Form.Group>

      <Form.Group controlId="formPassword">
        <Form.Label>Password:</Form.Label>
        <Form.Control
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validatePassword(); // Call validation on password change
          }}
          onBlur={validateUsername}
          required
          minLength="8"
        />
        {passwordError && <div className="error-message">{passwordError}</div>}
      </Form.Group>

      <Form.Group controlId="formEmail">
        <Form.Label>Email:</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateEmail(); // Call validation on email change
          }}
          required
        />
        {emailError && <div className="error-message">{emailError}</div>}
      </Form.Group>

      <Form.Group>
        <Form.Label>Birthday:</Form.Label>
        <Form.Control
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          required
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
};
