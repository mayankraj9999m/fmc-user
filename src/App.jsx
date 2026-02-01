// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Onboarding from "./pages/Onboarding";
// import Admin from "./pages/Admin";

// const Dashboard = () => <h1>Welcome to Student Dashboard</h1>;

// function App() {
    //     return (
        //         <BrowserRouter>
//             <Routes>
//                 <Route path="/" element={<Login />} />
//                 <Route path="/onboard" element={<Onboarding />} />
//                 <Route path="/dashboard" element={<Dashboard />} />
//                 <Route path="/admin" element={<Admin />} />
//             </Routes>
//         </BrowserRouter>
//     );
// }

// export default App;

import Header from "./components/Header";
import Route from "./router/Route";
import Routes from "./router/Routes";
import "./App.css";

// Pages
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { ThemeProvider } from "./context/ThemeProvider";
import Signup from "./pages/SignUp";

const App = () => {
    return (
        <ThemeProvider>
            <div className="app">
                <Header />
                <main className="main">
                    <Routes>
                        <Route path="/login">
                            <Login />
                        </Route>

                        <Route path="/signup">
                            <Signup />
                        </Route>

                        <Route path="*">
                            <NotFound />
                        </Route>
                    </Routes>
                </main>
            </div>
        </ThemeProvider>
    );
};

export default App;
