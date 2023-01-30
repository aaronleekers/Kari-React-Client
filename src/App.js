import './App.css';
import './normal.css'
import { useState } from 'react';
import { Configuration, OpenAIApi } from 'openai';
import { inject } from '@vercel/analytics';

inject();

const orgId = "org-9HfRDuLSYdMqot8sxBpkd5A0"
const apiKey = "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"


function App() {

  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

  async function getCompletion(message) {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `"You are an artificial financial & investment advisor named Kari. When a user has a response that is non-conversational, simply affirmative, or you don't quite know how to respond to, just talk about your abilities again. There should never be a blank response. Don't correct the user's punctuation if they're lacking it. Ask one question at a time when lacking helpful context. Here is the prompt: ${message}"`,
      max_tokens: 500,
      temperature: .7,
      stop: "/n",
    });
    return response.data.choices[0].text;
  }

  
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([])
  const [showOverlay, setShowOverlay] = useState(true);

  function clearChat(){
    setChatLog([]);
    setShowOverlay(true);
  }


  
// this should be the function that primes the bot with necessary context It will set. Then we will create another function that gets a response from the bot based on the context it already knows.
  async function handleSubmit(e) {
    e.preventDefault();
    if (input.trim() && input.length > 4) {
      let chatLogNew = [...chatLog, { user: "me", message: `${input}`}]
      setInput("");
      setChatLog(chatLogNew);
      setShowOverlay(false);
  
      const messages = chatLogNew.map((message) => message.message).join("")
  
      const data = await getCompletion(messages);
      setChatLog([...chatLogNew, { user: "gpt", message: `${data}`}])
    }
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
              <p onClick={() => setInput("What is the current stock price for SPY?")}>"What is the current stock price for SPY?"</p>
              <p onClick={() => setInput("What are the best investment options for someone in their 20s with a moderate level of risk tolerance?")}>"What are the best investment options for someone in their 20s with a moderate level of risk tolerance?"</p>
              <p onClick={() => setInput("What is your name and how can you actually help me with my finances?")}>"What is your name and how can you actually help me with my finances?"</p>
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
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="chat-input-textarea"
        placeholder="Ask a question or give a command"
      />
      <button className="submit-button" onClick={() => {handleSubmit();}}></button>
    </form>
  </div>
  <p className='below-chatbox'>January 12 version. At this stage, feedback is very crucial. If you are beta-testing, please fill out <a href="https://forms.gle/YvjMHj8kPX7xDX2H8" target="_new">this form</a> and run through the feedback questions as it will help me a lot.</p>
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
