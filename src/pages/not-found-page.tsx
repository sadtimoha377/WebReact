import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <div>
            <h2 className="text-xl font-bold">404 Page not found</h2>
            <Link className="underline" to="/requests">Go to requests</Link>
        </div>
    )
}

export default NotFoundPage;
