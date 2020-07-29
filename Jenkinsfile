pipeline {
  agent {
    docker {
      label 'swarm'
      image 'wwt/jenkins/nodejs:release'
    }
  }
  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }
  stages {
    stage('Install Dependencies') {
      steps {
        sh 'ci init'
        sh 'npm install'
      }
    }
    stage('Package') {
      steps {
        sh 'grunt --no-color package'
      }
    }
    stage('Publish') {
      when {
        branch 'master'
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'artifactory_deployer',
                   usernameVariable: 'ARTIFACTORY_USERNAME', passwordVariable: 'ARTIFACTORY_PASSWORD')]) {
          sh 'ci commit'
        }
      }
    }
    stage('Deploy') {
      when {
        branch 'master'
      }
      steps {
        milestone(10)
        lock(resource: "$JOB_NAME-deploy", inversePrecedence: true) {
          milestone(20)
          withCredentials([usernamePassword(credentialsId: 'scout_deployer',
                   usernameVariable: 'SCOUT_USERNAME', passwordVariable: 'SCOUT_PASSWORD')]) {
            sh 'ci deploy'
          }
        }
      }
    }
  }
  post {
    always {
      deleteDir()
    }
    failure {
      emailext (
        subject: '${DEFAULT_SUBJECT}',
        body: '${DEFAULT_CONTENT}',
        recipientProviders: [[$class: 'DevelopersRecipientProvider'], [$class: 'CulpritsRecipientProvider'], [$class: 'RequesterRecipientProvider']]
      )
    }
  }
}
