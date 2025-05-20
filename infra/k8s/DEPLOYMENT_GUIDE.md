# Frontend Deployment Guide for GKE

This guide explains how to deploy the Compresso Coffee Store frontend to Google Kubernetes Engine (GKE) with autoscaling capabilities.

## Prerequisites

1. **Google Cloud Account and Project**
   - Active Google Cloud account
   - Project with billing enabled
   - Project ID noted down for later use

2. **Required Tools**
   ```bash
   # Install Google Cloud SDK
   # Windows: https://cloud.google.com/sdk/docs/install#windows
   # Mac: brew install google-cloud-sdk
   # Linux: https://cloud.google.com/sdk/docs/install#linux

   # Install kubectl
   gcloud components install kubectl
   ```

## Step-by-Step Deployment Process

### 1. Initial Google Cloud Setup
```bash
# Initialize gcloud and set your project
gcloud init
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable container.googleapis.com
```

### 2. Create GKE Cluster
```bash
# Create a cluster with 3 nodes in us-central1-a
gcloud container clusters create compresso-cluster \
  --num-nodes=3 \
  --zone=us-central1-a \
  --machine-type=e2-medium

# Get cluster credentials
gcloud container clusters get-credentials compresso-cluster --zone=us-central1-a
```

### 3. Prepare Frontend Application
1. **Create Dockerfile in Frontend Directory**
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Push Docker Image**
   ```bash
   # Configure Docker to use Google Cloud credentials
   gcloud auth configure-docker

   # Build the image
   docker build -t gcr.io/YOUR_PROJECT_ID/compresso-frontend:latest ./frontend

   # Push to Google Container Registry
   docker push gcr.io/YOUR_PROJECT_ID/compresso-frontend:latest
   ```

### 4. Deploy to Kubernetes

1. **Update Configuration Files**
   - In `frontend-deployment.yaml`, replace `YOUR_PROJECT_ID` with your actual Google Cloud Project ID

2. **Apply Kubernetes Configurations**
   ```bash
   # Apply all configurations
   kubectl apply -f infra/k8s/frontend-deployment.yaml
   kubectl apply -f infra/k8s/frontend-service.yaml
   kubectl apply -f infra/k8s/frontend-hpa.yaml
   ```

### 5. Verify Deployment

```bash
# Check deployment status
kubectl get deployments
# Expected output:
# NAME                 READY   UP-TO-DATE   AVAILABLE   AGE
# frontend-deployment  2/2     2            2           1m

# Check pods
kubectl get pods
# Expected output:
# NAME                                  READY   STATUS    RESTARTS   AGE
# frontend-deployment-xxxxxx-xxxx       1/1     Running   0          1m
# frontend-deployment-xxxxxx-xxxx       1/1     Running   0          1m

# Check HPA status
kubectl get hpa
# Expected output:
# NAME           REFERENCE                       TARGETS   MINPODS   MAXPODS   REPLICAS
# frontend-hpa   Deployment/frontend-deployment  0%/70%    2         5         2

# Get service external IP
kubectl get services frontend-service
# Expected output:
# NAME               TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)        AGE
# frontend-service   LoadBalancer   10.x.x.x      35.x.x.x        80:3xxxx/TCP   1m
```

## Understanding the Configuration

### Deployment (frontend-deployment.yaml)
- Creates 2 initial replicas of the frontend
- Sets resource limits:
  - CPU: 100m request, 200m limit
  - Memory: 128Mi request, 256Mi limit
- Exposes port 3000

### Service (frontend-service.yaml)
- Type: LoadBalancer (creates external IP)
- Maps port 80 to container port 3000
- Automatically load balances between pods

### HPA (frontend-hpa.yaml)
- Maintains between 2 and 5 replicas
- Scales based on CPU utilization
- Target CPU utilization: 70%

## Monitoring and Maintenance

### Monitor Deployment
```bash
# Watch pods in real-time
kubectl get pods -w

# Check pod logs
kubectl logs -l app=frontend

# Check HPA status
kubectl describe hpa frontend-hpa
```

### Common Operations
```bash
# Scale manually if needed
kubectl scale deployment frontend-deployment --replicas=3

# Update image
kubectl set image deployment/frontend-deployment frontend=gcr.io/YOUR_PROJECT_ID/compresso-frontend:new-tag

# Delete deployment
kubectl delete -f infra/k8s/frontend-deployment.yaml
```

## Troubleshooting

### Common Issues and Solutions

1. **Pods Not Starting**
   ```bash
   kubectl describe pod <pod-name>
   kubectl logs <pod-name>
   ```

2. **HPA Not Scaling**
   ```bash
   kubectl describe hpa frontend-hpa
   kubectl top pods
   ```

3. **Service Not Accessible**
   ```bash
   kubectl describe service frontend-service
   kubectl get events
   ```

## Cleanup

To delete all resources when needed:
```bash
# Delete Kubernetes resources
kubectl delete -f infra/k8s/frontend-hpa.yaml
kubectl delete -f infra/k8s/frontend-service.yaml
kubectl delete -f infra/k8s/frontend-deployment.yaml

# Delete GKE cluster
gcloud container clusters delete compresso-cluster --zone=us-central1-a
``` 