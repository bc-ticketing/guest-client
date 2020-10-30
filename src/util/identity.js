import { argsToCid } from "idetix-utils";
import axios from "axios";

const IDETIX_APPROVAL_SERVER = "http://localhost:9191";

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
    try {
      for await (const chunk of ipfsInstance.cat(this.ipfsHash, {
        timeout: 2000,
      })) {
        ipfsData = Buffer(chunk, "utf8").toString();
      }
      const metadata = JSON.parse(ipfsData);
      this.title = metadata.approver.title;
      this.website.url = metadata.approver.url;
      this.twitter.url = metadata.approver.twitter;
      this.methods = metadata.approver.methods;
    } catch {
      return;
    }
  }

  async loadData(identitySC, ipfsInstance) {
    await this.fetchIPFSHash(identitySC);
    await this.loadIPFSMetadata(ipfsInstance);
    this.requestTwitterVerification();
    this.requestUrlVerification();
  }

  async requestTwitterVerification() {
    this.twitter.verification = await requestTwitterVerification(
      getHandle(this.twitter.url)
    );
  }

  async requestUrlVerification() {
    this.website.verification = await requestWebsiteVerification(
      this.website.url
    );
  }

  async getApprovalLevel(identitySC, userAddress) {
    const level = await identitySC.methods
      .getSecurityLevel(this.approverAddress, userAddress)
      .call();
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
  console.log(handle);
  const VERIFIER_URL = process.env.VUE_APP_TRUST_CERTIFICATES_API_URL;
  const VERIFIER_PORT = process.env.VUE_APP_TRUST_CERTIFICATES_API_PORT;
  try {
    let response = await axios.get(
      `${VERIFIER_URL}:${VERIFIER_PORT}/api/twitter?username=${handle}`
    );
    if (response.status == Number(200)) {
      console.log(response);
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function requestWebsiteVerification(url) {
  console.log(url);
  const VERIFIER_URL = process.env.VUE_APP_TRUST_CERTIFICATES_API_URL;
  const VERIFIER_PORT = process.env.VUE_APP_TRUST_CERTIFICATES_API_PORT;
  try {
    let response = await axios.get(
      `${VERIFIER_URL}:${VERIFIER_PORT}/api/website?url=${url}`
    );
    if (response.status == Number(200)) {
      console.log(response);
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function requestMailValidationCode(mail) {
  console.log(mail);
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
  console.log(number);
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
    console.log(response.status);
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
    console.log(response.status);
    if (response.status === 200) {
      return true;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
}
