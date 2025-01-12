import { useEffect, useState } from 'react';
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
import './RefundChart.css';

const RefundChart = () => {
  // Updated Dummy Data

  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');



  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    
    const fetchRefundReport = () => {
        axios.get('http://localhost:5001/chart/getRefundData')
            .then(response => {
                setReportData(response.data);
                // setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching refund report:', err);
                // setError('Failed to fetch refund report.');
                // // setLoading(false);
            });
    };
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setEndDate(formattedDate);
    fetchRefundReport();
}, []);
 
  // State for date filters


  // State for metric toggle
  const [metric, setMetric] = useState('quantity'); // 'quantity' or 'cost'

  // State for data selection
  const [dataSelection, setDataSelection] = useState('Total'); // 'Total', 'Pending', 'Rejected', 'Approved'

  // Function to handle filtering
  const filterData = () => {
    if (!startDate && !endDate) {
      return reportData;
    }
    return reportData.filter((item) => {
      const itemDate = new Date(item.date);
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date('2100-12-31');
      return itemDate >= start && itemDate <= end;
    });
  };

  const filteredData = filterData();

  // Mapping for data keys based on selection
  const getDataKey = () => {
    const selection = dataSelection.toLowerCase();
    if (selection === 'total') {
      return metric === 'quantity' ? 'total_request' : 'total_request_cost';
    } else if (selection === 'pending') {
      return metric === 'quantity' ? 'total_pending' : 'pending_cost';
    } else if (selection === 'approved') {
      return metric === 'quantity' ? 'total_approved' : 'approved_cost';
    } else if (selection === 'rejected') {
      return metric === 'quantity' ? 'total_rejected' : 'rejected_cost';
    }
  };

  const dataKey = getDataKey();

  // Calculate total for the chosen range and selection
  const calculateTotal = () => {
    return filteredData.reduce((total, item) => total + (item[dataKey] || 0), 0);
  };

  const total = calculateTotal();

  return (
    <div className="rc-container">
      <h2 className="rc-title">Refunds Over Time</h2>
      <div className="rc-filters">
        <div className="rc-filter">
          <label htmlFor="start-date" className="rc-label">Start Date:</label>
          <input
            type="date"
            id="start-date"
            className="rc-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="rc-filter">
          <label htmlFor="end-date" className="rc-label">End Date:</label>
          <input
            type="date"
            id="end-date"
            className="rc-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="rc-toggle-buttons">
        {/* Metric Button Group */}
        <div className="rc-button-group rc-metric-group">
          <button
            className={`rc-button ${metric === 'quantity' ? 'active' : ''}`}
            onClick={() => setMetric('quantity')}
          >
            Quantity
          </button>
          <button
            className={`rc-button ${metric === 'cost' ? 'active' : ''}`}
            onClick={() => setMetric('cost')}
          >
            Cost
          </button>
        </div>
        {/* Data Selection Button Group */}
        <div className="rc-button-group rc-data-group">
          <button
            className={`rc-button ${dataSelection === 'Total' ? 'active' : ''}`}
            onClick={() => setDataSelection('Total')}
          >
            Total
          </button>
          <button
            className={`rc-button ${dataSelection === 'Pending' ? 'active' : ''}`}
            onClick={() => setDataSelection('Pending')}
          >
            Pending
          </button>
          <button
            className={`rc-button ${dataSelection === 'Rejected' ? 'active' : ''}`}
            onClick={() => setDataSelection('Rejected')}
          >
            Rejected
          </button>
          <button
            className={`rc-button ${dataSelection === 'Approved' ? 'active' : ''}`}
            onClick={() => setDataSelection('Approved')}
          >
            Approved
          </button>
        </div>
      </div>

      <div className="rc-total-box">
        <h3>
          Total {dataSelection} {metric === 'quantity' ? '' : 'Cost'}: {total} {metric === 'cost' ? ' TL' : ''}
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ReLineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#555' }} />
          <YAxis
            label={{
              value:
                dataSelection === 'Total'
                  ? metric === 'quantity'
                    ? 'Total Quantity'
                    : 'Total Cost'
                  : `${dataSelection} ${metric === 'quantity' ? 'Quantity' : 'Cost'}`,
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
            name={`${dataSelection} ${metric === 'quantity' ? 'Quantity' : 'Cost'}`}
            stroke="#000000"
            activeDot={{ r: 8 }}
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RefundChart;


 // const dummyData = [
  //   {
  //     date: '2024-01-01',
  //     total_request: 1000,
  //     total_request_cost: 5000,
  //     total_pending: 200,
  //     pending_cost: 1000,
  //     total_approved: 650,
  //     approved_cost: 3250,
  //     total_rejected: 150,
  //     rejected_cost: 750
  //   },
  //   {
  //     date: '2024-01-05',
  //     total_request: 900,
  //     total_request_cost: 4500,
  //     total_pending: 180,
  //     pending_cost: 900,
  //     total_approved: 585,
  //     approved_cost: 2925,
  //     total_rejected: 135,
  //     rejected_cost: 675
  //   },
   
  //   {
  //     date: '2024-05-15',
  //     total_request: 1500,
  //     total_request_cost: 7500,
  //     total_pending: 300,
  //     pending_cost: 1500,
  //     total_approved: 975,
  //     approved_cost: 4875,
  //     total_rejected: 225,
  //     rejected_cost: 1125
  //   }
  // ];
