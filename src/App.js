import './App.css';
import './normal.css'
import { useState } from 'react';
import { Configuration, OpenAIApi } from 'openai';
import { inject } from '@vercel/analytics';
import Slider from 'react-slick';


inject();

// the handleSubmit front-end needs to be modified to call handleRequest if radio button is toggled yes. 


// envs
const orgId = process.env.ORG_ID;
const apiKey = "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";


function App() {

  // statehooks
  const [query, setQuery] = useState("");
  const [chatLog, setChatLog] = useState([])
  const [showOverlay, setShowOverlay] = useState(true);
  const [searchLiveInfo, setSearchLiveInfo] = useState(false);
  const [search, setSearch] = useState("Search");
  const [count, setCount] = useState(0);


  //open ai auth
  const configuration = new Configuration({
    orgId: orgId,
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

// First completion, sets the context as Kari.ai personality.
  async function getInitialCompletion(query) {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `
      Instructions: view the first nessage and respond to it accordingly.
      Context: You are an artificial financial advisor named Kari. 
      Conversational Style: You are a friendly, helpful, and knowledgeable financial advisor.
      Formatting: Money in USD, "$xxx,xxx.xx". (print out full number, not abbreviated)
      Abilities: The user can choose to pull in live financial data summaries for you to process. If user asks for live data, you will need to process it. If there is none, you will need to respond accordingly.

      Current feature list: Live Market Information (Stocks, Crypto, ETFs, Mutual Funds, Bonds, etc.), Smart Financial Analysis on Live Market Information, Insight generation - what to buy, what to sell, what to hold, etc.
      Current data sources: eodHistoricalData.com
      Current Data types: Current Asset prices, Historical Asset prices, macroeconomic data, crypto fundamentals, stock fundamentals, etc.
      Current limitation list: Max of 3 stocks requested at a time. Max of one financial statement requested at a time.
      future plans for platform: Charting, Personalized Advice, Alternative Data Sources, Intelligent insight generation, and more. 

      latestMessage: ${query}
      `,
      max_tokens: 2048,
      temperature: .6,
      stop: "/n",
    });
    return response.data.choices[0].text;
  }

// Second completion, mainly just responds to messages in a conversational manner.
  async function getContextCompletion(query, messages) {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `
      Don't mention outright: Conversational Style, Context, Instructions.
      Instructions: view the chatLog for context and respond to the latest message.
      Context: You are an artificial financial advisor named Kari. 

      latestMessage: ${query}
      chatLog: ${messages}
      `,
      max_tokens: 512,
      temperature: .5,
      stop: "/n",
    });
    return response.data.choices[0].text;
  }

  // clearChat button function
  function clearChat(){
    setCount(0);
    setChatLog([]);
    setShowOverlay(true);
  }


  // if messages array is empty, call getInitialCompletion
  // if messages array is not empty, call getContextCompletion
  async function handleSubmit(e) {
    e.preventDefault();
    if (query.trim() && query.length > 4) {
      let liveInfoResponse;
      if (searchLiveInfo === (true)) {
        console.log("Getting live Info Now");
        liveInfoResponse = await getLiveInfo(query);
        console.log(liveInfoResponse);
      } else {
        console.log("User did not request live info");
      }
      let chatLogNew = [...chatLog, { user: "me", message: `${query}` + (liveInfoResponse ? ` ${liveInfoResponse}` : "")}];
      setQuery("");
      setChatLog(chatLogNew);
      setShowOverlay(false);
      const messages = chatLogNew.map((message) => message.message).join("");
      let data;
      if (count === 0) {
        console.log("Getting initial completion");
        data = await getInitialCompletion(messages);
        setCount(count + 1);
      } else {
        console.log("Getting context completion");
        data = await getContextCompletion(query, messages);
      }
      setChatLog([...chatLogNew, { user: "gpt", message: `${data}`}]);
    }
  }
  



