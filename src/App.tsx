/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Import from "./pages/Import";
import BuySell from "./pages/BuySell";
import Detailing from "./pages/Detailing";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/import" element={<Import />} />
          <Route path="/buy-sell" element={<BuySell />} />
          <Route path="/detailing" element={<Detailing />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
}


