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

// TO DO:
// 1. Set up KariFinancialAnalyst to judge the vagueness of requests.
// 2. Set up KariFinancialAnalyst to return multiple data sources based on the query if the request is more than 50% vague.
// 3. If request is more than 50% vague, it will generate a list of more specific questions that support the answer of the vague question, to pull from.
// for example, if the user asks "What is the current price of AAPL?", Kari will judge the vagueness of that question, and then assemble it into an API call if it is less than 50% vague.
// However, if the user asks a more vague question such as "What stocks are hot right now?", Kari will convert the request into a list of more specific questions, such as "Get me the WSB top 10 stocks" which will be saved to a variable and then ran through the KariFinancialAnalyst function as query.
// 4. Set up KariFinancialAnalyst to await for all the data sources to arrive, and then assemble it into a large report.
// 5. Add front end status updates for the user to see what Kari is doing.

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
  const [searchLiveInfo, setSearchLiveInfo] = useState(false);
  const [search, setSearch] = useState("Search");

  //open ai auth
  const configuration = new Configuration({
    orgId: orgId,
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

  // NO NEED TO TOUCH THIS
  /**
   * The function takes in a string, and returns a string
   * @param query - the user's message
   * @returns The response from the OpenAI API.
   */
  // First completion, sets the context as Kari.ai personality.
  async function getInitialCompletion(query, liveInfoResponse) {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `
      Context: You are an artificial advisor named Kari. Your goal is to talk with users and provide relevant information by pulling in data from a variety of sources. If the user asks for live data, it will be passed into this prompt for you to process & respond to. If there is no live data, you will need to respond accordingly.
      Formatting: Money in USD, "$xxx,xxx.xx". (print out full number, not abbreviated)

      Current feature list: Live Market Information (Stocks, Crypto, ETFs, Mutual Funds, Bonds, etc.), Smart Financial Analysis on Live Market Information, Insight generation - what to buy, what to sell, what to hold, etc.
      Current Data types: Current Asset prices, Historical Asset prices, macroeconomic data, crypto fundamentals, stock fundamentals, etc.
      future plans for platform: Charting, Personalized Advice, Alternative Data Sources, Intelligent insight generation, and more. 

      user message: ${query}
      Data Passed in: ${liveInfoResponse}

      `,
      max_tokens: 2048,
      temperature: .6,
      stop: "/n",
    });
    return response.data.choices[0].text;
  }

  // NO NEED TO TOUCH THIS
  /**
   * The function takes in a query and a chatLog, and returns a response
   * @param query - the latest message from the user
   * @param messages - the chatlog of the conversation
   * @returns The response from the OpenAI API.
   */
  async function getContextCompletion(query, messages, liveInfoResponse) {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `
      Don't mention outright: Context
      Instructions: view the chatLog for context and respond to the latest message.
      Context: You are an artificial financial advisor named Kari. 

      latestMessage: ${query}
      chatLog: ${messages}
      Data to be passed in: ${liveInfoResponse}
      `,
      max_tokens: 512,
      temperature: .5,
      stop: "/n",
    });
    return response.data.choices[0].text;
  }

  // NO NEED TO TOUCH THIS
  /**
   * It clears the chat log and resets the count to 0.
   */
  async function clearChat() {
    setCount(0);
    setChatLog([]);
    setShowOverlay(true);
  }
  // NO NEED TO TOUCH THIS
  /**
   * It takes the value of the selected option in the dropdown menu and sets the state of the dataSource
   * variable to that value
   * @param e - the event object
   */
  async function handleDataSource(e) {
    setDataSource(e.target.value);
  };

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
    if (query.trim() && query.length > 4) {
      let liveInfoResponse;
      let chatLogNew = [...chatLog, { user: "me", message: `${query}` }];
      if (searchLiveInfo === (true)) {
        console.log("Getting live Info Now");
        liveInfoResponse = await getLiveInfo(query);
        console.log(liveInfoResponse);
      } else {
        console.log("User did not request live info");
      }
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
      setSearchLiveInfo(false);
      setChatLog([...chatLogNew, { user: "gpt", message: `${data}` }]);
    }
  }

  /**
   * It returns the result of the function that matches the data source that was selected
   * @param query - The query that you want to ask the bot.
   * @returns The function getLiveInfo is being returned.
   */
  async function getLiveInfo(query) {
    if (!dataSource.length) {
      alert("Please select a data source");
      return;
    }
    setSearch("Loading...");
    let response;
    if (dataSource === "KariFinancialAnalyst") {
      response = await KariFinancialAnalyst(query);
      setSearch("Search");
      return response;
    } else if (dataSource === "KariSportsAnalyst") {
      response = await KariSportsAnalyst(query);
      setSearch("Search");
    } else if (dataSource === "KariRealEstateAnalyst") {
      response = await KariRealEstateAnalyst(query);
      setSearch("Search");
    } else if (dataSource === "KariMarketingAnalyst") {
      response = await KariMarketingAnalyst(query);
      setSearch("Search");
    } else {
      console.error("Error: No data source was selected.");
      return;
    }
    console.log("Response: ", response);
    return response;
  }

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

              <button className="submit-button" onClick={() => { handleSubmit(); }}>Send</button>
              <button className="submit-button" onClick={() => { setSearchLiveInfo(true); handleSubmit() }}>{search}</button>
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
