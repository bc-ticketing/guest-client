###bash script to compile contracts and run environment
##author: MichaelBucher
##date: 25.06.2020

#deploy the contracts
cd idetix
truffle migrate --reset

#move compiled contracts' .js files to client
rm -rf ../src/contracts
cp -r contracts ../src/

#start vue.js client
cd ..
npm install
npm run serve
