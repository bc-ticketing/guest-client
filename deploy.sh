###bash script to compile and deploy contracts
##author: MichaelBucher
##date: 26.06.2020

#deploy the contracts
cd idetix/contracts
truffle compile
truffle migrate --reset

#move contracts (.sol) to client
cd ..
rm -rf ../src/contracts
cp -r contracts ../src/

#move compiled contracts' .js files to client
rm -rf ../src/abi
cp -r abi ../src/
