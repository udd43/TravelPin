import { motion } from 'framer-motion';

const tabs = [
  { id: 'map', label: 'MAP' },
  { id: 'pin', label: 'PIN' },
  { id: 'chat', label: 'CHAT' },
];

export default function BottomNav({ activeTab, onTabChange, unreadCount = 0 }) {
  return (
    <nav className="bottom-nav" id="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          id={`nav-${tab.id}`}
        >
          <span>
            {activeTab === tab.id ? `[ ${tab.label} ]` : tab.label}
          </span>
          {tab.id === 'chat' && unreadCount > 0 && (
            <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
