const API_KEY = '428cb0fed2ba2c363acad304263d5cdceb6054737a8846b11d384da72c887a7c'
 

const tickersHandlers = new Map(); // {}
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";

socket.addEventListener("message", e => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(
    e.data
  );

  if (type !== AGGREGATE_INDEX || newPrice === undefined) { 
    return;
  }
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach(fn => fn(newPrice));
 
});

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}



function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}



// socket.addEventListener("message", e => {
// 		const messageContent =  JSON.parse(e.data);
		
// 	  if(messageContent.MESSAGE !== 'INVALID_SUB'){
// 		return;
// 	  }
// 	console.log(messageContent);
// 	});
// socket.onmessage = function(e) {
// 	const messageContent =  JSON.parse(e.data);
// 	socketOnmessageCallback(messageContent);
// }

// export function socketOnmessageCallback(messageContent) {
// 	console.log('messageContent',messageContent);
// 	if(messageContent.MESSAGE === 'INVALID_SUB'){
// 		console.log('messageContent',messageContent);
		
// 		return  messageContent;
// 	}
// }

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = ticker => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};


