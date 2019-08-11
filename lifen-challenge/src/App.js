import React from "react";
import "./App.css";
// import DragDropDemo from "./components/DragDropDemo";
import Dropbox from "./components/Dropbox";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Better communication for medical practitioners</h1>
      </header>
      <section className="main-container">
        <Dropbox />
        {/* <DragDropDemo /> */}
      </section>
    </div>
  );
}

export default App;
