pipeline {
    agent any

    environment {
        IMAGE_NAME  = 'ecommerce-api'
        // Change to your Docker Hub username
        REGISTRY_NS = 'your-dockerhub-username'
        IMAGE_TAG   = "${env.BUILD_NUMBER}"
    }

    options {
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Install') {
            agent { docker { image 'node:20-alpine'; reuseNode true } }
            steps { sh 'npm ci' }
        }

        stage('Lint') {
            agent { docker { image 'node:20-alpine'; reuseNode true } }
            steps { sh 'npm run lint' }
        }

        stage('Test') {
            agent { docker { image 'node:20-alpine'; reuseNode true } }
            steps { sh 'npm test' }
            post {
                always { junit 'junit.xml' }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${REGISTRY_NS}/${IMAGE_NAME}:${IMAGE_TAG} -t ${REGISTRY_NS}/${IMAGE_NAME}:latest ."
            }
        }

        stage('Push Image') {
            when { branch 'main' }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                                  usernameVariable: 'DH_USER',
                                                  passwordVariable: 'DH_PASS')]) {
                    sh '''
                      echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
                      docker push ${REGISTRY_NS}/${IMAGE_NAME}:${IMAGE_TAG}
                      docker push ${REGISTRY_NS}/${IMAGE_NAME}:latest
                    '''
                }
            }
        }

        stage('Deploy to Staging') {
            when { branch 'main' }
            steps {
                sh '''
                  docker rm -f ecommerce-staging || true
                  docker run -d --name ecommerce-staging -p 3000:3000 ${REGISTRY_NS}/${IMAGE_NAME}:${IMAGE_TAG}
                  sleep 5
                  curl -f http://localhost:3000/health
                '''
            }
        }
    }

    post {
        success { echo 'Pipeline succeeded.' }
        failure { echo 'Pipeline failed. Check the stage logs.' }
        always  { cleanWs() }
    }
}
