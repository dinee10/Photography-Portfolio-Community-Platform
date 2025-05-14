import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Layout from "../../components/Layout";
import Spinner from "../../components/spinner/spinner"; 

function Landing() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000); 

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {loading ? (
                    <Spinner />
            ) : (
                <>
                    <Navbar />
                    <Layout />
                    <Footer />
                </>
            )}
        </>
    );
}

export default Landing;
