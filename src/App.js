import './App.css';
import './normal.css'
import { useState } from 'react';
import { Configuration, OpenAIApi } from 'openai';
import { inject } from '@vercel/analytics';
import { KariFinancialAnalyst } from './Models/KariFinancialAnalyst';
import { KariSportsAnalyst } from './Models/KariSportsAnalyst';
import { KariRealEstateAnalyst } from './Models/KariRealEstateAnalyst';
import { KariMarketingAnalyst } from './Models/KariMarketingAnalyst';

inject();

// envs
const orgId = process.env.ORG_ID;
const apiKey = "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";

function App() {

// statehooks
const [query, setQuery] = useState("");
const [chatLog, setChatLog] = useState([])
const [showOverlay, setShowOverlay] = useState(true);
const [count, setCount] = useState(0);
const [dataSource, setDataSource] = useState([]);

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
      Don't mention outright: Context
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
  async function clearChat(){
    setCount(0);
    setChatLog([]);
    setShowOverlay(true);
  }
  
  // if messages array is empty, call getInitialCompletion
  // if messages array is not empty, call getContextCompletion
  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim() || query.length <= 4 || !dataSource.length) {
      if (!dataSource.length) {
        alert("Please select a data source");
        return;
      }
      return;
    }
  
    console.log(`Running query with selected dataSource: ${dataSource} and query: ${query}`);
    const chatLogNew = [...chatLog, { user: "me", message: `${query}` }];
    setChatLog(chatLogNew);
    setShowOverlay(false);
  
    const messages = chatLogNew.map(message => message.message).join("");
    const completion = await fetchChatMessageCompletion(query, messages, count);
    setCount(count + 1);
    setChatLog([...chatLogNew, { user: "gpt", message: `${completion}` }]);
    setQuery("");
  }
  
  async function fetchChatMessageCompletion(query, messages, count) {
    console.log("Getting live info");
    const liveInfoResponse = await getLiveInfo(query);
    console.log("Live info response: ", liveInfoResponse);
  
    if (count === 0) {
      console.log("Getting initial completion");
      return getInitialCompletion(liveInfoResponse, query);
    }
    console.log("Getting context completion");
    return getContextCompletion(query, messages, liveInfoResponse);
  }
  
  async function getLiveInfo(query) {
    console.log("Checking which data source to use");
    if (dataSource === "KariFinancialAnalyst") {
      console.log("Using KariFinancialAnalyst")
      const response = await KariFinancialAnalyst(query);
      console.log("Response from KariFinancialAnalyst: ", response);
      return response;
    } else if (dataSource === "KariSportsAnalyst") {
      console.log("Using KariSportsAnalyst")
      const response = await KariSportsAnalyst(query);
      return response;
    } else if (dataSource === "KariRealEstateAnalyst") {
      console.log("Using KariRealEstateAnalyst")
      const response = await KariRealEstateAnalyst(query);
      return response;
    } else if (dataSource === "KariMarketingAnalyst") {
      console.log("Using KariMarketingAnalyst")
      const response = await KariMarketingAnalyst(query);
      return response;
    } else {
      console.error("Error: No data source was selected.");
      return;
    }       
  }


async function handleDataSource (e) {
  setDataSource(e.target.value);
};

  return (
    <div className="App"> 
<aside className="sidemenu"> 
  <h3 className="sidemenu-header">Kari</h3> 
   <button className="side-menu-button" onClick={clearChat}> + New Chat </button> 
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

        <button className="submit-button" onClick={() => {handleSubmit();}}>Send</button>
      <select value={dataSource} onChange={handleDataSource}>
      <option value="">Select an option</option>
      <option value="KariFinancialAnalyst">Kari Financial Analyst Model</option>
      <option value="KariSportsAnalyst">Kari Sports Analyst Model</option>
      <option value="KariRealEstateAnalyst">Kari Real Estate Analyst Model</option>
      <option value="KariMarketingAnalyst">Kari Marketing Analyst Model</option>
    </select>        
      </form>
    </div>
</div>
</section>
</div>
  );
}

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

