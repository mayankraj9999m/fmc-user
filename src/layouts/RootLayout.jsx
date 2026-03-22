import { Outlet } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function RootLayout() {
    return (
        <div className="app">
            <Header />
            <main className="main">
                <Outlet />
                <Footer />
            </main>
        </div>
    );
}
