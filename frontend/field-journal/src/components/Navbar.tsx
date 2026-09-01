import * as Avatar from '@radix-ui/react-avatar'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { LogOut, Leaf } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 font-bold text-emerald-700 text-lg">
          <Leaf className="h-5 w-5" />
          Field Journal
        </div>

        {isAuthenticated && user && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-gray-700 hover:bg-gray-100">
                <Avatar.Root className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Avatar.Fallback className="text-sm font-semibold text-emerald-700">
                    {user.username[0].toUpperCase()}
                  </Avatar.Fallback>
                </Avatar.Root>
                <span className="hidden sm:block">{user.username}</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                className="z-50 min-w-[10rem] rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
              >
                <DropdownMenu.Item
                  onSelect={logout}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 focus:outline-none"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>
    </header>
  )
}
