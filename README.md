# AI-Powered CI/CD Deployment Checker

## Project Purpose
A beginner-friendly, production-style CI/CD pipeline project that demonstrates modern DevOps practices. It features a unique **AI Deployment Analyzer** that reviews deployment data after every build and generates a natural language report explaining the deployment status, test results, security vulnerabilities, and health checks.

## Architecture
Developer &rarr; GitHub &rarr; GitHub Actions (Test, Build, Docker, Trivy Security Scan) &rarr; GitHub Container Registry (GHCR) &rarr; AWS EC2 Deployment &rarr; Health Check &rarr; AI Deployment Analysis &rarr; GitHub Actions Report Summary

## Technologies
- **Application**: Node.js, Express, Jest
- **DevOps**: Git, GitHub Actions, Docker, GitHub Container Registry (GHCR), AWS EC2
- **Security**: Trivy (Container Scanning)
- **AI**: Free LLM API (Gemini/Groq)

## Local Setup
1. Clone the repository: `git clone <repository_url>`
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Start the server: `npm start`
5. Verify health check: `curl http://localhost:3000/health`

## Docker Setup
1. Build the image: `docker build -t ai-cicd-checker:latest .`
2. Run the container: `docker run -d -p 3000:3000 --name cicd-test ai-cicd-checker:latest`
3. Verify health check: `curl http://localhost:3000/health`

## CI/CD Flow
The continuous integration and continuous deployment flow utilizes GitHub Actions to automate:
- **CI**: Runs on every Pull Request and Push to main. Checks out code, sets up Node.js, installs dependencies, runs automated Jest tests, and builds the Docker image.
- **CD**: Runs after CI on the main branch. Scans the Docker image for security vulnerabilities with Trivy, pushes the image to GHCR, SSHs into an AWS EC2 instance, pulls the latest image, starts a new container, and runs a health check.

## AI Deployment Checker
After a deployment finishes (success or failure), a script collects all relevant deployment data (commits, test results, security findings, health status) and sends it to an LLM. The AI generates a structured, easy-to-read report outlining the risk level and offering recommendations, which is posted directly back to the GitHub Actions UI.

## Future Improvements
- Add Nginx as a reverse proxy and configure HTTPS.
- Implement an automated rollback strategy.
- Send the AI reports to Slack or Discord.
