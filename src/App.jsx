import Header from "./components/Header";
import Route from "./router/Route";
import Routes from "./router/Routes";
import "./App.css";

// Pages
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { ThemeProvider } from "./context/ThemeProvider";
import Signup from "./pages/SignUp";
import Profile from "./pages/Profile";

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

                        <Route path="/profile">
                            <Profile />
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
