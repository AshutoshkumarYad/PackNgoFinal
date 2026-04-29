import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./CommunityChat.css";
export default function CommunityChat({ token, currentUserId, targetChatUser, sharedPostToChat }) {
  const [users, setUsers] = useState([]); // Both DMs and Groups
  const [selectedItem, setSelectedItem] = useState(null); // Renamed from selectedUser to conceptualize both
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Group Create States
  // Group Create States
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Fetch list of users and groups
    const fetchChatEntities = async () => {
      try {
        const [usersRes, groupsRes] = await Promise.all([
          axios.get("/api/chat/users", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/chat/groups/me", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const formattedGroups = groupsRes.data.map(g => ({ ...g, isGroup: true }));
        setUsers([...formattedGroups, ...usersRes.data]);

        // Join socket rooms for all groups
        if (socketRef.current) {
          formattedGroups.forEach(g => socketRef.current.emit("join_group", g._id));
        }
      } catch (err) {
        console.error("Failed to fetch chat entities:", err);
      }
    };

    // Initialize Socket
    const socketUrl = import.meta.env.DEV ? "http://localhost:5000" : "/";
    socketRef.current = io(socketUrl);
    if (currentUserId) {
      socketRef.current.emit("join_chat", currentUserId);
    }

    fetchChatEntities();

    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socketRef.current.on("receive_message", handleNewMessage);
    socketRef.current.on("receive_group_message", handleNewMessage);

    return () => {
      socketRef.current.off("receive_message", handleNewMessage);
      socketRef.current.off("receive_group_message", handleNewMessage);
      socketRef.current.disconnect();
    };
  }, [token, currentUserId]);

  // When a user or group is selected, load chat history
  const handleSelectUser = async (item) => {
    setSelectedItem(item);
    try {
      const endpoint = item.isGroup ? `group/${item._id}` : `${item._id}`;
      const { data } = await axios.get(`/api/chat/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
    }
  };

  useEffect(() => {
    if (targetChatUser && token) {
      // Create a mock user item if it isn't in 'users' list yet
      const match = users.find(u => u._id === targetChatUser._id);
      if (!match) {
        setUsers(prev => [targetChatUser, ...prev]);
      }
      handleSelectUser(targetChatUser);
    }
  }, [targetChatUser]);

  // Pre-fill input when a post is shared
  useEffect(() => {
    if (sharedPostToChat) {
      const title = sharedPostToChat.title || sharedPostToChat.description?.substring(0, 30) || 'a post';
      setInputText(`Check out this post: ${title} - ${window.location.origin}/Community`);
    }
  }, [sharedPostToChat]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) return;
    try {
      const { data } = await axios.post("/api/chat/groups", {
        name: newGroupName,
        members: selectedMembers
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      const newGroup = { ...data, isGroup: true };
      setUsers([newGroup, ...users]);
      setShowGroupModal(false);
      setNewGroupName("");
      setSelectedMembers([]);
      socketRef.current.emit("join_group", newGroup._id);
    } catch(err) {
      console.error(err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedItem) return;

    const messageData = {
      sender: currentUserId,
      text: inputText
    };

    if (selectedItem.isGroup) {
       messageData.group = selectedItem._id;
    } else {
       messageData.receiver = selectedItem._id;
    }

    socketRef.current.emit("send_message", messageData);
    setInputText("");
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedItem) return;
    
    try {
      const formData = new FormData();
      formData.append("media", file);
      
      const { data } = await axios.post("/api/chat/upload", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      
      const messageData = {
        sender: currentUserId,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType
      };
      
      if (selectedItem.isGroup) {
         messageData.group = selectedItem._id;
      } else {
         messageData.receiver = selectedItem._id;
      }

      socketRef.current.emit("send_message", messageData);
    } catch(err) {
      console.error("Failed to upload media:", err);
    }
  };

  const handleDeleteChat = async () => {
    const isGroup = selectedItem.isGroup;
    const isGroupAdmin = isGroup && selectedItem.admin && selectedItem.admin.toString() === currentUserId;
    
    // Custom prompt logic based on role
    let promptMsg = "Are you sure you want to permanently delete this entire chat history?";
    if (isGroup && !isGroupAdmin) promptMsg = "Are you sure you want to leave this group?";
    if (isGroup && isGroupAdmin) promptMsg = "Are you sure you want to format and DELETE this entire group platform?";

    if (!window.confirm(promptMsg)) return;

    try {
      const endpoint = isGroup ? `group/${selectedItem._id}` : `${selectedItem._id}`;
      await axios.delete(`/api/chat/${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
      
      setMessages([]);
      if (isGroup) {
         setUsers(users.filter(u => u._id !== selectedItem._id)); // Drop group from list
      }
      setSelectedItem(null);
    } catch(err) { console.error(err); }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the group?")) return;
    try {
      await axios.delete(`/api/chat/group/${selectedItem._id}/members/${memberId}`, { headers: { Authorization: `Bearer ${token}` } });
      
      // Update local member list
      const updatedSelectedItem = {
        ...selectedItem,
        members: selectedItem.members.filter(m => m._id !== memberId)
      };
      setSelectedItem(updatedSelectedItem);
      setUsers(users.map(u => u._id === selectedItem._id ? updatedSelectedItem : u));
    } catch(err) { console.error(err); }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedItem]);

  // Filter messages to only show those between current user and selected group/user
  const currentChatMessages = messages.filter(
    m => {
       if (selectedItem?.isGroup) {
         return m.group === selectedItem._id;
       }
       return (m.sender === currentUserId && m.receiver === selectedItem?._id) || 
              (m.sender === selectedItem?._id && m.receiver === currentUserId);
    }
  );

  const filteredUsers = users.filter(u => 
    u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!token || !currentUserId) {
    return (
      <div className="cc-container" style={{ alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
        <h3 style={{ color: '#fff', marginBottom: '10px' }}>Community Chat</h3>
        <p style={{ color: '#a0a0b8', fontSize: '14px' }}>Please log in to chat with other travelers.</p>
      </div>
    );
  }

  return (
    <div className="cc-container">
      {selectedItem ? (
        <>
          <div className="cc-header">
            <button className="cc-back-btn" onClick={() => setSelectedItem(null)}>
              ← Back
            </button>
            <div className="cc-header-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selectedItem.isGroup ? "👥 " : (
                 selectedItem.avatar ? (
                   <img 
                     src={selectedItem.avatar.startsWith('/uploads') ? `${selectedItem.avatar}` : selectedItem.avatar} 
                     alt="avatar" 
                     style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} 
                   />
                 ) : ""
              )}
              {selectedItem.name || "User"}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {selectedItem.isGroup && (
                <button 
                  onClick={() => setShowGroupMembers(!showGroupMembers)}
                  style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '13px' }}
                >
                  👥 Members
                </button>
              )}
              <button 
                onClick={handleDeleteChat} 
                style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px' }}
                title={selectedItem.isGroup && selectedItem.admin !== currentUserId ? "Leave Group" : "Delete Chat"}
              >
                🗑️
              </button>
            </div>
          </div>
          
          {selectedItem.isGroup && showGroupMembers && (
             <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Group Members</h4>
               {selectedItem.members && selectedItem.members.map(m => (
                 <div key={m._id || m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                   <span style={{ color: '#cbd5e1' }}>{m.name || "Unknown"} {(selectedItem.admin === m._id) && "👑"}</span>
                   {selectedItem.admin === currentUserId && m._id !== currentUserId && (
                      <button 
                         onClick={() => handleRemoveMember(m._id)}
                         style={{ background: '#f87171', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                   )}
                 </div>
               ))}
               {!selectedItem.members && <span style={{color: '#888'}}>Refresh to load roster</span>}
             </div>
          )}

          <div className="cc-messages">
            {currentChatMessages.map((msg, idx) => {
              const isSent = msg.sender && (msg.sender === currentUserId || msg.sender._id === currentUserId);
              return (
                <div key={idx} className={`cc-message-row ${isSent ? 'sent' : 'received'}`}>
                  {!isSent && selectedItem.isGroup && (
                     <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px', marginLeft: '5px' }}>
                       {msg.sender?.name || "Member"}
                     </div>
                  )}
                  <div className="cc-message-bubble">
                    {msg.mediaUrl && (
                      <div style={{ marginBottom: msg.text ? '8px' : '0' }}>
                        {msg.mediaType === 'video' ? (
                          <video src={msg.mediaUrl} controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                        ) : (
                          <img src={msg.mediaUrl} alt="attachment" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }} />
                        )}
                      </div>
                    )}
                    {msg.text && <div>{msg.text}</div>}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form className="cc-input-area" onSubmit={handleSendMessage}>
            <label style={{ cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
              📎
              <input type="file" style={{ display: 'none' }} accept="image/*,video/*" onChange={handleMediaUpload} />
            </label>
            <input 
              type="text" 
              className="cc-input" 
              placeholder="Type a message..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="cc-send-btn">
              ➤
            </button>
          </form>
        </>
      ) : showGroupModal ? (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', height: '100%', boxSizing: 'border-box' }}>
           <h3 style={{ margin: 0, color: '#fff' }}>Create Group</h3>
           <input 
              type="text" 
              placeholder="Group Name" 
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              className="cc-input"
           />
           <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px' }}>
             {users.filter(u => !u.isGroup).map(u => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <input 
                     type="checkbox" 
                     checked={selectedMembers.includes(u._id)}
                     onChange={() => {
                       if (selectedMembers.includes(u._id)) setSelectedMembers(selectedMembers.filter(id => id !== u._id));
                       else setSelectedMembers([...selectedMembers, u._id]);
                     }}
                  />
                  <span style={{ color: '#fff' }}>{u.name}</span>
                </div>
             ))}
           </div>
           <div style={{ display: 'flex', gap: '10px' }}>
             <button onClick={() => setShowGroupModal(false)} style={{ flex: 1, padding: '10px', background: '#475569', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
             <button onClick={handleCreateGroup} style={{ flex: 1, padding: '10px', background: '#2e7bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create</button>
           </div>
        </div>
      ) : (
        <>
          <div className="cc-header" style={{ justifyContent: 'space-between', padding: '15px' }}>
            <div className="cc-header-title" style={{ fontSize: '18px' }}>Chat</div>
            <button 
              onClick={() => setShowGroupModal(true)}
              style={{ background: 'transparent', border: 'none', color: '#2e7bff', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              + New Group
            </button>
          </div>
          <div style={{ padding: '12px 12px 0 12px' }}>
            <input 
              type="text" 
              placeholder="Search by username..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cc-input"
              style={{ width: '100%', padding: '8px 14px', boxSizing: 'border-box' }}
            />
          </div>
          <div className="cc-user-list">
            {filteredUsers.length === 0 ? (
              <p style={{ color: '#a0a0b8', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>No users found.</p>
            ) : (
              filteredUsers.map(item => (
                <div key={item._id} className="cc-user-item" onClick={() => handleSelectUser(item)}>
                  <div className="cc-user-avatar" style={{ background: item.isGroup ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : '' }}>
                    {item.isGroup ? "👥" : (
                      item.avatar ? (
                        <img 
                          src={item.avatar.startsWith('/uploads') ? `${item.avatar}` : item.avatar} 
                          alt="avatar" 
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                      ) : (
                        item.name ? item.name.charAt(0).toUpperCase() : "U"
                      )
                    )}
                  </div>
                  <div className="cc-user-name">{item.name || "Traveler"}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
