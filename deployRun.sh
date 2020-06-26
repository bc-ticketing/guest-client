###bash script to compile contracts and run environment
##author: MichaelBucher
##date: 25.06.2020

#deploy the contracts
cd idetix/contracts
truffle compile
truffle migrate --reset

#move compiled contracts' .js files to client
cd ..
rm -rf ../src/abi
cp -r abi ../src/

#start vue.js client
cd ..
npm install
npm run serve
