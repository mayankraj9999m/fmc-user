import { Outlet } from "react-router";
import Header from "../components/Header";

export default function RootLayout() {
    return (
        <div className="app">
            <Header />
            <main className="main">
                <Outlet />
            </main>
        </div>
    );
}
