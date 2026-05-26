import { Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Game from "./pages/game";
import NotFound from "./pages/404";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/play" element={<Game />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
