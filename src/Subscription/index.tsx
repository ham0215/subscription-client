import { useState, useMemo, useEffect } from 'react';
import { split, ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { ActionCableLink } from 'graphql-ruby-client';
import { getMainDefinition } from '@apollo/client/utilities';
import { createConsumer } from '@rails/actioncable';

type Message = {
  sender: string;
  body: string;
};

export default function Subscription() {
  const [receivedMessage, setReceivedMessage] = useState<Message>();
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject>>();
  const cable = useMemo(() => createConsumer('wss://localhost:3020/cable'), []);

  useEffect(() => {
    const httpLink = new HttpLink({
      uri: '/graphql',
      credentials: 'include'
    });

    // const hasSubscriptionOperation = ({ query: { definitions } }) => {
    //   return definitions.some(
    //     ({ kind, operation }) => kind === 'OperationDefinition' && operation === 'subscription'
    //   )
    // }

    // const link = ApolloLink.split(
    //   hasSubscriptionOperation,
    //   new ActionCableLink({ cable }),
    //   httpLink
    // );
    const wsLink = new ActionCableLink({ cable });
    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink,
    );

    const client = new ApolloClient({
      link: splitLink,
      cache: new InMemoryCache()
    });
    setClient(client);
  }, [cable]);

  const handleSend = () => {
    subscription?.perform('chat', { body: input });
    setInput('');
  };

  useEffect(() => {
    if (!receivedMessage) return;

    const { sender, body } = receivedMessage;
    setText(text.concat("\n", `${sender}: ${body}`));
  }, [receivedMessage]);

  useEffect(() => {
    const history = document.getElementById('history');
    history?.scrollTo(0, history.scrollHeight);
  }, [text]);

  const onChangeInput = (e) => {
    setInput(e.currentTarget.value);
  };

  return (
    <div>
      <div>
        <textarea id="history" readOnly style={{ width: "500px", height: "200px" }} value={text} />
      </div>
      <div>
        <input
          type="text"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{ width: "400px", marginRight: "10px" }}
          onChange={onChangeInput}
          value={input}
        />
        <button onClick={handleSend} disabled={input === ''}>
          send
        </button>
      </div>
    </div >
  );
}
