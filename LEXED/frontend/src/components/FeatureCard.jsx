import "../styles/FeatureCard.css";

function FeatureCard({
    title,
    description,
    image,
    buttonText,
    reverse = false,
}) {

    return (

        <section className={`feature ${reverse ? "reverse" : ""}`}>

            <div className="feature-image">

                <img src={image} alt={title}/>

            </div>

            <div className="feature-content">

                <h2>{title}</h2>

                <p>{description}</p>

                <button>

                    {buttonText}

                </button>

            </div>

        </section>

    )

}

export default FeatureCard;