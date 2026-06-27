import { motion } from 'framer-motion';
import { HiOutlineMap, HiOutlineCamera, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';

const tabs = [
  { id: 'map', label: '지도', icon: HiOutlineMap },
  { id: 'pin', label: '사진핀', icon: HiOutlineCamera },
  { id: 'chat', label: '채팅', icon: HiOutlineChatBubbleLeftRight },
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
          {activeTab === tab.id && (
            <motion.div
              layoutId="nav-indicator"
              style={{
                position: 'absolute',
                top: -2,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 24,
                height: 3,
                background: 'linear-gradient(135deg, #14b8a6, #06b6d4)',
                borderRadius: 9999,
              }}
            />
          )}
          <span className="nav-icon">
            <tab.icon />
          </span>
          <span>{tab.label}</span>
          {tab.id === 'chat' && unreadCount > 0 && (
            <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
