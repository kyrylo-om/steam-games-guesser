import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Play from "./pages/Play";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/play" element={<Play />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
