import IpfsHttpClient from "ipfs-http-client";

export const ipfsClient = new IpfsHttpClient({
  host: "localhost",
  port: 5001,
  protocol: "http"
});

