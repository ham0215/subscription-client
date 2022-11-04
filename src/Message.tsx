import { useState, useMemo, useEffect } from 'react';
import ActionCable from 'actioncable';

export function Message() {
  const [message, setMessage] = useState('');
  const cable = useMemo(() => ActionCable.createConsumer('wss://localhost:3020/cable'), []);
  const subscription = useMemo(() => {
    return cable.subscriptions.create("ChatChannel", {
      received: setMessage
    });
  }, []);

  return (
    <div>
      <h1>{message}</h1>
      <button onClick={() => {
        subscription.perform('received', { body: 'hoge' })
      }}>
        send
      </button>
    </div>
  );
}
