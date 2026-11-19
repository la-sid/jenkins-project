pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Check Node') {
            steps {
                bat 'node -v'
            }
        }

        stage('Install') {
            steps { bat 'npm install' }
        }

        stage('Lint') {
            steps { bat 'npm run lint' }
        }

        stage('Test') {
            steps { bat 'npm test' }
            post {
                always { junit allowEmptyResults: true, testResults: 'junit.xml' }
            }
        }

        stage('Deploy Locally') {
            steps {
                // Stop any older copy still using port 3000
                bat returnStatus: true, script: '''powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"'''

                // Start the app in the background and keep it alive after the build ends
                withEnv(['BUILD_ID=dontKillMe', 'JENKINS_NODE_COOKIE=dontKillMe']) {
                    bat 'start "" /b node src/server.js'
                }

                // Wait a few seconds, then check the app is up
                bat 'ping -n 6 127.0.0.1 > nul'
                bat '''powershell -Command "try { Invoke-WebRequest -UseBasicParsing http://localhost:3000/health | Out-Null } catch { exit 1 }"'''
            }
        }
    }

    post {
        success { echo 'Done! Open http://localhost:3000/products' }
        failure { echo 'Pipeline failed. Check the stage logs.' }
    }
}
