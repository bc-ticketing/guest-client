###bash script to compile contracts and run environment
##author: MichaelBucher
##date: 25.06.2020

#remove compiled contracts folder
rm -rf contracts

#copy the most recent contracts from the idetix repository to the guest-client
cp -r idetix/contracts contracts

#compile the contracts within the guest-client
cd contracts
truffle compile

#deploy the contracts
truffle migrate --reset

#start vue.js client
cd ../client
npm install
npm run serve
