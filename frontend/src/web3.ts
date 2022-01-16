export function resolveUri(uri: string) {
  if (uri.startsWith("ipfs://")) {
    const cid = uri.substring(7);
    return `https://ipfs.io/ipfs/${cid}`;
  }
  return uri;
}
