import React from 'react';
import './popup.css';

function Popup() {
  const openMainUI = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('ui/index.html')
    });
    window.close();
  };

  // Automatically open main UI
  React.useEffect(() => {
    openMainUI();
  }, []);

  return (
    <div className="popup">
      Opening dSnap...
    </div>
  );
}

export default Popup;