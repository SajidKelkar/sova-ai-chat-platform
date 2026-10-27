import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { MessageList } from '@/components/MessageList';
import { MessageInput } from '@/components/MessageInput';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoginDialog } from '@/components/LoginDialog';
import { SignupDialog } from '@/components/SignupDialog';
import { useAuth } from '@/context/AuthContext';
import {
  getRecentChats,
  createChat,
  deleteChat as apiDeleteChat,
  type NormalizedChat,
} from '@/api/chat';
import {
  getMessages,
  sendMessageToChat,
  type NormalizedMessage,
} from '@/api/message';
import { logout as apiLogout, deleteAccount as apiDeleteAccount } from '@/api/auth';
import { isAuthError } from '@/api/client';

type AuthModal = 'login' | 'signup' | null;

export function ChatPage() {
  const { status, isAuthenticated, logoutFrontend, authError } = useAuth();

  const [chats, setChats] = useState<NormalizedChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<NormalizedMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [composerSeed, setComposerSeed] = useState<string | undefined>(undefined);
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  // Confirm dialogs
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const [deletingChat, setDeletingChat] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const activeChatRef = useRef<string | null>(null);
  activeChatRef.current = activeChatId;
  const activeViewRevision = useRef(0);
  const messageLoadRevision = useRef(0);
  const wasAuthenticated = useRef(isAuthenticated);

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (isAuthError(err)) {
        logoutFrontend();
      }
    },
    [logoutFrontend],
  );

  const loadChats = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoadingChats(true);
      }

      try {
        const recent = await getRecentChats();
        setChats(recent);
        return recent;
      } catch (err) {
        if (!isAuthError(err)) {
          setError('Unable to load conversations. Please try again.');
        }
        handleAuthError(err);
        return [];
      } finally {
        if (showLoading) {
          setLoadingChats(false);
        }
      }
    },
    [handleAuthError],
  );

  const loadMessages = useCallback(
    async (chatId: string) => {
      const requestRevision = ++messageLoadRevision.current;
      setLoadingMessages(true);
      setError(null);
      try {
        const msgs = await getMessages(chatId);
        if (
          requestRevision === messageLoadRevision.current &&
          activeChatRef.current === chatId
        ) {
          setMessages(msgs);
        }
      } catch (err) {
        if (
          requestRevision !== messageLoadRevision.current ||
          activeChatRef.current !== chatId
        ) {
          return;
        }
        if (isAuthError(err)) {
          handleAuthError(err);
          return;
        }
        setError('Unable to load messages. Please try again.');
        setMessages([]);
      } finally {
        if (requestRevision === messageLoadRevision.current) {
          setLoadingMessages(false);
        }
      }
    },
    [handleAuthError],
  );

  // Load chats when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      loadChats();
    }
  }, [status, loadChats]);

  // When user logs out, clear private state
  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      activeViewRevision.current += 1;
      messageLoadRevision.current += 1;
      activeChatRef.current = null;
      setChats([]);
      setMessages([]);
      setActiveChatId(null);
      setLoadingMessages(false);
      setError(null);
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  // After login via modal completes (isAuthenticated flips to true),
  // send the pending message if one was queued
  useEffect(() => {
    if (isAuthenticated && pendingMessage) {
      const msg = pendingMessage;
      setPendingMessage(null);
      handleSend(msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, pendingMessage]);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      if (!isAuthenticated) {
        setAuthModal('login');
        return;
      }
      if (chatId === activeChatRef.current) {
        setSidebarOpen(false);
        return;
      }
      activeViewRevision.current += 1;
      activeChatRef.current = chatId;
      setActiveChatId(chatId);
      setMessages([]);
      setError(null);
      setSidebarOpen(false);
      loadMessages(chatId);
    },
    [isAuthenticated, loadMessages],
  );

  const handleNewChat = useCallback(() => {
    if (!isAuthenticated) {
      setAuthModal('login');
      return;
    }
    setSidebarOpen(false);
    activeViewRevision.current += 1;
    messageLoadRevision.current += 1;
    activeChatRef.current = null;
    setActiveChatId(null);
    setMessages([]);
    setLoadingMessages(false);
    setError(null);
    setComposerSeed(undefined);
  }, [isAuthenticated]);

  const handleDeleteChatClick = useCallback((chatId: string) => {
    setDeleteChatId(chatId);
  }, []);

  const confirmDeleteChat = useCallback(async () => {
    if (!deleteChatId) return;
    setDeletingChat(true);
    try {
      await apiDeleteChat(deleteChatId);
      setChats((prev) => prev.filter((c) => c.id !== deleteChatId));
      if (activeChatId === deleteChatId) {
        activeViewRevision.current += 1;
        messageLoadRevision.current += 1;
        activeChatRef.current = null;
        setActiveChatId(null);
        setMessages([]);
        setLoadingMessages(false);
      }
      setDeleteChatId(null);
    } catch (err) {
      if (isAuthError(err)) {
        handleAuthError(err);
        return;
      }
      setError('Unable to delete conversation. Please try again.');
    } finally {
      setDeletingChat(false);
    }
  }, [deleteChatId, activeChatId, handleAuthError]);

  const handleSend = useCallback(
    async (content: string) => {
      if (isSending || !content.trim()) return;

      if (!isAuthenticated) {
        setPendingMessage(content);
        setAuthModal('login');
        return;
      }

      setError(null);
      setComposerSeed(undefined);

      const userMsg: NormalizedMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
      };

      const requestChatId = activeChatRef.current;
      const requestViewRevision = activeViewRevision.current;
      const isRequestViewActive = () =>
        activeViewRevision.current === requestViewRevision;

      if (requestChatId) {
        setMessages((prev) => [...prev, userMsg]);
        setIsSending(true);
        try {
          const responseMsgs = await sendMessageToChat(requestChatId, content);
          if (isRequestViewActive()) {
            setMessages((prev) => [...prev, ...responseMsgs]);
          }
          loadChats(false);
        } catch (err) {
          if (isAuthError(err)) {
            handleAuthError(err);
            return;
          }
          if (isRequestViewActive()) {
            setMessages((prev) => prev.filter((message) => message.id !== userMsg.id));
            setComposerSeed(content);
            setError(
              err instanceof Error
                ? err.message
                : 'Something went wrong while sending your message.',
            );
          }
        } finally {
          setIsSending(false);
        }
      } else {
        // Create a chat first, then send the message
        setMessages((prev) => [...prev, userMsg]);
        setIsSending(true);
        let createdChatId: string | null = null;
        try {
          // Create chat
          const newChat = await createChat();
          createdChatId = newChat.id;
          if (isRequestViewActive()) {
            activeChatRef.current = newChat.id;
            setActiveChatId(newChat.id);
          }
          // Send message to the new chat
          const responseMsgs = await sendMessageToChat(newChat.id, content);
          if (isRequestViewActive()) {
            setMessages((prev) => [...prev, ...responseMsgs]);
          }
          loadChats(false);
        } catch (err) {
          if (createdChatId) {
            loadChats(false);
          }
          if (isAuthError(err)) {
            handleAuthError(err);
            return;
          }
          if (isRequestViewActive()) {
            setError(
              err instanceof Error
                ? err.message
                : 'Something went wrong while sending your message.',
            );
            setMessages((prev) => prev.filter((message) => message.id !== userMsg.id));
            setComposerSeed(content);
            if (!createdChatId) {
              activeChatRef.current = null;
              setActiveChatId(null);
            }
          }
        } finally {
          setIsSending(false);
        }
      }
    },
    [isSending, isAuthenticated, loadChats, handleAuthError],
  );

  const handleExampleClick = useCallback((text: string) => {
    setComposerSeed(text + ' ');
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // proceed regardless
    } finally {
      logoutFrontend();
    }
  }, [logoutFrontend]);

  const handleDeleteAccount = useCallback(async () => {
    setDeletingAccount(true);
    try {
      await apiDeleteAccount();
      logoutFrontend();
      setShowDeleteAccount(false);
    } catch (err) {
      if (isAuthError(err)) {
        handleAuthError(err);
        return;
      }
      setError('Unable to delete account. Please try again.');
    } finally {
      setDeletingAccount(false);
    }
  }, [logoutFrontend, handleAuthError]);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const headerTitle = activeChat?.title || 'New Chat';

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#ededed] dark:bg-[#141517] lg:gap-2">
      <div className={`shrink-0 ${sidebarCollapsed ? 'lg:hidden' : 'lg:flex lg:w-[296px] lg:flex-none'}`}>
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChatClick}
          onLogout={handleLogout}
          onDeleteAccount={() => setShowDeleteAccount(true)}
          onLogin={() => setAuthModal('login')}
          onSignup={() => setAuthModal('signup')}
          isMobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          loadingChats={loadingChats}
        />
      </div>

      <div className={`relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#fafafa] dark:bg-[#191a1d] lg:my-2 lg:mr-2 lg:rounded-[20px] lg:border lg:border-gray-200/80 lg:shadow-[0_8px_30px_rgba(0,0,0,0.055)] dark:lg:border-white/[0.07] dark:lg:shadow-[0_8px_30px_rgba(0,0,0,0.16)] ${sidebarCollapsed ? 'lg:ml-2' : ''}`}>
        {/* Chat header and sidebar controls */}
        <header className="chat-header absolute inset-x-0 top-0 z-20 flex h-14 items-center border-b border-gray-200/70 px-3 pl-14 dark:border-white/[0.07] lg:pl-14">
          <div className="absolute left-3 top-3 flex items-center gap-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="icon-button lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="icon-button hidden lg:flex"
              aria-label="Toggle sidebar"
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-[18px] w-[18px]" />
              ) : (
                <PanelLeftClose className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
          <span className="truncate text-sm font-semibold text-gray-700 dark:text-gray-100">
            {headerTitle}
          </span>
        </header>

        <div className="mt-14 flex min-h-0 w-full min-w-0 flex-1 flex-col">
          {messages.length === 0 && !loadingMessages && !isSending ? (
            <EmptyState onExampleClick={handleExampleClick} />
          ) : (
            <MessageList
              messages={messages}
              isLoadingResponse={isSending}
              errorMessage={error}
            />
          )}

          {loadingMessages && messages.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                <span className="text-sm">Loading messages…</span>
              </div>
            </div>
          )}

          {(error || authError) && messages.length === 0 && !loadingMessages && (
            <div className="mx-auto mb-3 w-full max-w-3xl px-4 sm:px-6" role="alert">
              <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
                {error || authError}
              </div>
            </div>
          )}

          <MessageInput
            onSend={handleSend}
            disabled={isSending}
            isSending={isSending}
            initialValue={composerSeed}
          />
        </div>
      </div>

      {/* Auth modal */}
      {authModal === 'login' && (
        <LoginDialog
          onClose={() => {
            setAuthModal(null);
            setPendingMessage(null);
          }}
          onNavigate={(page) => setAuthModal(page)}
        />
      )}
      {authModal === 'signup' && (
        <SignupDialog
          onClose={() => {
            setAuthModal(null);
            setPendingMessage(null);
          }}
          onNavigate={(page) => setAuthModal(page)}
        />
      )}

      {/* Delete chat confirmation */}
      <ConfirmDialog
        open={deleteChatId !== null}
        title="Delete conversation?"
        message="This conversation and all its messages will be permanently deleted."
        confirmLabel="Delete"
        variant="danger"
        loading={deletingChat}
        onConfirm={confirmDeleteChat}
        onCancel={() => setDeleteChatId(null)}
      />

      {/* Delete account confirmation */}
      <ConfirmDialog
        open={showDeleteAccount}
        title="Delete account?"
        message="Are you sure you want to permanently delete your account and associated data? This action cannot be undone."
        confirmLabel="Delete account"
        variant="danger"
        loading={deletingAccount}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteAccount(false)}
      />
    </div>
  );
}
