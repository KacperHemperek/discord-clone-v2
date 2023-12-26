export function getWebsocketConnection(path: string) {
  // console.log('getWebsocketConnection', import.meta.env.VITE_API_URL);
  try {
    const wsUrl = `${import.meta.env.VITE_WS_URL}${path}`;

    console.log('wsUrl', wsUrl);
    return new WebSocket(wsUrl);
  } catch (err) {
    console.error(err);
    return null;
  }
}
