import { useState, useMemo, useEffect } from 'react';
import ActionCable from 'actioncable';

type Message = {
  sender: string;
  body: string;
};

export default function Cable() {
  const [receivedMessage, setReceivedMessage] = useState<Message>();
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [subscription, setSubscription] = useState<ActionCable.Channel>();
  const cable = useMemo(() => ActionCable.createConsumer('wss://localhost:3020/cable'), []);

  useEffect(() => {
    const sub = cable.subscriptions.create({ channel: "ChatChannel" }, {
      received: (msg) => setReceivedMessage(msg)
    });
    setSubscription(sub);
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
