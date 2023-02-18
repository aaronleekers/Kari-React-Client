[x] make the console logs more efficient
[x] make the summaries in AlphaVantage better ong - this is kind of dependent on making the intelligent model. 
[x] the loading variable is not changing back to search after the search is done
[] the summarize data function should be removed, and the apiCallData should be returned to the response prompt.
[] the KariFinancialAnalyst should be able to discriminate the vagueness of a response, and run two different functions accordingly. If request is less than 50% vague, just match it up and get the data. If it is more than 50% vague, determine all data sources necessary, get all the data, put it into a report, and then send the report to the liveInfoResponse variable.
[] the liveInfoResponse needs to be pasted into the response instead of in the user chat message.
[] There needs to be a log of all the things that are going on on a high level in the code, so the user doesn't feel like its a waste of time.
[] There should be a chart that is generated whenever stock prices over a period of time come in. Basically any time a user queries alphavantgae with the first-third requestTypes.

