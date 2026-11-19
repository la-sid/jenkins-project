# Ecommerce API + Jenkins Pipeline

## Endpoints
- GET  /health
- GET  /products, /products/:id
- POST /cart/:userId        body: { "productId": 1, "qty": 2 }
- GET  /cart/:userId
- POST /checkout/:userId

## Run locally
    npm install
    npm test
    npm start

## Jenkins setup
1. Plugins: Pipeline, Git, Docker Pipeline, JUnit, Credentials Binding.
2. Jenkins host needs Docker installed; add the jenkins user to the docker group
   (`sudo usermod -aG docker jenkins`, then restart Jenkins).
3. Push this folder to a GitHub repo (branch: main).
4. Manage Jenkins > Credentials > add "Username with password"
   with ID `dockerhub-creds` (Docker Hub user + access token).
5. New Item > Multibranch Pipeline > add your Git repo as the branch source,
   Script Path = Jenkinsfile > Save. It scans and builds automatically.
6. Optional: add a GitHub webhook (`http://<jenkins-url>/github-webhook/`)
   so every push triggers a build.
7. Edit REGISTRY_NS in the Jenkinsfile to your Docker Hub username.
