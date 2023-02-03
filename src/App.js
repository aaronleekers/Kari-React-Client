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
  const [showQueryArea, setShowQueryArea] = useState(false);


  //open ai auth
  const configuration = new Configuration({
    orgId: orgId,
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

  const [details, setDetails] = useState("");
  const [style, setStyle] = useState("");
  const [brands, setBrands] = useState("");

// First completion, sets the context as Kari.ai personality.
  async function getInitialCompletion(details, style, brands) {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `
      Instructions: Generate a list of tweets for the user's product/service/company.
      Summarize the company into a one liner.
      Output: One liner, followed by a list of tweets.
      Don't directly quote any info passed in, only paraphrase.

      Information passed in
      Company One Liner - According to Founder: ${details}
      Words that match the vibe of the company: ${style}
      Brands that match the vibe of the company: ${brands}
      `,
      max_tokens: 3000,
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
      Purpose of App: To help the user generate a content strategy for their product/service/company.

      latestMessage: ${query}
      chatLog: ${messages}
      `,
      max_tokens: 3000,
      temperature: 1.0,
      stop: "/n",
    });
    return response.data.choices[0].text;
  }

  // clearChat button function
  function clearChat(){
    setChatLog([]);
    setShowOverlay(true);
    setBrands("");  
    setStyle("");
    setDetails("");
    setShowQueryArea(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (query.trim() && query.length > 4) {
      let chatLogNew = [...chatLog, { user: "me", message: `${query}`}];
      setQuery("");
      setChatLog(chatLogNew);
      setShowOverlay(false);
      const messages = chatLogNew.map((message) => message.message).join("");
        console.log("Getting context completion");
        const data = await getContextCompletion(query, messages);
      setChatLog([...chatLogNew, { user: "gpt", message: `${data}`}]);
    }
  }

  async function handleInitialSubmit(e) {
    e.preventDefault();

    let chatLogNew = [...chatLog, { user: "me", message: `Get me a tweet calendar for ${details} in the style of ${style} and brands like ${brands}`}];
    setChatLog(chatLogNew);
    setShowOverlay(false);
    setShowQueryArea(true);
    const messages = chatLogNew.map((message) => message.message).join("");
    const data = await getInitialCompletion(messages);
    setChatLog([...chatLogNew, { user: "gpt", message: `${data}`}]);
  }
  


return (
<div className="App">
<aside className="sidemenu"> 
  <h3 className="sidemenu-header">Jonald.ai</h3>
   <button className="side-menu-button" onClick={clearChat}> Reset</button> 
   <button className="side-menu-button" onClick={() => {window.open('https://ikonshop.io/product/cldoaiye9hrbc0ak0l0qpe5dj', '_blank')}}>OpenAI API Budget</button>
    <h4 className="sidemenu-header">Credit: Matt for tip jar</h4>
   </aside>
      <section className="chatbox">
      {showOverlay && (
       <form onSubmit={handleInitialSubmit} className="form-container">
       <input
         type="text"
         id="details"
         value={details}
         onChange={(e) => setDetails(e.target.value)}
         className="form-input"
          placeholder='What is your company one liner?'
       />
       <input
         type="text"
         id="style"
         value={style}
         onChange={(e) => setStyle(e.target.value)}
         className="form-input"
        placeholder='Write a list of words that go along with the vibe of your company.'
       />
       <input
         type="text"
         id="brands"
         value={brands}
         onChange={(e) => setBrands(e.target.value)}
         className="form-input"
         placeholder='Write a list of companies that you like the content of, or that you want to mimic.'
       />
       <button className="form-submit-button" onClick={() => {handleSubmit();}}>Send</button>
     </form>
          
        )}
        <div className="chat-log">
          {chatLog.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
    </div>
    {showQueryArea && (
      
      <div className="chat-input-holder">
      <div className="stock-screening-tool">
        <form onSubmit={handleSubmit}> 
          <input 
            rows="1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="chat-input-textarea"
            placeholder="Ask a question or give a command"></input>
          <button className="submit-button" onClick={() =>{ handleSubmit();}}>Send</button>
        </form>
      </div>
  </div>
      )}

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
