pipeline {
  options {
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    // this variable defines which branches will be deployed
    SNAPSHOT_BRANCH_REGEX = /(^main$)/
    RELEASE_REGEX = /^v?([0-9]+(\.[0-9]+)*)(-(RC|rc|beta|alpha)\.[0-9]+)?$/
    REPO_NAME = sh(returnStdout: true, script: 'basename `git remote get-url origin` .git').trim()
    VERSION = sh(returnStdout: true, script: 'grep -Po "\\"version\\": \\"\\K([^\\"]+)" package.json').trim()
    LATEST_AUTHOR = sh(returnStdout: true, script: 'git show -s --pretty=%an').trim()
    LATEST_COMMIT_ID = sh(returnStdout: true, script: 'git describe --tags --long  --always').trim()
    DOCKER_IMAGE_NAME = 'repo.heigit.org/heigit/ohsome-country-reports-frontend'
    DOCKER_CREDENTIALS_ID = 'docker-heigit-ci-service'
    DOCKER_REGISTRY_URL = 'https://repo.heigit.org'

    PATH = "${WORKSPACE}/node_modules/.bin:${env.PATH}"
  }

  stages {
    stage ('Install') {
      steps {
        script {
          echo REPO_NAME
          echo LATEST_AUTHOR
          echo LATEST_COMMIT_ID

          echo env.BRANCH_NAME
          echo env.BUILD_NUMBER
          echo env.TAG_NAME
        }
        nodejs('NodeJS 24') {
          sh 'npm clean-install'
        }
      }
      post {
        failure {
          basicsend("*${REPO_NAME}*-build nr. ${env.BUILD_NUMBER} *failed* to install packages, check your packages.json file (<${env.BUILD_URL}|Open Build in Jenkins>). Latest commit from  ${LATEST_AUTHOR}.")
        }
      }
    }

    stage ('Build') {
      steps {
        nodejs('NodeJS 24') {
          sh 'npm run build:prod'
        }
      }
      post {
        failure {
          rocket_buildfail()
        }
      }
    }

    stage('Build and publish Docker image') {
      steps {
        script {
          docker.withRegistry(DOCKER_REGISTRY_URL, DOCKER_CREDENTIALS_ID) {
            if (env.BRANCH_NAME ==~ SNAPSHOT_BRANCH_REGEX) {
              dockerImage = docker.build(DOCKER_IMAGE_NAME + ':' + env.BRANCH_NAME)
              grypeScan(scanDest: 'docker:' + dockerImage.id, repName: 'myGrypeScanResult.txt', autoInstall: true)
              dockerImage.push()
            }
            if (VERSION ==~ RELEASE_REGEX && env.TAG_NAME ==~ RELEASE_REGEX) {
              dockerImage = docker.build(DOCKER_IMAGE_NAME + ':' + VERSION)
              grypeScan(scanDest: 'docker:' + dockerImage.id, repName: 'myGrypeScanResult.txt', autoInstall: true)
              dockerImage.push()
              dockerImage.push('latest')
            }
          }
          recordIssues enabledForFailure: true, tools: [grype()]
        }
      }
      post {
        failure {
          rocket_buildfail()
        }
      }
    }

    stage('Wrapping Up') {
         steps {
            encourage()
            status_change()
        }
    }
  }
}
