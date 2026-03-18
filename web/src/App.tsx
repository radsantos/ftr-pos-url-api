import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { RedirectPage } from "./pages/RedirectPage";
import { NotFound } from "./pages/NotFound";
import { Header } from "./components/Header";
import './index.css';

export default function App() { 
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans">
        <Header/>
        <main className="pb-10">
          <Routes>
            <Route path='/' element={<HomePage/>}/>
            <Route path='/:short' element={<RedirectPage/>}/>
            <Route path='*' element={<NotFound/>}/>
          </Routes>
        </main>
      </div>
    </Router>
  ); 
}