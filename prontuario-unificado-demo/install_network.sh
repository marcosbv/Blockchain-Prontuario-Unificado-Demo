#!/bin/bash

# Inicia fabric
/media/extradisk/Blockchain/fabric-dev-servers/startFabric.sh
/media/extradisk/Blockchain/fabric-dev-servers/createPeerAdminCard.sh

# Gera archive com model, js e acls do chaincode
npm install

# Roda composer para instalar e iniciar a rede blockchain
composer network install --card PeerAdmin@hlfv1 --archiveFile ./dist/prontuario-unificado-demo.bna 
composer network start --networkName prontuario-unificado-demo --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --file networkadmin.card --card PeerAdmin@hlfv1

# Importa card para Composer
composer card import --file networkadmin.card

# Inicia composer rest server em background
composer-rest-server --card admin@prontuario-unificado-demo --namespaces never --websockets false --port 3000
