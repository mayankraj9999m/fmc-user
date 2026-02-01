import Link from "../router/Link";

const NotFound = () => {
    return (
        <div style={{ textAlign: "center", color: "red" }}>
            <h1>404</h1>
            <p>Page not found.</p>
            <Link href="/login">Go back to login</Link>
        </div>
    );
};

export default NotFound;
