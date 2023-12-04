import ReactDOM from "react-dom";
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.scss";
import Container from "react-bootstrap/Container";
import { MainView } from "./components/main-view/main-view";

const App = () => {
  return (
    <Container>
      <MainView />
    </Container>
  );
};

const container = document.querySelector("#root");
ReactDOM.render(<App />, container);
