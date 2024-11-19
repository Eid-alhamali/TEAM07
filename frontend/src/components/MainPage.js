// src/components/MainPage.js

import Navbar from './Navbar';
import './MainPage.css';
import mainCoffee from '../img/main_coffee.png';

// Import images directly from the src/img folder
import colombia from '../img/colombia.png';
import honduras from '../img/honduras.png';
import DominicanRepublic from '../img/DominicanRepublic.png';
import Nicaragua from '../img/Nicaragua.png';
import mexico from '../img/mexico.png';
import guatemala from '../img/guetamala.png';
import elsalvador from '../img/elsalvador.png';
import kenya from '../img/kenya.png';
import vietnam from '../img/vietnam.png';
import yemen from '../img/yemen.png';
import peru from '../img/peru.png';
import indonesia from '../img/indonesia.png';
import panama from '../img/panama.png';
import Rwanda from '../img/Rwanda.png';

const coffeeOptions = [
  { src: colombia, label: 'Colombia Coffee' },
  { src: honduras, label: 'Honduras Coffee' },
  { src: DominicanRepublic, label: 'Dominican R. Coffee' },
  { src: Nicaragua, label: 'Nicaragua Coffee' },
  { src: mexico, label: 'Mexico Coffee' },
  { src: guatemala, label: 'Guatemala Coffee' },
  { src: elsalvador, label: 'El Salvador Coffee' },
  { src: kenya, label: 'Kenya Coffee' },
  { src: vietnam, label: 'Vietnam Coffee' },
  { src: yemen, label: 'Yemen Coffee' },
  { src: peru, label: 'Peru Coffee' },
  { src: indonesia, label: 'Indonesia Coffee' },
  { src: panama, label: 'Panama Coffee' },
  { src: Rwanda, label: 'Rwanda Coffee' }
];

const MainPage = () => {
  return (
    <div className="main-page">
      <Navbar />
      <img src={mainCoffee} alt="Main Coffee" className="main-image" />
      <div className="main-content">
        <p>Your one-stop solution for efficient and effective compression services.</p>
      </div>

      {/* Horizontal scrollable section */}
      <div className="scrollable-container">
        {coffeeOptions.map((option, index) => (
          <div key={index} className="coffee-option">
            <div className="image-container">
              <img
                src={option.src}
                alt={option.label}
                className="coffee-image"
              />
            </div>
            <p className="coffee-label">{option.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainPage;