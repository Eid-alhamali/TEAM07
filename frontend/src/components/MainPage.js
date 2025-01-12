import './MainPage.css';
import LandingPage from "./LandingPage";
import BestSellingProducts from './BestSellingProducts';
import Partnership from './Partnership';


const MainPage = () => {
  return (
    
    <div className="main-page">    
      <LandingPage/>
      <Partnership/>
      <BestSellingProducts/>
    </div>
    
  );
};

export default MainPage;
