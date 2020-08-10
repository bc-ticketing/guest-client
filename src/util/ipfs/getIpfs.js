import IpfsHttpClient from "ipfs-http-client";

const ipfs = new IpfsHttpClient({
  host: "localhost",
  port: 5001,
  protocol: "http"
});

function getIpfs() {
  return ipfs;
}

export default getIpfs;