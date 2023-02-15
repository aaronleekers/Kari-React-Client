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


/**
 * The function takes in a string, and returns a string
 * @param query - the user's message
 * @returns The response from the OpenAI API.
 */
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


/**
 * The function takes in a query and a chatLog, and returns a response
 * @param query - the latest message from the user
 * @param messages - the chatlog of the conversation
 * @returns The response from the OpenAI API.
 */
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


/**
 * It clears the chat log and resets the count to 0.
 */
  async function clearChat(){
    setCount(0);
    setChatLog([]);
    setShowOverlay(true);
  }

  
/**
 * `handleSubmit` is an async function that takes an event as an argument. It prevents the default
 * action of the event, and then checks if the query is empty, or if the query is less than 4
 * characters, or if the data source is empty. If any of these conditions are true, it returns.
 * Otherwise, it creates a new chat log with the user's message, and sets the chat log to this new chat
 * log. It then sets the show overlay state to false, and creates a string of all the messages in the
 * chat log. It then calls the `fetchChatMessageCompletion` function, passing in the query, the
 * messages string, and the count. It then increments the count by 1, and sets the chat log to the new
 * chat log with the GPT-3 response. It then sets the query to an empty string
 * @param e - the event object
 * @returns A list of the top 10 most common words in the text.
 */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim() || query.length <= 4 || !dataSource.length) {
      if (!dataSource.length) {
        alert("Please select a data source");
        return;
      }
      return;
    }
    const chatLogNew = [...chatLog, { user: "me", message: `${query}` }];
    setChatLog(chatLogNew);
    setShowOverlay(false);
    const messages = chatLogNew.map(message => message.message).join("");
    const completion = await fetchChatMessageCompletion(query, messages, count);
    setCount(count + 1);
    setChatLog([...chatLogNew, { user: "gpt", message: `${completion}` }]);
    setQuery("");
  }
 


/**
 * It takes in a query, a list of messages, and a count. It then calls the getLiveInfo function, which
 * returns a promise. If the count is 0, it calls the getInitialCompletion function, which returns a
 * promise. If the count is not 0, it calls the getContextCompletion function, which returns a promise
 * @param query - The query string that the user has typed so far.
 * @param messages - an array of messages that have been sent in the chat.
 * @param count - The number of messages that have been sent in the current chat session.
 * @returns A promise that resolves to an array of objects.
 */
function fetchChatMessageCompletion(query, messages, count) {
  return getLiveInfo(query)
    .then(liveInfoResponse => {
      console.log("Live info response: ", liveInfoResponse);

      if (count === 0) {
        return getInitialCompletion(liveInfoResponse, query);
      }
      return getContextCompletion(query, messages, liveInfoResponse);
    })
    .catch(error => console.error(error));
}

/**
 * It returns the result of the function that matches the data source that was selected
 * @param query - The query that you want to ask the bot.
 * @returns The function getLiveInfo is being returned.
 */
  function getLiveInfo(query) {
    if (dataSource === "KariFinancialAnalyst") {
      const response = KariFinancialAnalyst(query);
      return response;
    } else if (dataSource === "KariSportsAnalyst") {
      const response = KariSportsAnalyst(query);
      return response;
    } else if (dataSource === "KariRealEstateAnalyst") {
      const response = KariRealEstateAnalyst(query);
      return response;
    } else if (dataSource === "KariMarketingAnalyst") {
      const response = KariMarketingAnalyst(query);
      return response;
    } else {
      console.error("Error: No data source was selected.");
      return;
    }
  }
  
/**
 * It takes the value of the selected option in the dropdown menu and sets the state of the dataSource
 * variable to that value
 * @param e - the event object
 */
async function handleDataSource (e) {
  setDataSource(e.target.value);
};

/* The above code is the main component of the application. It is the main container for the
application. It is the main component that is rendered to the screen. */
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

/**
 * It takes a message object as a prop, and returns a div with a class of chat-message, and a div with
 * a class of message
 */
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

