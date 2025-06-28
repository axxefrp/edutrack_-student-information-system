import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { Message, User } from '../../types';
import Button from '../Shared/Button';
import Input from '../Shared/Input';

type MessageView = 'inbox' | 'compose' | 'readMessage';

interface MessagingLocationState {
  composeMode?: boolean;
  recipientId?: string;
  subject?: string;
}

const MessagingScreen: React.FC = () => {
  const context = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState<MessageView>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Compose form state
  const [composeRecipientId, setComposeRecipientId] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  
  // Validation errors for compose
  const [composeRecipientError, setComposeRecipientError] = useState('');
  const [composeSubjectError, setComposeSubjectError] = useState('');
  const [composeBodyError, setComposeBodyError] = useState('');

  const [composeSuccess, setComposeSuccess] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!context || !context.currentUser) {
    return <div className="p-6 text-gray-700">Loading user data or not authorized...</div>;
  }

  const { currentUser, users, messages, sendMessage, markMessageAsRead } = context;

  const userMessages = messages
    .filter(msg => msg.recipientId === currentUser.uid)
    .sort((a, b) => new Date(b.dateSent).getTime() - new Date(a.dateSent).getTime());

  const availableRecipients = users.filter(user => user.uid !== currentUser.uid);

  useEffect(() => {
    const locationState = location.state as MessagingLocationState | null;
    if (locationState?.composeMode) {
      setActiveView('compose');
      if (locationState.recipientId) {
        setComposeRecipientId(locationState.recipientId);
      } else if (availableRecipients.length > 0 && !composeRecipientId) {
        setComposeRecipientId(availableRecipients[0].uid);
      }
      if (locationState.subject) {
        setComposeSubject(locationState.subject);
      }
      // Clear location state after using it and reset errors
      navigate(location.pathname, { replace: true, state: {} });
      resetComposeErrorsAndSuccess();
    } else if (activeView === 'compose' && availableRecipients.length > 0 && !composeRecipientId) {
      setComposeRecipientId(availableRecipients[0].uid);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, activeView, availableRecipients, navigate]);

  const resetComposeErrorsAndSuccess = () => {
    setComposeRecipientError('');
    setComposeSubjectError('');
    setComposeBodyError('');
    setComposeSuccess('');
  };

  const validateComposeForm = (): boolean => {
    resetComposeErrorsAndSuccess();
    let isValid = true;
    if (!composeRecipientId) {
      setComposeRecipientError('Recipient is required.');
      isValid = false;
    }
    if (!composeSubject.trim()) {
      setComposeSubjectError('Subject is required.');
      isValid = false;
    }
    if (!composeBody.trim()) {
      setComposeBodyError('Message body is required.');
      isValid = false;
    }
    return isValid;
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markMessageAsRead(message.id);
    }
    setActiveView('readMessage');
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateComposeForm()) {
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      sendMessage(composeRecipientId, composeSubject, composeBody);
      setIsSending(false);
      setComposeSuccess('Message sent successfully!');
      setComposeSubject('');
      setComposeBody('');
      // Keep recipient selected, clear errors
      setComposeSubjectError('');
      setComposeBodyError('');
      // Optionally switch to inbox after sending
      // setActiveView('inbox'); 
    }, 1000); // Simulate API call
  };
  
  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleString(undefined, { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
    });
  };


  const renderInbox = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Inbox ({userMessages.filter(m => !m.isRead).length} unread)</h2>
      {userMessages.length === 0 ? (
        <p className="text-gray-500">Your inbox is empty.</p>
      ) : (
        <ul className="space-y-3">
          {userMessages.map(msg => (
            <li
              key={msg.id}
              onClick={() => handleViewMessage(msg)}
              className={`p-4 rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md ${
                msg.isRead ? 'bg-white hover:bg-gray-50' : 'bg-primary-50 hover:bg-primary-100 border-l-4 border-primary-500'
              }`}
            >
              <div className="flex justify-between items-center">
                <p className={`text-sm font-semibold ${!msg.isRead ? 'text-primary-700' : 'text-gray-600'}`}>
                  From: {msg.senderUsername}
                </p>
                <p className="text-xs text-gray-400">{formatDate(msg.dateSent)}</p>
              </div>
              <p className={`mt-1 text-md ${!msg.isRead ? 'font-bold text-gray-800' : 'text-gray-700'}`}>{msg.subject}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderReadMessage = () => {
    if (!selectedMessage) return null;
    return (
      <div>
        <Button onClick={() => { setActiveView('inbox'); setSelectedMessage(null);}} variant="ghost" size="sm" className="mb-4">
          &larr; Back to Inbox
        </Button>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedMessage.subject}</h2>
          <div className="text-sm text-gray-500 mb-4">
            <p><strong>From:</strong> {selectedMessage.senderUsername}</p>
            <p><strong>To:</strong> You ({currentUser.username})</p>
            <p><strong>Date:</strong> {formatDate(selectedMessage.dateSent)}</p>
          </div>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {selectedMessage.body}
          </div>
        </div>
      </div>
    );
  };

  const renderComposeMessage = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Compose New Message</h2>
      <form onSubmit={handleComposeSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        {composeSuccess && <p className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{composeSuccess}</p>}
        
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
          <select
            id="recipient"
            value={composeRecipientId}
            onChange={(e) => { setComposeRecipientId(e.target.value); if(composeRecipientError) setComposeRecipientError('');}}
            className={`mt-1 block w-full px-3 py-2 border ${composeRecipientError ? 'border-red-500' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
            required
            disabled={isSending}
          >
            <option value="" disabled={!!composeRecipientId}>Select a recipient</option>
            {availableRecipients.map(user => (
              <option key={user.uid} value={user.uid}>{user.username} ({user.role.toLowerCase()})</option>
            ))}
          </select>
          {composeRecipientError && <p className="mt-1 text-xs text-red-600">{composeRecipientError}</p>}
        </div>
        <Input
          label="Subject"
          id="subject"
          type="text"
          value={composeSubject}
          onChange={(e) => { setComposeSubject(e.target.value); if(composeSubjectError) setComposeSubjectError(''); }}
          placeholder="Enter message subject"
          required
          disabled={isSending}
          error={composeSubjectError}
        />
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
          <textarea
            id="body"
            value={composeBody}
            onChange={(e) => { setComposeBody(e.target.value); if(composeBodyError) setComposeBodyError('');}}
            rows={6}
            className={`mt-1 block w-full px-3 py-2 border ${composeBodyError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
            placeholder="Write your message here..."
            required
            disabled={isSending}
          />
          {composeBodyError && <p className="mt-1 text-xs text-red-600">{composeBodyError}</p>}
        </div>
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="ghost" onClick={() => setActiveView('inbox')} disabled={isSending}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isSending} disabled={isSending}>Send Message</Button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setActiveView('inbox')} 
            variant={activeView === 'inbox' ? 'primary' : 'ghost'}
            aria-current={activeView === 'inbox' ? 'page' : undefined}
            disabled={isSending}
          >
            Inbox
          </Button>
          <Button 
            onClick={() => { 
                setActiveView('compose'); 
                resetComposeErrorsAndSuccess();
                setComposeSubject(''); 
                setComposeBody(''); 
                if (availableRecipients.length > 0 && !composeRecipientId) { 
                    setComposeRecipientId(availableRecipients[0].uid);
                }
            }} 
            variant={activeView === 'compose' ? 'primary' : 'ghost'}
            aria-current={activeView === 'compose' ? 'page' : undefined}
            disabled={isSending}
          >
            Compose
          </Button>
        </div>
      </div>

      {activeView === 'inbox' && renderInbox()}
      {activeView === 'readMessage' && renderReadMessage()}
      {activeView === 'compose' && renderComposeMessage()}
    </div>
  );
};

export default MessagingScreen;