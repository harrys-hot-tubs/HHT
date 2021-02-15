import React from "react";
import Footer from "../components/Footer";
import "../scss/main.scss";

const App = ({ Component, pageProps }) => {
  return (
    <div>
      <Component {...pageProps} />
      <Footer />
    </div>
  );
};

export default App;
