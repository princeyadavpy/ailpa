import React from 'react';
import AIChatPanel from '../components/AIChatPanel';
import { useApp } from '../context/AppContext';

export default function AIChat() {
  const { activeIncident } = useApp();
  return (
    <AIChatPanel
      minimal={false}
      incidentContext={activeIncident || null}
    />
  );
}
