import "./profile-view.scss";
import React, { useState, useEffect, useRef } from "react";
import { MovieCard } from "../movie-card/movie-card";
import { Row, Col, Container } from "react-bootstrap";

function ProfileView({
  user,
  favoriteMovies,
  onAddFavorite,
  onRemoveFavorite,
}) {
  const [userData, setUserData] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBirthday, setEditBirthday] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [birthdayError, setBirthdayError] = useState("");

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/users/${user.username}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setUserData(data);
      setEditUsername(data.username);
      setEditEmail(data.email);
      setEditBirthday(data.birthday);
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  const validateUsername = () => {
    if (!editUsername) {
      setUsernameError("Username is required");
      return false;
    }
    setUsernameError("");
    return true;
  };

  const validatePassword = () => {
    // Regular expression to check for at least one special character
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

    if (!editPassword) {
      setPasswordError("Password is required");
      return false;
    }

    if (!specialCharRegex.test(editPassword)) {
      setPasswordError("Password must include at least one special character");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const validateEmail = () => {
    if (!editEmail) {
      setEmailError("Email is required");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validateBirthday = () => {
    if (!editBirthday) {
      setBirthdayError("Birthday is required");
      return false;
    }

    setBirthdayError("");
    return true;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    // Perform validation checks
    const isUsernameValid = validateUsername();
    const isPasswordValid = validatePassword();
    const isEmailValid = validateEmail();
    const isBirthdayValid = validateBirthday();

    if (
      !isUsernameValid ||
      !isPasswordValid ||
      !isEmailValid ||
      !isBirthdayValid
    ) {
      return; // Stop the form submission if validation fails
    }

    const updatedData = {
      username: editUsername,
      email: editEmail,
      birthday: editBirthday,
    };

    if (editPassword) {
      updatedData.password = editPassword;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/users/${user.username}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Error in updating profile");
      }

      const data = await response.json();
      setUserData(data);
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile: ", error);
      alert("Failed to update profile");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (confirmation) {
      try {
        const response = await fetch(
          `http://localhost:8080/users/${user.username}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          alert("Account deleted successfully");
        } else {
          // Handle error scenario
          const errorData = await response.json();
          console.error("Error deleting account:", errorData.message);
          alert("Failed to delete account: " + errorData.message);
        }
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account");
      }
    }
  };

  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    <div className="profile-view-container">
      <div className="user-info">
        <h2>User Details:</h2>
        {userData ? (
          <div>
            <p>Username: {userData.username}</p>
            <p>Email: {userData.email}</p>
            <p>Birthday: {new Date(userData.birthday).toLocaleDateString()}</p>
          </div>
        ) : (
          <p>Loading user data...</p>
        )}
      </div>

      <h2 className="second-title">Favorites:</h2>
      <div ref={scrollContainerRef} className="favorites-scroll-container">
        <button className="scroll-btn left" onClick={scrollLeft}>
          &lt;
        </button>
        <Row noGutters className="favorites-row">
          {favoriteMovies.length > 0 ? (
            favoriteMovies.map((movie) => (
              <Col key={movie._id} xs={6} md={4} lg={3} xl={3} className="mb-3">
                <MovieCard
                  movie={movie}
                  onAddFavorite={onAddFavorite}
                  onRemoveFavorite={onRemoveFavorite}
                  isFavorite={true}
                />
              </Col>
            ))
          ) : (
            <p>No favorites added.</p>
          )}
        </Row>
        <button className="scroll-btn right" onClick={scrollRight}>
          &gt;
        </button>
      </div>

      <div className="updateUserAccount">
        <h3>Update Account</h3>
        <form onSubmit={handleProfileUpdate}>
          <input
            type="text"
            placeholder="New Username"
            value={editUsername}
            onChange={(e) => setEditUsername(e.target.value)}
            onBlur={validateUsername}
          />
          {usernameError && (
            <div className="error-message">{usernameError}</div>
          )}
          <input
            type="password"
            placeholder="New Password"
            onChange={(e) => setEditPassword(e.target.value)}
            onBlur={validatePassword}
          />
          {passwordError && (
            <div className="error-message">{passwordError}</div>
          )}
          <input
            type="email"
            placeholder="New Email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            onBlur={validateEmail}
          />
          {emailError && <div className="error-message">{emailError}</div>}
          <input
            type="date"
            placeholder="Date of Birth"
            value={editBirthday}
            onChange={(e) => setEditBirthday(e.target.value)}
            onBlur={validateBirthday}
          />
          {birthdayError && (
            <div className="error-message">{birthdayError}</div>
          )}
          <button type="submit" className="update-profile-button">
            Update Profile
          </button>
        </form>
        <button
          id="deleteAccountButton"
          className="delete-account-button"
          onClick={handleDeleteAccount}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

export default ProfileView;
