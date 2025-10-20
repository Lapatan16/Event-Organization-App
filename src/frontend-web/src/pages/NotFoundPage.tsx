import { Link } from "react-router-dom";

export default function NotFoundPage()
{
    return(
        <>
            <div>
                <div style={{fontSize: '60px'}}>Error 404 Page Not Found</div>
                <Link style={{fontSize: '40px'}} to="/home">Početna stranica</Link>
            </div>
        </>
    )
}