import Navbar from './Navbar';
import './MainPage.css';
import mainCoffee from '../assets/images/featured/main_page_banner.jpg';

// Import images directly from the src/assets/images/origins folder
import colombia from '../assets/images/origins/colombia.png';
import honduras from '../assets/images/origins/honduras.png';
import DominicanRepublic from '../assets/images/origins/DominicanRepublic.png';
import Nicaragua from '../assets/images/origins/nicaragua.png';
import mexico from '../assets/images/origins/mexico.png';
import guatemala from '../assets/images/origins/guatemala.png';
import elsalvador from '../assets/images/origins/elsalvador.png';
import kenya from '../assets/images/origins/kenya.png';
import vietnam from '../assets/images/origins/vietnam.png';
import yemen from '../assets/images/origins/yemen.png';
import peru from '../assets/images/origins/peru.png';
import indonesia from '../assets/images/origins/indonesia.png';
import panama from '../assets/images/origins/panama.png';
import Rwanda from '../assets/images/origins/rwanda.png';

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
      <img src={mainCoffee} alt="Main Coffee" className="main-page-image" />
      <div className="main-page-content">
        <p>Your one-stop solution for efficient and effective compression services.</p>
      </div>

      {/* Horizontal scrollable section */}
      <div className="main-page-scrollable-container">
        {coffeeOptions.map((option, index) => (
          <div key={index} className="main-page-coffee-option">
            <div className="main-page-image-container">
              <img
                src={option.src}
                alt={option.label}
                className="main-page-coffee-image"
              />
            </div>
            <p className="main-page-coffee-label">{option.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainPage;
