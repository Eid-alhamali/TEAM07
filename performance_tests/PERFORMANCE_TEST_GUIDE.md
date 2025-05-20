# Performance Testing Guide

This guide outlines how to perform load testing and performance evaluation of the Compresso Coffee Store system using Locust.

## Test Scenarios and Variables

### Independent Variables (What we control)
1. **Number of Users**
   - Concurrent users: 0-1000
   - User ramp-up rate: 10 users/second

2. **Request Patterns**
   - Browse products (40% of traffic)
   - Search products (20% of traffic)
   - Cart operations (15% of traffic)
   - Checkout process (10% of traffic)
   - View order history (5% of traffic)

3. **Think Time**
   - Random delay between actions: 1-5 seconds
   - Simulates realistic user behavior

### Dependent Variables (What we measure)
1. **Response Time**
   - Average response time
   - 95th percentile response time
   - 99th percentile response time

2. **Throughput**
   - Requests per second (RPS)
   - Successful transactions per second
   - Failed transactions per second

3. **Resource Utilization**
   - CPU usage
   - Memory consumption
   - Network I/O
   - Database connections

4. **Error Rates**
   - HTTP error responses
   - Application errors
   - Timeout errors

## Test Setup

### 1. Install Requirements
```bash
# Install Locust
pip install locust

# Install monitoring tools
pip install psutil
```

### 2. Start Locust
```bash
# Start Locust with web interface
locust -f performance_tests/locustfile.py --host=http://your-api-endpoint

# Start headless mode for CI/CD
locust -f performance_tests/locustfile.py --host=http://your-api-endpoint --headless -u 100 -r 10 --run-time 10m
```

### 3. Monitor System Resources
```bash
# Install monitoring tools in Kubernetes
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# View node metrics
kubectl top nodes

# View pod metrics
kubectl top pods
```

## Test Scenarios

### 1. Baseline Performance Test
- **Users**: 50 concurrent users
- **Duration**: 10 minutes
- **Purpose**: Establish baseline performance metrics

### 2. Load Test
- **Users**: Ramp up to 500 users
- **Duration**: 30 minutes
- **Purpose**: Verify system behavior under expected load

### 3. Stress Test
- **Users**: Ramp up to 1000 users
- **Duration**: 1 hour
- **Purpose**: Find breaking points and system limits

### 4. Endurance Test
- **Users**: 200 constant users
- **Duration**: 4 hours
- **Purpose**: Verify system stability over time

### 5. Spike Test
- **Users**: Sudden spike from 50 to 500 users
- **Duration**: 15 minutes
- **Purpose**: Test system recovery and stability

## Performance Targets

### Response Time Targets
- **API Endpoints**:
  - P95 < 500ms
  - P99 < 1000ms
- **Page Loads**:
  - P95 < 2000ms
  - P99 < 3000ms

### Throughput Targets
- Minimum 100 RPS under normal load
- Ability to handle 500 RPS during peak

### Error Rate Targets
- Error rate < 1% under normal load
- Error rate < 5% under peak load

### Resource Utilization Targets
- CPU: < 70% average utilization
- Memory: < 80% of allocated memory
- Database connections: < 80% of maximum pool

## Collecting Metrics

### 1. Locust Metrics
- Real-time metrics in web UI
- CSV reports for detailed analysis
- Custom metrics for business transactions

### 2. Kubernetes Metrics
```bash
# Get CPU and Memory usage for pods
kubectl top pods -n your-namespace

# Get detailed pod metrics
kubectl describe pod <pod-name>
```

### 3. Application Metrics
- Response times per endpoint
- Database query times
- Cache hit/miss rates
- Custom business metrics

## Analyzing Results

### 1. Generate Reports
```bash
# Start Locust with CSV output
locust -f locustfile.py --csv=test_results
```

### 2. Key Metrics to Analyze
- Response time distribution
- Error rate patterns
- Resource utilization trends
- System bottlenecks

### 3. Performance Analysis
```python
import pandas as pd

# Load test results
df = pd.read_csv('test_results_stats.csv')

# Calculate key metrics
avg_response_time = df['response_time'].mean()
p95_response_time = df['response_time'].quantile(0.95)
error_rate = (df['num_failures'] / df['num_requests']) * 100
```

## Optimization Process

1. **Identify Bottlenecks**
   - Analyze metrics to find slowest components
   - Check resource utilization patterns
   - Review error patterns

2. **Optimize Components**
   - Scale resources as needed
   - Optimize database queries
   - Implement caching where appropriate
   - Adjust Kubernetes resources

3. **Verify Improvements**
   - Rerun tests after changes
   - Compare metrics with baseline
   - Document improvements

## Continuous Monitoring

### 1. Set Up Monitoring
```bash
# Deploy Prometheus and Grafana
kubectl apply -f monitoring/

# Access Grafana dashboard
kubectl port-forward svc/grafana 3000:3000
```

### 2. Configure Alerts
- Set up alerts for:
  - High error rates
  - Slow response times
  - Resource constraints
  - System errors

### 3. Regular Testing
- Schedule periodic load tests
- Monitor trends over time
- Update performance baselines

## Best Practices

1. **Test Environment**
   - Use production-like data
   - Match production configuration
   - Isolate test environment

2. **Test Data**
   - Use realistic data volumes
   - Include various data patterns
   - Clean up test data

3. **Monitoring**
   - Monitor all system components
   - Collect detailed metrics
   - Keep historical data

4. **Documentation**
   - Document all test scenarios
   - Record baseline metrics
   - Track changes and improvements 