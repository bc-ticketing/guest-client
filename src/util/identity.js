import { argsToCid } from "idetix-utils";

export class IdentityApprover {
  constructor(approverAddress) {
    if (typeof approverAddress === "object") {
      Object.assign(this, approverAddress);
      this.approverAddress = approverAddress.approverAddress;
      return;
    }
    this.approverAddress = approverAddress;
    this.title = "";
    this.methods = [];
    this.url = "";
    this.twitter = "";
    this.lastFetchedBlock = 0;
    this.ipfsHash = "";
  }

  async fetchIPFSHash(identitySC) {
    //const approverSC = new web3Instance.eth.Contract(ABI, this.approverAddress);
    const approverMetadata = await identitySC.methods.getApproverInfo(this.approverAddress).call();
    console.log(approverMetadata);
    this.ipfsHash = argsToCid(
        approverMetadata.hashFunction,
        approverMetadata.size,
        approverMetadata.digest
    );
    return true;
  }

  async loadIPFSMetadata(ipfsInstance) {
    var ipfsData = null;
    for await (const chunk of ipfsInstance.cat(this.ipfsHash, {
      timeout: 2000
    })) {
      ipfsData = Buffer(chunk, "utf8").toString();
    }
    const metadata = JSON.parse(ipfsData);
    console.log(metadata);
    this.title = metadata.approver.title;
    this.url = metadata.approver.url;
    this.twitter = metadata.approver.twitter;
    this.methods = metadata.approver.methods;
  }

  async loadData(identitySC, ipfsInstance) {
    await this.fetchIPFSHash(identitySC);
    await this.loadIPFSMetadata(ipfsInstance);
  }

  async getApprovalLevel(identitySC, userAddress) {
      const level = await identitySC.methods.getSecurityLevel(this.approverAddress, userAddress).call();
      let method = this.methods.find(m => Number(m.level) === Number(level));
      return method;
  }

  getMethodFromLevel(level){
      const method =  this.methods.find(m => Number(m.level) === Number(level));
      return method ? method.value : undefined;
  }
}
