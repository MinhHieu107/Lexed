import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";
import flashcard from "../assets/flashcard.png";
import dashboard from "../assets/dashboard.png";
import community from "../assets/community.png";

import { useAuth } from "../context/AuthContext";

function LandingPage() {

    const { user } = useAuth();

    

    return (
        <>
            <Navbar />

            <Hero />

            <FeatureCard
                title="Flashcard"
                description="Turn complex case studies into bite-sized quizzes to memorize faster and master the law on the go."
                image={flashcard}
                buttonText="Try out"
            />

            <FeatureCard
                reverse
                title="Study Dashboard"
                description="Stay ahead of your deadlines by transforming scattered notes into a smart digital roadmap."
                image={dashboard}
                buttonText="Get Started"
            />

            <FeatureCard
                title="Community Notes"
                description="Expand your legal network and share insights by joining specialised discussion hubs."
                image={community}
                buttonText="Follow us"
            />

            <Footer />
        </>
    );
}

export default LandingPage;