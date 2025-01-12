import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './LineChart.css';

const LineChart = () => {
  const [orderMetrics, setOrderMetrics] = useState([]);
  
  // Initialize startDate and endDate based on available data
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');

  // State for metric selection
  const [dataKey, setDataKey] = useState('total_orders');

  useEffect(() => {
    const fetchOrderMetrics = () => {
      axios.get('http://localhost:5001/chart/getSalesData')
        .then(response => {
          setOrderMetrics(response.data);
        })
        .catch(err => {
          console.error('Error fetching order metrics:', err);
        });
    };
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setEndDate(formattedDate);
    fetchOrderMetrics();
  }, []);

  // Function to handle filtering based on date range
  const filterData = () => {
    if (!startDate && !endDate) {
      return orderMetrics;
    }
    return orderMetrics.filter((item) => {
      const itemDate = new Date(item.date);
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date('2100-12-31');
      return itemDate >= start && itemDate <= end;
    });
  };

  const filteredData = filterData();

  // Calculate total for the chosen range
  const calculateTotal = () => {
    return filteredData.reduce((total, item) => total + (item[dataKey] || 0), 0);
  };

  const total = calculateTotal();

  // Helper function to format date to 'YYYY-MM-DD'
  const formatDate = (date) => {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();

    return [
      year,
      month.length < 2 ? '0' + month : month,
      day.length < 2 ? '0' + day : day
    ].join('-');
  };

  return (
    <div className="lc-container">
      <h2 className="lc-title">Sales Data</h2>
      
      {/* Date Filters */}
      <div className="lc-filters">
        <div className="lc-filter">
          <label htmlFor="start-date" className="lc-label">Start Date:</label>
          <input
            type="date"
            id="start-date"
            className="lc-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={formatDate(new Date())} // Prevent selecting future dates
          />
        </div>
        <div className="lc-filter">
          <label htmlFor="end-date" className="lc-label">End Date:</label>
          <input
            type="date"
            id="end-date"
            className="lc-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            max={formatDate(new Date())} // Prevent selecting future dates
          />
        </div>
      </div>

      {/* Metric Selection Buttons */}
      <div className="lc-toggle-buttons">
        <button
          className={`lc-button ${dataKey === 'total_orders' ? 'active' : ''}`}
          onClick={() => setDataKey('total_orders')}
        >
          Total Orders
        </button>
        <button
          className={`lc-button ${dataKey === 'total_revenue' ? 'active' : ''}`}
          onClick={() => setDataKey('total_revenue')}
        >
          Total Revenue
        </button>
        <button
          className={`lc-button ${dataKey === 'total_profit' ? 'active' : ''}`}
          onClick={() => setDataKey('total_profit')}
        >
          Total Profit
        </button>
        <button
          className={`lc-button ${dataKey === 'cancelled_orders' ? 'active' : ''}`}
          onClick={() => setDataKey('cancelled_orders')}
        >
          Cancelled Orders
        </button>
         
        <button
          className={`lc-button ${dataKey === 'refunded_orders' ? 'active' : ''}`}
          onClick={() => setDataKey('refunded_orders')}
        >
          Refunded Orders
        </button>
        <button
          className={`lc-button ${dataKey === 'refund_cost' ? 'active' : ''}`}
          onClick={() => setDataKey('refund_cost')}
        >
          Refund Cost
        </button>
        
      </div>

      {/* Total Display */}
      <div className="lc-total-box">
        <h3>
          {dataKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}: {total} {['total_revenue', 'total_profit', 'cancelled_cost', 'refund_cost'].includes(dataKey) ? ' TL' : ''}
        </h3>
      </div>

      {/* Responsive Line Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <ReLineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#555' }} />
          <YAxis 
            label={{ 
              value: dataKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), 
              angle: -90, 
              position: 'insideLeft' 
            }} 
            tick={{ fontSize: 12, fill: '#555' }} 
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            name={dataKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            stroke="#2196F3"  
            activeDot={{ r: 8 }}
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;



 // Updated Dummy Data
  // const dummyData = [
  //   { date: '2024-01-01', total_orders: 400, total_revenue: 1200, total_profit: 800, cancelled_orders: 50 },
  //   { date: '2024-01-05', total_orders: 300, total_revenue: 900, total_profit: 600, cancelled_orders: 30 },
  //   { date: '2024-01-10', total_orders: 500, total_revenue: 1500, total_profit: 1000, cancelled_orders: 70 },
  //   { date: '2024-01-15', total_orders: 200, total_revenue: 600, total_profit: 400, cancelled_orders: 20 }
    
  // ];