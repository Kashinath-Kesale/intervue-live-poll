import { Routes, Route } from "react-router-dom";
import RoleSelect from "./pages/RoleSelect";
import StudentPage from "./pages/StudentPage";
import TeacherPage from "./pages/TeacherPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelect />} />
      <Route path="/student/*" element={<StudentPage />} /> 
      <Route path="/teacher" element={<TeacherPage />} />
    </Routes>
  );
}

export default App;
