import { argsToCid } from "idetix-utils";
import axios from "axios";

const IDETIX_APPROVAL_SERVER = "http://identity.icuzh.ch:9191";

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
    this.website = {
      url: "",
      verification: "pending",
    };
    this.twitter = {
      url: "",
      verification: "pending",
    };
    this.lastFetchedBlock = 0;
    this.ipfsHash = "";
  }

  async fetchIPFSHash(identitySC) {
    //const approverSC = new web3Instance.eth.Contract(ABI, this.approverAddress);
    const approverMetadata = await identitySC.methods
      .getApproverInfo(this.approverAddress)
      .call();
    this.ipfsHash = argsToCid(
      approverMetadata.hashFunction,
      approverMetadata.size,
      approverMetadata.digest
    );
    return true;
  }

  async loadIPFSMetadata() {
    var ipfsData;
    const url = "https://ipfs.io/ipfs/" + this.ipfsHash;
    const response = await axios.get(url, { timeout: 5000 });
    if (response.status == 200) {
      ipfsData = response.request.responseText;
    } else {
      return false;
    }
    const metadata = JSON.parse(ipfsData);
    this.title = metadata.approver.title;
    this.website.url = metadata.approver.url;
    this.twitter.url = metadata.approver.twitter;
    this.methods = metadata.approver.methods;
  }

  async loadData(identitySC, ipfsInstance) {
    await this.fetchIPFSHash(identitySC);
    await this.loadIPFSMetadata(ipfsInstance);
    this.requestTwitterVerification();
    this.requestUrlVerification();
  }

  async requestTwitterVerification() {
    if (!this.twitter.url || this.twitter.url.length === 0) {
      this.twitter.verification = false;
      return;
    }
    let address = await requestTwitterVerification(getHandle(this.twitter.url));
    console.log(address === this.approverAddress);
    this.twitter.verification = address === this.approverAddress;
    console.log(this.twitter.verification);
  }

  async requestUrlVerification() {
    if (!this.website.url || this.website.url.length === 0) {
      this.website.verification = false;
      return;
    }
    let address = await requestWebsiteVerification(this.website.url);
    this.website.verification = address === this.approverAddress;
  }

  async getApprovalLevel(identitySC, userAddress) {
    const level = await identitySC.methods
      .getSecurityLevel(this.approverAddress, userAddress)
      .call();
    console.log(`level: ${level}`);
    let method = this.methods.find((m) => Number(m.level) === Number(level));
    return method;
  }

  getMethodFromLevel(level) {
    const method = this.methods.find((m) => Number(m.level) === Number(level));
    return method ? method.value : undefined;
  }
}

export function getHandle(url) {
  return url.split("/").pop();
}

export async function requestTwitterVerification(handle) {
  try {
    let response = await axios.get(
      `${process.env.VUE_APP_TOKEN_VERIFIER}/api/twitter?username=${handle}`
    );
    if (response.status == Number(200)) {
      return response.data.data.eth_address;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function requestWebsiteVerification(url) {
  try {
    let response = await axios.get(
      `${process.env.VUE_APP_TOKEN_VERIFIER}/api/website?url=${url}`
    );
    if (response.status == Number(200)) {
      return response.data.data.eth_address;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function requestMailValidationCode(mail) {
  let response;
  try {
    response = await axios.post(
      `${IDETIX_APPROVAL_SERVER}/addEmailIdentity/?eMail=${mail}`
    );
    console.log(response);
  } catch {
    console.log("api call error");
  }
  return response;
}

export async function requestPhoneValidationCode(number) {
  let response;
  try {
    response = await axios.post(
      `${IDETIX_APPROVAL_SERVER}/addPhoneIdentity/?phoneNr=${number}`
    );
    console.log(response);
  } catch {
    console.log("api call error");
  }
  return response;
}

export async function requestKYCVerification(mrz, front, selfie) {
  let response;
  var formData = new FormData();
  formData.append("mrz", mrz);
  formData.append("front", front);
  formData.append("selfie", selfie);

  try {
    response = await axios.post(
      `${IDETIX_APPROVAL_SERVER}/AddKYCIdentity`,
      formData
    );
    console.log(response);
  } catch (e) {
    console.log(e);
    console.log("api call error");
  }
}

export async function requestMailVerification(
  mail,
  secret,
  signedSecret,
  address
) {
  let response;
  const paramString = `?eMail=${mail}&secret=${secret}&signedSecret=${signedSecret}&ethAddress=${address}`;
  try {
    response = await axios.post(
      `${IDETIX_APPROVAL_SERVER}/EmailIdentity/${paramString}`
    );
    if (response.status === 200) {
      return true;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function requestPhoneVerification(
  number,
  secret,
  signedSecret,
  address
) {
  let response;
  const paramString = `?phoneNr=${number}&secret=${secret}&signedSecret=${signedSecret}&ethAddress=${address}`;
  try {
    response = await axios.post(
      `${IDETIX_APPROVAL_SERVER}/PhoneIdentity/${paramString}`
    );
    if (response.status === 200) {
      return true;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
}
