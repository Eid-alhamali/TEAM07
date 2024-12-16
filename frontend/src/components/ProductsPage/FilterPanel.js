// src/components/FilterPanel.js

import PropTypes from 'prop-types';
import './FilterPanel.css';

const FilterPanel = ({ filters, handleFilterChange, applyFilters, closePanel, clearFilters }) => (
  <div className="filter-panel">
    {/* Close Icon at the top right */}
    <button className="close-icon" onClick={closePanel}>
      &times;
    </button>

    <div className="panel-content">
      <h3>Filter Coffees</h3>
      <div className="filters">
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">All Types</option>
          <option value="Arabica">Arabica</option>
          <option value="Robusta">Robusta</option>
        </select>
        <select name="region" value={filters.region} onChange={handleFilterChange}>
          <option value="">All Regions</option>
          <option value="Colombia">Colombia</option>
          <option value="Honduras">Honduras</option>
          <option value="Dominican Republic">Dominican Republic</option>
        </select>
        <select name="stature" value={filters.stature} onChange={handleFilterChange}>
          <option value="">All Statures</option>
          <option value="Tall">Tall</option>
          <option value="Short">Short</option>
        </select>
        <select name="beanSize" value={filters.beanSize} onChange={handleFilterChange}>
          <option value="">All Bean Sizes</option>
          <option value="Below Average">Below Average</option>
          <option value="Average">Average</option>
          <option value="Large">Large</option>
          <option value="Very Large">Very Large</option>
        </select>
        <select name="optimalAltitude" value={filters.optimalAltitude} onChange={handleFilterChange}>
          <option value="">All Altitudes</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select name="leafTipColor" value={filters.leafTipColor} onChange={handleFilterChange}>
          <option value="">All Leaf Tip Colors</option>
          <option value="Green">Green</option>
          <option value="Bronze">Bronze</option>
        </select>
      </div>
      {/* Apply and Clear Filters Buttons with Space Between */}
      <div className="filter-buttons">
        <button onClick={applyFilters} className="apply-filters-button">Apply</button>
        <button onClick={clearFilters} className="clear-filters-button">Clear Filters</button>
      </div>
    </div>
  </div>
);

FilterPanel.propTypes = {
  filters: PropTypes.shape({
    type: PropTypes.string,
    region: PropTypes.string,
    stature: PropTypes.string,
    beanSize: PropTypes.string,
    optimalAltitude: PropTypes.string,
    leafTipColor: PropTypes.string,
  }).isRequired,
  handleFilterChange: PropTypes.func.isRequired,
  applyFilters: PropTypes.func.isRequired,
  closePanel: PropTypes.func.isRequired,
  clearFilters: PropTypes.func.isRequired,
};

export default FilterPanel;
