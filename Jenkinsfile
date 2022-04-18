pipeline {
	agent { dockerfile true }

	environment {
		DADESCOMUNALS_USER = credentials("dadescomunals-user")
	}
	
	stages {
		stage('Build') {
			steps {
				sh '''
					cd client
					npm install
					npm run build
					tar -cvf client.tar dist
					mv client.tar ../client.tar
				'''
				stash(name: 'client-dist', includes: 'client.tar', useDefaultExcludes: true)
            		}
        	}

		stage('Deploy') {
			when {
				expression {
                			currentBuild.result == null || currentBuild.result == 'SUCCESS' 
              			}
            		}

			steps {
				withCredentials([sshUserPrivateKey(credentialsId: 'jenkins-server', keyFileVariable: 'KEY_FILE')]) {
					unstash 'client-dist'
					sh '''
						mkdir -p server/static
						tar --strip-components=1 -C server/static -xvf client.tar
						tar -cvf icqa.tar wsgi.py requirements.txt gunicorn.config.py run.sh config server/static server/web server/geo.py server/__init__.py

						mkdir -p .ssh
						more ${KEY_FILE}
						cat ${KEY_FILE} > ./key_key.key
						eval $(ssh-agent -s)
						chmod 600 ./key_key.key
						ssh-add ./key_key.key

						scp -o "UserKnownHostsFile=/dev/null" -o "StrictHostKeyChecking=no" hemeroteca.tar ${DADESCOMUNALS_USER}@dadescomunals.lan:icqa.tar

						ssh -o "UserKnownHostsFile=/dev/null" -o "StrictHostKeyChecking=no" ${DADESCOMUNALS_USER}@dadescomunals.lan <<EOF
							cd /opt/www/apps/icqa_waves

							sudo tar -C . -xvf /home/${DADESCOMUNALS_USER}/icqa.tar
							if [ -d .venv ];
							then
								sudo rm -rf .venv
							fi

							sudo virtualenv -p python3 .venv
							sudo .venv/bin/pip install -r requirements.txt

							sudo ./run.sh
						EOF
					'''.stripIndent()
				}
			}
		}
    	}
}
