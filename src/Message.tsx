import { useState, useMemo, useEffect } from 'react';
import ActionCable from 'actioncable';

export function Message() {
  const [message, setMessage] = useState('');
  const [subscription, setSubscription] = useState<ActionCable.Channel>();
  const cable = useMemo(() => ActionCable.createConsumer('wss://localhost:3020/cable'), []);
  useEffect(() => {
    const sub = cable.subscriptions.create({ channel: "ChatChannel" }, {
      received: (data) => setMessage(data.body)
    });
    setSubscription(sub);
  }, [cable]);

  return (
    <div>
      <div>{message}</div>
      <button onClick={() => {
        subscription?.perform('received', { body: 'hoge' })
      }}>
        send
      </button>
    </div>
  );
}
