import { BrowserRouter as Router, Routes, Route } from "react-router";
import Login from "@/react-app/pages/Login";
import Dashboard from "@/react-app/pages/Dashboard";
import PDFPreview from "@/react-app/pages/PDFPreview";
import RequestsList from "@/react-app/pages/RequestsList";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/requests" element={<RequestsList />} />
        <Route path="/pdf/:id" element={<PDFPreview />} />
      </Routes>
    </Router>
  );
}
