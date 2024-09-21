<<<<<<< HEAD
'use client'
import { useState, useEffect } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
=======
import { Disclosure, Menu } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link';
>>>>>>> 7c54dcd5cff8940658845b1d0db0fe7d66b877db

const navigation = [
  { name: 'Dashboard', href: '/dashboard', current: false },
  { name: 'Transactions', href: '/transactions', current: false },
  { name: 'Budgets', href: '/budgets', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

<<<<<<< HEAD
export default function Navigation() {

    const [accountDetails, setAccountDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccountDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/users/account`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log(data);
                setAccountDetails(data.user); // Ensure this matches the backend response structure
              
            } catch (error) {
                console.error('Error fetching account details:', error);
            }
        };

        fetchAccountDetails();

        return () => {
            setAccountDetails(null);
        };
    }, []);

=======
export default function Navigation({ onSeraAIClick, currentPage }) {
>>>>>>> 7c54dcd5cff8940658845b1d0db0fe7d66b877db
  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-blue-400 to-blue-500">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <h1 className="text-white text-3xl font-bold">sera</h1> <i className="fa-solid fa-leaf text-white text-xl font-bold"></i>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.href === currentPage ? 'border-b border-white text-white' : 'text-white hover:border-b hover:border-white',
                          'px-3 py-2 text-sm font-medium'
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                    <button
                      onClick={onSeraAIClick}
                      className={classNames(
                        currentPage === '/sera-ai' ? 'border-b border-white text-white' : 'text-white hover:border-b hover:border-white',
                        'px-3 py-2 text-sm font-medium'
                      )}
                    >
                      SeraAI
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <Menu as="div" className="relative ml-3">
                  {/* ... (keep the existing Menu component code) ... */}
                </Menu>
              </div>
            </div>
          </div>

<<<<<<< HEAD
            {/* Profile dropdown */}
            {accountDetails && (
            <p className='text-white text-sm font-bold'>{accountDetails.firstName || ''} {accountDetails.lastName || ''}</p>
            )
           }
           <Menu as="div" className="relative ml-3">
              <div>
                <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  {accountDetails && (
                  <img
                    alt=""
                    src={`https://ui-avatars.com/api/?name=${accountDetails.firstName || ''} ${accountDetails.lastName || ''}`} 
                    className="h-8 w-8 rounded-full"
                  />
                  )}
                </MenuButton>
              </div>
              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
               
                <MenuItem>
                  <a href="../login" className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100">
                    Sign out
                  </a>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
=======
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.href === currentPage ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              <Disclosure.Button
                as="button"
                onClick={onSeraAIClick}
                className={classNames(
                  currentPage === '/sera-ai' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'block rounded-md px-3 py-2 text-base font-medium w-full text-left'
                )}
              >
                SeraAI
              </Disclosure.Button>
            </div>
          </Disclosure.Panel>
        </>
      )}
>>>>>>> 7c54dcd5cff8940658845b1d0db0fe7d66b877db
    </Disclosure>
  )
}
