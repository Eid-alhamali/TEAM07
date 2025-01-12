import './Partnership.css';
import { useNavigate } from "react-router-dom";

const Partnership = () => {
  const navigate = useNavigate();
  const logos = [
    { src: '/lavazza.png', alt: 'Lavazza' },
    { src: '/dominos.png', alt: "Domino's" },
    { src: '/subway.png', alt: 'Subway' },
    { src: '/burger.png', alt: 'Burger King' },
    { src: '/dunkins.png', alt: 'Nike' },
    { src: '/subway.png', alt: 'Adidas' },
  ];

  
  const getLogoRows = (logos, perRow) => {
    const rows = [];
    for (let i = 0; i < logos.length; i += perRow) {
      rows.push(logos.slice(i, i + perRow));
    }
    return rows;
  };

  const logoRows = getLogoRows(logos, 2); 

  return (
    <section className="partnership-section">
      <div className="partnership-container">
        <div className="partnership-content">
          <h2 className="partnership-heading">We Work With the Best Partners</h2>
          <p className="partnership-description">
          Compressor is a trusted name in premium coffee, dedicated to delivering exceptional coffee beans sourced from the finest regions around the world. We take pride in collaborating with well-known brands to bring unparalleled quality and flavor to coffee enthusiasts everywhere.
          </p>
          <button className="partnership-button" onClick={() => navigate("/about")}>READ MORE</button>
        </div>
        <div className="partnership-logos">
          {logoRows.map((row, rowIndex) => (
            <div className="partnership-logo-row" key={rowIndex}>
              {row.map((logo, logoIndex) => (
                <img
                  key={logoIndex}
                  src={logo.src}
                  alt={logo.alt}
                  className="partnership-logo"
                  loading="lazy" 
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partnership;
