This is a [Next.js](https://nextjs.org) project bootstrapped with [`Next.js documentation website`](https://nextjs.org/docs/).

## Description

This project is a chatbot tuned with the data from the NextJS documentation website.

The data is firstly retrieved by scrapping the website and re-arranged into many txt files.
Then, those files have one by one been tokenised and transformed into embeddings that I'm storing in my database. <br>
Here is my project used for the scrapping and the tokenisation process: [Scrapper](https://github.com/sillyHack/data-scrapper-with-vector-embedding)

Finally, in each OPENAI API call, all of that context is given to chatbot, and respond according that and also only give responses related to the NextJS framework