async function getLiveInfo(query) {
    setSearch("Loading...");
    var url = `https://kari-platform-node-production.up.railway.app/api_search`;
    console.log(`Sending ${query} to Server`);
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: {query} })
    });
    console.log(response.status);
    const results = await response.json();
    console.log(`Response received!`);
    console.log(results);
    setSearch("Search");
    return results;
}

  return (
    <div className="App">
<aside className="sidemenu"> 
  <h3 className="sidemenu-header">Kari</h3>
   <button className="side-menu-button" onClick={clearChat}> Clear Chat </button> 
   <button className="side-menu-button" onClick={() => window.open("https://forms.gle/6rQ4nsWddMqPgsCw9")}> Join Waitlist </button> 
   </aside>
      <section className="chatbox">
      {showOverlay && (
          <div className="overlay-card">
            <div>
              <h2>Get answers to questions like:</h2>
            </div>

          <div className="overlay-card-columns">
            <div className="overlay-card-column-example">
              <p onClick={() => setQuery("Compare the stocks TSLA, AAPL, MCD")}>Compare the stocks TSLA, AAPL, MCD</p>
              <p onClick={() => setQuery("What is the market cap of Ethereum?")}>What is the market cap of Ethereum?</p>
              <p onClick={() => setQuery("How has the SPY performed over the last year?")}>How has the SPY performed over the last year?</p>
            </div>
            <div className="overlay-card-column-example">
            <p onClick={() => setQuery("What is the current stock price for SPY?")}>What is the current stock price for SPY?</p>
              <p onClick={() => setQuery("What is the current unemployment rate of Croatia?")}>What is the current unemployment rate of Croatia?</p>
              <p onClick={() => setQuery("What is the annual population growth of the US?")}>What is the annual population growth of the US?</p>
            </div>
            <div className="overlay-card-column-example">
            <p onClick={() => setQuery("What are your current features?")}>What is your current feature list?</p>
              <p onClick={() => setQuery("What are your current limitations?")}>What are your current limitations?</p>
              <p onClick={() => setQuery("What are the future plans for this platform?")}>What are the future plans for this platform?</p>
            </div>
          </div>
        </div>        
        )}
        <div className="chat-log">
          {chatLog.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
    </div>
    <div className="chat-input-holder">
    <div className="stock-screening-tool">
      <form onSubmit={handleSubmit}> 
        <input 
          rows="1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="chat-input-textarea"
          placeholder="Ask a question or give a command"></input>

        <button className="submit-button" onClick={() => {setSearchLiveInfo(false); handleSubmit();}}>Send</button>
        <button className="submit-button" onClick={() => {setSearchLiveInfo(true); handleSubmit()}}>{search}</button>
      </form>
    </div>
  <p className='below-chatbox'>February 1 version. At this stage, feedback is very crucial. If you are beta-testing, please fill out <a href="https://forms.gle/YvjMHj8kPX7xDX2H8" target="_new">this form</a> and run through the feedback questions as it will help me a lot.</p>
</div>
</section>
</div>
  );
}
// array text strings to display

const text = [
  "Compare the stocks TSLA, AAPL, MCD",
  "Compare Ford, General Motors, and Tesla's price performance on January 25, 2023.",
  "What are the fundamentals of bitcoin?",
  "What is the max supply of Avalanche?",
  "What is the market dominance of Ethereum?",
  "How has the SPY performed over the last year?",
  "How has Microsoft performed between jan 2019 and jan 2020?",
  "Get me historical performance for SPY over the last week",
  "What is the current price of SPY?",
  "What are the latest price movements of AMZN?",
  "What the current volume traded for SPY?",
  "What is the current interest rate for the US?",
  "What is the total population of the US?",
  "What is the annual population growth of the US?",
  "What is the current inflation rate of the US?",
  "What is the current CPI for the US?",
  "What is the current GDP of the US?",
  "What is the current GDP per capita of the US?",
  "What is the GDP growth of the US this year?",
  "What is the current debt to GDP ratio?",
  "What is the current GNI?",
  "What is the current GNI per capita?",
  "What is the current fertility rate of the US?",
  "What is the current unemployment rate?",
  "Get me the latest balance sheet for AAPL",
  "Get me the latest income statement for AAPL",
  "Get me the latest cash flow statement for AAPL",
  "Get me the latest statement of shareholders equity for AAPL",
  "How much did Apple earn this year?",
  "How much cash does AAPL have on its balance sheet?",
  "How much cash flow came from investing activities for AAPL"
]


const ChatMessage = ({ message }) => {
  return (
    <div className="clearfix">
    <div className={`chat-message ${message.user === "gpt" && "chatgpt"}`}>
    <div className="chat-message-center">
    </div> 
    <div className="message">
      {message.message}
  </div>
</div>
</div>
  )
}
export default App;
