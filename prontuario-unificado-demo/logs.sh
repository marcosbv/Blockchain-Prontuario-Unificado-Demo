docker ps -a | awk '{ print $1,$2 }' | grep 'dev-peer0.org1.example.com-prontuario-unificado-demo' | awk '{print $1 }' | xargs -I {} docker logs -f {}