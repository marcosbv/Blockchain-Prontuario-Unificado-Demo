#!/bin/bash

# Remove cartoes e diretorio dist
rm -vfr ~/.composer/cards
rm -vfr ./dist

# Para e remove a fabric
/media/extradisk/Blockchain/fabric-dev-servers/stopFabric.sh
/media/extradisk/Blockchain/fabric-dev-servers/teardownFabric.sh

# Remocao do container do Chaincode
docker ps -a | awk '{ print $1,$2 }' | grep 'dev-peer0.org1.example.com-prontuario-unificado-demo' | awk '{print $1 }' | xargs -I {} docker rm {}
docker images | grep 'dev-peer0.org1.example.com-prontuario-unificado-demo' | awk '{print $3 }' | xargs -I {} docker rmi {}
#sudo docker rmi $(docker images |grep 'dev-peer0.org1.example.com-prontuario-unificado-demo')
