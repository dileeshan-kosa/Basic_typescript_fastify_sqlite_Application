import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet, RouterProvider, Link, createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form' // <-- We added this import!
import './index.css'

// 1. SETUP TANSTACK QUERY
const queryClient = new QueryClient()

// 2. SETUP TANSTACK ROUTER

// A. The Root Route (Main Layout)
const rootRoute = createRootRoute({
  component: () => (
    <div className="bg-gray-100 min-h-screen p-8 text-gray-800">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200 relative overflow-hidden">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">User Management</h1>
        
        <div className="flex gap-4 mb-8">
          <Link 
            to="/" 
            className="font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
            activeProps={{ className: 'bg-blue-600 text-white' }}
            inactiveProps={{ className: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300' }}
          >
            Add User
          </Link>
          <Link 
            to="/users" 
            className="font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
            activeProps={{ className: 'bg-blue-600 text-white' }}
            inactiveProps={{ className: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300' }}
          >
            Display Users
          </Link>
        </div>

        <Outlet />
      </div>
    </div>
  ),
})

// B. The "Add User" Page (Using TanStack Form)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function AddUserPage() {
    
    // Initialize the TanStack Form
    const form = useForm({
      defaultValues: {
        name: '',
        email: '',
      },
      onSubmit: async ({ value }) => {
        // This runs when the user clicks Submit
        try {
          const response = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(value) // Send the form data
          });
          
          const result = await response.json();
          if (result.success) {
            alert('User successfully saved to SQLite!');
            form.reset(); // Instantly clear the text boxes!
          }
        } catch (error) {
          console.error('Error saving user:', error);
          alert('Failed to save user. Is the Fastify backend running?');
        }
      },
    });

    return (
      <div className="animate-fade-in">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Add a New User</h2>
        
        {/* The Form UI */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Name Field */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => !value ? 'Name is required' : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {field.state.meta.errors ? (
                  <p className="text-red-500 text-sm mt-1">{field.state.meta.errors}</p>
                ) : null}
              </div>
            )}
          </form.Field>

          {/* Email Field */}
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => !value.includes('@') ? 'Must be a valid email containing @' : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. john@example.com"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {field.state.meta.errors ? (
                  <p className="text-red-500 text-sm mt-1">{field.state.meta.errors}</p>
                ) : null}
              </div>
            )}
          </form.Field>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-3 rounded-lg transition-colors shadow-md mt-2"
          >
            Save to Database
          </button>
        </form>
      </div>
    )
  },
})

// C. The "Display Users" Page (Still a placeholder)
const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: function DisplayUsersPage() {
    return (
      <div className="animate-fade-in">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Database Records</h2>
        <p className="text-gray-500 italic">TanStack Query list will go here soon...</p>
      </div>
    )
  },
})

// D. Connect the rooms to the house
const routeTree = rootRoute.addChildren([indexRoute, usersRoute])
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// 3. RENDER THE APPLICATION
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)