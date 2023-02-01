import './App.css';
import './normal.css'
import { useState } from 'react';
import { Configuration, OpenAIApi } from 'openai';
import { inject } from '@vercel/analytics';

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

  //open ai auth
  const configuration = new Configuration({
    orgId: orgId,
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

// First completion, sets the context as Kari.ai personality.
  async function getInitialCompletion(query, messages) {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `
      Instructions: view the chatLog for context and respond to the latest message.
      Context: You are an artificial financial advisor named Kari. 
      Purpose: Your purpose is to help the user understand the data that is passed in.
      Formatting: Money in USD, "$xxx,xxx.xx", concise, answers the question, asks 
      leading questions to stimulate insights
      Abilities: The user can choose to pull in live financial data summaries for you to process, 
      so tell the user to enable the live info and then ask away.

      latestMessage: ${query}
      chatLog: ${messages}
      `,
      max_tokens: 256,
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
      Instructions: view the chatLog for context and respond to the latest message.
      chatLog: ${messages}
      latestMessage: ${query}
      `,
      max_tokens: 256,
      temperature: .6,
      stop: "/n",
    });
    return response.data.choices[0].text;
  }

  // clearChat button function
  function clearChat(){
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
      console.log("Getting live Info Now")
      liveInfoResponse = await getLiveInfo(query);
      console.log(liveInfoResponse);
    } else {
      console.log("User did not request live info")
    }
    let chatLogNew = [...chatLog, { user: "me", message: `${query}` + (liveInfoResponse ? ` ${liveInfoResponse}` : "")}]
    setQuery("");
    setChatLog(chatLogNew);
    setShowOverlay(false);
    const messages = chatLogNew.map((message) => message.message).join("");
    let data;
    let count = 0;
    if (count === 0) {
      console.log("Getting initial completion")
      data = await getInitialCompletion(messages);
      count++;
    } else {
      console.log("Getting context completion")
      data = await getContextCompletion(messages);
    }    setChatLog([...chatLogNew, { user: "gpt", message: `${data}`}])
  }
}

  async function getLiveInfo(query) {
    var url = `kari-platform-node-production.up.railway.app/api_search`;
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
              <h2>Kari.ai Financial Advisor</h2>
            </div>
          <div className="overlay-card-columns">
            <div className="overlay-card-column-example">
              <h3>Example Prompts:</h3>
              <p onClick={() => setQuery("What is the current stock price for SPY?")}>"What is the current stock price for SPY?"</p>
              <p onClick={() => setQuery("What are the best investment options for someone in their 20s with a moderate level of risk tolerance?")}>"What are the best investment options for someone in their 20s with a moderate level of risk tolerance?"</p>
              <p onClick={() => setQuery("What is your name and how can you actually help me with my finances?")}>"What is your name and how can you actually help me with my finances?"</p>
            </div>
            <div className="overlay-card-column">
              <h3>Current Limitations:</h3>
              <p>The chat may not have access to the most recent data on financial topics.</p>
              <p>The chat does not have access to the user's personal financial situation or other relevant context.</p>
              <p>The chat's answers may be limited by the quality and clarity of the prompts it receives.</p>
            </div>
            <div className="overlay-card-column">
              <h3>Future Features:</h3>
              <p>Save Threads</p>
              <p>Access to More Financial Data</p>
              <p>Charting & Data Visualization</p>
              <p>And more!</p>
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
        <button className="submit-button" onClick={() => {setSearchLiveInfo(true); handleSubmit(query);}}>Search</button>
      </form>
    </div>
  <p className='below-chatbox'>February 1 version. At this stage, feedback is very crucial. If you are beta-testing, please fill out <a href="https://forms.gle/YvjMHj8kPX7xDX2H8" target="_new">this form</a> and run through the feedback questions as it will help me a lot.</p>
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
