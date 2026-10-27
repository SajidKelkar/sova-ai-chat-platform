import { useState } from 'react';
import {
  MessageSquare,
  Trash2,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  X,
  User as UserIcon,
  LogIn,
  PenSquare,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import type { NormalizedChat } from '@/api/chat';
import { BrandMark } from './BrandMark';

interface SidebarProps {
  chats: NormalizedChat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onLogin: () => void;
  onSignup: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  loadingChats: boolean;
}

export function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onLogout,
  onDeleteAccount,
  onLogin,
  onSignup,
  isMobileOpen,
  onCloseMobile,
  loadingChats,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-950/35 backdrop-blur-[2px] lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[288px] flex-col border-r border-gray-200/70 bg-[#f4f4f4] shadow-[12px_0_40px_rgba(0,0,0,0.07)] transition-transform duration-200 ease-out dark:border-white/[0.07] dark:bg-[#18191c] dark:shadow-none lg:static lg:my-2 lg:ml-2 lg:rounded-[20px] lg:border lg:border-gray-200/80 lg:shadow-[0_8px_26px_rgba(0,0,0,0.045)] lg:dark:border-white/[0.07] lg:dark:shadow-[0_8px_26px_rgba(0,0,0,0.12)] lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-9 w-9 rounded-xl ring-1 ring-black/[0.06] dark:ring-white/10" />

            <div>
              <p className="text-sm font-semibold tracking-[-0.02em] text-gray-900 dark:text-white">
                Sova AI
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                Your thinking partner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors duration-150 hover:bg-black/[0.04] hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.07] dark:hover:text-gray-100"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-[17px] w-[17px]" />
              ) : (
                <Moon className="h-[17px] w-[17px]" />
              )}
            </button>

            <button
              onClick={onCloseMobile}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors duration-150 hover:bg-black/[0.04] hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.07] dark:hover:text-gray-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-1">
          <button
            onClick={onNewChat}
            className="group flex h-11 w-full items-center gap-2.5 rounded-xl border border-gray-200/80 bg-white/70 px-3 text-[13px] font-semibold text-gray-700 transition-colors duration-150 hover:border-gray-300 hover:bg-white hover:text-gray-900 dark:border-white/[0.1] dark:bg-white/[0.045] dark:text-gray-200 dark:hover:border-white/[0.16] dark:hover:bg-white/[0.08] dark:hover:text-white"
          >
            <div className="flex h-5 w-5 items-center justify-center text-gray-500 dark:text-gray-400">
              <PenSquare className="h-[15px] w-[15px]" />
            </div>

            <span>New Chat</span>
          </button>
        </div>

        {/* Recent Chats */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 pt-6">
          <div className="mb-2 px-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-500">
              Recent conversations
            </span>
          </div>

          <div className="space-y-1">
            {loadingChats &&
              [1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-9 rounded-xl bg-gray-200/60 dark:bg-white/[0.045]"
                />
              ))}

            {!isAuthenticated && !loadingChats && (
              <div className="px-3 py-3 text-xs leading-relaxed text-gray-500 dark:text-gray-500">
                Sign in to keep your conversations here.
              </div>
            )}

            {isAuthenticated && !loadingChats && chats.length === 0 && (
              <div className="px-3 py-3 text-xs leading-relaxed text-gray-500 dark:text-gray-500">
                Your conversations will appear here.
              </div>
            )}

            {isAuthenticated &&
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center gap-1 rounded-xl text-[13px] transition-colors duration-150 ${
                    activeChatId === chat.id
                      ? 'bg-black/[0.045] text-gray-900 dark:bg-white/[0.075] dark:text-gray-100'
                      : 'text-gray-600 hover:bg-black/[0.035] hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.045] dark:hover:text-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectChat(chat.id)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-left"
                    aria-current={activeChatId === chat.id ? 'page' : undefined}
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0 opacity-60" />
                    <span className="truncate">{chat.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteChat(chat.id)}
                    className="mr-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 opacity-100 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    aria-label={`Delete ${chat.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Account */}
        <div className="border-t border-gray-200/70 p-2.5 dark:border-white/[0.07]">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex w-full items-center gap-2.5 rounded-xl border border-transparent p-2 transition-colors duration-150 hover:border-gray-200/70 hover:bg-white/70 dark:hover:border-white/[0.07] dark:hover:bg-white/[0.045]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200/80 text-gray-600 ring-1 ring-gray-300/60 dark:bg-gray-700/80 dark:text-gray-100 dark:ring-white/10">
                  <UserIcon className="h-4 w-4" />
                </div>

                <div className="flex-1 overflow-hidden text-left">
                  <p className="truncate text-[13px] font-semibold text-gray-800 dark:text-gray-200">
                    {user?.name || user?.email || 'User'}
                  </p>
                  <p className="truncate text-[11px] text-gray-400 dark:text-gray-500">
                    {user?.email || 'Account'}
                  </p>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    menuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {menuOpen && (
                <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 overflow-hidden rounded-xl border border-gray-200/80 bg-white p-1 shadow-[0_12px_30px_rgba(0,0,0,0.12)] dark:border-white/[0.08] dark:bg-[#282a2e] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.06]"
                  >
                    <LogOut className="h-4 w-4 text-gray-400" />
                    Log out
                  </button>

                  <div className="my-1 border-t border-gray-100 dark:border-white/[0.07]" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDeleteAccount();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-error-600 transition-colors hover:bg-red-50 dark:text-error-400 dark:hover:bg-red-500/[0.08]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete account
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <button
                onClick={onLogin}
                className="flex w-full items-center gap-2.5 rounded-xl border border-gray-200/80 bg-white/70 px-3 py-2.5 text-[13px] font-semibold text-gray-700 transition-colors duration-150 hover:border-gray-300 hover:bg-white dark:border-white/[0.1] dark:bg-white/[0.045] dark:text-gray-200 dark:hover:bg-white/[0.08]"
              >
                <LogIn className="h-4 w-4" />
                Log in
              </button>

              <button
                onClick={onSignup}
                className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-[13px] font-medium text-gray-600 transition-colors duration-150 hover:bg-black/[0.035] dark:text-gray-400 dark:hover:bg-white/[0.05]"
              >
                Create account
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}